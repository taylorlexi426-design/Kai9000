const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'kai9000.db'),
  logging: false,
  dialectOptions: {
    timeout: 20000,
  },
});

const db = {
  sequelize,
  Sequelize,
};

// Import models
db.User = require('./models/User')(sequelize, Sequelize);
db.Task = require('./models/Task')(sequelize, Sequelize);
db.Conversation = require('./models/Conversation')(sequelize, Sequelize);
db.Message = require('./models/Message')(sequelize, Sequelize);

// Define associations
db.User.hasMany(db.Task, { foreignKey: 'userId' });
db.Task.belongsTo(db.User, { foreignKey: 'userId' });

db.Task.hasMany(db.Conversation, { foreignKey: 'taskId' });
db.Conversation.belongsTo(db.Task, { foreignKey: 'taskId' });

db.Conversation.hasMany(db.Message, { foreignKey: 'conversationId' });
db.Message.belongsTo(db.Conversation, { foreignKey: 'conversationId' });

module.exports = db;
