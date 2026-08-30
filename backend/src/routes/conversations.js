const express = require('express');
const router = express.Router();

// GET /api/v1/conversations
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all conversations' });
});

// POST /api/v1/conversations
router.post('/', (req, res) => {
  res.status(200).json({ message: 'Create conversation' });
});

// GET /api/v1/conversations/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Get conversation by id' });
});

// PUT /api/v1/conversations/:id
router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'Update conversation' });
});

// DELETE /api/v1/conversations/:id
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'Delete conversation' });
});

module.exports = router;
