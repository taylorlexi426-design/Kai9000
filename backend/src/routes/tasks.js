const express = require('express');
const router = express.Router();

// GET /api/v1/tasks
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all tasks' });
});

// POST /api/v1/tasks
router.post('/', (req, res) => {
  res.status(200).json({ message: 'Create task' });
});

// GET /api/v1/tasks/:id
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Get task by id' });
});

// PUT /api/v1/tasks/:id
router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'Update task' });
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'Delete task' });
});

module.exports = router;
