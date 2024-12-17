const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true},
        singerName: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
