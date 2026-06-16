import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { clearAll, makeCategory, makeSong } from './helpers';
import { SongLyrics } from '../src/models';
import { writeToneWav } from '../src/seed/assets';

const app = createApp();
let songId: string;
let slug: string;

beforeAll(async () => {
  await clearAll();
  const cat = await makeCategory('Keertanas');
  writeToneWav('songs', 'audio-test.wav', 261.6, 1);
  const song = await makeSong(cat._id, {
    title: 'Brahmam Okkate',
    slug: 'brahmam-okkate',
    audioFile: 'audio-test.wav',
    languages: ['Telugu', 'English'],
    playCount: 10,
  });
  songId = String(song._id);
  slug = song.slug;
  await SongLyrics.create({ song: song._id, language: 'Telugu', languageCode: 'te', content: 'బ్రహ్మ మొక్కటే', isDefault: true, order: 0 });
  await SongLyrics.create({ song: song._id, language: 'English', languageCode: 'en', content: 'The Absolute is One', order: 1 });
  await makeSong(cat._id, { title: 'Adivo Alladivo', slug: 'adivo-alladivo', playCount: 5 });
});

describe('public songs API', () => {
  it('lists published songs with pagination meta', async () => {
    const res = await request(app).get('/api/songs');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('coverUrl');
  });

  it('returns song detail by slug with lyrics and related songs', async () => {
    const res = await request(app).get(`/api/songs/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Brahmam Okkate');
    expect(res.body.lyrics).toHaveLength(2);
    expect(res.body.related.length).toBeGreaterThanOrEqual(1);
  });

  it('searches by title', async () => {
    const res = await request(app).get('/api/songs').query({ q: 'Brahmam' });
    expect(res.body.data.some((s: { slug: string }) => s.slug === 'brahmam-okkate')).toBe(true);
  });

  it('streams audio honoring the Range header (206 partial content)', async () => {
    const res = await request(app).get(`/api/songs/${songId}/stream`).set('Range', 'bytes=0-1023');
    expect(res.status).toBe(206);
    expect(res.headers['content-range']).toMatch(/^bytes 0-1023\//);
    expect(res.headers['accept-ranges']).toBe('bytes');
  });

  it('returns 404 for an unknown song', async () => {
    const res = await request(app).get('/api/songs/does-not-exist');
    expect(res.status).toBe(404);
  });
});
