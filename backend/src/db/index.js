const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kai9000_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  }
);

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
