import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { origin, breadcrumbs, breadcrumbSchema, jsonLd } from './site-seo.mjs';
import { siteLayout } from './site-layout.mjs';
import { applySiteStyles } from './site-assets.mjs';
import { siteData } from './site-data.mjs';
import { shopBusiness, shopId, shopName } from './shop-business.mjs';
import shopMap from '../assets/shop-map.js';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const version = async path => '/' + path + '?v=' + createHash('sha256').update(await readFile(new URL(path, root))).digest('hex').slice(0, 12);
const catalog = createRequire(import.meta.url)('../assets/shop-catalog.js');
const items = JSON.parse(await read('items.json'));
const familyPack = items.find(item => item.slug === 'pacco-famiglia-vitellone');
const business = shopBusiness(siteData);
const contact = siteData.contatto;
const telephone = `tel:${business.telephone}`;
const path = '/spaccio/';
const canonical = origin + path;
const title = 'Spaccio Aziendale Giuggioloni a Osimo | Vendita in azienda';
const description = 'Spaccio Aziendale Giuggioloni a Osimo: carni, salumi, formaggi, pasta fresca all’uovo, uova e olio. Foto e contatti. Vendita in loco in Via Acquaviva 34.';
const trail = [['Home', '/'], ['Spaccio aziendale', path]];
const socialImage = '/assets/spaccio/spaccio-osimo-1200x630.webp';

function photo(name, alt, { hero = false, gallery = false } = {}) {
  const prefix = '/assets/spaccio/' + name;
  const sizes = gallery ? '(min-width: 1152px) 347px, (min-width: 768px) calc(33.333vw - 2rem), calc(100vw - 2rem)' : hero ? '(min-width: 1152px) 528px, (min-width: 768px) calc(50vw - 3rem), calc(100vw - 2rem)' : '(min-width: 1152px) 528px, (min-width: 640px) calc(50vw - 2.5rem), calc(100vw - 2rem)';
  return `<picture><source type="image/avif" srcset="${prefix}-480.avif 480w, ${prefix}-800.avif 800w, ${prefix}-1200.avif 1200w" sizes="${sizes}"><img src="${prefix}-800.webp" srcset="${prefix}-480.webp 480w, ${prefix}-800.webp 800w, ${prefix}-1200.webp 1200w" sizes="${sizes}" width="800" height="${hero ? '1000' : '600'}" alt="${escape(alt)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

let { header, footer } = siteLayout(path);
header = header.replace(' aria-label="Agriturismo Giuggioloni — home"', '');
footer = footer.replace(' aria-label="Agriturismo Giuggioloni — home"', '');
header = header.replaceAll('href="/shop/"', 'href="/spaccio/" aria-current="page"')
  .replaceAll('>I Nostri Prodotti</a>', '>Lo spaccio</a>')
  .replaceAll(' data-booking', '').replaceAll('>Prenota Ora!</a>', '>Chiama lo spaccio</a>').replaceAll('>Prenota</a>', '>Chiama lo spaccio</a>')
  .replace(/href="tel:[^"]*"/g, `href="${telephone}"`);
// This page describes the shop: do not reuse the restaurant's opening times or map.
footer = footer.replace(/<section class="place-map"[\s\S]*?<\/section>/, '')
  .replace(/(<h2\b[^>]*>)Orari(<span[\s\S]*?<\/h2>)\s*<ul data-hours[\s\S]*?<\/ul>/, (_, open, heading) =>
    `${open}Orari dello spaccio${heading}<p class="text-sm leading-relaxed">Chiamaci per conoscere gli orari di apertura e la disponibilità dei prodotti.</p><p class="mt-4"><a class="underline" href="${telephone}">${escape(contact.numeri_telefono[0])}</a></p>`)
  .replace(/<p data-text="home.descrizione"([^>]*)>[\s\S]*?<\/p>/, `<p$1>Lo spaccio della nostra azienda agricola a Osimo. Carni e prodotti da acquistare in loco, nella stessa struttura dell’agriturismo.</p>`);

const products = [
  ['carni', 'Il banco macelleria', 'Il banco carni dello Spaccio Aziendale Giuggioloni, con diversi tagli esposti', 'Tagli di suino, vitellone e animali da cortile. Nel banco della carne è esposta anche la pasta fresca all’uovo.', '/shop/', 'Scopri le carni e i prezzi'],
  ['pasta-fresca', 'Pasta fresca all’uovo', 'La pasta fresca all’uovo esposta nella parte superiore del banco carne dello spaccio', 'Chitarrine, tagliatelle, cappelletti e ravioli, esposti nello stesso banco della carne. Chiamaci per conoscere prezzi e disponibilità della pasta fresca.', telephone, 'Chiedi della pasta fresca'],
  ['uova', 'Le uova', 'Un cesto di uova sul banco dello spaccio aziendale', 'Le uova sono tra i prodotti del catalogo. Per quantità e disponibilità puoi chiamarci prima di passare.', '/shop/uova/', 'Vai alla pagina delle uova'],
  ['olio-pasta', 'Olio e pasta secca Campofilone', 'Confezioni di pasta secca Campofilone e olio sullo scaffale dello spaccio', 'Olio in diversi formati e pasta secca Campofilone, nelle tipologie chitarrine e fettuccine: scopri i dettagli nel catalogo.', '/shop/olio/', 'Scopri i formati dell’olio'],
];
const productCards = products.map(([name, heading, alt, text, href, label]) => `<article class="spaccio-product">${photo(name, alt)}<div><h3>${heading}</h3><p>${text}</p><a href="${href}">${label} <span aria-hidden="true">→</span></a>${name === 'olio-pasta' ? '<a href="/shop/pasta-secca-campofilone/">Scopri la pasta Campofilone <span aria-hidden="true">→</span></a>' : ''}</div></article>`).join('\n');
const fridgePhotos = [
  ['frigo-salumi', 'Salumi e prodotti confezionati esposti nel frigo dello spaccio Giuggioloni', 'Salumi e preparazioni nel frigo dello spaccio.'],
  ['frigo-formaggi', 'Formaggi, olive e altri prodotti nell’espositore refrigerato dello spaccio', 'Formaggi, olive e altri prodotti esposti nel frigo.'],
  ['frigo-prodotti', 'Salsicce, un taglio confezionato e altri prodotti nel frigo dello spaccio', 'Salsicce e altri prodotti nell’espositore refrigerato.'],
].map(([name, alt, caption]) => `<figure>${photo(name, alt, { gallery: true })}<figcaption>${caption}</figcaption></figure>`).join('\n');
const fridge = `<section class="spaccio-fridge" aria-labelledby="spaccio-fridge-title"><div class="spaccio-section-heading"><p class="spaccio-eyebrow">L’espositore refrigerato</p><h2 id="spaccio-fridge-title">Il frigo di salumi, formaggi e altri prodotti</h2><p>Nello spaccio trovi anche un frigo con salumi, formaggi e altri prodotti. È un espositore distinto dal banco macelleria, dove sono esposti i tagli di carne e la pasta fresca all’uovo.</p></div><div class="spaccio-fridge-gallery">${fridgePhotos}</div><p>Le foto mostrano alcuni dei prodotti esposti. Per conoscere l’assortimento disponibile quando vuoi passare, contattaci.</p><div class="place-actions"><a href="${telephone}">Chiedi dei prodotti del frigo</a></div></section>`;
const family = familyPack ? `<section class="spaccio-family" aria-labelledby="family-title"><div><p class="spaccio-eyebrow">Da prenotare al telefono</p><h2 id="family-title">${escape(familyPack.titolo)}</h2><p>Tagli e formati di vitellone scelti dal macellaio secondo disponibilità. Chiama per prenotare il pacco e concordare il ritiro nello spaccio.</p></div><div><p class="spaccio-family-price">${escape(catalog.priceText(catalog.normalize(familyPack)))}</p><p>Il totale dipende dal peso effettivo.</p><div class="place-actions"><a class="spaccio-primary" href="${telephone}">Chiama per prenotare</a><a href="/shop/pacco-famiglia-vitellone/">Dettagli del pacco</a></div></div></section>` : '';
const schema = jsonLd({ '@graph': [business, {
  '@type': 'WebPage', '@id': canonical + '#pagina', url: canonical, name: title, description, inLanguage: 'it',
  isPartOf: { '@id': origin + '/#sito' }, mainEntity: { '@id': shopId }, about: { '@id': shopId },
  primaryImageOfPage: { '@type': 'ImageObject', url: origin + socialImage, width: 1200, height: 630 },
}] });

const html = applySiteStyles(`<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="${shopName}">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${origin + socialImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/webp"><meta property="og:image:alt" content="L’insegna dello Spaccio Aziendale Giuggioloni a Osimo">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${origin + socialImage}"><meta name="twitter:image:alt" content="L’insegna dello Spaccio Aziendale Giuggioloni a Osimo">
<meta name="theme-color" content="#f5eee3"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/assets/site.min.css"><link rel="stylesheet" href="${await version('assets/spaccio.css')}">
<script src="/assets/site.js" defer></script><script src="${await version('assets/shop-map.js')}" defer></script>
${breadcrumbSchema(trail)}${schema}
</head><body class="bg-background-cream text-gray-800 font-display">
${header}<main id="contenuto" class="subpage"><div class="farm-page spaccio-page">
${breadcrumbs(trail)}
<section class="spaccio-hero" aria-labelledby="spaccio-title"><div class="spaccio-hero-copy"><p class="spaccio-eyebrow">Vendita in azienda · Osimo, Marche</p><h1 id="spaccio-title">Spaccio Aziendale Giuggioloni a Osimo</h1><p class="spaccio-lead">I sapori della nostra campagna, da portare a casa.</p><p>Il punto vendita dell’azienda agricola, nella stessa struttura dell’agriturismo. Carni, salumi, formaggi, uova, pasta fresca all’uovo, olio e pasta secca da scegliere in loco, in ${escape(contact.via)}.</p><div class="place-actions"><a class="spaccio-primary" href="/shop/">Prodotti e prezzi</a><a href="${telephone}">Chiama lo spaccio</a></div><p class="spaccio-local-note">Acquisti esclusivamente in azienda. Nessuna vendita online o spedizione.</p></div><figure class="spaccio-hero-photo">${photo('interno', 'L’interno dello spaccio Giuggioloni, con lo scaffale dei prodotti e l’insegna Macelleria', { hero: true })}<figcaption>Il nostro punto vendita in Via Acquaviva, a Osimo.</figcaption></figure></section>
<section class="spaccio-intro" aria-labelledby="spaccio-about"><p class="spaccio-eyebrow">Dall’agriturismo alla tua tavola</p><h2 id="spaccio-about">Lo spaccio della nostra azienda agricola</h2><p>Giuggioloni è una realtà familiare sulle colline di Osimo, in provincia di Ancona. Accanto alla cucina dell’agriturismo c’è lo spaccio: uno spazio dedicato a chi vuole acquistare carni e prodotti da portare nella cucina di casa.</p><p>Qui puoi informarti sui tagli del banco, scegliere i formati dell’olio e scoprire i prodotti disponibili. Il catalogo ti aiuta a consultare i prezzi prima della visita; assortimento e quantità vanno verificati con noi.</p></section>
<section class="spaccio-products" aria-labelledby="spaccio-products-title"><div class="spaccio-section-heading"><p class="spaccio-eyebrow">Uno sguardo al punto vendita</p><h2 id="spaccio-products-title">Cosa trovi nello spaccio</h2><p>Le foto raccontano il locale e alcuni dei prodotti esposti. Per la disponibilità attuale, contattaci.</p></div><div class="spaccio-product-grid">${productCards}</div><div class="place-actions"><a href="/shop/">Consulta tutto il catalogo e i prezzi <span aria-hidden="true">→</span></a></div></section>
${fridge}
${family}
<section class="spaccio-visit" id="dove-siamo" aria-labelledby="spaccio-visit-title"><figure><img src="/assets/shop-vetrina.webp" srcset="/assets/shop-vetrina-480.webp 480w, /assets/shop-vetrina-768.webp 768w, /assets/shop-vetrina.webp 1200w" sizes="(min-width:1152px) 528px, (min-width:768px) calc(50vw - 3rem), calc(100vw - 2rem)" width="1200" height="900" loading="lazy" decoding="async" alt="L’insegna esterna dello Spaccio Aziendale Giuggioloni"><figcaption>L’insegna dello spaccio nella struttura dell’agriturismo.</figcaption></figure><div><p class="spaccio-eyebrow">Vieni a trovarci</p><h2 id="spaccio-visit-title">Dove siamo e come contattarci</h2><p><strong>${shopName}</strong><br>${escape(contact.via)}<br>${escape(contact.comune)}</p><p>Ci trovi nella stessa struttura dell’Agriturismo Giuggioloni. La mappa qui sotto apre la scheda Google dedicata allo spaccio.</p><p><strong>Orari e disponibilità:</strong> chiamaci prima di venire per conoscere gli orari di apertura, verificare i prodotti e concordare eventuali prenotazioni.</p><a class="spaccio-phone" href="${telephone}">${escape(contact.numeri_telefono[0])}</a><p><a class="spaccio-email" href="mailto:${escape(contact.mail)}">${escape(contact.mail)}</a></p><div class="place-actions"><a href="${shopMap.placeUrl}" target="_blank" rel="noopener noreferrer">Indicazioni per lo spaccio <span aria-hidden="true">↗</span></a></div></div></section>
<section class="place-map spaccio-map" data-shop-map aria-labelledby="spaccio-map-title"><h2 id="spaccio-map-title">La scheda Google dello spaccio</h2><p>Visualizza la posizione dello Spaccio Aziendale Giuggioloni.</p><div class="place-actions"><a href="${shopMap.profileUrl}" target="_blank" rel="noopener noreferrer">Apri la scheda Google <span aria-hidden="true">↗</span></a><button type="button" data-shop-map-toggle aria-expanded="false" aria-controls="spaccio-map-slot" hidden>Mostra la mappa dello spaccio</button></div><div id="spaccio-map-slot" data-shop-map-slot hidden></div><p class="spaccio-map-note">La mappa si collega a Google solo quando scegli di mostrarla. <a href="/privacy/">Informativa privacy</a>.</p></section>
<section class="spaccio-faq" aria-labelledby="spaccio-faq-title"><h2 id="spaccio-faq-title">Prima di passare allo spaccio</h2><details><summary>Posso acquistare online?</summary><p>Il sito presenta prodotti e prezzi. Gli acquisti si effettuano esclusivamente nello spaccio aziendale a Osimo; non sono previste vendite online o spedizioni.</p></details><details><summary>Come prenoto il pacco famiglia di vitellone?</summary><p>La prenotazione telefonica è necessaria. Chiama <a href="${telephone}">${escape(contact.numeri_telefono[0])}</a> per concordare il ritiro: tagli e formati sono scelti dal macellaio in base alla disponibilità. <a href="/shop/pacco-famiglia-vitellone/">Consulta la pagina del pacco famiglia</a>.</p></details><details><summary>Lo spaccio è nello stesso posto dell’agriturismo?</summary><p>Sì, si trova nella stessa struttura, in ${escape(contact.via)}, a Osimo. Il punto vendita ha una propria scheda Google: usa i collegamenti dedicati allo spaccio presenti in questa pagina.</p></details><details><summary>Quali sono gli orari di apertura?</summary><p>Per conoscere gli orari dello spaccio e verificare la disponibilità dei prodotti, <a href="${telephone}">contattaci al telefono</a> prima della visita.</p></details></section>
</div></main>${footer}
</body></html>
`);
await mkdir(new URL('spaccio/', root), { recursive: true });
const output = new URL('spaccio/index.html', root);
if (await readFile(output, 'utf8').catch(() => '') !== html) await writeFile(output, html);
let sitemap = await read('sitemap.xml');
if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
  sitemap = sitemap.replace('</urlset>', `  <url><loc>${canonical}</loc></url>\n</urlset>`);
  await writeFile(new URL('sitemap.xml', root), sitemap);
}
console.log('Pagina /spaccio/ generata: foto, contatti, scheda Google e SEO dello spaccio.');
