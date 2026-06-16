import fs from 'fs';
import { storagePath, type StorageFolder } from '../lib/storage';

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Write a short, gentle sine-tone WAV so the audio player has real, seekable audio. */
export function writeToneWav(folder: StorageFolder, filename: string, freq: number, seconds: number): number {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * seconds);
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const env = Math.max(0, Math.min(1, t / 0.08, (seconds - t) / 0.4));
    // soft chord: fundamental + fifth, low amplitude
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.5 * Math.sin(2 * Math.PI * freq * 1.5 * t)) * 0.16 * env;
    buf.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, 44 + i * 2);
  }
  fs.writeFileSync(storagePath(folder, filename), buf);
  return Math.round(seconds);
}

/** Square cover art with a cultural gradient, Om watermark, and title text. */
export function writeCoverSvg(filename: string, titleMain: string, titleSub: string, hue: number): void {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},72%,46%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 28) % 360},78%,28%)"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <text x="300" y="360" font-size="300" fill="rgba(255,255,255,0.12)" text-anchor="middle" font-family="Georgia, serif">ॐ</text>
  <rect x="36" y="36" width="528" height="528" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" rx="20"/>
  <text x="300" y="436" font-size="46" fill="#ffffff" text-anchor="middle" font-family="Georgia, serif">${xml(titleMain)}</text>
  <text x="300" y="486" font-size="24" fill="rgba(255,255,255,0.88)" text-anchor="middle" font-family="Verdana, sans-serif">${xml(titleSub)}</text>
</svg>`;
  fs.writeFileSync(storagePath('images', filename), svg);
}

/** Wide festival banner. */
export function writeBannerSvg(folder: StorageFolder, filename: string, title: string, subtitle: string, hue: number): void {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="380" viewBox="0 0 1200 380">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="hsl(${hue},80%,42%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 35) % 360},82%,26%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="380" fill="url(#b)"/>
  <text x="1050" y="300" font-size="320" fill="rgba(255,255,255,0.10)" text-anchor="middle" font-family="Georgia, serif">ॐ</text>
  <text x="80" y="180" font-size="64" fill="#fff" font-family="Georgia, serif">${xml(title)}</text>
  <text x="82" y="240" font-size="28" fill="rgba(255,255,255,0.9)" font-family="Verdana, sans-serif">${xml(subtitle)}</text>
</svg>`;
  fs.writeFileSync(storagePath(folder, filename), svg);
}
