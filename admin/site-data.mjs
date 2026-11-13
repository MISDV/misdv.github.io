import { readFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';

export const siteData = JSON.parse(await readFile(new URL('../dati.json', import.meta.url), 'utf8'));
const days = { 'Lunedì': 'Monday', 'Martedì': 'Tuesday', 'Mercoledì': 'Wednesday', 'Giovedì': 'Thursday', 'Venerdì': 'Friday', 'Sabato': 'Saturday', 'Domenica': 'Sunday' };
const phoneNumber = value => value.replace(/[^+\d]/g, '');

// Publish only the confirmed services; a whole closed day is explicit in the data.
export function restaurantOpeningHours(data = siteData) {
  const groups = new Map();
  for (const [day, service] of Object.entries(data.orari)) {
    const periods = [service.pranzo, service.cena].filter(Boolean);
    if (!periods.length && service.note === 'Chiuso') periods.push('00:00-00:00');
    for (const period of periods) {
      const match = String(period).match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
      if (!match || !days[day]) throw new Error(`Orario del ristorante non valido: ${day} ${period}`);
      const key = match[1] + '-' + match[2];
      if (!groups.has(key)) groups.set(key, { '@type': 'OpeningHoursSpecification', dayOfWeek: [], opens: match[1], closes: match[2] });
      groups.get(key).dayOfWeek.push('https://schema.org/' + days[day]);
    }
  }
  return [...groups.values()];
}

// The compact contact summary and Lume use the same confirmed timetable as the
// footer and Restaurant JSON-LD, rather than separate hard-coded day names.
export function restaurantHoursSummary(data = siteData) {
  restaurantOpeningHours(data); // Validate the same periods exposed in JSON-LD.
  const week = Object.keys(days);
  const groups = new Map();
  const closedDays = [];
  const unconfirmed = [];
  for (const day of week) {
    const service = data.orari[day];
    if (!service) { unconfirmed.push(day); continue; }
    const periods = [service.pranzo, service.cena].filter(Boolean);
    if (!periods.length) {
      if (service.note === 'Chiuso') closedDays.push(day);
      else unconfirmed.push(day);
      continue;
    }
    const key = periods.join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(day);
  }
  const list = (items, language) => new Intl.ListFormat(language === 'it' ? 'it-IT' : 'en-GB', { type: 'conjunction' }).format(items);
  const dayNames = (keys, language, compact = false) => {
    const labels = keys.map(day => language === 'it' ? day.toLowerCase() : days[day]);
    if (compact && keys.length > 2 && keys.every((day, i) => week.indexOf(day) === week.indexOf(keys[0]) + i)) {
      return language === 'it' ? `Da ${labels[0]} a ${labels.at(-1)}` : `${labels[0]} to ${labels.at(-1)}`;
    }
    const value = list(labels, language);
    return value ? value[0].toUpperCase() + value.slice(1) : '';
  };
  const result = { hours: {}, closed: {} };
  for (const language of ['it', 'en']) {
    const entries = [...groups].map(([periods, keys]) => `${dayNames(keys, language)}: ${list(periods.split('|').map(period => period.replace('-', '–')), language)}`);
    if (unconfirmed.length) entries.push(`${dayNames(unconfirmed, language)}: ${language === 'it' ? 'orari da confermare' : 'times to be confirmed'}`);
    result.hours[language] = entries.join(' · ') || (language === 'it' ? 'Nessun servizio di apertura previsto.' : 'No scheduled opening hours.');
    result.closed[language] = dayNames(closedDays, language, true) || (language === 'it' ? 'Nessuna chiusura settimanale indicata.' : 'No weekly closing day listed.');
  }
  return result;
}

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
