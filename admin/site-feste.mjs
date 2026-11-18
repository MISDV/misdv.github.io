import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { siteData } from './site-data.mjs';

const css = await readFile(new URL('../assets/feste.css', import.meta.url));
const version = createHash('sha256').update(css).digest('hex').slice(0, 12);
const stylesheet = `<link rel="stylesheet" href="/assets/feste.css?v=${version}">`;

export const festivities = [
  {
    path: '/natale/',
    label: 'Cenone di Natale',
    title: 'Cenone di Natale in agriturismo a Osimo',
    description: 'Cenone di Natale all’Agriturismo Giuggioloni, in Via Acquaviva a Osimo. Contattaci per conoscere il menù della serata e prenotare.',
    service: 'Cena in agriturismo',
    intro: 'Festeggia il Natale a tavola all’Agriturismo Giuggioloni, nelle campagne di Osimo.',
    details: 'Per conoscere il menù del cenone, il prezzo e l’orario, chiamaci. Ti diremo se c’è posto e potrai prenotare per la tua famiglia o il tuo gruppo.',
  },
  {
    path: '/santo-stefano/',
    label: 'Santo Stefano',
    title: 'Santo Stefano in agriturismo a Osimo',
    description: 'Il 26 dicembre all’Agriturismo Giuggioloni a Osimo. Chiama per informazioni sul menù di Santo Stefano e per prenotare un tavolo.',
    service: '26 dicembre in agriturismo',
    intro: 'Il 26 dicembre puoi festeggiare Santo Stefano con la tua famiglia all’Agriturismo Giuggioloni, a Osimo.',
    details: 'Chiamaci per sapere cosa prevede il menù di Santo Stefano, conoscere orari e prezzi e verificare la disponibilità di un tavolo.',
  },
  {
    path: '/capodanno/',
    label: 'Capodanno da asporto',
    title: 'Capodanno da asporto a Osimo',
    description: 'Per Capodanno l’Agriturismo Giuggioloni a Osimo offre solo asporto. Chiama per conoscere i piatti disponibili, ordinare e concordare il ritiro.',
    service: 'Solo asporto',
    intro: 'Per Capodanno prepariamo piatti da ritirare all’Agriturismo Giuggioloni e portare a casa per la tua tavola delle feste.',
    details: 'Chiama per conoscere i piatti disponibili e i prezzi, concordare le quantità e fissare l’orario di ritiro.',
    takeaway: true,
  },
];

function renderLinks(entries, cards = false) {
  return `<ul class="feste-links${cards ? ' feste-links--cards' : ''}">${entries.map(event => `<li><a href="${event.path}"><span><strong>${escape(event.label)}</strong>${cards ? `<small>${escape(event.service)}</small>` : ''}</span><span aria-hidden="true">→</span></a></li>`).join('\n')}</ul>`;
}

export function renderFestivity(event) {
  const { via, comune, numeri_telefono: [phone] } = siteData.contatto;
  const tel = phone.replace(/[^+\d]/g, '');
  return `<article class="feste-page">
  <header class="feste-intro">
    <p class="feste-service">${escape(event.service)}</p>
    <h1>${escape(event.title)}</h1>
    <p>${escape(event.intro)}</p>
  </header>
  <section class="feste-info" aria-labelledby="feste-contact">
    <div>
      <h2 id="feste-contact">${event.takeaway ? 'Come ordinare e ritirare' : 'Menù e prenotazioni'}</h2>
      <p>${escape(event.details)}</p>
      <a class="feste-phone" href="tel:${escape(tel)}"><span>${event.takeaway ? 'Chiama per l’asporto' : 'Chiama per prenotare'}</span><strong>${escape(phone)}</strong></a>
    </div>
    <div class="feste-address">
      <h3>${event.takeaway ? 'Dove ritirare' : 'Dove siamo'}</h3>
      <address>Agriturismo Giuggioloni<br>${escape(via)}<br>${escape(comune)}</address>
      <div class="place-actions"><a href="/come-arrivare/">Come arrivare</a></div>
    </div>
  </section>
  <nav class="feste-related" aria-labelledby="feste-related-title">
    <h2 id="feste-related-title">Le altre proposte per le feste</h2>
    ${renderLinks(festivities.filter(related => related.path !== event.path))}
  </nav>
</article>`;
}

export function applyFestivities(html) {
  html = html.replace(/(<!-- FESTE:(HOME|MENU):START -->)[\s\S]*?(<!-- FESTE:\2:END -->)/g, (_, start, location, end) => {
    const home = location === 'HOME';
    return `${start}
<section class="feste-list feste-list--${location.toLowerCase()}" aria-labelledby="feste-list-title">
  <h2 id="feste-list-title">Le feste all’agriturismo</h2>
  ${renderLinks(festivities, home)}
</section>
${end}`;
  });
  html = html.replace(/(?:\r?\n)?<link rel="stylesheet" href="\/assets\/feste\.css(?:\?[^"]*)?">/g, '');
  if (!html.includes('class="feste-page"') && !html.includes('class="feste-list ')) return html;
  return html.replace(/<link rel="stylesheet" href="\/assets\/(?:site\.min|site-legacy\.min)\.css(?:\?[^"]*)?">/, link => `${link}\n${stylesheet}`);
}
