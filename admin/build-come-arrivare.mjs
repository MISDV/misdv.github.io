import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import placeMap from '../assets/place-map.js';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { restaurantId } from './site-business.mjs';
import { siteData } from './site-data.mjs';
import { siteLayout } from './site-layout.mjs';
import { origin, breadcrumbs, breadcrumbSchema, jsonLd } from './site-seo.mjs';
import { applySiteStyles } from './site-assets.mjs';

const root = new URL('../', import.meta.url);
const version = async name => '/assets/' + name + '?v=' + createHash('sha256')
  .update(await readFile(new URL('assets/' + name, root))).digest('hex').slice(0, 12);
const { destinationPlaceId, entrance, routes } = JSON.parse(await readFile(new URL('./come-arrivare.json', import.meta.url), 'utf8'));
const path = '/come-arrivare/';
const canonical = origin + path;
const title = 'Come arrivare all’Agriturismo Giuggioloni a Osimo';
const description = 'Indicazioni in auto da Santo Stefano, San Paterniano e Osimo centro. Riconosci l’insegna su Via Acquaviva e raggiungi il parcheggio dell’Agriturismo Giuggioloni.';
const trail = [['Home', '/'], ['Come arrivare', path]];
const { via, comune, numeri_telefono: [phone] } = siteData.contatto;
const dest = `Agriturismo Giuggioloni - I Sapori dell'Acquaviva, ${via}, Osimo`;
const telephone = 'tel:' + phone.replace(/[^+\d]/g, '');
const photo = '/assets/come-arrivare/ingresso';
const photoAlt = 'Insegna in legno Agriturismo Giuggioloni e Spaccio Aziendale, su sostegno scuro e basamento di pietre chiare';
const entranceLabel = entrance.confirmed ? 'Imbocco della strada privata' : 'Imbocco della strada privata (posizione stimata)';
const entranceMap = 'https://www.google.com/maps/search/?' + new URLSearchParams({ api: '1', query: entrance.point });
const newTab = 'target="_blank" rel="noopener noreferrer"';
const { header, footer } = siteLayout(path);
const footerWithoutMap = footer.replace(/<section class="place-map"[\s\S]*?<\/section>/, '');

function routeUrl(route) {
  const waypoints = [...route.waypoints, entrance.point];
  if (waypoints.length > 3) throw new Error(`Troppi punti intermedi per ${route.id}.`);
  return 'https://www.google.com/maps/dir/?' + new URLSearchParams({
    api: '1', destination: dest, destination_place_id: destinationPlaceId,
    travelmode: 'driving', waypoints: waypoints.join('|'), dir_action: 'navigate',
  });
}

const choices = routes.map(route => `<li><a class="arrival-choice" href="#${route.id}">
    <span><strong>${escape(route.title)}</strong><small>${escape(route.subtitle)}</small></span>
    <span aria-hidden="true">↓</span>
  </a></li>`).join('\n');

const sections = routes.map(route => `<section id="${route.id}" class="arrival-route" aria-labelledby="${route.id}-title">
  <h3 id="${route.id}-title">${escape(route.title)}</h3>
  <p>${escape(route.summary)}</p>
  <ol>
    ${route.steps.map(step => `<li>${escape(step)}</li>`).join('\n    ')}
    <li>Imbocca la strada privata accanto all’insegna e prosegui fino all’agriturismo e al parcheggio.</li>
  </ol>
  <div class="arrival-actions">
    <a class="arrival-button arrival-primary" href="${escape(routeUrl(route))}" ${newTab} data-arrival-event="maps_open" data-route="${route.id}">Apri questo percorso su Google Maps <span aria-hidden="true">↗</span></a>
    <a class="arrival-button" href="#${route.id}" data-share-route>Condividi queste indicazioni</a>
    <a class="arrival-link" href="#riconosci-ingresso">Guarda l’insegna d’ingresso <span aria-hidden="true">↑</span></a>
  </div>
  <p class="arrival-share-status" role="status"></p>
  <div class="arrival-share-copy" hidden><label for="${route.id}-link">Copia questo indirizzo</label><input id="${route.id}-link" value="${canonical}#${route.id}" readonly></div>
</section>`).join('\n');

const schema = jsonLd({
  '@type': 'WebPage', '@id': canonical + '#pagina', url: canonical, name: title,
  description, inLanguage: 'it', isPartOf: { '@id': origin + '/#sito' }, about: { '@id': restaurantId },
});
const html = applySiteStyles(`<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="Agriturismo Giuggioloni">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${origin}${photo}-960.webp"><meta property="og:image:alt" content="${escape(photoAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f5eee3"><link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/site.min.css"><link rel="stylesheet" href="${await version('come-arrivare.css')}">
<script src="${await version('place-map.js')}" defer></script><script src="/assets/site.js" defer></script><script src="/assets/booking.js" defer></script><script src="${await version('come-arrivare.js')}" defer></script>
${schema}
${breadcrumbSchema(trail)}
</head><body class="bg-background-cream text-gray-800 font-display bg-texture-cream" data-arrival-analytics>
${header}<main id="contenuto" class="subpage"><div class="farm-page arrival-page">
${breadcrumbs(trail)}
<header class="arrival-intro">
  <h1>Come arrivare all’Agriturismo Giuggioloni</h1>
  <address>${escape(via)}, ${escape(comune.split(' - ')[0])}</address>
  <p>Scegli da dove arrivi: ti accompagniamo fino all’ingresso con indicazioni semplici e punti di riferimento.</p>
</header>
<nav class="arrival-choices" aria-labelledby="arrival-choices-title">
  <h2 id="arrival-choices-title">Da dove arrivi?</h2>
  <ul>${choices}</ul>
</nav>
<section id="riconosci-ingresso" class="arrival-entrance" aria-labelledby="arrival-entrance-title">
  <div>
    <h2 id="arrival-entrance-title">Quando vedi questa insegna, sei all’ingresso</h2>
    <p>Cerca l’insegna in legno con le scritte verdi «Agriturismo Giuggioloni» e «Spaccio Aziendale». Qui inizia la nostra strada privata: imboccala e prosegui fino all’agriturismo e al parcheggio.</p>
    <a class="arrival-link" href="${photo}-1536.webp" ${newTab}>Ingrandisci la foto dell’insegna <span aria-hidden="true">↗</span></a>
  </div>
  <figure>
    <img src="${photo}-480.webp" srcset="${photo}-480.webp 480w, ${photo}-960.webp 960w" sizes="(min-width: 70rem) 32rem, (min-width: 48rem) 47vw, calc(100vw - 4rem)" width="960" height="960" decoding="async" alt="${escape(photoAlt)}">
    <figcaption>L’insegna all’imbocco della strada privata che conduce all’agriturismo e al parcheggio.</figcaption>
  </figure>
</section>
<section class="arrival-itineraries" aria-labelledby="arrival-itineraries-title">
  <h2 id="arrival-itineraries-title">Indicazioni in auto</h2>
  <p class="arrival-route-note">Google Maps può mostrare i passaggi intermedi come tappe. ${entrance.confirmed ? '' : 'Il punto dell’imbocco sulla mappa è indicativo. Sul posto, cerca l’insegna in legno.'}</p>
  ${sections}
</section>
<div class="arrival-support">
  <section id="mappa" class="place-map arrival-map" data-map aria-labelledby="arrival-map-title">
    <h2 id="arrival-map-title">L’ingresso e il locale su Maps</h2>
    <p>Usa l’insegna per riconoscere l’imbocco. La mappa qui sotto mostra il locale e si collega a Google solo quando scegli di aprirla.</p>
    <div class="arrival-actions">
      <a class="arrival-link" href="${escape(entranceMap)}" ${newTab} data-arrival-event="maps_open" data-route="ingresso">${entranceLabel} <span aria-hidden="true">↗</span></a>
      <a class="arrival-link" href="${escape(placeMap.placeUrl)}" ${newTab} data-arrival-event="maps_open" data-route="locale">Scheda Google del ristorante <span aria-hidden="true">↗</span></a>
      <button type="button" class="arrival-button" data-map-toggle data-arrival-event="maps_open" data-route="mappa" aria-expanded="false" aria-controls="arrival-map-slot" hidden>Mostra la mappa Google</button>
    </div>
    <div id="arrival-map-slot" data-map-slot hidden></div>
  </section>
  <section class="arrival-help" aria-labelledby="arrival-help-title">
    <h2 id="arrival-help-title">Hai bisogno di aiuto? Chiamaci</h2>
    <a class="arrival-button arrival-primary" href="${telephone}" data-arrival-event="phone_click">${escape(phone)}</a>
    <a class="arrival-link" href="/prenotazione/">Prenotazioni e contatti <span aria-hidden="true">→</span></a>
  </section>
</div>
</div></main>${footerWithoutMap}
</body></html>
`);

const directory = new URL('come-arrivare/', root);
await mkdir(directory, { recursive: true });
const output = new URL('index.html', directory);
if (await readFile(output, 'utf8').catch(() => '') !== html) await writeFile(output, html);
console.log('Pagina /come-arrivare/ generata con i tre itinerari.');
