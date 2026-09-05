/**
 * Very small intent parser that turns natural language chat messages into
 * structured device commands. Not a full NLP engine, but enough to satisfy
 * commands like "turn on screen", "open settings", "set volume to 10", etc.
 */

const APP_NAME_MAP = {
  settings: 'com.android.settings/.Settings',
  camera: 'com.android.camera/.Camera',
  browser: 'com.android.chrome/com.google.android.apps.chrome.Main',
  chrome: 'com.android.chrome/com.google.android.apps.chrome.Main',
  gallery: 'com.android.gallery3d/.app.GalleryActivity',
};

function parseIntent(message) {
  const text = String(message || '').trim().toLowerCase();

  if (!text) {
    return { intent: 'unknown' };
  }

  if (/turn on (the )?screen|wake( up)? screen|screen on/.test(text)) {
    return { intent: 'device_command', action: 'screen', params: { state: 'on' } };
  }

  if (/turn off (the )?screen|lock screen|screen off/.test(text)) {
    return { intent: 'device_command', action: 'screen', params: { state: 'off' } };
  }

  const brightnessMatch = text.match(/brightness\s*(?:to|=)?\s*(\d+)/);
  if (brightnessMatch) {
    return {
      intent: 'device_command',
      action: 'brightness',
      params: { level: parseInt(brightnessMatch[1], 10) },
    };
  }

  const volumeMatch = text.match(/volume\s*(?:to|=)?\s*(\d+)/);
  if (volumeMatch) {
    return {
      intent: 'device_command',
      action: 'volume',
      params: { stream: 'music', level: parseInt(volumeMatch[1], 10) },
    };
  }
  if (/volume up|increase volume|louder/.test(text)) {
    return { intent: 'device_command', action: 'volume', params: { stream: 'music', level: 15 } };
  }
  if (/volume down|decrease volume|quieter|mute/.test(text)) {
    return { intent: 'device_command', action: 'volume', params: { stream: 'music', level: 0 } };
  }

  const openMatch = text.match(/open (?:the )?(?:app )?["']?([a-z0-9 _.\-]+?)["']?$/);
  if (openMatch) {
    const appName = openMatch[1].trim();
    return {
      intent: 'device_command',
      action: 'app',
      params: { name: APP_NAME_MAP[appName] || appName },
    };
  }

  const notifyMatch = text.match(/(?:send|show) (?:a )?notification[:\-]?\s*(.*)/);
  if (notifyMatch) {
    return {
      intent: 'device_command',
      action: 'notification',
      params: { title: 'Kai9000', content: notifyMatch[1] || 'Hello from Kai9000' },
    };
  }
  if (/(read|list|show) (my )?notifications/.test(text)) {
    return { intent: 'device_command', action: 'notification', params: { action: 'list' } };
  }

  if (/(device )?(status|info|battery|wifi)/.test(text)) {
    return { intent: 'device_command', action: 'info', params: {} };
  }

  const filesMatch = text.match(/(?:list|show) files(?: in)? ?(.*)/);
  if (filesMatch) {
    return {
      intent: 'device_command',
      action: 'file',
      params: { path: filesMatch[1] || '~' },
    };
  }

  return { intent: 'chat' };
}

function describeAction(action, params) {
  switch (action) {
    case 'screen':
      return `Turning the screen ${params.state === 'off' ? 'off' : 'on'}.`;
    case 'brightness':
      return `Setting brightness to ${params.level}.`;
    case 'volume':
      return `Setting ${params.stream} volume to ${params.level}.`;
    case 'app':
      return `Opening ${params.name}.`;
    case 'url':
      return `Opening ${params.url}.`;
    case 'notification':
      return params.action === 'list' ? 'Reading your notifications.' : 'Sending a notification.';
    case 'file':
      return `Listing files in ${params.path}.`;
    case 'info':
      return 'Checking device status.';
    default:
      return 'Running the requested command.';
  }
}

module.exports = { parseIntent, describeAction, APP_NAME_MAP };
