const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// GET /api/v1/device/status
router.get('/status', deviceController.getStatus);

// GET /api/v1/device/history
router.get('/history', deviceController.getHistory);

// POST /api/v1/device/command
router.post('/command', deviceController.runCommand);

module.exports = router;
