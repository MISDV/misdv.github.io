import { readFile } from 'node:fs/promises';
import placeMap from '../assets/place-map.js';
import { renderSiteData } from './site-data.mjs';

// The approved home layout is the source for the site's common header/footer.
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const begin = source.indexOf('<a class="sr-only');
const main = source.indexOf('<main id="contenuto"');
const foot = source.indexOf('<footer ');
if (begin < 0 || main < begin || foot < main) throw new Error('Layout della home non disponibile.');

const translations = new Map([
  ['Un angolo di paradiso nelle Marche dove riscoprire i sapori autentici e la bellezza della vita semplice, immersi nei colori caldi della natura.', 'Discover the flavours of the Marche countryside, seasonal family cooking and the warmth of our welcome in Osimo.'],
  ['La mappa interattiva si collega a Google quando scegli di mostrarla.', 'The interactive map connects to Google when you choose to display it.'],
  ['Come arrivare all’agriturismo', 'Find our restaurant'], ['Indicazioni su Google Maps', 'Directions on Google Maps'],
  ['Mostra la mappa Google', 'Show Google map'], ['Cena, orario da confermare', 'Dinner, time to be confirmed'],
  ['Navigazione principale', 'Main navigation'], ['Menu principale mobile', 'Mobile navigation'],
  ['Apri menu principale', 'Open navigation menu'], ['Chiudi menu', 'Close menu'], ['Vai al contenuto', 'Skip to content'],
  ['I Nostri Prodotti', 'Products (IT)'], ['La Nostra Storia', 'Our story (IT)'], ['La Fattoria', 'Our farm (IT)'],
  ['Lo spaccio aziendale', 'Farm shop (IT)'],
  ['Menù completo', 'Restaurant menu'], ['Prenota Ora!', 'Book a table'], ['Prenota', 'Book a table'],
  ['Preferenze cookie', 'Cookie preferences'], ['Informativa', 'Privacy (IT)'],
  ['Tutti i diritti riservati.', 'All rights reserved.'], ['Esplora', 'Explore'], ['Contatti', 'Contact'], ['Orari', 'Opening times'],
  ['Lunedì', 'Monday'], ['Martedì', 'Tuesday'], ['Mercoledì', 'Wednesday'], ['Giovedì', 'Thursday'],
  ['Venerdì', 'Friday'], ['Sabato', 'Saturday'], ['Domenica', 'Sunday'], ['Chiuso', 'Closed'], ['Prodotti', 'Products (IT)'],
]);

export function siteLayout(path = '/', language = 'it') {
  let header = source.slice(begin, main);
  let footer = source.slice(foot, source.indexOf('</footer>', foot) + 9);
  footer = footer.replace(/(<a data-maps href=")[^"]+/, '$1' + placeMap.placeUrl);
  header = header.replaceAll('hidden lg:flex space-x-8 items-center', 'site-desktop-links space-x-8 items-center')
    .replaceAll('lg:hidden flex items-center', 'site-mobile-toggle items-center')
    .replaceAll('lg:hidden fixed inset-0', 'site-mobile-overlay fixed inset-0')
    .replaceAll('lg:hidden fixed inset-x-0', 'site-mobile-panel fixed inset-x-0')
    .replaceAll(' aria-current="page"', '');
  header = header.replaceAll('href="#fattoria"', 'href="/fattoria/"').replaceAll('href="/#fattoria"', 'href="/fattoria/"')
    .replaceAll('href="#prodotti"', 'href="/spaccio/"').replaceAll('href="/#prodotti"', 'href="/spaccio/"').replaceAll('href="/shop/"', 'href="/spaccio/"');
  footer = footer.replaceAll('href="/shop/"', 'href="/spaccio/"');
  if (path === '/menu/') {
    header = header.replaceAll('href="/menu/">Menù completo', 'href="/menu/" aria-current="page">Menù completo');
    footer = footer.replace('href="/en/" lang="en" hreflang="en"','href="/menu/en/" lang="en" hreflang="en"');
  }
  if (path === '/') header = header.replaceAll('href="/">Home</a>', 'href="/" aria-current="page">Home</a>');
  if (path === '/fattoria/') header = header.replaceAll('href="/fattoria/"', 'href="/fattoria/" aria-current="page"');
  footer = footer.replace(/<div class="flex items-center gap-3 mb-6">([\s\S]*?)(?=\s*<p data-text="home.descrizione")/, block =>
    block.replace('<div class="flex items-center gap-3 mb-6">', '<a href="/" aria-label="Agriturismo Giuggioloni — home" class="site-footer-brand flex items-center gap-3 mb-6">').replace(/<\/div>(\s*)$/, '</a>$1'));
  header = renderSiteData(header);
  footer = renderSiteData(footer);
  for (const section of ['header', 'footer']) {
    let markup = section === 'header' ? header : footer;
    markup = markup.replace(/<span\b[^>]*class="material-icons[^>]*>/g, tag => tag.includes('aria-hidden=') ? tag : tag.slice(0, -1) + ' aria-hidden="true">');
    if (section === 'header') header = markup; else footer = markup;
  }
  if (language === 'en') {
    header = header.replaceAll('href="#contenuto"', 'href="#content"').replaceAll('href="/"', 'href="/en/"')
      .replaceAll('href="/menu/"', 'href="/menu/en/"');
    footer = footer.replaceAll('href="/menu/"','href="/menu/en/"').replace('href="/" aria-label=', 'href="/en/" aria-label=')
      .replace('href="/en/" lang="en" hreflang="en">English', 'href="/" lang="it" hreflang="it">Italiano');
    for (const [from, to] of translations) { header = header.replaceAll(from, to); footer = footer.replaceAll(from, to); }
    header = header.replace(/ data-text="[^"]*"/g, '');
    footer = footer.replace(/ data-text="[^"]*"/g, '');
    if(path==='/en/') header = header.replaceAll('href="/en/">Home</a>', 'href="/en/" aria-current="page">Home</a>');
    if(path==='/menu/en/') {
      header = header.replaceAll('href="/menu/en/">Restaurant menu', 'href="/menu/en/" aria-current="page">Restaurant menu');
      footer = footer.replace('href="/" lang="it" hreflang="it"','href="/menu/" lang="it" hreflang="it"');
    }
  }
  return { header, footer };
}

export function replaceSiteLayout(html, path) {
  const { header, footer } = siteLayout(path);
  const start = html.indexOf('<a class="sr-only');
  const main = html.indexOf('<main id="contenuto"');
  const foot = html.indexOf('<footer ');
  if (start < 0 || main < start || foot < main) throw new Error('Layout non valido: ' + path);
  return html.slice(0, start) + header + html.slice(main, foot) + footer + html.slice(html.indexOf('</footer>', foot) + 9);
}
