import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildLume } from './lume/build.mjs';
import { updateMenuPage, validMenu } from './menu-page.mjs';
import { buildEnglishMenu, menuAlternates, menuLanguageLinks } from './menu-english.mjs';

const menu = JSON.parse(await readFile(new URL('../menu.json', import.meta.url), 'utf8'));
if (!validMenu(menu)) throw new Error('Categorie, piatti o prezzi non validi in menu.json.');
const lume = Array.isArray(menu.categories)
  ? await buildLume(menu, JSON.parse(await readFile(new URL('../dati.json', import.meta.url), 'utf8'))) : new Map();

const pages = await Promise.all(['../menu/index.html', '../index.html'].map(async path => {
  const url = new URL(path, import.meta.url);
  const html = await readFile(url, 'utf8');
  let updated = updateMenuPage(html, menu, { preview: path === '../index.html' });
  if (path === '../menu/index.html') {
    updated = menuAlternates(updated);
    updated = updated.replace(/<nav class="menu-languages"[\s\S]*?<\/nav>/g,'');
    updated = updated.replace(/(<nav class="breadcrumbs"[\s\S]*?<\/nav>)/, '$1'+menuLanguageLinks('it'));
    updated = updated.replace('href="/en/" lang="en" hreflang="en"', 'href="/menu/en/" lang="en" hreflang="en"');
  }
  return { url, html, updated };
}));
for (const { url, html, updated } of pages) {
  if (updated !== html) await writeFile(url, updated, 'utf8');
}
for (const [path, html] of lume) {
  const url = new URL('../' + path, import.meta.url);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, html, 'utf8');
}
console.log('Pagina del menù e anteprima nella home sincronizzate.' + (lume.size ? ' Versioni Lume rigenerate.' : ''));

await mkdir(new URL('../menu/en/',import.meta.url),{recursive:true});
await writeFile(new URL('../menu/en/index.html',import.meta.url), await buildEnglishMenu(menu),'utf8');
const sitemapURL=new URL('../sitemap.xml',import.meta.url);
let sitemap=await readFile(sitemapURL,'utf8');
if(!sitemap.includes('https://agriturismogiuggioloni.it/menu/en/')) await writeFile(sitemapURL,sitemap.replace('</urlset>','  <url><loc>https://agriturismogiuggioloni.it/menu/en/</loc></url>\n</urlset>'));
