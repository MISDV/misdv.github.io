import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { applyLanguage } from './site-language.mjs';
import { renderSiteData } from './site-data.mjs';
import { applyFooterCredit } from './site-credit.mjs';
import { applySocialMetadata } from './site-metadata.mjs';
import { applyBusinessSchemas } from './site-business.mjs';

// One blocking stylesheet, shared by the public site. Shop and Lume keep their own CSS.
const sources = ['../assets/site-legacy.min.css', './site-fonts.css', '../assets/site-extras.css', '../assets/booking.css', './site-accessibility.css'];
const css = (await Promise.all(sources.map(path => readFile(new URL(path, import.meta.url), 'utf8'))))
  .map(text => text.replace(/\/\*[\s\S]*?\*\//g, '').split(/\r?\n/).map(line => line.trim()).join(''))
  .join('\n') + '\n';
const output = new URL('../assets/site.min.css', import.meta.url);
if (await readFile(output, 'utf8').catch(() => '') !== css) await writeFile(output, css);
export const siteStylesHref = `/assets/site.min.css?v=${createHash('sha256').update(css).digest('hex').slice(0, 12)}`;
const scripts = await Promise.all(['site.js', 'booking.js', 'consent.js', 'menu.mjs'].map(async name => [name,
  '/assets/' + name + '?v=' + createHash('sha256').update(await readFile(new URL('../assets/' + name, import.meta.url))).digest('hex').slice(0, 12),
]));
const serifFont = css.match(/src:url\((site-fonts\/giuggioloni-serif-[a-f0-9]+\.woff2)\)/)?.[1];
if (!serifFont) throw new Error('Font principale ottimizzato non trovato.');

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
  html = html.replace(/href="\/assets\/(?:shop-fonts\/playfair-display-700-latin|site-fonts\/giuggioloni-serif-[a-f0-9]+)\.woff2"/g, `href="/assets/${serifFont}"`);
  for (const [name, href] of scripts) {
    const pattern = new RegExp(`src="/assets/${name.replace('.', '\\.')}\\b(?:\\?[^\"]*)?"`, 'g');
    html = html.replace(pattern, `src="${href}"`);
  }
  return applySocialMetadata(applyBusinessSchemas(applyFooterCredit(applyLanguage(renderSiteData(html)))));
}
