import { readdir, readFile, writeFile } from 'node:fs/promises';
import { applySiteStyles } from './site-assets.mjs';
import { applySocialMetadata } from './site-metadata.mjs';

for (const name of ['index.html', 'menu/index.html', 'menu/en/index.html', 'storia.html', 'en/index.html', 'spaccio/index.html', 'fattoria/index.html', 'fattoria/animali/index.html', 'fattoria/orto/index.html', 'fattoria/locale/index.html', 'privacy/index.html', 'prenotazione/index.html']) {
  const file = new URL('../' + name, import.meta.url);
  const html = await readFile(file, 'utf8');
  const updated = applySiteStyles(html);
  if (html !== updated) await writeFile(file, updated);
}
console.log('CSS pubblico riunito e riferimenti aggiornati.');
// Also cover stand-alone catalog/Lume builds, prints and legacy redirects.
async function finalize(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['admin', 'node_modules'].includes(entry.name)) continue;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) { await finalize(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    const updated = applySocialMetadata(html);
    if (html !== updated) await writeFile(file, updated);
  }
}
await finalize(new URL('../', import.meta.url));
await import('./build-sitemap.mjs');
