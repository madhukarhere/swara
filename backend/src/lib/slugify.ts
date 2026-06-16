/** ASCII slug; returns '' when input has no latin chars (caller adds a fallback/suffix). */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Build a slug guaranteed non-empty and unique against an async existence check. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  fallback = 'item',
): Promise<string> {
  let root = slugify(base) || fallback;
  let candidate = root;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await exists(candidate)) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}
