const express = require('express');
const request = require('supertest');

const deviceRoutes = require('../routes/device');
const chatRoutes = require('../routes/chat');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/device', deviceRoutes);
  app.use('/api/v1/chat', chatRoutes);
  return app;
}

describe('Device routes', () => {
  const app = buildApp();

  it('GET /api/v1/device/status returns device info', async () => {
    const res = await request(app).get('/api/v1/device/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('battery');
    expect(res.body).toHaveProperty('wifi');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('POST /api/v1/device/command requires an action', async () => {
    const res = await request(app).post('/api/v1/device/command').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/v1/device/command rejects an unknown action', async () => {
    const res = await request(app).post('/api/v1/device/command').send({ action: 'self-destruct' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Unknown device action/);
  });

  it('POST /api/v1/device/command rejects non-object params', async () => {
    const res = await request(app)
      .post('/api/v1/device/command')
      .send({ action: 'screen', params: 'on' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/params must be an object/);
  });

  it('POST /api/v1/device/command executes a screen command and logs it', async () => {
    const res = await request(app)
      .post('/api/v1/device/command')
      .send({ action: 'screen', params: { state: 'on' } });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.log).toHaveProperty('action', 'screen');

    const history = await request(app).get('/api/v1/device/history');
    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    expect(history.body.length).toBeGreaterThan(0);
    expect(history.body[0].action).toBe('screen');
  });
});

describe('Chat routes', () => {
  const app = buildApp();

  it('POST /api/v1/chat/message requires a message', async () => {
    const res = await request(app).post('/api/v1/chat/message').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/chat/message parses a device command intent', async () => {
    const res = await request(app)
      .post('/api/v1/chat/message')
      .send({ message: 'turn on screen' });

    expect(res.status).toBe(200);
    expect(res.body.userMessage.content).toBe('turn on screen');
    expect(res.body.reply.sender).toBe('ai');
    expect(res.body.command).toMatchObject({ action: 'screen' });
  });

  it('POST /api/v1/chat/message falls back to chit-chat for unrecognized messages', async () => {
    const res = await request(app)
      .post('/api/v1/chat/message')
      .send({ message: 'hello there' });

    expect(res.status).toBe(200);
    expect(res.body.command).toBeNull();
    expect(typeof res.body.reply.content).toBe('string');
  });

  it('GET /api/v1/chat/history returns stored messages', async () => {
    const res = await request(app).get('/api/v1/chat/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
