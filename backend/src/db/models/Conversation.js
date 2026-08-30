module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
    },
    topic: {
      type: DataTypes.STRING,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return Conversation;
};
