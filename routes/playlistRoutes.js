const express = require('express');
const Playlist = require('../models/Playlist');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const axios = require('axios');

// Create a new playlist
router.post('/addPlaylist',authMiddleware, async (req, res) => {
  try {
    const { playlistName, description, singerName, userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required to create a playlist',
      });
    }

    const newPlaylist = new Playlist({
      name : playlistName,
      description,
      singerName,
      userId, // Store userId with the playlist
    });

    await newPlaylist.save();

    res.status(201).json({
      status: 'success',
      message: 'Playlist created successfully',
      data: newPlaylist,
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create playlist',
      error: error.message,
    });
  }
});

router.get('/getUserPlaylists', authMiddleware, async (req, res) => {
    try {
        const userId = req.query.userId;
  
      // Find playlists that belong to this user
      const playlists = await Playlist.find({ userId });
  
      if (playlists.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No playlists found for this user',
        });
      }
  
      res.status(200).json({
        status: 'success',
        data: playlists,
      });
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user playlists',
        error: error.message,
      });
    }
  });

  router.delete('/deletePlaylist/:id', async (req, res) => {
    try {
      const playlistId = req.params.id; // Get playlist ID from URL params
      const userId = req.query.userId
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find and delete the playlist
      const deletedPlaylist = await Playlist.findOneAndDelete({ _id: playlistId, userId });
  
      if (!deletedPlaylist) {
        return res.status(404).json({
          status: 'error',
          message: 'Playlist not found or you do not have permission to delete it',
        });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Playlist deleted successfully',
        data: deletedPlaylist,
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete playlist',
        error: error.message,
      });
    }
  });
  
  router.get('/search', async (req, res) => {

    const { query } = req.query; // Get the search query from URL parameters
  
    if (!query) {
      return res.status(400).json({ error: 'Please provide a search query.' });
    }
  
    try {
      // Get an access token using Client Credentials Flow
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'client_credentials',
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
      });
  
      const accessToken = tokenResponse.data.access_token;
  
      // Search for the song using Spotify Web API
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: query,
          type: 'track', // Search for tracks only
        },
      });
  
      // Return the first song result from the search
      const tracks = response.data.tracks.items;
      if (tracks.length === 0) {
        return res.status(404).json({ error: 'No songs found.' });
      }
  
      return res.status(200).json({
        status: 'success',  // Success status
        data: [
          {
            song: tracks[0].name,
            artist: tracks[0].artists[0].name,
            album: tracks[0].album.name,
            previewUrl: tracks[0].preview_url,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching data from Spotify.' });
    }
  });
  
module.exports = router;
