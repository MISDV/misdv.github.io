import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { adaptCatalog } from './lume/build.mjs';
import { renderMenu } from '../assets/menu-render.mjs';
import { siteLayout } from './site-layout.mjs';
import { origin, breadcrumbs, breadcrumbSchema } from './site-seo.mjs';
import { renderMenuSchema } from './menu-schema.mjs';
import { applySiteStyles } from './site-assets.mjs';

const core = createRequire(import.meta.url)('./lume/src/core.js');
const load = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
export function menuAlternates(html) {
  html=html.replace(/<link rel="alternate" hreflang="(?:it|en|x-default)"[^>]*>\s*/g,'');
  return html.replace('</head>', ['it','en','x-default'].map(lang=>`<link rel="alternate" hreflang="${lang}" href="${origin}/menu/${lang==='en'?'en/':''}">`).join('\n')+'\n</head>');
}
export function menuLanguageLinks(language) {
  return `<nav class="menu-languages" aria-label="${language==='en'?'Menu language':'Lingua del menù'}"><a href="/menu/" lang="it" hreflang="it"${language==='it'?' aria-current="page"':''}>Italiano</a><a href="/menu/en/" lang="en" hreflang="en"${language==='en'?' aria-current="page"':''}>English</a></nav>`;
}
export async function buildEnglishMenu(catalog) {
  const [descriptions,allergens]=await Promise.all([load('./lume/config/descriptions.json'),load('./lume/config/allergens.json')]);
  const adapted=adaptCatalog(catalog,descriptions,allergens);
  const names=new Map([...adapted.items,...adapted.fixedMenus].map(item=>[item.id,item]));
  const cats=new Map(adapted.categories.map(c=>[c.id,c]));
  const english={...catalog,
    title:'The flavours of our land: from farm to table',
    description:'From our farm to your table: meat from our own supply chain and handmade fresh pasta, following the traditions of the Marche countryside.',
    a_la_carte_note:'Water and cover charge are not included in the à la carte menu.',
    allergen_note:'For information about allergens, intolerances and ingredients, please ask the waiting staff to consult the restaurant’s allergen book.',
    categories:catalog.categories.map(c=>({...c,title:core.localize(cats.get(c.id).name,'en'),group:c.group?'Drinks':undefined,
      description:c.description?core.localize(cats.get(c.id).subtitle,'en'):undefined,subtitle:undefined,
      dishes:c.dishes.map(d=>{const n=names.get(d.id);return {...d,
        name:d.id==='boccolotti-del-batte-oca'?'Batte Oca boccolotti pasta':core.localize(n.name,'en'),
        description:d.description?core.localize(n.description,'en'):undefined,
        courses:d.courses?.map((_,i)=>core.localize(n.courses[i].label,'en')),
        includes:d.includes?.map((_,i)=>core.localize(n.inclusions[i].name,'en')),
      };}),
    })),
  };
  const {header,footer}=siteLayout('/menu/en/','en');
  const trail=[['Home','/en/'],['Menu','/menu/en/']];
  const title='Menu and prices in Osimo | Agriturismo Giuggioloni';
  const description='Explore our seasonal menu in English: set menus, handmade pasta, farm meats, desserts and wines at Agriturismo Giuggioloni in Osimo. Call to book.';
  return menuAlternates(applySiteStyles(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${origin}/menu/en/"><meta property="og:type" content="website"><meta property="og:locale" content="en_GB"><meta property="og:site_name" content="Agriturismo Giuggioloni"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${origin}/menu/en/"><meta property="og:image" content="${origin}/og-image-1200x630.png"><meta property="og:image:alt" content="Agriturismo Giuggioloni in Osimo"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#f5eee3">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/assets/site.min.css"><link rel="preload" href="/assets/shop-fonts/playfair-display-700-latin.woff2" as="font" type="font/woff2" crossorigin>
${renderMenuSchema(english,{language:'en'})}${breadcrumbSchema(trail)}
<script src="/assets/place-map.js?v=1" defer></script><script src="/assets/site.js?v=9" defer></script><script type="module" src="/assets/menu.mjs?v=3"></script><script src="/assets/booking.js?v=3" defer></script>
</head><body class="bg-background-cream text-gray-800 font-display bg-texture-cream">${header}
<main id="content" class="subpage"><section class="menu-hero bg-background-cream border-b border-primary/20"><div class="max-w-4xl mx-auto px-4 sm:px-6">${breadcrumbs(trail,'en')}${menuLanguageLinks('en')}<p class="text-primary text-sm font-bold tracking-widest uppercase mb-3 font-serif">I sapori dell’Acquaviva · Osimo</p><h1 class="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Our restaurant menu</h1><p class="text-gray-600 font-light text-lg leading-relaxed mb-6">Seasonal cooking at Agriturismo Giuggioloni, inspired by our farm and its harvest.</p><a class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-sm font-serif font-bold uppercase tracking-wide shadow-lg" href="tel:+393922529406" data-booking>Book a table</a></div></section>
<div class="menu-main max-w-4xl mx-auto px-4 sm:px-6"><div id="menu-controls" class="menu-controls" hidden><div class="menu-field"><label for="menu-category">Category</label><div class="menu-select"><select id="menu-category"><option value="">All categories</option></select><svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="m5 8 5 5 5-5" stroke="currentColor" stroke-width="2"/></svg></div></div><label>Search the menu<input type="search" id="menu-search" placeholder="E.g. pappardelle or verdicchio"></label></div><p id="menu-empty" role="status" hidden>No items match your search.</p><div id="menu-content">${renderMenu(english,{language:'en'})}</div></div></main>${footer}</body></html>`));
}
