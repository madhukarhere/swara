#!/usr/bin/env node
/**
 * Sources public-domain / freely-licensed cultural images from Wikimedia Commons
 * into frontend/public/cultural/. Re-run any time. Replace the files with your
 * own to customise (keep the same filenames).
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../frontend/public/cultural');
fs.mkdirSync(OUT, { recursive: true });

const UA = 'SwaraPortal/1.0 (local cultural-music demo; contact: admin@swara.local)';

function getJson(url) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { 'User-Agent': UA } }, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => {
          try {
            res(JSON.parse(d));
          } catch (e) {
            rej(e);
          }
        });
      })
      .on('error', rej);
  });
}

function download(url, dest, redirects = 0) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { 'User-Agent': UA } }, (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && redirects < 6) {
          r.resume();
          return res(download(r.headers.location, dest, redirects + 1));
        }
        if (r.statusCode !== 200) {
          r.resume();
          return rej(new Error(`HTTP ${r.statusCode}`));
        }
        const f = fs.createWriteStream(dest);
        r.pipe(f);
        f.on('finish', () => f.close(() => res(fs.statSync(dest).size)));
        return undefined;
      })
      .on('error', rej);
  });
}

async function searchImage(query) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    '&iiprop=url|mime|size&iiurlwidth=900&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=' +
    encodeURIComponent(query);
  const j = await getJson(api);
  const pages = Object.values(j?.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (ii?.thumburl && (ii.mime || '').startsWith('image/')) {
      return { title: p.title, url: ii.thumburl };
    }
  }
  return null;
}

const targets = [
  { name: 'veena.jpg', queries: ['Saraswati veena instrument', 'Tanjore veena', 'Veena instrument India'] },
  { name: 'bharat-mata.jpg', queries: ['Bharat Mata Abanindranath Tagore', 'Bharat Mata painting Tagore'] },
];

for (const t of targets) {
  let done = false;
  for (const q of t.queries) {
    try {
      const r = await searchImage(q);
      if (r) {
        const size = await download(r.url, path.join(OUT, t.name));
        console.log(`  ✓ ${t.name} ← "${r.title}" (${Math.round(size / 1024)} KB) [query: ${q}]`);
        done = true;
        break;
      }
    } catch (e) {
      console.warn(`    query "${q}" failed: ${e.message}`);
    }
  }
  if (!done) console.error(`  ✗ could not source ${t.name}`);
}
console.log('\nDone. Files in', OUT);
