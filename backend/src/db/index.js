const logger = require('../utils/logger');

// Mock in-memory database for development
const mockDb = {
  users: [],
  tasks: [],
  conversations: [],
  messages: [],
};

const db = {
  sequelize: {
    authenticate: async () => {
      logger.info('Mock database connected');
      return true;
    },
    sync: async () => {
      logger.info('Mock database synced');
      return true;
    },
  },
  Sequelize: {},
  // Mock models
  User: { findAll: () => mockDb.users, create: (data) => mockDb.users.push(data) },
  Task: { findAll: () => mockDb.tasks, create: (data) => mockDb.tasks.push(data) },
  Conversation: { findAll: () => mockDb.conversations, create: (data) => mockDb.conversations.push(data) },
  Message: { findAll: () => mockDb.messages, create: (data) => mockDb.messages.push(data) },
};

module.exports = db;
