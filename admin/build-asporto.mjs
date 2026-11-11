import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { origin, breadcrumbs, breadcrumbSchema } from './site-seo.mjs';
import { renderSiteData, siteData } from './site-data.mjs';
import { applyLanguage } from './site-language.mjs';
import { applyFooterCredit } from './site-credit.mjs';

const root = new URL('../', import.meta.url);
const catalog = createRequire(import.meta.url)('../assets/shop-catalog.js');
const escape = catalog.escape;
const source = JSON.parse(await readFile(new URL('asporto.json', import.meta.url), 'utf8'));
if (!Array.isArray(source.prodotti) || !source.prodotti.length) throw new Error('Listino asporto mancante.');
const ids = new Set();
for (const item of source.prodotti) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || ids.has(item.slug)) throw new Error('Slug asporto non valido o duplicato.');
  ids.add(item.slug);
  if (typeof item.titolo !== 'string' || !item.titolo.trim()) throw new Error('Nome asporto mancante.');
  if (item.prezzo !== null && (!Number.isFinite(item.prezzo) || item.prezzo <= 0 || item.unita !== 'kg')) throw new Error('Prezzo o unità asporto non validi.');
  if (item.prezzo === null && item.unita !== null) throw new Error('Non indicare unità non confermate per i prezzi da definire.');
}
const date = new Date(source.aggiornato + 'T12:00:00Z');
if (!/^\d{4}-\d{2}-\d{2}$/.test(source.aggiornato) || !Number.isFinite(date.getTime())) throw new Error('Data del listino asporto non valida.');
const updated = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'Europe/Rome' }).format(date);

const shop = await readFile(new URL('shop/index.html', root), 'utf8');
const headerStart = shop.indexOf('<nav class="sticky');
const footerStart = shop.indexOf('<footer id="footer"');
if (headerStart < 0 || footerStart < 0) throw new Error('Layout dello shop non disponibile per l’asporto.');
const cleanBrandLabels = markup => markup.replace(/<a\b[^>]*\bclass="shop-site-brand[^\"]*"[^>]*>/g, tag => tag.replace(/\saria-label="[^\"]*"/, ''));
const header = cleanBrandLabels(shop.slice(headerStart, shop.indexOf('</nav>', headerStart) + 6).replaceAll(' aria-current="page"', ''))
  .replace('class="text-primary font-bold transition-colors"', 'class="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium"');
const footer = cleanBrandLabels(shop.slice(footerStart, shop.indexOf('</footer>', footerStart) + 9))
  .replace(' aria-label="Apri la scheda dello Spaccio Aziendale Giuggioloni su Google Maps"', '');
const version = async path => '/' + path + '?v=' + createHash('sha256').update(await readFile(new URL(path, root))).digest('hex').slice(0, 12);
const contact = siteData.contatto;
const telephone = 'tel:' + contact.numeri_telefono[0].replace(/[^+\d]/g, '');
const path = '/shop/asporto/';
const title = 'Asporto | Spaccio Aziendale Giuggioloni a Osimo';
const description = 'Le proposte da asporto di Giuggioloni a Osimo: lasagna, ragù, olive all’ascolana, cremini e pasta fresca. Listino e contatti per il ritiro in azienda.';
const trail = [['Spaccio aziendale', '/spaccio/'], ['Prodotti', '/shop/'], ['Asporto', path]];
const confirmed = source.prodotti.filter(item => item.prezzo !== null);
const pending = source.prodotti.filter(item => item.prezzo === null);
const rows = confirmed.map(item => `<li class="asporto-row" data-asporto="${escape(item.slug)}"><div><h3>${escape(item.titolo)}</h3>${item.tipologie_da_confermare ? '<p class="asporto-row-note">Tipologie di pasta fresca da confermare al telefono.</p>' : ''}</div><span class="shop-price">${escape(catalog.priceText(item))}</span></li>`).join('\n');
const pendingSection = pending.length ? `<section class="asporto-section asporto-pending" aria-labelledby="asporto-pending-title"><h2 id="asporto-pending-title">Altre proposte</h2><p>Contattaci per conoscere prezzi e disponibilità.</p><ul class="asporto-list">${pending.map(item => `<li class="asporto-row" data-asporto="${escape(item.slug)}"><h3>${escape(item.titolo)}</h3><span class="asporto-pending-price">Prezzo da confermare</span></li>`).join('\n')}</ul></section>` : '';

const html = applyFooterCredit(applyLanguage(renderSiteData(`<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${escape(description)}">
<meta name="robots" content="noindex,follow"><link rel="canonical" href="${origin + path}">
<meta property="og:type" content="website"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="Spaccio Aziendale Giuggioloni"><meta property="og:title" content="${title}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin + path}">
<meta property="og:image" content="${origin}/assets/spaccio/spaccio-osimo-1200x630.webp"><meta property="og:image:alt" content="L’insegna dello Spaccio Aziendale Giuggioloni a Osimo"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f5eee3"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/shop-tailwind.min.css"><link rel="stylesheet" href="/assets/site-extras.css?v=6"><link rel="stylesheet" href="${await version('assets/shop-products.css')}"><link rel="stylesheet" href="${await version('assets/shop-asporto.css')}">
${breadcrumbSchema(trail)}
</head><body class="bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100 font-display min-h-screen flex flex-col">
<a class="asporto-skip" href="#asporto-content">Vai al contenuto</a>
${header}<main id="asporto-content" class="shop-detail-page asporto-page">
${breadcrumbs(trail)}
<header class="asporto-hero"><p class="shop-product-category">Giuggioloni · Osimo</p><h1>Le proposte da asporto</h1><p>Piatti e preparazioni da ritirare in azienda. Consulta il listino e chiamaci per disponibilità, quantità e ritiro.</p><a class="shop-phone-button" href="${telephone}">Chiama per l’asporto <span class="asporto-cta-number">${escape(contact.numeri_telefono[0])}</span></a></header>
<div class="asporto-columns"><section class="asporto-section" aria-labelledby="asporto-prices-title"><h2 id="asporto-prices-title">Il listino asporto</h2><ul class="asporto-list">${rows}</ul><p class="asporto-price-note">I prezzi indicati sono al chilogrammo. Il totale dipende dal peso effettivo.</p></section>${pendingSection}</div>
<section class="shop-purchase" aria-labelledby="asporto-contact-title"><h2 id="asporto-contact-title">Informazioni e ritiro</h2><p>Ti aspettiamo in <strong>${escape(contact.via)}, ${escape(contact.comune)}</strong>, nella stessa struttura dell’agriturismo.</p><p>Per disponibilità, ingredienti e allergeni, o per concordare il ritiro, chiama <a href="${telephone}">${escape(contact.numeri_telefono[0])}</a>.</p><p><a href="mailto:${escape(contact.mail)}">${escape(contact.mail)}</a></p></section>
<p class="asporto-updated">Listino aggiornato il <time datetime="${escape(source.aggiornato)}">${escape(updated)}</time></p>
</main>${footer}
</body></html>
`)));
const directory = new URL('shop/asporto/', root);
await mkdir(directory, { recursive: true });
const output = new URL('index.html', directory);
if (await readFile(output, 'utf8').catch(() => '') !== html) await writeFile(output, html);
console.log(`Asporto generato: ${confirmed.length} prezzi confermati, ${pending.length} da definire; pagina esclusa dalla navigazione e dalla sitemap.`);
