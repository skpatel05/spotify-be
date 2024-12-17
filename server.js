const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',  // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // You can specify allowed methods
    credentials: true,  // Allow cookies to be sent with the request (optional)
  }));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use("/api/playlists", playlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
