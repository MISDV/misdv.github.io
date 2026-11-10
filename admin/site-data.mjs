import { readFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';

export const siteData = JSON.parse(await readFile(new URL('../dati.json', import.meta.url), 'utf8'));
const days = { 'Lunedì': 'Monday', 'Martedì': 'Tuesday', 'Mercoledì': 'Wednesday', 'Giovedì': 'Thursday', 'Venerdì': 'Friday', 'Sabato': 'Saturday', 'Domenica': 'Sunday' };
const phoneNumber = value => value.replace(/[^+\d]/g, '');

// Only text-only elements are bindings; nested markup and the approved layout stay intact.
function bindText(html, attribute, valueFor) {
  const pattern = new RegExp(`(<([a-z][\\w-]*)\\b[^>]*\\s${attribute}(?:="([^"]*)")?(?=\\s|>)[^>]*>)([^<]*)(<\\/\\2>)`, 'gi');
  return html.replace(pattern, (all, open, tag, key, body, close) => {
    const value = valueFor(key);
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Dato mancante per ${attribute}: ${key || tag}`);
    if (tag.toLowerCase() === 'a') {
      const href = key?.startsWith('contatto.numeri_telefono.') ? `tel:${phoneNumber(value)}` :
        key === 'contatto.mail' || attribute === 'data-email' ? `mailto:${value}` : null;
      if (href) open = open.replace(/\bhref="[^"]*"/, `href="${escape(href)}"`);
    }
    return open + (body.match(/^\s*/)?.[0] || '') + escape(value) + (body.trim() ? body.match(/\s*$/)?.[0] || '' : '') + close;
  });
}

export function renderSiteData(html, language = /<html\b[^>]*\blang="en(?:-[^"]*)?"/i.test(html) ? 'en' : 'it', data = siteData) {
  const get = key => key.split('.').reduce((object, part) => object?.[part], data);
  if (language === 'it') html = bindText(html, 'data-text', get);
  html = bindText(html, 'data-bind', get);
  for (const [attribute, value] of [['data-via', data.contatto.via], ['data-comune', data.contatto.comune], ['data-email', data.contatto.mail]]) {
    html = bindText(html, attribute, () => value);
  }
  html = html.replace(/<a\b[^>]*\bdata-social="([^"]+)"[^>]*>/g, (tag, name) => {
    const link = data.socials[name]?.link;
    if (!link || !/^https:\/\//i.test(link)) throw new Error(`Social non valido: ${name}`);
    return tag.replace(/\bhref="[^"]*"/, `href="${escape(link)}"`);
  });
  html = html.replace(/(<ul\b[^>]*\bdata-phones(?=\s|>)[^>]*>)[\s\S]*?<\/ul>/g, (_, open) => open + '\n' + data.contatto.numeri_telefono.map(phone =>
    `<li><a href="tel:${escape(phoneNumber(phone))}">${escape(phone)}</a></li>`).join('\n') + '\n</ul>');
  html = html.replace(/(<ul\b[^>]*\bdata-hours(?=\s|>)[^>]*>)[\s\S]*?<\/ul>/g, (_, open) => {
    const hours = Object.entries(data.orari).map(([day, service]) => {
      const times = [service.pranzo, service.cena].filter(Boolean).map(time => String(time).replace('-', '–'));
      const note = language === 'en' ? (service.note === 'Chiuso' ? 'Closed' : service.note === 'Cena' ? 'Dinner, time to be confirmed' : 'Time to be confirmed') :
        (service.note === 'Cena' ? 'Cena, orario da confermare' : service.note || 'Orario da confermare');
      const label = times.length ? times.map(time => `<span class="service-time">${escape(time)}</span>`).join('') : escape(note);
      return `<li><span>${escape(language === 'en' ? days[day] || day : day)}</span><span${service.note === 'Chiuso' ? ' class="closed"' : ''}>${label}</span></li>`;
    }).join('\n');
    return open + '\n' + hours + '\n</ul>';
  });
  if (html.includes('data-cards>')) {
    const template = html.match(/<template id="farm-card-template">([\s\S]*?)<\/template>/)?.[1];
    if (!template || !html.includes('<!-- SITE-CARDS:START -->') || !html.includes('<!-- SITE-CARDS:END -->')) throw new Error('Modello o marcatori delle schede fattoria mancanti.');
    const cards = data.cards.map(card => {
      let markup = bindText(template.trim(), 'data-card-title', () => card.titolo);
      markup = bindText(markup, 'data-card-body', () => card.valore);
      const icon = /^[a-z_]+$/.test(card.icona || '') ? card.icona : 'info';
      return markup.replace(/(<span class="material-icons)([^"]*)"([^>]*>)[^<]*(<\/span>)/g, (_, start, classes, end, close) =>
        start + classes + (!['agriculture', 'restaurant_menu', 'favorite', 'info'].includes(icon) ? ' material-icons-full' : '') + '"' + end + icon + close);
    }).join('\n');
    html = html.replace(/(<!-- SITE-CARDS:START -->)[\s\S]*?(<!-- SITE-CARDS:END -->)/, (_, start, end) => start + '\n' + cards + '\n' + end);
  }
  return html;
}
