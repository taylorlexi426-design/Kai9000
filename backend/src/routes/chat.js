const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/v1/chat/message
router.post('/message', chatController.sendMessage);

// GET /api/v1/chat/history
router.get('/history', chatController.getHistory);

module.exports = router;
