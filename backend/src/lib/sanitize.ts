import sanitizeHtml from 'sanitize-html';

const decodeSafe = (s: string): string =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Strip ALL HTML; for names, comments, plain fields and lyrics. */
export const cleanText = (s: string): string =>
  decodeSafe(sanitizeHtml(s ?? '', { allowedTags: [], allowedAttributes: {} })).trim();

/** Allow a safe subset of formatting; for article bodies and CMS-editable static pages. */
export const cleanRich = (s: string): string =>
  sanitizeHtml(s ?? '', {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'hr'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
