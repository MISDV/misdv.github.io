import { readFile, writeFile } from 'node:fs/promises';
import { updateMenuPage } from './menu-page.mjs';

const menu = JSON.parse(await readFile(new URL('../menu.json', import.meta.url), 'utf8'));
if (!menu?.days || typeof menu.days !== 'object' || Array.isArray(menu.days)) {
  throw new Error('menu.json deve contenere i giorni del menù.');
}

const pages = await Promise.all(['../menu/index.html', '../index.html'].map(async path => {
  const url = new URL(path, import.meta.url);
  const html = await readFile(url, 'utf8');
  return { url, html, updated: updateMenuPage(html, menu) };
}));
for (const { url, html, updated } of pages) {
  if (updated !== html) await writeFile(url, updated, 'utf8');
}
console.log('Pagina del menù e anteprima nella home sincronizzate.');
