require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game_downloads', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/games', require('./routes/games'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Game Download Platform API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
