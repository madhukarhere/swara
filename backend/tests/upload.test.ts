import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { clearAll, makeAdmin, makeCategory, adminAgent } from './helpers';

const app = createApp();
let categoryId: string;

beforeAll(async () => {
  await clearAll();
  await makeAdmin('admin', 'Admin@12345');
  const cat = await makeCategory('Keertanas');
  categoryId = String(cat._id);
});

describe('admin song upload validation', () => {
  it('rejects a non-audio file submitted as audio (400)', async () => {
    const { agent, csrf } = await adminAgent(app);
    const res = await agent
      .post('/api/admin/songs')
      .set('X-CSRF-Token', csrf)
      .field('title', 'Bad Upload')
      .field('category', categoryId)
      .attach('audio', Buffer.from('not really audio'), { filename: 'evil.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
  });

  it('creates a song with a valid audio file (201) and exposes a stream URL', async () => {
    const { agent, csrf } = await adminAgent(app);
    const res = await agent
      .post('/api/admin/songs')
      .set('X-CSRF-Token', csrf)
      .field('title', 'Valid Song')
      .field('category', categoryId)
      .field('singer', 'Tester')
      .attach('audio', Buffer.from('RIFF....WAVEfmt '), { filename: 'song.wav', contentType: 'audio/wav' });
    expect(res.status).toBe(201);
    expect(res.body.data.hasAudio).toBe(true);
    expect(res.body.data.audioUrl).toContain('/stream');
  });

  it('rejects an upload with no CSRF token (403)', async () => {
    const res = await request(app)
      .post('/api/admin/songs')
      .field('title', 'No CSRF')
      .field('category', categoryId);
    expect(res.status).toBe(403);
  });
});
