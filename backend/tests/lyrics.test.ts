import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app';
import { clearAll, makeAdmin, makeCategory, makeSong, adminAgent } from './helpers';

const app = createApp();
let songId: string;

beforeAll(async () => {
  await clearAll();
  await makeAdmin('admin', 'Admin@12345');
  const cat = await makeCategory('Keertanas');
  const song = await makeSong(cat._id, { title: 'Bhaja Govindam', slug: 'bhaja-govindam' });
  songId = String(song._id);
});

describe('admin lyrics CRUD (multi-language)', () => {
  it('creates a lyric translation and reflects the language on the song', async () => {
    const { agent, csrf } = await adminAgent(app);
    const res = await agent
      .post('/api/admin/lyrics')
      .set('X-CSRF-Token', csrf)
      .send({ song: songId, language: 'Sanskrit', languageCode: 'sa', content: 'भज गोविन्दम्', isDefault: true, order: 0 });
    expect(res.status).toBe(201);

    const detail = await agent.get(`/api/songs/${songId}`);
    expect(detail.body.languages).toContain('Sanskrit');
  });

  it('rejects a duplicate language code for the same song (409)', async () => {
    const { agent, csrf } = await adminAgent(app);
    const res = await agent
      .post('/api/admin/lyrics')
      .set('X-CSRF-Token', csrf)
      .send({ song: songId, language: 'Sanskrit (again)', languageCode: 'sa', content: 'dup' });
    expect(res.status).toBe(409);
  });

  it('adds a second language, updates it, then deletes it', async () => {
    const { agent, csrf } = await adminAgent(app);

    const created = await agent
      .post('/api/admin/lyrics')
      .set('X-CSRF-Token', csrf)
      .send({ song: songId, language: 'English', languageCode: 'en', content: 'Worship Govinda', order: 1 });
    expect(created.status).toBe(201);
    const lyricId = created.body.data.id;

    const updated = await agent
      .put(`/api/admin/lyrics/${lyricId}`)
      .set('X-CSRF-Token', csrf)
      .send({ content: 'Worship Govinda, O foolish mind' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.content).toContain('foolish mind');

    const list = await agent.get('/api/admin/lyrics').query({ song: songId });
    expect(list.body.data.length).toBe(2);

    const del = await agent.delete(`/api/admin/lyrics/${lyricId}`).set('X-CSRF-Token', csrf);
    expect(del.status).toBe(200);

    const after = await agent.get('/api/admin/lyrics').query({ song: songId });
    expect(after.body.data.length).toBe(1);
  });
});
