import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { clearAll, makeAdmin } from './helpers';

const app = createApp();

beforeAll(async () => {
  await clearAll();
  await makeAdmin('admin', 'Admin@12345');
});

describe('admin authentication', () => {
  it('blocks login without a CSRF token (403)', async () => {
    const res = await request(app).post('/api/admin/login').send({ username: 'admin', password: 'Admin@12345' });
    expect(res.status).toBe(403);
  });

  it('rejects invalid credentials (401)', async () => {
    const agent = request.agent(app);
    const csrf = (await agent.get('/api/admin/csrf')).body.csrfToken;
    const res = await agent.post('/api/admin/login').set('X-CSRF-Token', csrf).send({ username: 'admin', password: 'nope' });
    expect(res.status).toBe(401);
  });

  it('logs in with valid credentials and reaches a protected route', async () => {
    const agent = request.agent(app);
    const csrf = (await agent.get('/api/admin/csrf')).body.csrfToken;
    const login = await agent.post('/api/admin/login').set('X-CSRF-Token', csrf).send({ username: 'admin', password: 'Admin@12345' });
    expect(login.status).toBe(200);
    expect(login.body.admin.username).toBe('admin');

    const me = await agent.get('/api/admin/me');
    expect(me.status).toBe(200);
    expect(me.body.admin.role).toBe('ADMIN');
  });

  it('blocks a protected route without authentication (401)', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
  });
});
