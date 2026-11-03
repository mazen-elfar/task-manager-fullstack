import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Backend Foundation & Health Check', () => {
  const app = createApp();

  it('GET /health returns 200 with status healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('environment');
  });

  it('GET /api/v1 returns 200 with API info', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Task Manager API');
    expect(res.body).toHaveProperty('version', 'v1');
  });

  it('GET /undefined-route returns 404 with standard error format', async () => {
    const res = await request(app).get('/undefined-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });
});
