import request from 'supertest';
import type { Express } from 'express';
import {
  Admin,
  Category,
  Song,
  SongLyrics,
  SongComment,
  Quote,
  Banner,
  Announcement,
  CalendarEvent,
  HomepageSettings,
  Video,
  Article,
  EventModel,
  SongPlay,
  SongDownload,
  AuditLog,
} from '../src/models';

export async function clearAll(): Promise<void> {
  await Promise.all([
    Admin.deleteMany({}),
    Category.deleteMany({}),
    Song.deleteMany({}),
    SongLyrics.deleteMany({}),
    SongComment.deleteMany({}),
    Quote.deleteMany({}),
    Banner.deleteMany({}),
    Announcement.deleteMany({}),
    CalendarEvent.deleteMany({}),
    HomepageSettings.deleteMany({}),
    Video.deleteMany({}),
    Article.deleteMany({}),
    EventModel.deleteMany({}),
    SongPlay.deleteMany({}),
    SongDownload.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
}

export async function makeAdmin(username = 'admin', password = 'Admin@12345') {
  const a = new Admin({ username, email: `${username}@test.local`, role: 'ADMIN' });
  await a.setPassword(password);
  await a.save();
  return a;
}

export async function makeCategory(name = 'Keertanas') {
  return Category.create({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
}

let songSeq = 0;
export async function makeSong(categoryId: unknown, over: Record<string, unknown> = {}) {
  songSeq += 1;
  return Song.create({
    title: `Test Song ${songSeq}`,
    slug: `test-song-${songSeq}`,
    category: categoryId,
    status: 'published',
    ...over,
  });
}

/** Returns a cookie-persisting agent that is already logged in, plus the CSRF token. */
export async function adminAgent(app: Express, username = 'admin', password = 'Admin@12345') {
  const agent = request.agent(app);
  const csrf = (await agent.get('/api/admin/csrf')).body.csrfToken as string;
  await agent.post('/api/admin/login').set('X-CSRF-Token', csrf).send({ username, password });
  return { agent, csrf };
}
