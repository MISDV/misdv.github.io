import { readFile, writeFile } from 'node:fs/promises';
import { applySiteStyles } from './site-assets.mjs';

for (const name of ['index.html', 'menu/index.html', 'menu/en/index.html', 'storia.html', 'en/index.html', 'spaccio/index.html', 'fattoria/index.html', 'fattoria/animali/index.html', 'fattoria/orto/index.html', 'fattoria/locale/index.html', 'privacy/index.html']) {
  const file = new URL('../' + name, import.meta.url);
  const html = await readFile(file, 'utf8');
  const updated = applySiteStyles(html);
  if (html !== updated) await writeFile(file, updated);
}
console.log('CSS pubblico riunito e riferimenti aggiornati.');
await import('./build-sitemap.mjs');
