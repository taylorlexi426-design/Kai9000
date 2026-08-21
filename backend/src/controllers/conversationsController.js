const db = require('../db');
const logger = require('../utils/logger');

exports.getConversations = async (req, res) => {
  try {
    const { taskId } = req.params;
    const conversations = await db.Conversation.findAll({
      where: { taskId },
      include: [db.Message],
    });

    res.json(conversations);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { taskId, title, context } = req.body;

    const conversation = await db.Conversation.create({
      taskId,
      title,
      context,
    });

    res.status(201).json(conversation);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await db.Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
    });

    res.json(messages);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { sender, content, metadata } = req.body;

    const message = await db.Message.create({
      conversationId,
      sender,
      content,
      metadata,
    });

    res.status(201).json(message);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};
