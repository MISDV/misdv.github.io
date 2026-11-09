import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { origin, breadcrumbs, breadcrumbSchema, jsonLd } from './site-seo.mjs';
import shopMap from '../assets/shop-map.js';
import { shopBusiness, shopId, shopName } from './shop-business.mjs';

const require = createRequire(import.meta.url);
const catalog = require('../assets/shop-catalog.js');
const { escape: e, normalize, priceText } = catalog;
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const items = JSON.parse(await read('items.json'));
const business = shopBusiness(JSON.parse(await read('dati.json')));
const slugs = new Set();
if (!Array.isArray(items) || !items.length) throw new Error('Il catalogo deve contenere prodotti.');
for (const item of items) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || slugs.has(item.slug)) throw new Error('Slug prodotto non valido o duplicato.');
  slugs.add(item.slug);
  for (const field of ['titolo', 'categoria', 'tipologia', 'descrizione']) if (typeof item[field] !== 'string' || !item[field].trim()) throw new Error(`${item.slug}: ${field} mancante.`);
  if (item.prezzo !== null && (!Number.isFinite(item.prezzo) || item.prezzo <= 0)) throw new Error(`${item.slug}: prezzo non valido.`);
  if (item.prezzo_massimo !== undefined && (item.prezzo === null || !Number.isFinite(item.prezzo_massimo) || item.prezzo_massimo < item.prezzo)) throw new Error(`${item.slug}: intervallo di prezzo non valido.`);
  if (![null, 'kg', 'l', 'pezzo'].includes(item.unita)) throw new Error(`${item.slug}: unità non valida.`);
  for (const v of item.varianti || []) {
    if (!v.nome || !Number.isFinite(v.prezzo) || v.prezzo <= 0 || ![null, 'kg', 'l', 'pezzo'].includes(v.unita)) throw new Error(`${item.slug}: variante non valida.`);
    if (v.totale !== undefined && (!Number.isFinite(v.quantita) || v.quantita <= 0 || Math.abs(v.totale - v.quantita * v.prezzo) > .001)) throw new Error(`${item.slug}: totale del formato non valido.`);
  }
}

async function save(path, text) {
  const url = new URL(path, root);
  await mkdir(new URL('.', url), { recursive: true });
  if (await readFile(url, 'utf8').catch(() => '') !== text) await writeFile(url, text);
}
function block(html, name, value) {
  const start = `<!-- ${name}:START -->`, end = `<!-- ${name}:END -->`;
  if (html.split(start).length !== 2 || html.split(end).length !== 2) throw new Error(`Marcatori ${name} non validi.`);
  const a = html.indexOf(start), b = html.indexOf(end);
  if (b < a) throw new Error(`Marcatori ${name} fuori ordine.`);
  return html.slice(0, a + start.length) + '\n' + value + '\n' + html.slice(b);
}
async function version(path) { return '/'+path+'?v='+createHash('sha256').update(await read(path)).digest('hex').slice(0,12); }
const style = await version('assets/shop-products.css');
const library = await version('assets/shop-catalog.js');
const script = await version('assets/shop.js');
const controls = await version('assets/shop-controls.js');
const mapScript = await version('assets/shop-map.js');
const catalogSource = await version('items.json');
function mapControls(){
  return `<div class="shop-location-map" data-shop-map><div class="shop-map-actions"><a href="${shopMap.profileUrl}" target="_blank" rel="noopener noreferrer">Scheda Google dello spaccio ↗</a><button type="button" data-shop-map-toggle aria-expanded="false" aria-controls="shop-map-frame" hidden>Mostra la mappa dello spaccio</button></div><div id="shop-map-frame" data-shop-map-slot hidden></div><p class="shop-map-note">La mappa interattiva si collega a Google solo quando scegli di mostrarla. <a href="/privacy/">Informativa privacy</a>.</p></div>`;
}
let index = await read('shop/index.html');
index = block(index, 'SHOP-NOTICE', catalog.notice());
index = block(index, 'SHOP-CATALOG', items.map(catalog.card).join('\n'));
index = block(index, 'SHOP-LIST-SCHEMA', jsonLd({ '@graph': [business,
  { '@type': 'WebPage', '@id': origin+'/shop/#pagina', url: origin+'/shop/', name: shopName+' a Osimo: prodotti e prezzi', inLanguage:'it', mainEntity:{'@id':shopId}, about:{'@id':shopId} },
  { '@type': 'ItemList', '@id':origin+'/shop/#catalogo', name: 'Prodotti dello '+shopName, numberOfItems:items.length, itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.titolo, url: origin + '/shop/' + item.slug + '/' })) }
]}));
index = block(index, 'SHOP-LOCATION', `<section class="shop-store-location" id="spaccio" aria-labelledby="shop-location-title"><h2 id="shop-location-title">${shopName} a Osimo</h2><p>Ti aspettiamo in <strong>Via Acquaviva 34, 60027 Osimo (AN)</strong>, nella stessa struttura dell’agriturismo. Lo spaccio è l’attività dedicata alla vendita in azienda di carni, uova, olio e pasta.</p><p>Per disponibilità, prezzi da definire e prenotazione del pacco famiglia chiama <a href="tel:+393922529406">+39 392 252 9406</a>.</p>${mapControls()}</section>`);
index = index.replace(/href="\/assets\/shop-products\.css\?[^"\s]+"/, `href="${style}"`)
  .replace(/src="\/assets\/shop-catalog\.js\?[^"\s]+"/, `src="${library}"`)
  .replace(/src="\/assets\/shop\.js\?[^"\s]+"/, `src="${script}"`)
  .replace(/src="\/assets\/shop-controls\.js\?[^"\s]+"/, `src="${controls}"`)
  .replace(/src="\/assets\/shop-map\.js\?[^"\s]+"/, `src="${mapScript}"`)
  .replace(/(id="totalCount"[^>]*>)[^<]*/, '$1' + items.length)
  .replace(/(id="shop-results-status"[^>]*>)[^<]*/, '$1' + items.length + ' prodotti');
index = index.replace(/(<div id="productsGrid")([^>]*)(>)/, (_, start, attrs) => start + attrs.replace(/\sdata-catalog-src="[^"]*"/, '') + ` data-catalog-src="${catalogSource}">`);
const indexTrail=[['Agriturismo','/'],['Spaccio aziendale','/shop/']];
index=index.replace(/<script type="application\/ld\+json">[^<]*"@type":"BreadcrumbList"[^<]*<\/script>/,breadcrumbSchema(indexTrail))
  .replace(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/,breadcrumbs(indexTrail));
const maxPrice=Math.ceil(Math.max(...items.map(p=>p.prezzo_massimo??p.prezzo??0)));
index=index.replace(/(<input[^>]*id="priceMin"[^>]*\bmax=")[^"]*/, '$1'+maxPrice)
  .replace(/(<input[^>]*id="priceMin"[^>]*\bvalue=")[^"]*/, '$1'+maxPrice);
await save('shop/index.html', index);

const headerStart = index.indexOf('<nav class="sticky');
const header = index.slice(headerStart, index.indexOf('</nav>', headerStart) + 6).replace(' aria-current="page"', '');
const footerStart = index.indexOf('<footer id="footer"');
const footer = index.slice(footerStart, index.indexOf('</footer>', footerStart) + 9);
if (headerStart < 0 || footerStart < 0) throw new Error('Header/footer dello shop non disponibili.');

function offer(p, v = p) {
  const spec = { '@type': 'UnitPriceSpecification', priceCurrency: 'EUR' };
  if (v.prezzo_massimo != null) { spec.minPrice = v.prezzo; spec.maxPrice = v.prezzo_massimo; }
  else spec.price = v.prezzo;
  if (v.unita) spec.referenceQuantity = { '@type': 'QuantitativeValue', value: 1, unitText: v.unita === 'l' ? 'litro' : v.unita };
  const o = { '@type': 'Offer', name: v.nome || p.titolo, url: origin + '/shop/' + p.slug + '/', priceCurrency: 'EUR', availability: 'https://schema.org/InStoreOnly', priceSpecification: spec, seller: { '@id': shopId }, availableAtOrFrom:{'@id':shopId} };
  if (v.totale !== undefined) o.price = v.totale;
  else if (!v.unita && v.prezzo_massimo == null) o.price = v.prezzo;
  return o;
}
for (const item of items) {
  const p = normalize(item), path = '/shop/' + p.slug + '/', url = origin + path;
  const trail = [['Agriturismo', '/'], ['Spaccio', '/shop/'], [p.titolo, path]];
  const title = p.titolo + ' | Spaccio Giuggioloni a Osimo';
  const description = p.titolo + ': ' + priceText(p) + '. Vendita solo nello Spaccio Aziendale Giuggioloni a Osimo. ' + (p.prenotazione_obbligatoria ? 'Prenotazione telefonica necessaria.' : 'Contattaci per la disponibilità.');
  const product = { '@type': 'Product', '@id':url+'#prodotto', name: p.titolo, description: p.descrizione, category: p.categoria, url };
  if (p.immagine) product.image = new URL(p.immagine, origin).href;
  if (p.prezzo !== null) product.offers = p.varianti.length ? p.varianti.map(v => offer(p, v)) : offer(p);
  const reservation = p.prenotazione_obbligatoria ? '<aside class="shop-reservation-note"><h2>Prenotazione telefonica necessaria</h2><p>Il pacco può comprendere vari formati e tagli di vitellone, a discrezione del macellaio e secondo disponibilità. Chiama per prenotare e concordare il ritiro in azienda.</p></aside>' : '';
  const priceNote = p.unita === 'kg' ? '<p class="shop-price-note">Il prezzo è al chilogrammo. Il totale dipende dal peso effettivo del prodotto.</p>' : p.prezzo === null ? '<p class="shop-price-note">Il prezzo non è ancora definito: chiedici informazioni prima di venire in azienda.</p>' : '';
  const html = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="${shopName}">
<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${url}">
<meta property="og:image" content="${origin}/assets/shop-vetrina.webp"><meta property="og:image:alt" content="Insegna dello ${shopName} a Osimo"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${e(title)}"><meta name="twitter:description" content="${e(description)}"><meta name="twitter:image" content="${origin}/assets/shop-vetrina.webp">
<meta name="theme-color" content="#f5eee3"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/shop-tailwind.min.css"><link rel="stylesheet" href="/assets/site-extras.css?v=6"><link rel="stylesheet" href="${style}"><script src="${mapScript}" defer></script>
${breadcrumbSchema(trail)}${jsonLd({'@graph':[business,product,{'@type':'WebPage','@id':url+'#pagina',url,name:title,inLanguage:'it',mainEntity:{'@id':product['@id']},about:{'@id':shopId}}]})}</head>
<body class="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 font-display min-h-screen flex flex-col">
${header}${breadcrumbs(trail)}<main class="shop-detail-page">${catalog.notice()}
<article class="shop-product-layout"><div class="shop-detail-media${p.immagine ? '' : ' shop-detail-placeholder'}">${catalog.media(p, true)}</div><div class="shop-detail-copy">
<p class="shop-product-category">${e(p.categoria)} · Spaccio aziendale</p><h1>${e(p.titolo)}</h1><p class="shop-price">${e(priceText(p))}</p><p>${e(p.descrizione)}</p>
${p.varianti.length ? '<h2>Formati disponibili</h2>' + catalog.variants(p) : ''}${priceNote}${reservation}
<a class="shop-phone-button" href="tel:+393922529406">${p.prenotazione_obbligatoria ? 'Chiama per prenotare il pacco' : 'Chiama per informazioni'} <span aria-hidden="true">↗</span></a>
</div></article><section class="shop-purchase"><h2>Come acquistare nello spaccio</h2><p>Ti aspettiamo nello <strong>${shopName}</strong>, in <strong>Via Acquaviva 34, 60027 Osimo (AN)</strong>, nella stessa struttura dell’agriturismo. Prodotti e disponibilità si verificano in azienda: il catalogo non costituisce una conferma di disponibilità.</p><p>Per informazioni${p.prenotazione_obbligatoria ? ' e per la prenotazione obbligatoria del pacco' : ''}: <a href="tel:+393922529406">+39 392 252 9406</a> · <a href="mailto:info@agriturismogiuggioloni.it">info@agriturismogiuggioloni.it</a>.</p>${mapControls()}</section>
<a class="shop-back-link" href="/shop/">← Torna a tutti i prodotti</a></main>${footer}</body></html>\n`;
  await save('shop/' + p.slug + '/index.html', html);
}

let sitemap = await read('sitemap.xml');
if (!sitemap.includes('<!-- SHOP-PRODUCTS:START -->')) sitemap = sitemap.replace('</urlset>', '<!-- SHOP-PRODUCTS:START --><!-- SHOP-PRODUCTS:END -->\n</urlset>');
sitemap = block(sitemap, 'SHOP-PRODUCTS', items.map(p => `  <url><loc>${origin}/shop/${p.slug}/</loc></url>`).join('\n'));
await save('sitemap.xml', sitemap);
console.log(`Shop sincronizzato: ${items.length} prodotti e pagine statiche, varianti e avviso vendita in loco.`);
