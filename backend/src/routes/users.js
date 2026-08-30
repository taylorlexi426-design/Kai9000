const express = require('express');
const router = express.Router();

// GET /api/v1/users
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all users' });
});

// GET /api/v1/users/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Get user by id' });
});

// PUT /api/v1/users/:id
router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'Update user' });
});

// DELETE /api/v1/users/:id
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'Delete user' });
});

module.exports = router;
