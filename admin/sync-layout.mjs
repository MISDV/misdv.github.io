import { readFile, writeFile } from 'node:fs/promises';
import { replaceSiteLayout } from './site-layout.mjs';
import { applySiteStyles } from './site-assets.mjs';

for (const [name, path] of [['index.html', '/'], ['menu/index.html', '/menu/'], ['storia.html', '/storia.html']]) {
  const url = new URL('../' + name, import.meta.url);
  const html = await readFile(url, 'utf8');
  const updated = applySiteStyles(replaceSiteLayout(html, path));
  if (html !== updated) await writeFile(url, updated, 'utf8');
}
