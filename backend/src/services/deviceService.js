const { execFile } = require('child_process');
const os = require('os');
const logger = require('../utils/logger');

const EXEC_TIMEOUT = 5000;

/**
 * Runs a termux-api binary with the given arguments.
 * Uses execFile (not exec) with an argument array so user-provided values are
 * never interpreted by a shell, eliminating command/argument injection.
 * When termux-api tooling isn't available (e.g. running on a normal Linux/CI
 * machine instead of Android/Termux) the command is "simulated" so the rest
 * of the application keeps working end-to-end.
 */
function runCommand(command, args = []) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: EXEC_TIMEOUT }, (error, stdout, stderr) => {
      if (error) {
        // execFile does not use a shell, so a missing binary surfaces as
        // error.code === 'ENOENT' (not a numeric shell exit code).
        const commandMissing = error.code === 'ENOENT';
        logger.warn(`termux command failed (${command}): ${error.message}`);
        resolve({
          // When the termux-api binary simply isn't installed, treat the
          // call as a simulated success so the rest of the app keeps working.
          success: commandMissing,
          simulated: true,
          raw: null,
          error: commandMissing ? undefined : (stderr || error.message),
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

// NOTE: Termux:API does not expose direct screen power control. These use
// termux-wake-lock/termux-wake-unlock to acquire/release a CPU+screen wake
// lock, which is the closest equivalent available without root and is what
// the "screen on/off" chat commands map to.
async function acquireWakeLock() {
  return runCommand('termux-wake-lock');
}

async function releaseWakeLock() {
  return runCommand('termux-wake-unlock');
}

async function setBrightness(level) {
  const value = Math.max(0, Math.min(255, parseInt(level, 10) || 0));
  return runCommand('termux-brightness', [String(value)]);
}

async function setVolume(stream, level) {
  const validStreams = ['music', 'ring', 'alarm', 'notification', 'system', 'call'];
  const streamName = validStreams.includes(stream) ? stream : 'music';
  const value = Math.max(0, Math.min(15, parseInt(level, 10) || 0));
  return runCommand('termux-volume', [streamName, String(value)]);
}

async function openApp(nameOrPackage) {
  const safeArg = String(nameOrPackage || '').replace(/[^a-zA-Z0-9_./-]/g, '');
  if (!safeArg) {
    return { success: false, simulated: false, raw: null, error: 'No valid app name/package provided' };
  }
  return runCommand('am', [
    'start',
    '-a', 'android.intent.action.MAIN',
    '-c', 'android.intent.action.LAUNCHER',
    '-n', safeArg,
  ]);
}

const ALLOWED_URL_SCHEMES = ['http:', 'https:'];

async function openUrl(url) {
  let parsed;
  try {
    parsed = new URL(String(url || ''));
  } catch (err) {
    return { success: false, simulated: false, raw: null, error: 'Invalid URL' };
  }
  if (!ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {
    return { success: false, simulated: false, raw: null, error: `Unsupported URL scheme: ${parsed.protocol}` };
  }
  return runCommand('termux-open-url', [parsed.toString()]);
}

async function listNotifications() {
  return runCommand('termux-notification-list');
}

async function sendNotification(title, content) {
  const safeTitle = String(title || 'Kai9000');
  const safeContent = String(content || '');
  return runCommand('termux-notification', ['-t', safeTitle, '-c', safeContent]);
}

async function listFiles(dirPath) {
  let target = String(dirPath || '~').trim();
  // execFile doesn't invoke a shell, so '~' isn't expanded automatically.
  if (target === '~' || target.startsWith('~/')) {
    target = target.replace(/^~/, os.homedir());
  }
  // "--" tells `ls` that everything after it is a positional path argument,
  // preventing a path starting with "-" from being interpreted as a flag.
  // Note: this browses the device's own filesystem on behalf of its owner,
  // so relative traversal (e.g. "..") is intentionally allowed.
  return runCommand('ls', ['-la', '--', target]);
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
      return params.state === 'off' ? releaseWakeLock() : acquireWakeLock();
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
  acquireWakeLock,
  releaseWakeLock,
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
