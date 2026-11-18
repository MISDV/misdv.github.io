import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { siteData } from './site-data.mjs';

const posts = [
  {
    slug: 'menu-di-natale', code: 'Df20TXzoC17', title: 'Il menù di Natale 2026 a Osimo',
    text: 'La locandina del 25 dicembre presenta il menù di Natale a 60 €, con cappelletti in brodo e lasagna rossa. Nella pagina dedicata al cenone trovi i contatti per prenotare.',
    path: '/natale/', label: 'Cenone di Natale',
    imageHeight: 1190, imageAlt: 'Locandina con le portate del menù di Natale del 25 dicembre',
  },
  {
    slug: 'piatti-da-asporto', code: 'DfhXcv3oSkE', title: 'Piatti da asporto a Osimo',
    text: 'Il post presenta il servizio di asporto del fine settimana all’Agriturismo Giuggioloni. Chiama per conoscere i piatti disponibili e concordare il ritiro in Via Acquaviva 34.',
    path: '/prenotazione/#ristorante', label: 'Contatti per l’asporto',
    imageHeight: 1201, imageAlt: 'Locandina dell’asporto del sabato e della domenica, con foto di lasagne, pollo, oca, caponata, grigliata mista e parmigiana',
  },
  {
    slug: 'serate-del-venerdi', code: 'DfnbUlylNOo', title: 'Le serate del venerdì in agriturismo',
    text: 'La locandina presenta le serate a tema dal 20 novembre al 18 dicembre 2026. Per sapere quando l’agriturismo è aperto, consulta gli orari attuali.',
    path: '/prenotazione/#ristorante', label: 'Orari del ristorante',
    imageHeight: 1200, imageAlt: 'Calendario delle cinque serate del venerdì dedicate alla cucina di stagione e ai prodotti aziendali',
  },
  {
    slug: 'prima-serata-del-venerdi', code: 'Df0PB08oksm', title: 'Arrosticini, caldarroste e vino novello',
    text: 'Il post annuncia la prima serata di venerdì 20 novembre con arrosticini, caldarroste e vino novello. Per confermare la disponibilità, contatta l’agriturismo.',
    path: '/prenotazione/#ristorante', label: 'Contatti dell’agriturismo',
    imageHeight: 960, imageAlt: 'Locandina della serata del 20 novembre con foto di arrosticini, castagne e vino novello',
  },
];

const styles = await readFile(new URL('../assets/social.css', import.meta.url));
const version = createHash('sha256').update(styles).digest('hex').slice(0, 12);
export const socialHead = `<link rel="stylesheet" href="/assets/social.css?v=${version}">`;

export function renderSocialPosts() {
  const cards = posts.map(({ slug, code, title, text, path, label, imageHeight, imageAlt }) => {
    const permalink = new URL(`p/${code}/`, siteData.socials.instagram.link);
    const image = `/assets/social/${slug}`;
    return `<article class="farm-overview-card social-post" id="${escape(slug)}" aria-labelledby="${escape(slug)}-title">
    <img class="social-post-image" src="${image}-480.webp"
      srcset="${image}-480.webp 480w, ${image}-960.webp 960w"
      sizes="(min-width: 70rem) 33.25rem, (min-width: 40rem) calc((100vw - 3.5rem) / 2), calc(100vw - 2rem)"
      width="960" height="${imageHeight}" alt="${escape(imageAlt)}" loading="lazy" decoding="async">
    <div>
      <h3 id="${escape(slug)}-title">${escape(title)}</h3>
      <p>${escape(text)}</p>
      <div class="social-post-links">
        <a href="${escape(path)}">${escape(label)}</a>
        <a href="${escape(permalink.href)}" aria-label="Apri su Instagram · ${escape(title)}">Apri su Instagram</a>
      </div>
    </div>
  </article>`;
  }).join('\n');
  return `<section aria-labelledby="instagram-posts">
  <h2 id="instagram-posts">Dai nostri post su Instagram</h2>
  <div class="farm-overview-grid">${cards}</div>
</section>`;
}
