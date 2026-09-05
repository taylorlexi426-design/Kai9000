const crypto = require('crypto');
const logger = require('../utils/logger');

// Mock in-memory database for development
const mockDb = {
  users: [],
  tasks: [],
  conversations: [],
  messages: [],
  commandLogs: [],
  deviceState: {
    id: 'device-state',
    lastCommand: null,
    lastUpdated: null,
  },
};

/**
 * Creates a simple mock model backed by an in-memory array, adding
 * auto-generated ids and timestamps so records behave a bit more like real
 * Sequelize instances.
 */
function createMockCollection(collection) {
  return {
    findAll: () => [...collection],
    create: (data) => {
      const record = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      collection.push(record);
      return record;
    },
  };
}

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
  Message: createMockCollection(mockDb.messages),
  CommandLog: createMockCollection(mockDb.commandLogs),
  DeviceState: {
    get: () => ({ ...mockDb.deviceState }),
    update: (data) => {
      mockDb.deviceState = {
        ...mockDb.deviceState,
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      return { ...mockDb.deviceState };
    },
  },
};

module.exports = db;
