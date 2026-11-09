import { createHash } from 'node:crypto';
import placeMap from '../../assets/place-map.js';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { breadcrumbs, breadcrumbSchema } from '../site-seo.mjs';

const require = createRequire(import.meta.url);
const core = require('./src/core.js');
const view = require('./src/view.js');
const read = name => readFile(new URL(name, import.meta.url), 'utf8');
const load = async name => JSON.parse(await read(name));
const bilingual = (it, en = it) => ({ it, en });
const encode = data => JSON.stringify(data).replace(/</g, '\\u003c');
const categoriesEn = {
  'menu-fissi': 'Set menus', 'primi-piatti': 'First courses', 'secondi-piatti': 'Main courses',
  'contorni-e-fritti-della-tradizione': 'Sides and traditional fried bites',
  'dolci-della-casa': 'Homemade desserts', bibite: 'Soft drinks', birre: 'Beers', spumanti: 'Sparkling wines',
  'carta-vini': 'Wine list', 'vini-della-casa': 'House wines', 'amari-e-grappe': 'Bitters and grappas',
};
const wineCategories = new Set(['spumanti', 'carta-vini', 'vini-della-casa']);
const wineTypes = {
  'mille-bolle-frizzante-0-75-lt': 'sparkling', 'vino-bianco-marche-igp-passione-di-peco-0-75-lt': 'white',
  'chardonnay-marche-igp-0-75-lt': 'white', 'vino-rosato-marche-igp-0-75-lt': 'rose',
  'verdicchio-class-le-barbatelle-doc-0-75-lt': 'white', 'passerina-le-barbatelle-igp-0-75-lt': 'white',
  'pecorino-le-barbatelle-igp-0-75-lt': 'white', 'rosso-conero-doc-piancarda-garofoli-0-75-lt': 'red',
  'lacrima-di-morro-d-alba-le-barbatelle-0-75-lt': 'red', 'rosso-conero-le-barbatelle-0-75-lt': 'red',
  'passerina-1-lt': 'white', 'rosso-marche-1-lt': 'red',
};
const fixedEn = {
  'Antipasto alla Giuggiola': 'Giuggiola starter',
  '2 primi a scelta tra tutti i primi del Giorno': 'Two first courses of your choice from the day’s selection',
  'Degustazione Sapori della Tradizione': 'Traditional flavours tasting',
  'Contorno: patate arrosto, erbe di campo e insalata mista': 'Sides: roast potatoes, wild greens and mixed salad',
  'Degustazione Sapori della Filiera': 'Farm produce tasting',
  'Contorno a scelta': 'Side dish of your choice',
  'Assaggio di fritti tradizionali: olive ascolane, cremini, panelle': 'Traditional fried bites: Ascoli-style olives, fried custard bites and panelle',
  'Dolci caserecci della casa': 'Homemade desserts',
  'Acqua': 'Water', '¼ di vino della casa': '¼ of house wine', 'Caffè': 'Coffee', 'Coperto': 'Cover charge',
  'Bottiglia di vino di nostra produzione': 'Bottle of wine from our own production', 'Dessert': 'Dessert',
};
const categorySubtitles = {
  'primi-piatti': 'Fresh pasta rolled by hand with eggs from our hens.',
  'secondi-piatti': 'Meats from our own supply chain, with on-site butchery and free-range farming.',
  'dolci-della-casa': 'Made daily in our kitchen.',
};
const fallbackDescription = bilingual('Chiedi al personale come viene servita questa voce.', 'Ask the staff how this item is served.');
const unknownAllergens = { allergensStatus: 'unknown', allergens: [] };

function matchingNote(dish, note) {
  if (!note) return undefined;
  // A renamed or reformulated dish must not inherit the old recipe guidance.
  const fields = ['name', 'description', 'courses', 'includes'];
  return fields.every(key => JSON.stringify(dish[key]) === JSON.stringify(note.source[key])) ? note : undefined;
}

function adaptCatalog(catalog, descriptions, allergens) {
  const menu = { schemaVersion: 2, allergens, categories: [], items: [], fixedMenus: [] };
  for (const category of catalog.categories) {
    const type = category.id === 'menu-fissi' ? 'fixed' : wineCategories.has(category.id) ? 'wine' : category.group === 'Bevande' ? 'drink' : 'food';
    const name = bilingual(category.title, categoriesEn[category.id]);
    const subtitle = [category.description, category.subtitle].filter(Boolean).join(' · ');
    const conditions = bilingual(category.description || 'Chiedi al personale per le condizioni.',
      category.id === 'menu-fissi' ? 'Shared menu. Minimum two guests. The whole table chooses the same set menu.' : undefined);
    menu.categories.push({ id: category.id, type, name, subtitle: type === 'fixed' ? conditions : bilingual(subtitle || name.it, categorySubtitles[category.id] || name.en), layout: type === 'drink' ? 'list' : 'cards' });
    for (const dish of category.dishes) {
      const note = matchingNote(dish, descriptions[dish.id]);
      const item = {
        id: dish.id, name: bilingual(dish.name, note?.nameEn), description: note?.description || (dish.description ? bilingual(dish.description) : fallbackDescription),
        price: dish.price, status: dish.available === false ? 'suspended' : 'available',
        ...unknownAllergens, allergenChecks: note?.allergenChecks || [],
      };
      if (type === 'fixed') {
        menu.fixedMenus.push({
          ...item, conditions,
          courses: (dish.courses || []).map(text => ({ label: bilingual(text, fixedEn[text]), mode: 'all', itemIds: [] })),
          inclusions: (dish.includes || []).map(text => ({ name: bilingual(text, fixedEn[text]), description: bilingual('Incluso nel prezzo.', 'Included in the price.'), ingredients: [], ...unknownAllergens })),
        });
        continue;
      }
      Object.assign(item, { category: category.id, kind: type, priceUnit: dish.price_unit || (type === 'food' ? 'portion' : 'bottle'), ingredients: [] });
      if (note && dish.id === 'ravioli-con-crema-di-zucchine-e-pinoli') item.ingredients = [bilingual('Zucchine', 'Courgettes'), bilingual('Pinoli', 'Pine nuts')];
      if (type === 'wine') {
        item.wineType = (note ? wineTypes[dish.id] : null) ?? (category.id === 'spumanti' ? 'sparkling' : null);
        item.volume = dish.name.match(/\d+(?:,\d+)?\s+(?:lt|cl)\b/i)?.[0] || '';
      }
      if (note && dish.id === 'rosso-conero-doc-piancarda-garofoli-0-75-lt') {
        item.producer = bilingual('Garofoli');
        item.grapes = 'Montepulciano';
      }
      menu.items.push(item);
    }
  }
  return menu;
}

export async function buildLume(catalog, contactData) {
  const [site, descriptions, allergens, strings, stylesheet, qr, ...scripts] = await Promise.all([
    load('./config/site.json'), load('./config/descriptions.json'), load('./config/allergens.json'), load('./src/i18n.json'),
    read('./src/styles.css'), read('./config/menu-qr.svg'), ...['core', 'view', 'app'].map(name => read('./src/' + name + '.js')),
  ]);
  const menu = adaptCatalog(catalog, descriptions, allergens);
  site.updatedAt = catalog.updated?.slice?.(0, 10) || site.updatedAt;
  site.restaurant.coverCharge = catalog.cover_charge ?? 0;
  site.restaurant.coverNote = bilingual(catalog.a_la_carte_note || '', 'Water and cover charge are separate on the à la carte menu.');
  const contact = contactData.contatto;
  site.restaurant.address = [contact?.via, contact?.comune].filter(Boolean).join(', ');
  site.restaurant.phone = contact?.numeri_telefono?.[0] || null;
  site.restaurant.email = contact?.mail || null;
  site.restaurant.mapsUrl = placeMap.placeUrl;
  site.features.featured = menu.items.some(item => item.id === site.featured.id && item.status === 'available');
  if (catalog.season) for (const lang of site.languages) strings[lang].season = (lang === 'it' ? 'STAGIONE ' : 'SEASON ') + catalog.season;
  const errors = core.validate(site, menu);
  if (errors.length) throw new Error('Dati Lume non validi:\n- ' + errors.join('\n- '));

  const files = new Map([['lume/assets/menu-qr.svg', qr]]);
  const asset = (extension, content) => {
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
    const path = 'lume/assets/menu-' + hash + '.' + extension;
    files.set(path, content);
    return '/' + path;
  };
  const branding = Object.entries(site.branding).filter(([key]) => key === 'light' || key === 'dark')
    .map(([theme, colors]) => `#lume-menu[data-theme="${theme}"]{${Object.entries(colors).map(([key, value]) => `--lm-${key}:${value}`).join(';')}}`).join('\n');
  const css = asset('css', branding + '\n' + stylesheet);
  const js = asset('js', scripts.join('\n;\n'));
  const options = {
    assetPrefix: '/lume/', languagePaths: { it: '/lume/', en: '/lume/en/' },
    featurePhoto: { src: '/assets/agriturismo-orto.webp', avif: '/assets/agriturismo-orto.avif', alt: bilingual('Il raccolto dell’orto dell’agriturismo', 'Produce from the farm’s vegetable garden') },
    qrPath: '/lume/assets/menu-qr.svg',
  };
  for (const lang of site.languages) {
    const prepared = core.prepare(site, menu, lang);
    const t = strings[lang];
    const path = options.languagePaths[lang];
    const pageOptions = { ...options, printPath: path + 'print/' };
    const trail = [['Home', '/'], [lang === 'it' ? 'Menù' : 'Menu', '/menu/'], [lang === 'it' ? 'Carta Lume' : 'Lume menu', path]];
    const root = view.root(prepared, t, pageOptions).replace('<main id="lm-content" tabindex="-1">', '<main id="lm-content" tabindex="-1">' + breadcrumbs(trail, lang));
    const escape = core.escape;
    const canonical = site.baseUrl + path;
    const title = escape(site.seo.title[lang]);
    const description = escape(site.seo.description[lang]);
    const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/assets/place-map.js?v=1" defer></script><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="${css}"><link rel="stylesheet" href="/assets/site-extras.css?v=6"><link rel="stylesheet" href="/assets/booking.css?v=2">`;
    const alternate = site.languages.map(language => `<link rel="alternate" hreflang="${language}" href="${site.baseUrl + options.languagePaths[language]}">`).join('');
    const metadata = `<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical}">${alternate}<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${site.baseUrl}/og-image-1200x630.png"><meta name="theme-color" content="${site.branding.light.paper}">`;
    const app = `<script type="application/json" data-lume-payload>${encode({ site, menu, strings, lang, options: pageOptions })}</script><script src="${js}" defer></script><script src="/assets/booking.js?v=3" defer></script>`;
    files.set(path.slice(1) + 'index.html', `<!doctype html>\n<html lang="${lang}"><head>${head}${metadata}${breadcrumbSchema(trail)}</head><body class="lume-document">${root}${app}</body></html>\n`);

    const print = root.replace('class="lm-root"', 'class="lm-root lm-print"').replace(/<details /g, '<details open ')
      .replace(/<a class="lm-skip"[^>]*>[^<]*<\/a>/, '')
      .replace('<main id="lm-content" tabindex="-1">', `<main id="lm-content" tabindex="-1"><h1 class="lm-sr">${lang === 'it' ? 'Menù Agriturismo Giuggioloni' : 'Agriturismo Giuggioloni menu'}</h1>`);
    const printBar = `<nav class="lm-print-bar" aria-label="${escape(t.print)}"><button type="button" onclick="window.print()">${escape(t.print)}</button><a href="${path}">${escape(t.edition)}</a></nav>`;
    files.set(path.slice(1) + 'print/index.html', `<!doctype html>\n<html lang="${lang}"><head>${head}<title>${title} · ${escape(t.print)}</title><meta name="robots" content="noindex,follow"></head><body class="lume-document">${printBar}${print}</body></html>\n`);
  }
  return files;
}
