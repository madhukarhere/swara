#!/usr/bin/env node
/**
 * Local backup: dumps MongoDB with mongodump and copies the media tree into
 * data/backups/<timestamp>/. No cloud — everything stays on disk.
 *
 * Usage:  node scripts/backup.mjs
 * Env:    MONGODB_URI (default mongodb://127.0.0.1:27017/swara)
 *         DATA_DIR    (default <repo>/data)
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function readEnv(file) {
  const out = {};
  try {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {
    /* no .env */
  }
  return out;
}

const env = readEnv(path.join(ROOT, 'backend', '.env'));
const MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swara';
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(DATA_DIR, 'backups', stamp);
fs.mkdirSync(path.join(outDir, 'db'), { recursive: true });

console.log(`Swara backup → ${outDir}`);

// 1) Database dump
try {
  execFileSync('mongodump', ['--uri', MONGODB_URI, '--out', path.join(outDir, 'db')], { stdio: 'inherit' });
  console.log('  ✓ database dumped');
} catch (e) {
  console.error('  ✗ mongodump failed — is the MongoDB Database Tools package installed and on PATH?');
  console.error(`    ${e.message}`);
}

// 2) Media copy (everything under data/ except the backups folder itself)
const MEDIA = ['songs', 'videos', 'documents', 'banners', 'images', 'article_images', 'lyrics_pdfs', 'profile_images'];
let files = 0;
for (const folder of MEDIA) {
  const src = path.join(DATA_DIR, folder);
  if (!fs.existsSync(src)) continue;
  const dest = path.join(outDir, 'media', folder);
  fs.cpSync(src, dest, { recursive: true });
  files += fs.readdirSync(src).length;
}
console.log(`  ✓ media copied (${files} files)`);
console.log('\nBackup complete.');
console.log('Restore DB with:  mongorestore --uri "<uri>" --drop ' + path.join(outDir, 'db'));
