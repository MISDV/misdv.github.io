import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { breadcrumbs, breadcrumbSchema, jsonLd, origin } from './site-seo.mjs';

const farm = [
  {
    path: '/fattoria/animali/', label: 'Animali', heading: 'Gli animali della fattoria',
    title: 'Gli animali della fattoria a Osimo',
    description: 'Incontra gli animali dell’azienda agricola Giuggioloni tra le colline di Osimo e scopri il loro legame con la cucina dell’agriturismo.',
    intro: 'La fattoria è parte dell’agriturismo. Qui alleviamo gli animali dell’azienda e ritroviamo, anche in cucina, il legame con il lavoro di ogni giorno.',
    content: 'I bovini e gli animali da cortile fanno parte della vita della fattoria. Se vuoi vedere gli animali durante una visita, chiedi al personale quali spazi sono accessibili.',
    hero: ['animali', 'Un bovino della fattoria Giuggioloni'],
  },
  {
    path: '/fattoria/orto/', label: 'Orto', heading: 'L’orto dell’Acquaviva',
    title: 'L’orto dell’agriturismo a Osimo',
    description: 'Dalle piantine al raccolto, scopri l’orto dell’Agriturismo Giuggioloni e gli ortaggi che accompagnano la cucina di stagione a Osimo.',
    intro: 'L’orto cambia con i mesi e con il raccolto. Seguiamo questo ritmo anche a tavola, dove le verdure di stagione accompagnano i piatti dell’agriturismo.',
    content: 'Dalle prime piantine ai filari, le foto raccontano momenti diversi del lavoro nell’orto. Per sapere cosa abbiamo raccolto o cosa trovi oggi in cucina, chiedi al personale.',
    hero: ['campo', 'I filari dell’orto sulle colline di Osimo'],
    gallery: [['piantine', 'Le piantine prima del trapianto'], ['raccolto', 'Le colture nell’orto dell’agriturismo']],
  },
  {
    path: '/fattoria/locale/', label: 'Il locale', heading: 'Il locale e il giardino',
    title: 'Il ristorante e il giardino a Osimo',
    description: 'Scopri il locale e il giardino di I Sapori dell’Acquaviva, l’agriturismo Giuggioloni in Via Acquaviva 34, a Osimo.',
    intro: 'I Sapori dell’Acquaviva accoglie gli ospiti tra le colline di Osimo. Il giardino circonda il locale e accompagna le giornate in campagna.',
    content: 'In tavola trovi le proposte della stagione e i menù fissi. Per sapere se è possibile mangiare all’aperto e prenotare un tavolo, contattaci prima della visita.',
    hero: ['giardino', 'Il giardino dell’Agriturismo Giuggioloni'],
    gallery: [['esterni', 'Fiori e verde negli spazi esterni'], ['prato', 'Il prato e gli alberi del giardino']],
  },
];

const story = new URL('../storia.html', import.meta.url);
const template = await readFile(story, 'utf8');
const header = template.slice(template.indexOf('<a class="sr-only'), template.indexOf('<main id="contenuto"'));
const footer = template.slice(template.indexOf('<footer '), template.indexOf('</footer>') + '</footer>'.length);
if (!header.includes('id="siteNav"') || !footer.includes('id="contatti"')) throw new Error('Header o footer del sito non trovato.');

function photo([name, alt], eager = false) {
  const prefix = '/assets/fattoria/' + name;
  const sizes = eager ? '(min-width: 768px) min(48vw, 540px), calc(100vw - 2rem)' : '(min-width: 768px) 33vw, calc(100vw - 2rem)';
  return `<picture><source type="image/avif" srcset="${prefix}-480.avif 480w, ${prefix}-800.avif 800w" sizes="${sizes}"><img class="farm-photo" src="${prefix}-480.webp" srcset="${prefix}-480.webp 480w, ${prefix}-800.webp 800w" sizes="${sizes}" width="480" height="360" alt="${escape(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

function page({ path, title, description, trail, content, hero, privacy = false }) {
  const canonical = origin + path;
  const fullTitle = escape(title + ' | Agriturismo Giuggioloni');
  const summary = escape(description);
  const social = hero ? `${origin}/assets/fattoria/${hero[0]}-800.webp` : `${origin}/og-image-1200x630.png`;
  const robots = privacy ? 'noindex,follow' : 'index,follow,max-image-preview:large';
  const schema = jsonLd({ '@type': 'WebPage', '@id': canonical + '#pagina', url: canonical, name: title, description, inLanguage: 'it', about: { '@id': origin + '/#ristorante' } });
  return `<!doctype html>
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
<link rel="stylesheet" href="/assets/site-extras.css?v=1">
${breadcrumbSchema(trail)}
${schema}
<script src="/assets/site.js?v=4" defer></script>
${privacy ? '<script src="/assets/consent.js?v=1" defer></script>' : ''}
</head>
<body class="bg-background-cream dark:bg-background-dark text-gray-800 dark:text-gray-200 font-display bg-texture-cream">
${header}<main id="contenuto" class="subpage"><div class="farm-page">
${breadcrumbs(trail)}
${content}
</div></main>
${footer}
</body></html>
`;
}

for (const entry of farm) {
  const related = [...farm, { path: '/storia.html', label: 'La nostra storia' }].filter(link => link.path !== entry.path);
  const content = `<section class="farm-hero"><div><p class="eyebrow">La fattoria · Osimo</p><h1>${escape(entry.heading)}</h1><p>${escape(entry.intro)}</p><div class="place-actions"><a href="/lume/">Scopri il menù completo</a><a href="#contatti">Contatti e indicazioni</a></div></div>${photo(entry.hero, true)}</section>
<section class="farm-content"><h2>${entry.label === 'Il locale' ? 'Vieni a trovarci' : 'La vita in fattoria'}</h2><p>${escape(entry.content)}</p>
${entry.gallery ? `<div class="farm-gallery">${entry.gallery.map(image => `<figure>${photo(image)}<figcaption>${escape(image[1])}</figcaption></figure>`).join('')}</div>` : ''}</section>
<nav class="farm-more" aria-label="Altre pagine della fattoria"><h2>Scopri la fattoria</h2><ul>${related.map(link => `<li><a href="${link.path}">${escape(link.label)}</a></li>`).join('')}</ul></nav>`;
  await save(entry.path, page({ ...entry, trail: [['Home', '/'], ['Fattoria', '/#fattoria'], [entry.label, entry.path]], content }));
}

const privacyPath = '/privacy/';
await save(privacyPath, page({
  path: privacyPath, title: 'Privacy e cookie', description: 'Come il sito usa cookie e preferenze e come modificare il consenso alle statistiche.',
  trail: [['Home', '/'], ['Privacy e cookie', privacyPath]], privacy: true,
  content: `<article class="farm-content"><h1>Privacy e cookie</h1>
<p>Per domande sui dati trattati tramite il sito puoi scrivere all’Agriturismo Giuggioloni, Via Acquaviva 34, 60027 Osimo (AN), all’indirizzo <a href="mailto:info@agriturismogiuggioloni.it">info@agriturismogiuggioloni.it</a>.</p>
<section id="cookie"><h2>Cookie e memoria del dispositivo</h2>
<p>Il sito salva in questo browser la tua scelta sulle statistiche. Il menù Lume salva localmente i preferiti e il tema che scegli. Puoi cancellarli dalla voce «Privacy e preferenze» di Lume o dalle impostazioni del browser.</p>
<p>Solo se lo accetti, la home carica Google Analytics 4 per misurare le visite. Analytics può salvare i cookie <code>_ga</code> e <code>_ga_*</code>, per un massimo di 180 giorni dalla creazione. Le funzioni pubblicitarie sono disattivate. Consulta le <a href="https://policies.google.com/technologies/partner-sites?hl=it">informazioni di Google sul trattamento dei dati</a>.</p>
<p>La mappa Google si collega al fornitore quando scegli di mostrarla. I collegamenti a Google Maps e ai social aprono siti esterni soggetti alle rispettive informative.</p></section>
<section id="preferenze-cookie"><h2>Modifica le tue preferenze</h2><p id="cookie-status" class="cookie-status" role="status">Le statistiche richiedono JavaScript e una scelta esplicita.</p><div class="place-actions"><button type="button" data-cookie-settings hidden>Modifica preferenze cookie</button></div></section></article>`,
}));

async function save(path, content) {
  const directory = new URL('..' + path, import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), content, 'utf8');
}
