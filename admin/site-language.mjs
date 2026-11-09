import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const source = await readFile(new URL('../assets/language.js', import.meta.url));
const script = `<script src="/assets/language.js?v=${createHash('sha256').update(source).digest('hex').slice(0,12)}" defer></script>`;
export function applyLanguage(html) {
  if (html.includes('src="/assets/language.js')) return html.replace(/<script src="\/assets\/language\.js[^\"]*"[^>]*><\/script>/,script);
  return html.replace('</head>',script+'\n</head>');
}
