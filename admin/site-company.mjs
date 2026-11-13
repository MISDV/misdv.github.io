import { siteData } from './site-data.mjs';
import { escapeHtml as escape } from '../assets/menu-render.mjs';
import { origin, jsonLd } from './site-seo.mjs';

export function companyIdentity(data = siteData) {
  const company = data.societa;
  if (!company?.ragione_sociale?.trim() || !/^\d{11}$/.test(company.partita_iva || '')) {
    throw new Error('Ragione sociale e partita IVA della società sono necessarie.');
  }
  return { legalName: company.ragione_sociale, vatID: 'IT' + company.partita_iva };
}

const start = '<!-- COMPANY:START -->';
const end = '<!-- COMPANY:END -->';
const style = '<style id="company-style">.site-company{display:block;max-width:72rem;margin:1rem auto 0;padding:.5rem 1rem;font:400 .75rem/1.65 system-ui,sans-serif;text-align:center;overflow-wrap:anywhere;color:inherit}.site-company>span{display:block}.site-company-vat{font-weight:600}.site-company-contact{display:inline-flex;align-items:center;min-height:44px;margin-bottom:.3rem;color:inherit;font-weight:600;text-decoration:underline;text-underline-offset:.2em}.site-company-contact:focus-visible{outline:2px solid currentColor;outline-offset:3px}#lume-menu .site-company{color:var(--lm-ink)}@media print{.site-company{font-size:8pt;color:#193d32}.site-company-contact{display:none}}</style>';

// Shared by the final metadata pass, including the independent Shop/Lume builds.
// No browser request is needed for these company details.
export function applyCompanyData(html, data = siteData) {
  const identity = companyIdentity(data);
  html = html.replace(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, source) => {
    const value = JSON.parse(source);
    let changed = false;
    const visit = node => {
      if (!node || typeof node !== 'object') return;
      const types = [node['@type']].flat();
      const id = node['@id'] || node.url;
      const ours = typeof id === 'string' && new URL(id, origin).origin === origin;
      if (ours && types.some(type => ['Restaurant', 'Store', 'Organization'].includes(type))) {
        for (const [key, next] of Object.entries(identity)) {
          if (node[key] !== next) { node[key] = next; changed = true; }
        }
      }
      for (const child of Object.values(node)) {
        if (Array.isArray(child)) child.forEach(visit);
        else if (child && typeof child === 'object') visit(child);
      }
    };
    visit(value);
    return changed ? jsonLd(value) : script;
  });
  if (!/<footer\b/i.test(html)) return html;
  const english = /<html\b[^>]*\blang="en(?:-[^"]*)?"/i.test(html);
  const block = `${start}\n<p class="site-company"><a class="site-company-contact" href="/prenotazione/">${english ? 'Reservations and contacts (Italian)' : 'Prenotazioni e contatti'}</a><span class="site-company-name" lang="it">${escape(identity.legalName)}</span><span class="site-company-vat">${english ? 'VAT no.' : 'P. IVA'} ${escape(data.societa.partita_iva)}</span></p>\n${end}`;
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, footer => {
    footer = footer.replace(/<!-- COMPANY:START -->[\s\S]*?<!-- COMPANY:END -->\s*/g, '');
    return footer.includes('<!-- DOUBLEN-CREDIT:START -->')
      ? footer.replace('<!-- DOUBLEN-CREDIT:START -->', block + '\n<!-- DOUBLEN-CREDIT:START -->')
      : footer.replace(/<\/footer>/i, block + '\n</footer>');
  });
  html = html.replace(/<style\b[^>]*\bid=["']company-style["'][^>]*>[\s\S]*?<\/style>\s*/gi, '');
  return html.replace(/<\/head>/i, style + '\n</head>');
}
