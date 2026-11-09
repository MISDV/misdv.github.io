import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { applyLanguage } from './site-language.mjs';

// One blocking stylesheet, shared by the public site. Shop and Lume keep their own CSS.
const sources = ['../assets/site-legacy.min.css', '../assets/site-extras.css', '../assets/booking.css', './site-accessibility.css'];
const css = (await Promise.all(sources.map(path => readFile(new URL(path, import.meta.url), 'utf8'))))
  .map(text => text.replace(/\/\*[\s\S]*?\*\//g, '').split(/\r?\n/).map(line => line.trim()).join(''))
  .join('\n') + '\n';
const output = new URL('../assets/site.min.css', import.meta.url);
if (await readFile(output, 'utf8').catch(() => '') !== css) await writeFile(output, css);
export const siteStylesHref = `/assets/site.min.css?v=${createHash('sha256').update(css).digest('hex').slice(0, 12)}`;

export function applySiteStyles(html) {
  let found = false;
  html = html.replace(/<link\b[^>]*href="\/assets\/(?:site-legacy\.min|site\.min|site-extras|booking)\.css(?:\?[^"\s]*)?"[^>]*>/g, () => {
    if (found) return '';
    found = true;
    return `<link rel="stylesheet" href="${siteStylesHref}">`;
  });
  if (!found) throw new Error('Foglio di stile del sito non trovato.');
  const preload = '<link rel="preload" href="/assets/site-fonts/material-icons-site.woff2" as="font" type="font/woff2" crossorigin>';
  if (!html.includes(preload)) html = html.replace('</head>', `${preload}\n</head>`);
  return applyLanguage(html);
}
