import { escapeHtml } from '../assets/menu-render.mjs';

export const origin = 'https://agriturismogiuggioloni.it';

export function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')}</script>`;
}

export function breadcrumbs(steps, lang = 'it') {
  const items = steps.map(([label, url], index) => index < steps.length - 1
    ? `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`
    : `<li aria-current="page">${escapeHtml(label)}</li>`);
  return `<nav class="breadcrumbs" aria-label="${lang === 'it' ? 'Percorso di navigazione' : 'Breadcrumb'}"><ol>${items.join('')}</ol></nav>`;
}

export function breadcrumbSchema(steps) {
  return jsonLd({ '@type': 'BreadcrumbList', itemListElement: steps.map(([name, url], index) => ({
    '@type': 'ListItem', position: index + 1, name, item: new URL(url, origin).href,
  })) });
}
