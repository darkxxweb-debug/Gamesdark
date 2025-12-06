const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { authenticateAdmin, authenticateApp } = require('../middleware/auth');

// PUBLIC: Get all games (no password needed for viewing)
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ uploadedAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: Get single game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC: Increment download count
router.put('/download/:id', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    res.json({ message: 'Download count updated', game });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN: Add new game (requires admin password)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json({ message: 'Game added successfully', game });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ADMIN: Update game
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Game updated successfully', game });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ADMIN: Delete game
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROTECTED: Get all games (requires app password for download)
router.get('/protected/all', authenticateApp, async (req, res) => {
  try {
    const games = await Game.find().sort({ uploadedAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
