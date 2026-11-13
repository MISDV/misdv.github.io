import { jsonLd, origin } from './site-seo.mjs';

const labels = {
  it: { season: 'Stagione', cover: 'Coperto', courses: 'Il percorso', includes: 'Inclusi nel prezzo', conditions: 'Condizioni', allergens: 'Allergeni indicati', person: 'persona', perPerson: 'Prezzo a persona.', perKg: 'Prezzo al chilogrammo.' },
  en: { season: 'Season', cover: 'Cover charge', courses: 'The courses', includes: 'Included in the price', conditions: 'Conditions', allergens: 'Listed allergens', person: 'person', perPerson: 'Price per person.', perKg: 'Price per kilogram.' },
};
const text = value => typeof value === 'string' ? value.trim() : '';
const paragraphs = values => values.filter(Boolean).join('\n');
const list = (label, values) => Array.isArray(values) && values.some(Boolean) ? `${label}: ${values.filter(Boolean).join('; ')}.` : '';

// The public renderer hides unavailable dishes and empty categories in this order.
// Read the same localized catalog used by renderMenu; do not enrich it from Lume-only notes.
export function menuSchema(menu, { language = 'it', url = origin + (language === 'en' ? '/menu/en/' : '/menu/') } = {}) {
  if (!Array.isArray(menu.categories)) throw new Error('Lo schema Menu richiede un catalogo per categorie.');
  const words = labels[language];
  if (!words) throw new Error('Lingua del menù non supportata.');
  const format = new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'it-IT', { style: 'currency', currency: 'EUR' });
  const restaurant = { '@id': origin + '/#ristorante' };
  const result = {
    '@type': 'Menu', '@id': url + '#menu', url,
    name: text(menu.title) || (language === 'en' ? 'Agriturismo Giuggioloni menu' : 'Menù Agriturismo Giuggioloni'),
    inLanguage: language, provider: restaurant, about: restaurant,
    isPartOf: { '@id': origin + '/#sito' },
    description: paragraphs([
      text(menu.description),
      menu.season ? `${words.season} ${menu.season}.` : '',
      Number.isFinite(menu.cover_charge) ? `${words.cover}: ${format.format(menu.cover_charge)}.` : '',
      text(menu.a_la_carte_note), text(menu.allergen_note),
    ]),
    hasMenuSection: menu.categories.flatMap(category => {
      const dishes = category.dishes.filter(dish => dish.available !== false);
      if (!dishes.length) return [];
      const fixed = category.id === 'menu-fissi';
      const section = {
        '@type': 'MenuSection', '@id': `${url}#sezione-${category.id}`,
        name: category.title,
        hasMenuItem: dishes.map(dish => {
          const item = { '@type': 'MenuItem', '@id': `${url}#voce-${dish.id}`, identifier: dish.id, name: dish.name || dish.title };
          const description = paragraphs([
            text(dish.description),
            Array.isArray(dish.tags) ? dish.tags.filter(Boolean).join(' · ') : '',
            list(words.courses, dish.courses), list(words.includes, dish.includes),
            fixed && category.description ? `${words.conditions}: ${category.description}` : '',
            list(words.allergens, dish.allergens),
          ]);
          if (description) item.description = description;

          // A non-numeric display label (e.g. "ask staff") must not expose an otherwise hidden numeric price.
          const display = String(dish.price_display ?? '').trim();
          const price = display ? (/^\d+(?:[.,]\d{1,2})?$/.test(display) ? Number(display.replace(',', '.')) : null) : dish.price;
          if (Number.isFinite(price) && price >= 0) {
            const unit = dish.price_unit === 'kg' ? { unitCode: 'KGM', unitText: 'kg' } : fixed ? { unitText: words.person } : null;
            const offer = { '@type': 'Offer', price, priceCurrency: 'EUR', seller: restaurant, url };
            const conditions = paragraphs([
              fixed ? text(category.description) : '',
              dish.price_unit === 'kg' ? words.perKg : fixed ? words.perPerson : '',
            ]);
            if (conditions) offer.description = conditions;
            if (unit) offer.priceSpecification = {
              '@type': 'UnitPriceSpecification', price, priceCurrency: 'EUR',
              referenceQuantity: { '@type': 'QuantitativeValue', value: 1, ...unit },
            };
            item.offers = offer;
          } else if (display) item.description = paragraphs([description, display]);
          return item;
        }),
      };
      const description = paragraphs([text(category.group), text(category.description), text(category.subtitle)]);
      if (description) section.description = description;
      return [section];
    }),
  };
  if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(menu.updated || '') && Number.isFinite(new Date(menu.updated).getTime())) result.dateModified = new Date(menu.updated).toISOString().slice(0, 10);
  return result;
}

export function renderMenuSchema(menu, options) {
  return jsonLd(menuSchema(menu, options)).replace('<script ', '<script id="menu-schema" ');
}

export function updateMenuSchema(html, menu, options) {
  const isMenu = data => data && (Array.isArray(data['@type']) ? data['@type'].includes('Menu') : data['@type'] === 'Menu');
  const rendered = renderMenuSchema(menu, options);
  let inserted = false;
  // Remove the previous Menu while preserving unrelated graph entities and the breadcrumb script.
  html = html.replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, payload) => {
    let data;
    try { data = JSON.parse(payload); } catch { return script; }
    if (isMenu(data)) {
      if (inserted) return '';
      inserted = true;
      return rendered;
    }
    if (Array.isArray(data['@graph']) && data['@graph'].some(isMenu)) {
      const graph = data['@graph'].filter(node => !isMenu(node));
      const remaining = graph.length ? jsonLd({ ...data, '@graph': graph }) : '';
      if (inserted) return remaining;
      inserted = true;
      return remaining + (remaining ? '\n' : '') + rendered;
    }
    return script;
  });
  if (inserted) return html;
  if (!/<\/head>/i.test(html)) throw new Error('Head della pagina menù non trovato.');
  return html.replace(/<\/head>/i, rendered + '\n</head>');
}
