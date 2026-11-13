import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { origin, breadcrumbs, jsonLd } from './site-seo.mjs';
import { siteLayout } from './site-layout.mjs';
import { applySiteStyles } from './site-assets.mjs';
import { siteData } from './site-data.mjs';
import { restaurantId, restaurantLocation } from './site-business.mjs';
import { shopBusiness, shopId, shopName } from './shop-business.mjs';
import restaurantMap from '../assets/place-map.js';
import shopMap from '../assets/shop-map.js';

const root = new URL('../', import.meta.url);
const version = async file => '/' + file + '?v=' + createHash('sha256').update(await readFile(new URL(file, root))).digest('hex').slice(0, 12);
const path = '/prenotazione/';
const canonical = origin + path;
const title = 'Prenotazioni e contatti a Osimo | Giuggioloni';
const description = 'Prenota un tavolo all’Agriturismo Giuggioloni o contatta lo Spaccio Aziendale a Osimo. Telefono, email, indirizzo, orari e mappe Google delle due attività.';
const trail = [['Home', '/'], ['Prenotazioni e contatti', path]];
const contact = siteData.contatto;
const phone = contact.numeri_telefono[0];
const telephone = 'tel:' + phone.replace(/[^+\d]/g, '');
const email = 'mailto:' + contact.mail;
const address = `<address>${escape(contact.via)}<br>${escape(contact.comune)}</address>`;

function restaurantHours() {
  const groups = [];
  for (const [day, service] of Object.entries(siteData.orari)) {
    const times = [service.pranzo, service.cena].filter(value => typeof value === 'string' && value.trim())
      .map(time => time.replaceAll('-', '–'));
    const label = times.length ? times.join(' · ') : service.note === 'Chiuso' ? 'Chiuso' : 'Chiama per conoscere gli orari';
    if (groups.at(-1)?.label === label) groups.at(-1).last = day;
    else groups.push({ first: day, last: day, label, times });
  }
  return '<dl class="contact-hours">' + groups.map(group => `<div><dt>${escape(group.first === group.last ? group.first : group.first + '–' + group.last)}</dt><dd>${group.times.length ? group.times.map(time => `<span>${escape(time)}</span>`).join('') : escape(group.label)}</dd></div>`).join('') + '</dl>';
}

function map(kind, place, label) {
  const store = kind === 'spaccio';
  const data = store ? 'data-shop-map' : 'data-map';
  const toggle = store ? 'data-shop-map-toggle' : 'data-map-toggle';
  const slot = store ? 'data-shop-map-slot' : 'data-map-slot';
  return `<div class="contact-map" ${data}><div class="place-actions"><a href="${escape(place.placeUrl)}" target="_blank" rel="noopener noreferrer">Scheda e indicazioni ${label} <span aria-hidden="true">↗</span></a><button type="button" ${toggle} aria-controls="${kind}-map" aria-expanded="false" hidden>Mostra la mappa ${label}</button></div><div id="${kind}-map" ${slot} hidden></div><p class="contact-map-note">La mappa interattiva si collega a Google solo quando scegli di mostrarla.</p></div>`;
}

const socialNames = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' };
const socials = Object.entries(siteData.socials).filter(([name, profile]) => socialNames[name] && /^https:\/\//.test(profile.link))
  .map(([name, profile]) => `<a href="${escape(profile.link)}" target="_blank" rel="noopener noreferrer"><svg width="22" height="22" aria-hidden="true" focusable="false"><use href="/assets/site-social.svg#${name}"></use></svg><span>${socialNames[name]}</span><span aria-hidden="true">↗</span></a>`).join('');
const company = siteData.societa;
const companyDetails = company?.ragione_sociale && company?.partita_iva ? `<section class="contact-company" aria-labelledby="contact-company-title"><h2 id="contact-company-title">Dati della società</h2><p>${escape(company.ragione_sociale)}</p><p>Partita IVA <strong>${escape(company.partita_iva)}</strong></p></section>` : '';

let { header, footer } = siteLayout(path);
// Both Google business profiles are already presented in the main contact cards.
footer = footer.replace(/<section class="place-map"[\s\S]*?<\/section>/, '');
const schema = jsonLd({ '@graph': [
  {
    '@type': 'ContactPage', '@id': canonical + '#pagina', url: canonical, name: title,
    description, inLanguage: 'it', isPartOf: { '@id': origin + '/#sito' },
    mainEntity: [{ '@id': restaurantId }, { '@id': shopId }],
    about: [{ '@id': restaurantId }, { '@id': shopId }],
    breadcrumb: { '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb', itemListElement: trail.map(([name, url], index) => ({
      '@type': 'ListItem', position: index + 1, name, item: origin + url,
    })) },
  },
  {
    '@type': 'Restaurant', '@id': restaurantId, name: 'Agriturismo Giuggioloni – I Sapori dell’Acquaviva',
    url: origin + '/', image: origin + '/assets/agriturismo-hero.webp', logo: origin + '/logo.png',
    servesCuisine: ['Cucina marchigiana', 'Cucina italiana'], ...restaurantLocation(siteData),
    sameAs: Object.values(siteData.socials).map(profile => profile.link),
  },
  shopBusiness(siteData),
] });

const html = applySiteStyles(`<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="Agriturismo Giuggioloni">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${origin}/og-image-1200x630.png"><meta property="og:image:alt" content="Agriturismo Giuggioloni – I Sapori dell’Acquaviva a Osimo">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f5eee3"><link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/site.min.css"><link rel="stylesheet" href="${await version('assets/prenotazione.css')}">
<script src="/assets/place-map.js" defer></script><script src="${await version('assets/shop-map.js')}" defer></script><script src="/assets/site.js" defer></script><script src="/assets/booking.js" defer></script>
${schema}
</head><body class="bg-background-cream text-gray-800 font-display bg-texture-cream">
${header}<main id="contenuto" class="subpage"><div class="farm-page contact-page">
${breadcrumbs(trail)}
<header class="contact-hero"><div><p class="contact-eyebrow">Giuggioloni · Osimo, Marche</p><h1>Prenotazioni e contatti</h1><p>Un tavolo all’agriturismo, una domanda sui prodotti dello spaccio o le indicazioni per raggiungerci: trovi qui tutti i nostri riferimenti.</p><p>Le due attività sono nella stessa struttura e hanno ciascuna la propria scheda Google Maps.</p></div><div class="contact-callout"><p class="contact-eyebrow">Chiamaci direttamente</p><a class="contact-phone" href="${telephone}">${escape(phone)}</a><p>Per prenotare un tavolo o chiedere informazioni allo spaccio.</p><a class="contact-email" href="${escape(email)}">${escape(contact.mail)}</a></div></header>
<div class="contact-business-grid">
<section class="contact-business" id="ristorante" aria-labelledby="restaurant-contact-title"><header><p class="contact-eyebrow">Il ristorante · Prenotazioni tavoli</p><h2 id="restaurant-contact-title">Agriturismo Giuggioloni</h2><p class="contact-subtitle">I Sapori dell’Acquaviva</p></header>${address}<div class="contact-business-hours"><h3>Orari del ristorante</h3>${restaurantHours()}</div><p>La prenotazione del tavolo si concorda direttamente al telefono. Chiamaci anche per richieste particolari o per organizzare un pranzo o una cena insieme.</p><div class="place-actions"><a class="contact-primary" href="${telephone}">Chiama per prenotare</a><a href="/menu/">Consulta il menù</a></div>${map('ristorante', restaurantMap, 'del ristorante')}</section>
<section class="contact-business" id="spaccio" aria-labelledby="shop-contact-title"><header><p class="contact-eyebrow">Il punto vendita · Informazioni sui prodotti</p><h2 id="shop-contact-title">${shopName}</h2><p class="contact-subtitle">Vendita esclusivamente in azienda</p></header>${address}<div class="contact-business-hours"><h3>Orari e disponibilità dello spaccio</h3><p>Chiamaci prima di passare per conoscere gli orari di apertura, verificare i prodotti disponibili e concordare eventuali prenotazioni.</p></div><p>Lo spaccio ha una propria scheda Google, distinta da quella del ristorante: per raggiungerlo usa la mappa e il collegamento dedicati qui sotto.</p><div class="place-actions"><a class="contact-primary" href="${telephone}">Chiama lo spaccio</a><a href="/spaccio/">Scopri lo spaccio</a></div>${map('spaccio', shopMap, 'dello spaccio')}</section>
</div>
<section class="contact-details" aria-labelledby="contact-details-title"><div><p class="contact-eyebrow">Ti aspettiamo in campagna</p><h2 id="contact-details-title">Come raggiungerci</h2><p>Ci trovi in <strong>${escape(contact.via)}, ${escape(contact.comune)}</strong>. Davanti al locale è disponibile un grande parcheggio.</p><p>Il ristorante è accessibile in sedia a rotelle. I bambini possono giocare nel giardino del locale e gli animali sono benvenuti. La fattoria è un’azienda agricola, non è didattica e non è aperta alle visite.</p><a class="contact-text-link" href="/fattoria/locale/">Il locale, il giardino e l’accessibilità <span aria-hidden="true">→</span></a></div><div class="contact-socials"><h2>Restiamo in contatto</h2><p>Puoi scriverci a <a class="contact-email" href="${escape(email)}">${escape(contact.mail)}</a> e seguirci sui nostri canali social.</p><div class="contact-social-links">${socials}</div><p class="contact-external-note">I collegamenti alle mappe e ai social aprono i rispettivi siti esterni.</p></div></section>
${companyDetails}
</div></main>${footer}
</body></html>
`);
const directory = new URL('prenotazione/', root);
await mkdir(directory, { recursive: true });
const destination = new URL('index.html', directory);
if (await readFile(destination, 'utf8').catch(() => '') !== html) await writeFile(destination, html);
console.log('Pagina /prenotazione/ generata: contatti, orari e schede Maps distinte delle due attività.');
