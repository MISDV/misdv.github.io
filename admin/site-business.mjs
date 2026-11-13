import placeMap from '../assets/place-map.js';
import { siteData } from './site-data.mjs';
import { origin, jsonLd } from './site-seo.mjs';

export const restaurantId = origin + '/#ristorante';

export function restaurantLocation(data = siteData) {
  const contact = data.contatto;
  return {
    telephone: contact.numeri_telefono[0].replace(/[^+\d]/g, ''),
    email: contact.mail,
    address: {
      '@type': 'PostalAddress', streetAddress: contact.via,
      addressLocality: 'Osimo', addressRegion: 'AN', postalCode: '60027', addressCountry: 'IT',
    },
    geo: { '@type': 'GeoCoordinates', ...placeMap.coordinates },
    hasMap: placeMap.placeUrl,
    hasMenu: { '@id': origin + '/menu/#menu' },
  };
}

const decodeText = value => String(value || '')
  .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function metaValue(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (tag.match(/\bname\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase() === name) {
      return decodeText(tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2]);
    }
  }
  return '';
}

// Used by the shared build pass: the story is hand-maintained HTML, while its
// AboutPage is always derived from that page's current title and description.
export function applyBusinessSchemas(html) {
  const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find(tag => /\brel\s*=\s*["']canonical["']/i.test(tag));
  const canonical = canonicalTag?.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
  const isStory = canonical === origin + '/storia.html';
  let breadcrumbId = canonical + '#breadcrumb';
  html = html.replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, text) => {
    let value;
    try { value = JSON.parse(text); }
    catch { throw new Error(`JSON-LD non valido in ${canonical || 'pagina senza canonical'}.`); }
    let changed = false;
    const update = node => {
      if (node['@type'] === 'Restaurant' && node['@id'] === restaurantId) {
        changed = true;
        return { ...node, ...restaurantLocation() };
      }
      if (isStory && node['@type'] === 'BreadcrumbList') {
        breadcrumbId = node['@id'] || breadcrumbId;
        if (!node['@id']) { changed = true; return { ...node, '@id': breadcrumbId }; }
      }
      return node;
    };
    value = value['@graph'] ? { ...value, '@graph': value['@graph'].map(update) } : update(value);
    return changed ? jsonLd(value) : script;
  });
  if (!isStory) return html;
  const title = decodeText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]).trim();
  const description = metaValue(html, 'description');
  if (!title || !description) throw new Error('Titolo e descrizione della storia sono necessari per AboutPage.');
  const schema = jsonLd({
    '@type': 'AboutPage', '@id': canonical + '#pagina', url: canonical,
    name: title, description, inLanguage: 'it',
    isPartOf: { '@id': origin + '/#sito' },
    about: { '@id': restaurantId }, mainEntity: { '@id': restaurantId },
    breadcrumb: { '@id': breadcrumbId },
  });
  const block = '<!-- ABOUT-SCHEMA:START -->\n' + schema + '\n<!-- ABOUT-SCHEMA:END -->';
  if (html.includes('<!-- ABOUT-SCHEMA:START -->')) {
    const existing = /<!-- ABOUT-SCHEMA:START -->[\s\S]*?<!-- ABOUT-SCHEMA:END -->/;
    if (!existing.test(html)) throw new Error('Marcatori AboutPage della storia non validi.');
    return html.replace(existing, block);
  }
  return html.replace('</head>', block + '\n</head>');
}
