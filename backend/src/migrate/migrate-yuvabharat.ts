/**
 * One-off migration: SQL Server `yuvabharat` -> MongoDB `swara`.
 * See docs/superpowers/specs/2026-06-30-sqlserver-to-mongodb-migration-design.md
 *
 * Run:  npx tsx src/migrate/migrate-yuvabharat.ts
 */
import 'dotenv/config';
import crypto from 'node:crypto';
import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import sql from 'mssql';

import {
  Category,
  Song,
  SongLyrics,
  SongComment,
  SongPlay,
  Admin,
  DocumentModel,
  Quote,
  CalendarEvent,
} from '../models/index';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swara';

const SQL_CONFIG: sql.config = {
  user: 'sa',
  password: 'SwaraDev@2026',
  server: 'localhost',
  port: 1433,
  database: 'yuvabharat',
  options: { encrypt: true, trustServerCertificate: true },
  requestTimeout: 120000,
};

/* ----------------------------- helpers ------------------------------ */
const sha = (s?: string | null) =>
  s ? crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 32) : undefined;

const usedSlugs = new Set<string>();
function uniqueSlug(input: string): string {
  let base = (input || 'item')
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  if (!base) base = 'item';
  let slug = base;
  let n = 2;
  while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
  usedSlugs.add(slug);
  return slug;
}

const dateBucket = (d?: Date | null) =>
  (d instanceof Date && !isNaN(d.getTime()) ? d : new Date('2015-01-01')).toISOString().slice(0, 10);

const LANG_CODES: Record<string, string> = { telugu: 'te', sanskrit: 'sa', hindi: 'hi', english: 'en' };
const langCode = (name?: string) =>
  name ? LANG_CODES[name.trim().toLowerCase()] || name.trim().slice(0, 2).toLowerCase() : 'xx';

async function q<T = any>(pool: sql.ConnectionPool, query: string): Promise<T[]> {
  const r = await pool.request().query(query);
  return r.recordset as T[];
}

async function rawInsert(model: mongoose.Model<any>, docs: any[], batch = 2000) {
  if (!docs.length) return 0;
  const col = model.collection;
  for (let i = 0; i < docs.length; i += batch) {
    await col.insertMany(docs.slice(i, i + batch), { ordered: false });
  }
  return docs.length;
}

/* ------------------------------ main -------------------------------- */
async function main() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connecting to SQL Server: yuvabharat');
  const pool = await sql.connect(SQL_CONFIG);

  const summary: Record<string, number> = {};

  // Wipe targets
  const targets = [Category, Song, SongLyrics, SongComment, SongPlay, Admin, DocumentModel, Quote, CalendarEvent];
  for (const m of targets) await m.collection.deleteMany({});
  console.log('Wiped target collections.');

  /* 1. Languages lookup */
  const langs = await q(pool, 'SELECT LanID, LanTitle FROM V_Languages');
  const langMap = new Map<number, string>(langs.map((l) => [l.LanID, l.LanTitle]));

  /* 2. categories <- v_Categories + V_GhoshCategory */
  const catMap = new Map<number, Types.ObjectId>(); // v_Categories
  const ghoshMap = new Map<number, Types.ObjectId>(); // V_GhoshCategory
  const catDocs: any[] = [];

  for (const c of await q(pool, 'SELECT CatId, CatName, CatDesc, CatStatus, CatDOC FROM v_Categories')) {
    const _id = new Types.ObjectId();
    catMap.set(c.CatId, _id);
    const doc = new Category({ _id, name: c.CatName, slug: uniqueSlug(c.CatName), description: c.CatDesc, order: c.CatId }).toObject();
    doc.createdAt = c.CatDOC || new Date();
    doc.updatedAt = doc.createdAt;
    catDocs.push(doc);
  }
  for (const g of await q(pool, 'SELECT GhoshCatID, GhoshCatName FROM V_GhoshCategory')) {
    const _id = new Types.ObjectId();
    ghoshMap.set(g.GhoshCatID, _id);
    const doc = new Category({ _id, name: g.GhoshCatName, slug: uniqueSlug(g.GhoshCatName), order: 100 + g.GhoshCatID }).toObject();
    doc.createdAt = new Date();
    doc.updatedAt = doc.createdAt;
    catDocs.push(doc);
  }
  summary.categories = await rawInsert(Category, catDocs);

  /* 3. songs <- V_Files + V_Rachana */
  const fileSongMap = new Map<number, Types.ObjectId>();
  const fileDateMap = new Map<number, Date>();
  const songDocs: any[] = [];
  const lyricDocs: any[] = [];
  const fallbackCat = catMap.values().next().value as Types.ObjectId;

  for (const f of await q(pool, `SELECT FileID,FileTitle,FileName,FileDesc,FileAuthor,FileStatus,FileCatID,FileDOC,FileHits,FileLanID,FileDownloadCount FROM V_Files`)) {
    const _id = new Types.ObjectId();
    fileSongMap.set(f.FileID, _id);
    if (f.FileDOC) fileDateMap.set(f.FileID, f.FileDOC);
    const language = langMap.get(f.FileLanID);
    const doc = new Song({
      _id,
      title: f.FileTitle || f.FileName || `Song ${f.FileID}`,
      slug: uniqueSlug(f.FileTitle || `song-${f.FileID}`),
      category: catMap.get(f.FileCatID) || fallbackCat,
      singer: f.FileAuthor || undefined,
      audioFile: f.FileName || undefined,
      playCount: f.FileHits || 0,
      downloadCount: f.FileDownloadCount || 0,
      languages: language ? [language] : [],
      status: f.FileStatus === 1 ? 'published' : 'draft',
      publishedAt: f.FileDOC || undefined,
    }).toObject();
    doc.createdAt = f.FileDOC || new Date();
    doc.updatedAt = doc.createdAt;
    songDocs.push(doc);

    // Lyrics live in V_Files.FileDesc (plain text in the file's language).
    const lyrics = (f.FileDesc || '').toString().trim();
    if (lyrics.length > 5) {
      const ldoc = new SongLyrics({
        _id: new Types.ObjectId(),
        song: _id,
        language: language || 'Unknown',
        languageCode: langCode(language),
        content: lyrics,
        isDefault: true,
        order: 0,
      }).toObject();
      ldoc.createdAt = f.FileDOC || new Date();
      ldoc.updatedAt = ldoc.createdAt;
      lyricDocs.push(ldoc);
    }
  }

  for (const r of await q(pool, `SELECT RachanaID,RachanaCatID,RachanaName,RachanaDesc,RachanaFileName,RachanaDOC,RachanaStatus,RachanaHits,RachanaDownloads FROM V_Rachana`)) {
    const _id = new Types.ObjectId();
    const doc = new Song({
      _id,
      title: r.RachanaName || `Rachana ${r.RachanaID}`,
      slug: uniqueSlug(r.RachanaName || `rachana-${r.RachanaID}`),
      category: ghoshMap.get(r.RachanaCatID) || fallbackCat,
      audioFile: r.RachanaFileName || undefined,
      playCount: r.RachanaHits || 0,
      downloadCount: r.RachanaDownloads || 0,
      status: r.RachanaStatus === 1 ? 'published' : 'draft',
      publishedAt: r.RachanaDOC || undefined,
    }).toObject();
    doc.createdAt = r.RachanaDOC || new Date();
    doc.updatedAt = doc.createdAt;
    songDocs.push(doc);
  }
  summary.songs = await rawInsert(Song, songDocs);
  summary.songLyrics = await rawInsert(SongLyrics, lyricDocs);

  /* 4. songComments <- V_Comments */
  const cStatus = (s: number) => (s === 1 ? 'approved' : s === 2 ? 'rejected' : 'pending');
  const commentDocs: any[] = [];
  for (const c of await q(pool, `SELECT CommentID,Name,Comment,Email,DateCreated,FileID,Status,IPAddress FROM V_Comments`)) {
    const song = fileSongMap.get(c.FileID);
    if (!song) continue;
    const doc = new SongComment({
      song,
      name: (c.Name || 'Anonymous').slice(0, 80),
      email: c.Email || undefined,
      comment: (c.Comment || '').slice(0, 2000) || '(empty)',
      status: cStatus(c.Status),
      ipHash: sha(c.IPAddress),
    }).toObject();
    doc.createdAt = c.DateCreated || new Date();
    doc.updatedAt = doc.createdAt;
    commentDocs.push(doc);
  }
  summary.songComments = await rawInsert(SongComment, commentDocs);

  /* 5. songPlays <- V_Embed */
  const playDocs: any[] = [];
  for (const e of await q(pool, `SELECT EmbedSite,EmbedFileID FROM V_Embed`)) {
    const song = fileSongMap.get(e.EmbedFileID);
    if (!song) continue;
    playDocs.push({
      _id: new Types.ObjectId(),
      song,
      dateBucket: dateBucket(fileDateMap.get(e.EmbedFileID)),
      ipHash: sha(e.EmbedSite),
      createdAt: fileDateMap.get(e.EmbedFileID) || new Date('2015-01-01'),
    });
  }
  summary.songPlays = await rawInsert(SongPlay, playDocs);

  /* 6. admins <- V_Users */
  const adminDocs: any[] = [];
  const seenUser = new Set<string>();
  const seenEmail = new Set<string>();
  for (const u of await q(pool, `SELECT UID,UName,UEmail,UPassword,UCreation,ULastLogin FROM V_Users`)) {
    let username = (u.UName || `user${u.UID}`).toLowerCase().replace(/\s+/g, '');
    let email = (u.UEmail || `user${u.UID}@example.com`).toLowerCase();
    if (seenUser.has(username)) username = `${username}${u.UID}`;
    if (seenEmail.has(email)) email = `${u.UID}.${email}`;
    seenUser.add(username);
    seenEmail.add(email);
    adminDocs.push({
      _id: new Types.ObjectId(),
      username,
      email,
      passwordHash: await bcrypt.hash(u.UPassword || `changeme${u.UID}`, 12),
      role: 'ADMIN',
      lastLoginAt: u.ULastLogin || undefined,
      createdAt: u.UCreation || new Date(),
      updatedAt: u.UCreation || new Date(),
    });
  }
  summary.admins = await rawInsert(Admin, adminDocs);

  /* 7. documents <- V_Downloads */
  const docDocs: any[] = [];
  for (const d of await q(pool, `SELECT DownloadID,DownloadName,DownloadFileName,DownloadDesc,FileSize,DownloadDOC FROM V_Downloads`)) {
    if (!d.DownloadFileName) continue;
    const size = parseInt(String(d.FileSize || '').replace(/[^0-9]/g, ''), 10);
    docDocs.push({
      _id: new Types.ObjectId(),
      title: d.DownloadName || d.DownloadFileName,
      type: 'download',
      filePath: d.DownloadFileName,
      size: isNaN(size) ? undefined : size,
      createdAt: d.DownloadDOC || new Date(),
      updatedAt: d.DownloadDOC || new Date(),
    });
  }
  summary.documents = await rawInsert(DocumentModel, docDocs);

  /* 8. quotes <- V_Quotes */
  const quoteDocs: any[] = [];
  for (const qq of await q(pool, `SELECT QID,QDesc,QPerson,QDOC,QStatus FROM V_Quotes`)) {
    if (!qq.QDesc) continue;
    quoteDocs.push({
      _id: new Types.ObjectId(),
      text: qq.QDesc,
      author: qq.QPerson || undefined,
      mode: 'random',
      isActive: qq.QStatus === 1,
      createdAt: qq.QDOC || new Date(),
      updatedAt: qq.QDOC || new Date(),
    });
  }
  summary.quotes = await rawInsert(Quote, quoteDocs);

  /* 9. calendarEvents <- V_Calendar */
  const calDocs: any[] = [];
  for (const c of await q(pool, `SELECT Edate,TTithi,SignificanceDesc FROM V_Calendar`)) {
    const d: Date | null = c.Edate ? new Date(c.Edate) : null;
    if (!d || isNaN(d.getTime())) continue;
    const name = (c.SignificanceDesc || c.TTithi || 'Event').toString().slice(0, 200);
    calDocs.push({
      _id: new Types.ObjectId(),
      name,
      month: d.getMonth() + 1,
      day: d.getDate(),
      year: d.getFullYear(),
      description: c.SignificanceDesc || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  summary.calendarEvents = await rawInsert(CalendarEvent, calDocs);

  console.log('\n=== Migration summary (docs inserted) ===');
  for (const [k, v] of Object.entries(summary)) console.log(`  ${k.padEnd(16)} ${v}`);

  await pool.close();
  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
