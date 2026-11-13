import { readdir, readFile, writeFile } from 'node:fs/promises';
import { origin } from './site-seo.mjs';

const root = new URL('../', import.meta.url);
const urls = new Set();
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['admin', 'node_modules'].includes(entry.name)) continue;
    const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) { await visit(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = await readFile(file, 'utf8');
    const relative = decodeURIComponent(file.href.slice(root.href.length));
    const expected = origin + '/' + relative.replace(/index\.html$/, '');
    const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) || [];
    const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(([, name, , value]) => [name.toLowerCase(), value]));
    if (!relative.startsWith('shop/')) {
      for (const tag of html.match(/<a\b[^>]*>/gi) || []) {
        const href = attrs(tag).href;
        if (!href) continue;
        const link = new URL(href, expected);
        if (link.origin === origin && link.pathname.startsWith('/shop/')) throw new Error('Collegamento pubblico al catalogo privato in ' + relative + ': ' + href);
      }
    }
    if (tags.some(tag => {
      const a = attrs(tag);
      return a['http-equiv']?.toLowerCase() === 'refresh' || ['robots', 'googlebot'].includes(a.name?.toLowerCase()) && /\bnoindex\b/i.test(a.content);
    })) continue;
    const canonical = tags.map(attrs).find(a => a.rel === 'canonical')?.href;
    if (!canonical) throw new Error('Canonical mancante: ' + file.pathname);
    if (canonical !== expected) throw new Error('Canonical non corrispondente al file: ' + canonical);
    // Defence in depth: private catalog routes must never re-enter the sitemap.
    if (new URL(canonical).pathname.startsWith('/shop/')) throw new Error('Pagina shop priva di noindex: ' + canonical);
    urls.add(canonical);
  }
}
await visit(root);
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...urls].sort().map(url => `  <url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('\n') + '\n</urlset>\n';
const destination = new URL('sitemap.xml', root);
if (await readFile(destination, 'utf8').catch(() => '') !== xml) await writeFile(destination, xml);
console.log(`Sitemap: ${urls.size} pagine pubbliche; catalogo privato escluso.`);
