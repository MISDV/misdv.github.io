import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { siteData } from './site-data.mjs';

const posts = [
  {
    slug: 'menu-di-natale', code: 'Df20TXzoC17', title: 'Il menù di Natale 2026 a Osimo',
    text: 'Nel post di Natale l’Agriturismo Giuggioloni presenta il menù delle feste. Nella pagina dedicata al cenone trovi i contatti per prenotare.',
    path: '/natale/', label: 'Cenone di Natale',
  },
  {
    slug: 'piatti-da-asporto', code: 'DfhXcv3oSkE', title: 'Piatti da asporto a Osimo',
    text: 'Il post presenta il servizio di asporto del fine settimana all’Agriturismo Giuggioloni. Chiama per conoscere i piatti disponibili e concordare il ritiro in Via Acquaviva 34.',
    path: '/prenotazione/#ristorante', label: 'Contatti per l’asporto',
  },
  {
    slug: 'serate-del-venerdi', code: 'DfnbUlylNOo', title: 'Le serate del venerdì in agriturismo',
    text: 'L’annuncio è dedicato alle serate a tema con la cucina della tradizione. Per sapere quando l’agriturismo è aperto, consulta gli orari attuali.',
    path: '/prenotazione/#ristorante', label: 'Orari del ristorante',
  },
  {
    slug: 'prima-serata-del-venerdi', code: 'Df0PB08oksm', title: 'Arrosticini, caldarroste e vino novello',
    text: 'Il post annuncia la prima serata di venerdì 20 novembre con arrosticini, caldarroste e vino novello. Per confermare la disponibilità, contatta l’agriturismo.',
    path: '/prenotazione/#ristorante', label: 'Contatti dell’agriturismo',
  },
];

const asset = async name => {
  const file = await readFile(new URL('../assets/' + name, import.meta.url));
  return '/assets/' + name + '?v=' + createHash('sha256').update(file).digest('hex').slice(0, 12);
};
const [css, js] = await Promise.all([asset('social.css'), asset('social.js')]);
export const socialHead = `<link rel="stylesheet" href="${css}">\n<script src="${js}" defer></script>`;

export function renderSocialPosts() {
  const cards = posts.map(({slug, code, title, text, path, label}) => {
    const permalink = new URL(`p/${code}/`, siteData.socials.instagram.link);
    return `<article class="farm-overview-card social-post" id="${escape(slug)}" aria-labelledby="${escape(slug)}-title">
    <div>
      <h3 id="${escape(slug)}-title">${escape(title)}</h3>
      <p>${escape(text)}</p>
      <a class="social-related" href="${escape(path)}">${escape(label)}</a>
      <div class="place-actions">
        <button type="button" data-instagram-post="${escape(code)}" aria-haspopup="dialog" aria-describedby="instagram-notice" hidden>Mostra anteprima</button>
        <a data-post-permalink href="${escape(permalink.href)}" aria-label="Apri su Instagram · ${escape(title)}">Apri su Instagram</a>
      </div>
    </div>
  </article>`;
  }).join('\n');
  return `<section aria-labelledby="instagram-posts">
  <h2 id="instagram-posts">Dai nostri post su Instagram</h2>
  <p id="instagram-notice" hidden>Quando apri un’anteprima, il browser si collega a Instagram, che può usare i propri cookie.</p>
  <div class="farm-overview-grid">${cards}</div>
</section>
<dialog class="social-preview" id="instagram-preview" aria-labelledby="instagram-preview-title">
  <div class="social-preview-bar">
    <h2 id="instagram-preview-title">Anteprima Instagram</h2>
    <form method="dialog" class="place-actions"><button autofocus>Chiudi</button></form>
  </div>
  <div id="instagram-preview-content"></div>
  <div class="place-actions social-preview-link"><a id="instagram-preview-link">Apri il post su Instagram</a></div>
</dialog>`;
}
