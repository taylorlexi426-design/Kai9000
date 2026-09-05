const db = require('../db');
const logger = require('../utils/logger');
const deviceService = require('../services/deviceService');

async function logCommand(action, params, result) {
  const entry = await db.CommandLog.create({
    action,
    params,
    success: !!result.success,
    result: result.raw !== undefined ? result.raw : null,
    simulated: !!result.simulated,
    error: result.error,
  });
  await db.DeviceState.update({ lastCommand: entry });
  return entry;
}

exports.getStatus = async (req, res) => {
  try {
    const info = await deviceService.getDeviceInfo();
    const state = db.DeviceState.get();
    res.json({ ...info, lastCommand: state.lastCommand });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await db.CommandLog.findAll();
    res.json(history.slice().reverse());
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.runCommand = async (req, res) => {
  try {
    const { action, params } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'action is required' });
    }

    if (!deviceService.VALID_ACTIONS.includes(action)) {
      return res.status(400).json({ error: `Unknown device action: ${action}` });
    }

    if (params !== undefined && (typeof params !== 'object' || params === null || Array.isArray(params))) {
      return res.status(400).json({ error: 'params must be an object' });
    }

    const result = await deviceService.executeCommand(action, params || {});
    const entry = await logCommand(action, params || {}, result);

    res.status(result.success ? 200 : 502).json({ ...result, log: entry });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.logCommand = logCommand;
