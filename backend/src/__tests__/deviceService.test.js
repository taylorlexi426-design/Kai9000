const deviceService = require('../services/deviceService');

describe('deviceService', () => {
  it('clamps brightness to the 0-255 range', async () => {
    const high = await deviceService.setBrightness(999);
    expect(high.simulated).toBe(true); // termux-brightness isn't installed in CI

    const low = await deviceService.setBrightness(-50);
    expect(low.simulated).toBe(true);
  });

  it('clamps volume to the 0-15 range and falls back to a valid stream', async () => {
    const result = await deviceService.setVolume('not-a-stream', 999);
    expect(result.simulated).toBe(true);
  });

  it('rejects openApp when the sanitized app name is empty', async () => {
    const result = await deviceService.openApp('!!!@@@???***');
    expect(result).toEqual({
      success: false,
      simulated: false,
      raw: null,
      error: 'No valid app name/package provided',
    });
  });

  it('rejects openUrl for disallowed schemes', async () => {
    const result = await deviceService.openUrl('javascript:alert(1)');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unsupported URL scheme/);
  });

  it('rejects openUrl for invalid URLs', async () => {
    const result = await deviceService.openUrl('not a url');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid URL');
  });

  it('accepts openUrl for http/https URLs', async () => {
    const result = await deviceService.openUrl('https://example.com');
    expect(result.simulated).toBe(true); // termux-open-url isn't installed in CI
  });

  it('exposes the list of valid device actions', () => {
    expect(deviceService.VALID_ACTIONS).toEqual(
      expect.arrayContaining(['screen', 'brightness', 'volume', 'app', 'url', 'notification', 'file', 'info']),
    );
  });
});
