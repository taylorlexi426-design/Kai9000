const { exec } = require('child_process');
const logger = require('../utils/logger');

const EXEC_TIMEOUT = 5000;

/**
 * Runs a termux-api shell command.
 * When termux-api tooling isn't available (e.g. running on a normal Linux/CI
 * machine instead of Android/Termux) the command is "simulated" so the rest
 * of the application keeps working end-to-end.
 */
function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: EXEC_TIMEOUT }, (error, stdout, stderr) => {
      if (error) {
        const notInstalled = error.code === 127 || /not found|ENOENT/i.test(String(error.message));
        logger.warn(`termux command failed (${cmd}): ${error.message}`);
        resolve({
          success: notInstalled, // treat "command not found" as a simulated success
          simulated: true,
          raw: null,
          error: notInstalled ? undefined : (stderr || error.message),
        });
        return;
      }

      const raw = stdout ? stdout.trim() : '';
      let parsed = raw;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        parsed = raw;
      }

      resolve({ success: true, simulated: false, raw: parsed });
    });
  });
}

async function screenOn() {
  return runCommand('termux-wake-lock');
}

async function screenOff() {
  return runCommand('termux-wake-unlock');
}

async function setBrightness(level) {
  const value = Math.max(0, Math.min(255, parseInt(level, 10) || 0));
  return runCommand(`termux-brightness ${value}`);
}

async function setVolume(stream, level) {
  const validStreams = ['music', 'ring', 'alarm', 'notification', 'system', 'call'];
  const streamName = validStreams.includes(stream) ? stream : 'music';
  const value = Math.max(0, Math.min(15, parseInt(level, 10) || 0));
  return runCommand(`termux-volume ${streamName} ${value}`);
}

async function openApp(nameOrPackage) {
  const safeArg = String(nameOrPackage || '').replace(/[^a-zA-Z0-9_.\- ]/g, '');
  return runCommand(`am start -a android.intent.action.MAIN -c android.intent.action.LAUNCHER -n ${safeArg}`);
}

async function openUrl(url) {
  const safeUrl = String(url || '').replace(/[^a-zA-Z0-9_.\-:/?=&%]/g, '');
  return runCommand(`termux-open-url "${safeUrl}"`);
}

async function listNotifications() {
  return runCommand('termux-notification-list');
}

async function sendNotification(title, content) {
  const safeTitle = String(title || 'Kai9000').replace(/["'`\\]/g, '');
  const safeContent = String(content || '').replace(/["'`\\]/g, '');
  return runCommand(`termux-notification -t "${safeTitle}" -c "${safeContent}"`);
}

async function listFiles(dirPath) {
  const safePath = String(dirPath || '~').replace(/[^a-zA-Z0-9_.\-/~ ]/g, '');
  return runCommand(`ls -la ${safePath}`);
}

async function getBatteryStatus() {
  return runCommand('termux-battery-status');
}

async function getWifiInfo() {
  return runCommand('termux-wifi-connectioninfo');
}

async function getDeviceInfo() {
  const [battery, wifi] = await Promise.all([getBatteryStatus(), getWifiInfo()]);
  return {
    battery: battery.raw,
    wifi: wifi.raw,
    simulated: battery.simulated || wifi.simulated,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Executes a structured device command.
 * @param {string} action - one of screen, brightness, volume, app, url, notification, file, info
 * @param {object} params
 */
async function executeCommand(action, params = {}) {
  switch (action) {
    case 'screen':
      return params.state === 'off' ? screenOff() : screenOn();
    case 'brightness':
      return setBrightness(params.level);
    case 'volume':
      return setVolume(params.stream, params.level);
    case 'app':
      return openApp(params.name);
    case 'url':
      return openUrl(params.url);
    case 'notification':
      return params.action === 'list'
        ? listNotifications()
        : sendNotification(params.title, params.content);
    case 'file':
      return listFiles(params.path);
    case 'info':
      return getDeviceInfo();
    default:
      return { success: false, error: `Unknown device action: ${action}` };
  }
}

module.exports = {
  runCommand,
  screenOn,
  screenOff,
  setBrightness,
  setVolume,
  openApp,
  openUrl,
  listNotifications,
  sendNotification,
  listFiles,
  getBatteryStatus,
  getWifiInfo,
  getDeviceInfo,
  executeCommand,
};
