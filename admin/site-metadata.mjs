import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { applyCompanyData } from './site-company.mjs';
import { applyTracking } from './site-tracking.mjs';

const origin = 'https://agriturismogiuggioloni.it';
const imageCache = new Map();
const mapScriptHref = '/assets/place-map.js?v=' + createHash('sha256').update(readFileSync(new URL('../assets/place-map.js', import.meta.url))).digest('hex').slice(0, 12);
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39|#x27);/g, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&#39;': "'", '&#x27;': "'" })[entity]);
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3])]));
}

// Read local image headers during the build; no image package or browser request.
function imageMetadata(value) {
  const url = new URL(value, origin);
  if (url.origin !== origin) return null;
  if (imageCache.has(url.pathname)) return imageCache.get(url.pathname);
  let result = null;
  const file = new URL('..' + url.pathname, import.meta.url);
  const root = new URL('../', import.meta.url);
  if (!file.href.startsWith(root.href)) return null;
  const bytes = readFileSync(file);
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    result = { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), type: 'image/png' };
  } else if (bytes.length >= 30 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    for (let offset = 12; offset + 8 < bytes.length;) {
      const kind = bytes.toString('ascii', offset, offset + 4), size = bytes.readUInt32LE(offset + 4), data = offset + 8;
      if (kind === 'VP8X' && size >= 10) result = { width: 1 + bytes.readUIntLE(data + 4, 3), height: 1 + bytes.readUIntLE(data + 7, 3), type: 'image/webp' };
      if (kind === 'VP8 ' && size >= 10) result = { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff, type: 'image/webp' };
      if (kind === 'VP8L' && size >= 5) { const dims = bytes.readUInt32LE(data + 1); result = { width: 1 + (dims & 0x3fff), height: 1 + ((dims >>> 14) & 0x3fff), type: 'image/webp' }; }
      if (result) break;
      offset = data + size + (size % 2);
    }
  }
  imageCache.set(url.pathname, result);
  return result;
}

export function applySocialMetadata(html) {
  html = applyTracking(applyCompanyData(html));
  html = html.replace(/(<script\b[^>]*\bsrc=")\/assets\/place-map\.js(?:\?[^"]*)?"/g, (_, start) => start + mapScriptHref + '"');
  const match = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!match) return html;
  let head = match[1];
  const values = new Map([...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => { const a = attributes(tag); return [a.property || a.name, a.content]; }));
  // Redirects, admin and print documents have no social preview to complete.
  if (!values.get('og:title') || !values.get('og:image')) return html;
  const language = /<html\b[^>]*\blang="en(?:-[^"]*)?"/i.test(html) ? 'en' : 'it';
  function setMeta(key, value, property = false) {
    if (!value) return;
    const tag = `<meta ${property ? 'property' : 'name'}="${key}" content="${escape(value)}">`;
    let found = false;
    head = head.replace(/<meta\b[^>]*>/gi, existing => {
      const a = attributes(existing);
      if ((a.name || a.property) !== key) return existing;
      if (found) return '';
      found = true;
      return tag;
    });
    if (!found) head += '\n' + tag;
    values.set(key, String(value));
  }
  setMeta('og:type', values.get('og:type') || 'website', true);
  setMeta('og:locale', values.get('og:locale') || (language === 'en' ? 'en_GB' : 'it_IT'), true);
  setMeta('og:site_name', values.get('og:site_name') || 'Agriturismo Giuggioloni', true);
  setMeta('og:image:alt', values.get('og:image:alt') || (language === 'en' ? 'Agriturismo Giuggioloni in Osimo' : 'Agriturismo Giuggioloni a Osimo'), true);
  const image = imageMetadata(values.get('og:image'));
  if (image) for (const key of ['width', 'height', 'type']) setMeta('og:image:' + key, String(image[key]), true);
  setMeta('twitter:card', values.get('twitter:card') || 'summary_large_image');
  for (const key of ['title', 'description', 'image', 'image:alt']) setMeta('twitter:' + key, values.get('og:' + key));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  if (!links.some(a => a.rel === 'apple-touch-icon')) head += '\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">';
  return applyTracking(html.slice(0, match.index) + match[0].replace(match[1], head) + html.slice(match.index + match[0].length));
}
