const db = require('../db');
const logger = require('../utils/logger');
const deviceService = require('../services/deviceService');
const chatService = require('../services/chatService');
const deviceController = require('./deviceController');

const CHAT_RESPONSES = [
  "Got it! I'm not sure how to help with that yet, but I'm learning.",
  'I heard you. Try asking me to control your device, e.g. "turn on screen" or "open settings".',
  "I'm Kai9000, your device assistant. Ask me to control your screen, volume, apps or notifications!",
];

function fallbackReply() {
  const index = Math.floor(Math.random() * CHAT_RESPONSES.length);
  return CHAT_RESPONSES[index];
}

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const userEntry = await db.Message.create({
      sender: 'user',
      content: message,
    });

    const intent = chatService.parseIntent(message);
    let reply;
    let command = null;

    if (intent.intent === 'device_command') {
      const result = await deviceService.executeCommand(intent.action, intent.params);
      const log = await deviceController.logCommand(intent.action, intent.params, result);
      command = { action: intent.action, params: intent.params, ...result, log };
      reply = `${chatService.describeAction(intent.action, intent.params)} ${
        result.success ? 'Done!' : `Something went wrong: ${result.error || 'unknown error'}`
      }`;
    } else {
      reply = fallbackReply();
    }

    const aiEntry = await db.Message.create({
      sender: 'ai',
      content: reply,
      metadata: command ? { command } : undefined,
    });

    res.status(200).json({
      userMessage: userEntry,
      reply: aiEntry,
      command,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const messages = await db.Message.findAll();
    res.json(messages);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};
