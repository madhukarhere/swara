import * as React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement>;

/** Shared line-art wrapper, matching the lucide stroke style. */
function Glyph({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ----------------------------- Devotional symbols ----------------------------- */

/** ॐ — rendered from the Unicode glyph for fidelity. */
export function Om(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <text x="12" y="19" textAnchor="middle" fontSize="21" fontFamily="Georgia, 'Noto Serif', serif">
        ॐ
      </text>
    </svg>
  );
}

export function Lotus(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 20c-2-4-2-8 0-12 2 4 2 8 0 12Z" />
      <path d="M12 20c-3-3-4.5-6.5-4-10 3 2 4 6 4 10Z" />
      <path d="M12 20c3-3 4.5-6.5 4-10-3 2-4 6-4 10Z" />
      <path d="M12 20c-4.5-2-7.5-5-8-8.5 4 1 7 4.5 8 8.5Z" />
      <path d="M12 20c4.5-2 7.5-5 8-8.5-4 1-7 4.5-8 8.5Z" />
    </Glyph>
  );
}

export function Diya(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.5 13.5c3.5 4 13.5 4 17 0-3.5 1.3-13.5 1.3-17 0Z" />
      <path d="M12 12.5c-.8-2 .8-3 0-5.5 1.8 1.8 1.6 4 0 5.5Z" />
      <path d="M9 16.4c1.5 1 4.5 1 6 0" />
    </Glyph>
  );
}

export function Bell(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M6.5 15c0-5 1.5-8.5 5.5-8.5S17.5 10 17.5 15Z" />
      <path d="M5.5 15h13" />
      <path d="M12 6.5V5" />
      <circle cx="12" cy="3.8" r="1.1" />
      <path d="M12 15v1.6" />
      <circle cx="12" cy="17.6" r=".8" />
    </Glyph>
  );
}

export function Conch(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M8.5 3.5c5 1 8 5 8 9.5 0 4-4 7.5-8.5 7 3.5-3 4.5-6.5 3-9-1-2-1.5-4.5-2.5-7.5Z" />
      <path d="M11 11c1.5 1 3 1.5 4.5 1" />
      <path d="M10.2 8c1.3.7 2.8 1 4.1 1" />
      <path d="M8 20c-1.5-1.5-2-3.5-1.5-5.5" />
    </Glyph>
  );
}

export function Kalasha(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M7 13c0 5 2 7.5 5 7.5s5-2.5 5-7.5c0-1.8-2.2-3-5-3s-5 1.2-5 3Z" />
      <path d="M9 10.3c1-1 5-1 6 0" />
      <circle cx="12" cy="7.3" r="2" />
      <path d="M10.3 8.6C8.5 8 7.5 6 8 4.3" />
      <path d="M13.7 8.6c1.8-.6 2.8-2.6 2.3-4.3" />
    </Glyph>
  );
}

export function PeacockFeather(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 21c.5-5-.5-8 0-11.5" />
      <ellipse cx="12" cy="6" rx="3.3" ry="4.4" />
      <ellipse cx="12" cy="6.4" rx="1.7" ry="2.4" />
      <path d="M12 9.5C9.5 9 8.6 7.5 8.9 6" />
      <path d="M12 9.5c2.5-.5 3.4-2 3.1-3.5" />
    </Glyph>
  );
}

export function Trishul(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 21V7" />
      <path d="M12 7V2.5" />
      <path d="M8.5 8V4.2" />
      <path d="M15.5 8V4.2" />
      <path d="M8.5 7.2C10 6 14 6 15.5 7.2" />
      <path d="M10 18.5h4" />
    </Glyph>
  );
}

/* ------------------------------ Musical instruments ------------------------------ */

export function Veena(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="7.5" cy="16.2" r="3.8" />
      <path d="M10 13.6 18.6 5" />
      <path d="M9.4 14.8 18 6.4" />
      <circle cx="19.6" cy="4.4" r="1.5" />
      <path d="m17.7 6.2 1.4-1" />
      <path d="m18.9 7.3 1.4-1" />
    </Glyph>
  );
}

export function Tanpura(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="17.5" r="3.6" />
      <path d="M10.3 15V4.6a1.7 1.7 0 0 1 3.4 0V15" />
      <path d="M11.1 15V5.2" />
      <path d="M12.9 15V5.2" />
      <path d="M10 16.2h4" />
    </Glyph>
  );
}

export function Bansuri(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="3" y="10.5" width="18" height="3" rx="1.5" />
      <path d="M6 12h.01" />
      <path d="M9.5 12h.01" />
      <path d="M12.5 12h.01" />
      <path d="M15.5 12h.01" />
      <path d="M18 12h.01" />
    </Glyph>
  );
}

export function Tabla(props: IconProps) {
  return (
    <Glyph {...props}>
      <ellipse cx="8" cy="9" rx="3" ry="1.5" />
      <path d="M5 9v5c0 1.4 1.4 2 3 2s3-.6 3-2V9" />
      <ellipse cx="16.5" cy="10" rx="3.4" ry="1.7" />
      <path d="M13.1 10v4.5c0 1.5 1.5 2.1 3.4 2.1s3.4-.6 3.4-2.1V10" />
    </Glyph>
  );
}

export function Mridangam(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 12c0-2.5 2-3.5 4-3.5h6c2 0 4 1 4 3.5s-2 3.5-4 3.5H9c-2 0-4-1-4-3.5Z" />
      <ellipse cx="6.2" cy="12" rx="1.3" ry="3.2" />
      <ellipse cx="17.8" cy="12" rx="1.3" ry="3.2" />
    </Glyph>
  );
}

export function Manjira(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="8" cy="10" r="3.7" />
      <circle cx="8" cy="10" r=".8" />
      <circle cx="16" cy="14" r="3.7" />
      <circle cx="16" cy="14" r=".8" />
      <path d="M8.2 6.4C12 5 13.2 8 15.8 10.4" />
    </Glyph>
  );
}

/** Ordered set for decorative cycling (instruments + symbols). */
export const CULTURAL_ICONS = [
  Veena,
  Bansuri,
  Tabla,
  Mridangam,
  Tanpura,
  Manjira,
  Lotus,
  Diya,
  Bell,
  Conch,
  Kalasha,
  PeacockFeather,
] as const;

/** Deterministic pick from a string key (e.g. category id) so it stays stable. */
export function iconForKey(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return CULTURAL_ICONS[h % CULTURAL_ICONS.length];
}
