import { readFile, writeFile } from 'node:fs/promises';
import { updateMenuPage, validMenu } from './menu-page.mjs';

const menu = JSON.parse(await readFile(new URL('../menu.json', import.meta.url), 'utf8'));
if (!validMenu(menu)) throw new Error('Categorie, piatti o prezzi non validi in menu.json.');

const pages = await Promise.all(['../menu/index.html', '../index.html'].map(async path => {
  const url = new URL(path, import.meta.url);
  const html = await readFile(url, 'utf8');
  return { url, html, updated: updateMenuPage(html, menu, { preview: path === '../index.html' }) };
}));
for (const { url, html, updated } of pages) {
  if (updated !== html) await writeFile(url, updated, 'utf8');
}
console.log('Pagina del menù e anteprima nella home sincronizzate.');
