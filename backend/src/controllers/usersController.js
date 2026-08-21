const db = require('../db');
const logger = require('../utils/logger');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, bio, avatar } = req.body;

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      firstName,
      lastName,
      bio,
      avatar,
    });

    res.json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};
