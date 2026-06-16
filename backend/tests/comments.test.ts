import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { clearAll, makeAdmin, makeCategory, makeSong, adminAgent } from './helpers';
import { signCaptchaToken } from '../src/lib/captcha';

const app = createApp();
let songId: string;

beforeAll(async () => {
  await clearAll();
  await makeAdmin('admin', 'Admin@12345');
  const cat = await makeCategory('Keertanas');
  const song = await makeSong(cat._id, { title: 'Brahmam Okkate', slug: 'brahmam-okkate' });
  songId = String(song._id);
});

describe('comments, CAPTCHA and moderation', () => {
  it('accepts a valid comment but holds it for moderation (not publicly visible)', async () => {
    const token = signCaptchaToken('abcd');
    const res = await request(app)
      .post(`/api/songs/${songId}/comments`)
      .send({ name: 'Tester', rating: 5, comment: 'Beautiful keertana', captchaToken: token, captchaAnswer: 'abcd' });
    expect(res.status).toBe(201);

    const list = await request(app).get(`/api/songs/${songId}/comments`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0); // pending -> hidden
  });

  it('rejects an incorrect CAPTCHA answer (400)', async () => {
    const token = signCaptchaToken('abcd');
    const res = await request(app)
      .post(`/api/songs/${songId}/comments`)
      .send({ name: 'Tester', comment: 'hello there', captchaToken: token, captchaAnswer: 'WRONG' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid payload (422)', async () => {
    const res = await request(app)
      .post(`/api/songs/${songId}/comments`)
      .send({ name: '', comment: '', captchaToken: 'short', captchaAnswer: '' });
    expect(res.status).toBe(422);
  });

  it('lets an admin approve a comment, making it publicly visible', async () => {
    const token = signCaptchaToken('abcd');
    await request(app)
      .post(`/api/songs/${songId}/comments`)
      .send({ name: 'Asha', rating: 4, comment: 'Lovely rendition', captchaToken: token, captchaAnswer: 'abcd' });

    const { agent, csrf } = await adminAgent(app);
    const pending = await agent.get('/api/admin/comments').query({ status: 'pending' });
    expect(pending.status).toBe(200);
    expect(pending.body.data.length).toBeGreaterThanOrEqual(1);

    const commentId = pending.body.data[0].id;
    const mod = await agent.patch(`/api/admin/comments/${commentId}`).set('X-CSRF-Token', csrf).send({ status: 'approved' });
    expect(mod.status).toBe(200);

    const list = await request(app).get(`/api/songs/${songId}/comments`);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
