import { readFile, writeFile } from 'node:fs/promises';
import { updateMenuPage } from './menu-page.mjs';

const page = new URL('../menu/index.html', import.meta.url);
const menu = JSON.parse(await readFile(new URL('../menu.json', import.meta.url), 'utf8'));
if (!menu?.days || typeof menu.days !== 'object' || Array.isArray(menu.days)) {
  throw new Error('menu.json deve contenere i giorni del menù.');
}

const html = await readFile(page, 'utf8');
const updated = updateMenuPage(html, menu);
if (updated !== html) await writeFile(page, updated, 'utf8');
console.log('Pagina del menù sincronizzata.');
