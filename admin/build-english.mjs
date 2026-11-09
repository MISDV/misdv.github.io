import { mkdir, writeFile } from 'node:fs/promises';
import placeMap from '../assets/place-map.js';
import { breadcrumbSchema, breadcrumbs, jsonLd } from './site-seo.mjs';
import { siteLayout } from './site-layout.mjs';
import { applySiteStyles } from './site-assets.mjs';

const title = 'Farm restaurant in Osimo, Marche | Agriturismo Giuggioloni';
const description = 'Family-run farm restaurant in Osimo: seasonal Marche cooking, two dining rooms, a garden, parking and wheelchair access. View the English menu and call to book.';
const trail = [['Home', '/'], ['English', '/en/']];
const { header, footer } = siteLayout('/en/', 'en');
const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://agriturismogiuggioloni.it/en/">
<link rel="alternate" hreflang="it" href="https://agriturismogiuggioloni.it/">
<link rel="alternate" hreflang="en" href="https://agriturismogiuggioloni.it/en/">
<link rel="alternate" hreflang="x-default" href="https://agriturismogiuggioloni.it/">
<meta property="og:type" content="website"><meta property="og:locale" content="en_GB">
<meta property="og:site_name" content="Agriturismo Giuggioloni"><meta property="og:title" content="${title}">
<meta property="og:description" content="${description}"><meta property="og:url" content="https://agriturismogiuggioloni.it/en/">
<meta property="og:image" content="https://agriturismogiuggioloni.it/assets/fattoria/giardino-800.webp">
<meta property="og:image:alt" content="The garden at Agriturismo Giuggioloni in Osimo">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f5eee3">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/site-legacy.min.css">
<link rel="stylesheet" href="/assets/site-extras.css?v=5"><link rel="stylesheet" href="/assets/booking.css?v=1">
<script src="/assets/place-map.js?v=1" defer></script>
<script src="/assets/booking.js?v=3" defer></script>
<script src="/assets/site.js?v=9" defer></script>
${breadcrumbSchema(trail)}
${jsonLd({ '@type': 'WebPage', '@id': 'https://agriturismogiuggioloni.it/en/#page', url: 'https://agriturismogiuggioloni.it/en/', name: title, description, inLanguage: 'en', isPartOf: { '@id': 'https://agriturismogiuggioloni.it/#sito' }, about: { '@id': 'https://agriturismogiuggioloni.it/#ristorante' } })}
</head><body class="bg-background-cream text-gray-800 font-display">
${header}
<main id="content" class="subpage"><div class="farm-page english-home">${breadcrumbs(trail, 'en')}
<section class="farm-hero"><div><p class="eyebrow">Osimo · Marche · Italy</p><h1>A family table in the Marche countryside</h1><p>Welcome to Agriturismo Giuggioloni, a farm restaurant in Osimo, in the province of Ancona. Our family brings the farm’s produce and the flavours of seasonal Marche cooking to the table.</p><div class="place-actions"><a href="/lume/en/">View the English menu</a><a href="tel:+393922529406" data-booking>Book your table</a></div></div><picture><source type="image/avif" srcset="/assets/fattoria/giardino-480.avif 480w,/assets/fattoria/giardino-800.avif 800w" sizes="(min-width:768px) 48vw,100vw"><img class="farm-photo" src="/assets/fattoria/giardino-800.webp" alt="The garden surrounding our restaurant" width="800" height="600" fetchpriority="high"></picture></section>
<article class="farm-content">
<h2 id="farm">From father to sons</h2><p>Our story is a family story, passed from father to sons. Maurizio is our cook and prepares the food; Massimo manages the dining room and welcomes our guests. We grow what the seasons allow and use the harvest in our menu.</p>
<h2>Two dining rooms, throughout the year</h2><p>The indoor dining room has a long row of windows overlooking the garden. Our second room is outdoors and covered: its sides stay open in summer and can be closed in winter, so it can be used in the colder months too.</p>
<h2>A garden for everyone</h2><p>Children have a large green space to play in the restaurant’s garden, surrounded by nature, while parents can enjoy an aperitivo outdoors. Pets are welcome.</p>
<h2>Parking and access</h2><p>There is a large car park in front of the restaurant. The premises are wheelchair accessible.</p>
<aside class="farm-note"><h2>A working farm</h2><p>Our farm raises geese, hens, chickens, ducks, rabbits, lambs, goats, sheep, calves and pigs. It is a working farm, not an educational farm, and is not open for visits.</p></aside>
<h2>Opening times and reservations</h2><p>Friday dinner: please call to confirm the time. Saturday and Sunday: 11:30–15:00 and 19:00–23:00. Closed Monday to Thursday.</p>
<p>Call <a href="tel:+393922529406">+39 392 252 9406</a> to arrange your table, or email <a href="mailto:info@agriturismogiuggioloni.it">info@agriturismogiuggioloni.it</a>.</p>
<div class="place-actions"><a href="tel:+393922529406" data-booking>Book a table</a><a href="/lume/en/">Dishes, prices and allergen guide</a></div>
<h2>Find us</h2><p>Via Acquaviva 34, 60027 Osimo (AN), Marche, Italy.</p><p><a href="${placeMap.placeUrl}" target="_blank" rel="noopener noreferrer">Directions on Google Maps</a></p>
</article></div></main>
${footer}
</body></html>`;
const directory = new URL('../en/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('index.html', directory), applySiteStyles(html) + '\n', 'utf8');
