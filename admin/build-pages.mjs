import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { breadcrumbs, breadcrumbSchema, jsonLd, origin } from './site-seo.mjs';
import { siteLayout } from './site-layout.mjs';
import { applySiteStyles } from './site-assets.mjs';

const farm = [
  {
    path: '/fattoria/animali/', label: 'Animali', heading: 'Gli animali della fattoria',
    title: 'Gli animali della fattoria a Osimo',
    description: 'Scopri gli animali dell’azienda agricola Giuggioloni a Osimo e il loro legame con la cucina. La fattoria non è didattica e non è aperta alle visite.',
    intro: 'La fattoria è parte dell’agriturismo. Qui alleviamo gli animali dell’azienda e ritroviamo, anche in cucina, il legame con il lavoro di ogni giorno.',
    content: 'In azienda alleviamo oche, galline, polli, papere, conigli, agnelli, capre, pecore, vitelli e maiali. Gli animali fanno parte del lavoro quotidiano della nostra famiglia e del legame tra la terra e la tavola.',
    extra: '<aside class="farm-note"><h2>Una fattoria agricola</h2><p>La nostra è un’azienda agricola: non svolge attività di fattoria didattica e non è aperta alle visite. Puoi conoscere la nostra realtà attraverso queste pagine e la cucina dell’agriturismo.</p></aside>',
    hero: ['animali', 'Un bovino della fattoria Giuggioloni'],
  },
  {
    path: '/fattoria/orto/', label: 'Orto', heading: 'L’orto dell’Acquaviva',
    title: 'L’orto dell’agriturismo a Osimo',
    description: 'Dalle piantine al raccolto, scopri l’orto dell’Agriturismo Giuggioloni e gli ortaggi che accompagnano la cucina di stagione a Osimo.',
    intro: 'L’orto cambia con i mesi e con il raccolto. Seguiamo questo ritmo anche a tavola, dove le verdure di stagione accompagnano i piatti dell’agriturismo.',
    content: 'Coltiviamo tutto ciò che la stagione ci permette di portare in tavola. Il raccolto entra nel menù dell’agriturismo e accompagna il lavoro di Maurizio in cucina. Le foto raccontano momenti diversi, dalle piantine ai filari. La fattoria non è didattica e non è aperta alle visite.',
    hero: ['campo', 'I filari dell’orto sulle colline di Osimo'],
    gallery: [['piantine', 'Le piantine prima del trapianto'], ['raccolto', 'Le colture nell’orto dell’agriturismo']],
  },
  {
    path: '/fattoria/locale/', label: 'Il locale', heading: 'Il locale e il giardino',
    title: 'Il ristorante e il giardino a Osimo',
    description: 'Agriturismo a Osimo con due sale, giardino, grande parcheggio e accesso in sedia a rotelle. Bambini e animali ammessi. Scopri il locale e prenota.',
    intro: 'I Sapori dell’Acquaviva accoglie gli ospiti tra le colline di Osimo. Il giardino circonda il locale e accompagna le giornate in campagna.',
    content: 'Massimo si occupa della sala e dell’accoglienza, mentre Maurizio prepara i piatti della cucina di famiglia. Il locale si affaccia sul giardino e offre due sale per stare insieme in ogni stagione.',
    extra: `<section class="farm-content practical-info"><h2>Due sale, tutto l’anno</h2><p>La sala interna ha una grande fila di finestre affacciate sul giardino. La seconda sala è esterna e coperta: d’estate rimane aperta sui lati, mentre d’inverno può essere richiusa e utilizzata anche nei mesi freddi.</p>
<h2>Giardino e aperitivi all’aperto</h2><p>Il grande spazio verde offre ai bambini la possibilità di giocare in mezzo alla natura, nel giardino del locale. I genitori possono rilassarsi e fare un aperitivo all’aperto.</p>
<h2>Parcheggio e accessibilità</h2><p>Davanti al locale è disponibile un grande parcheggio. L’agriturismo è accessibile alle persone in sedia a rotelle.</p>
<h2>Gli animali sono benvenuti</h2><p>Puoi venire all’agriturismo con il tuo animale.</p>
<aside class="farm-note"><h2>La fattoria non è visitabile</h2><p>L’azienda agricola non è una fattoria didattica e non è aperta alle visite. Il giardino del ristorante resta lo spazio dedicato al relax e al gioco.</p></aside>
<div class="place-actions"><a href="tel:+393922529406" data-booking>Prenota un tavolo</a></div></section>`,
    hero: ['giardino', 'Il giardino dell’Agriturismo Giuggioloni'],
    gallery: [['esterni', 'Fiori e verde negli spazi esterni'], ['prato', 'Il prato e gli alberi del giardino']],
  },
];

function photo([name, alt], eager = false, card = false) {
  const prefix = '/assets/fattoria/' + name;
  const sizes = eager || card ? '(min-width: 768px) min(48vw, 540px), calc(100vw - 2rem)' : '(min-width: 768px) 33vw, calc(100vw - 2rem)';
  return `<picture><source type="image/avif" srcset="${prefix}-480.avif 480w, ${prefix}-800.avif 800w" sizes="${sizes}"><img class="farm-photo" src="${prefix}-480.webp" srcset="${prefix}-480.webp 480w, ${prefix}-800.webp 800w" sizes="${sizes}" width="480" height="360" alt="${escape(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

function page({ path, title, description, trail, content, hero, privacy = false, collection = [] }) {
  const { header, footer } = siteLayout(path);
  const canonical = origin + path;
  const fullTitle = escape(title + ' | Agriturismo Giuggioloni');
  const summary = escape(description);
  const social = hero ? `${origin}/assets/fattoria/${hero[0]}-800.webp` : `${origin}/og-image-1200x630.png`;
  const robots = privacy ? 'noindex,follow' : 'index,follow,max-image-preview:large';
  const webPage = { '@type': collection.length ? 'CollectionPage' : 'WebPage', '@id': canonical + '#pagina', url: canonical, name: title, description, inLanguage: 'it', isPartOf: { '@id': origin + '/#sito' }, about: { '@id': origin + '/#ristorante' } };
  if (collection.length) webPage.mainEntity = { '@id': canonical + '#percorsi' };
  const schema = jsonLd(collection.length ? { '@graph': [webPage, { '@type': 'ItemList', '@id': canonical + '#percorsi', name: 'Scopri la fattoria Giuggioloni', numberOfItems: collection.length, itemListElement: collection.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, name: entry.label, url: origin + entry.path })) }] } : webPage);
  return applySiteStyles(`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${summary}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Agriturismo Giuggioloni">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${summary}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${social}">
<meta property="og:image:alt" content="${escape(hero?.[1] || 'Agriturismo Giuggioloni a Osimo')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
<meta name="theme-color" content="#f5eee3">
<link rel="stylesheet" href="/assets/site-legacy.min.css">
<link rel="stylesheet" href="/assets/site-extras.css?v=5">
<link rel="stylesheet" href="/assets/booking.css?v=1">
${breadcrumbSchema(trail)}
${schema}
<script src="/assets/place-map.js?v=1" defer></script>
<script src="/assets/site.js?v=9" defer></script>
<script src="/assets/booking.js?v=3" defer></script>
${privacy ? '<script src="/assets/consent.js?v=1" defer></script>' : ''}
</head>
<body class="bg-background-cream dark:bg-background-dark text-gray-800 dark:text-gray-200 font-display bg-texture-cream">
${header}<main id="contenuto" class="subpage"><div class="farm-page">
${breadcrumbs(trail)}
${content}
</div></main>
${footer}
</body></html>
`);
}

const farmOverview = [
  { path: '/fattoria/animali/', label: 'Gli animali', hero: ['animali', 'Un bovino della fattoria Giuggioloni'], text: 'Gli allevamenti dell’azienda agricola e il loro legame con la cucina dell’agriturismo.' },
  { path: '/fattoria/orto/', label: 'L’orto', hero: ['campo', 'I filari dell’orto tra le colline di Osimo'], text: 'Il lavoro nei campi, le coltivazioni e gli ortaggi che seguono il ritmo delle stagioni.' },
  { path: '/storia.html', label: 'La nostra storia', hero: ['storia', 'Gli ulivi negli spazi verdi dell’agriturismo'], text: 'Una storia dal padre ai figli: Maurizio in cucina e Massimo in sala, tra tradizione e accoglienza.' },
  { path: '/fattoria/locale/', label: 'Il locale e il giardino', hero: ['giardino', 'Il giardino dell’Agriturismo Giuggioloni a Osimo'], text: 'Due sale, il giardino, il parcheggio e gli spazi accessibili per stare insieme in campagna.' },
];
await save('/fattoria/', page({
  path: '/fattoria/', title: 'La fattoria, l’orto e la nostra storia a Osimo',
  description: 'Conosci la fattoria Giuggioloni a Osimo: animali, orto, storia di famiglia, ristorante e giardino. Scopri le quattro pagine dell’agriturismo.',
  trail: [['Home', '/'], ['La fattoria', '/fattoria/']], hero: ['giardino', 'Il giardino dell’Agriturismo Giuggioloni'], collection: farmOverview,
  content: `<header class="farm-overview-intro"><p class="eyebrow">Giuggioloni · Osimo, Marche</p><h1>La nostra fattoria</h1><p>La vita dell’azienda agricola, il lavoro nell’orto e l’accoglienza di famiglia. Quattro percorsi per conoscere il legame tra la nostra terra e la tavola dell’agriturismo.</p></header>
<section aria-labelledby="farm-overview-title"><h2 id="farm-overview-title">Scopri il mondo Giuggioloni</h2><div class="farm-overview-grid">${farmOverview.map((entry, index) => `<a class="farm-overview-card" href="${entry.path}">${photo(entry.hero, index === 0, true)}<div><h3>${entry.label}</h3><p>${escape(entry.text)}</p><span aria-hidden="true">Scopri di più <span>→</span></span></div></a>`).join('\n')}</div></section>
<aside class="farm-note"><h2>Un’azienda agricola, ogni giorno</h2><p>La fattoria non è didattica e non è aperta alle visite. Ti raccontiamo il nostro lavoro attraverso queste pagine e la cucina dell’agriturismo; il giardino del ristorante è lo spazio dedicato al relax e al gioco.</p></aside>
<div class="place-actions"><a href="/menu/">Scopri il menù completo</a><a href="/spaccio/">Lo spaccio aziendale</a><a href="tel:+393922529406" data-booking>Prenota un tavolo</a></div>`,
}));

for (const entry of farm) {
  const related = [...farm, { path: '/storia.html', label: 'La nostra storia' }].filter(link => link.path !== entry.path);
  const content = `<section class="farm-hero"><div><p class="eyebrow">La fattoria · Osimo</p><h1>${escape(entry.heading)}</h1><p>${escape(entry.intro)}</p><div class="place-actions"><a href="/menu/">Scopri il menù completo</a><a href="#contatti">Contatti e indicazioni</a></div></div>${photo(entry.hero, true)}</section>
<section class="farm-content"><h2>${entry.label === 'Il locale' ? 'Vieni a trovarci' : 'La vita in fattoria'}</h2><p>${escape(entry.content)}</p>
${entry.gallery ? `<div class="farm-gallery">${entry.gallery.map(image => `<figure>${photo(image)}<figcaption>${escape(image[1])}</figcaption></figure>`).join('')}</div>` : ''}</section>
${entry.extra || ''}
<nav class="farm-more" aria-label="Altre pagine della fattoria"><h2>Scopri la fattoria</h2><ul>${related.map(link => `<li><a href="${link.path}">${escape(link.label)}</a></li>`).join('')}</ul></nav>`;
  await save(entry.path, page({ ...entry, trail: [['Home', '/'], ['Fattoria', '/fattoria/'], [entry.label, entry.path]], content }));
}

const privacyPath = '/privacy/';
await save(privacyPath, page({
  path: privacyPath, title: 'Privacy e cookie', description: 'Come il sito usa cookie e preferenze e come modificare il consenso alle statistiche.',
  trail: [['Home', '/'], ['Privacy e cookie', privacyPath]], privacy: true,
  content: `<article class="farm-content"><h1>Privacy e cookie</h1>
<p>Per domande sui dati trattati tramite il sito puoi scrivere all’Agriturismo Giuggioloni, Via Acquaviva 34, 60027 Osimo (AN), all’indirizzo <a href="mailto:info@agriturismogiuggioloni.it">info@agriturismogiuggioloni.it</a>.</p>
<section id="cookie"><h2>Cookie e memoria del dispositivo</h2>
<p>Il sito salva in questo browser la tua scelta sulle statistiche e la preferenza di lingua Italiano/English, utilizzata per aprire la carta nella lingua scelta. Puoi cambiare lingua dal selettore del menù o cancellare la preferenza dalle impostazioni del browser. Il menù Lume salva localmente i preferiti e il tema che scegli. Puoi cancellarli dalla voce «Privacy e preferenze» di Lume o dalle impostazioni del browser.</p>
<p>Solo se lo accetti, la home carica Google Analytics 4 per misurare le visite. Analytics può salvare i cookie <code>_ga</code> e <code>_ga_*</code>, per un massimo di 180 giorni dalla creazione. Le funzioni pubblicitarie sono disattivate. Consulta le <a href="https://policies.google.com/technologies/partner-sites?hl=it">informazioni di Google sul trattamento dei dati</a>.</p>
<p>La mappa Google si collega al fornitore quando apri il popup di prenotazione oppure scegli di mostrarla nella pagina. I collegamenti a Google Maps e ai social aprono siti esterni soggetti alle rispettive informative.</p></section>
<section id="preferenze-cookie"><h2>Modifica le tue preferenze</h2><p id="cookie-status" class="cookie-status" role="status">Le statistiche richiedono JavaScript e una scelta esplicita.</p><div class="place-actions"><button type="button" data-cookie-settings hidden>Modifica preferenze cookie</button></div></section></article>`,
}));

async function save(path, content) {
  const directory = new URL('..' + path, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), content, 'utf8');
}

const sitemapURL = new URL('../sitemap.xml', import.meta.url);
let sitemap = await readFile(sitemapURL, 'utf8');
if (!sitemap.includes(`${origin}/fattoria/</loc>`)) {
  sitemap = sitemap.replace('</urlset>', `  <url><loc>${origin}/fattoria/</loc></url>\n</urlset>`);
  await writeFile(sitemapURL, sitemap);
}

await import('./build-english.mjs');
await import('./build-spaccio.mjs');
await import('./build-shop.mjs');
