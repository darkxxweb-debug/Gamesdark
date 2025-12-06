const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  downloadLink: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Sports', 'Racing', 'Strategy', 'Other'],
    default: 'Other'
  },
  fileSize: {
    type: String,
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  platform: {
    type: String,
    enum: ['Android', 'PC', 'iOS', 'Multi-platform'],
    default: 'Android'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);
