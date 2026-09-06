const { parseIntent } = require('../services/chatService');

describe('chatService.parseIntent', () => {
  it('detects turning the screen on', () => {
    expect(parseIntent('turn on screen')).toEqual({
      intent: 'device_command',
      action: 'screen',
      params: { state: 'on' },
    });
  });

  it('detects turning the screen off', () => {
    expect(parseIntent('turn off the screen')).toEqual({
      intent: 'device_command',
      action: 'screen',
      params: { state: 'off' },
    });
  });

  it('detects opening an app', () => {
    expect(parseIntent('open settings')).toEqual({
      intent: 'device_command',
      action: 'app',
      params: { name: 'com.android.settings/.Settings', resolved: true },
    });
  });

  it('marks unresolved apps so the reply can warn the user', () => {
    expect(parseIntent('open foobar')).toEqual({
      intent: 'device_command',
      action: 'app',
      params: { name: 'foobar', resolved: false },
    });
  });

  it('detects setting volume to a level', () => {
    expect(parseIntent('set volume to 5')).toEqual({
      intent: 'device_command',
      action: 'volume',
      params: { stream: 'music', level: 5 },
    });
  });

  it('detects device status requests', () => {
    expect(parseIntent('what is the battery status')).toEqual({
      intent: 'device_command',
      action: 'info',
      params: {},
    });
  });

  it('falls back to plain chat for unrelated messages', () => {
    expect(parseIntent('tell me a joke')).toEqual({ intent: 'chat' });
  });

  it('handles empty input', () => {
    expect(parseIntent('')).toEqual({ intent: 'unknown' });
  });
});
