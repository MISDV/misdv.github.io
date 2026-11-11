import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { escapeHtml as escape } from '../assets/menu-render.mjs';

const root = new URL('../assets/doublen/', import.meta.url);
const configSource = await readFile(new URL('doublen-config.js', root), 'utf8');
const context = { window: {} };
runInNewContext(configSource, context, { timeout: 100 });
const website = new URL(context.window.DOUBLEN_FOOTER_CONFIG.website);
if (website.protocol !== 'https:') throw new Error('Il sito DoubleN deve avere un URL HTTPS.');
const assets = await Promise.all(['doublen-footer.css', 'doublen-config.js', 'doublen-footer.js'].map(async name => {
  const hash = createHash('sha256').update(await readFile(new URL(name, root))).digest('hex').slice(0, 12);
  const url = `/assets/doublen/${name}?v=${hash}`;
  return name.endsWith('.css') ? `<link rel="stylesheet" href="${url}">` : `<script src="${url}" defer></script>`;
}));
const start = '<!-- DOUBLEN-CREDIT:START -->', end = '<!-- DOUBLEN-CREDIT:END -->';

export function applyFooterCredit(html) {
  if (!/<footer\b/.test(html)) return html;
  const english = /<html\b[^>]*\blang="en(?:-[^"]*)?"/i.test(html);
  const prefix = english ? 'Signed' : 'Firmato';
  const label = english ? 'Signed DoubleN: visit the website (opens in a new tab)' : 'Firmato DoubleN: visita il sito (si apre in una nuova scheda)';
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, footer => {
    const theme = /\blm-footer\b/.test(footer) ? 'lume' : /\bid="footer"/.test(footer) ? 'auto' : 'dark';
    const signature = `${start}
<div class="dn-footer-credit" data-dn-theme="${theme}"><a class="dn-signature${theme === 'dark' ? ' dn-signature--dark' : ''}" href="${escape(website.href)}" target="_blank" rel="noopener noreferrer" data-dn-contact-open aria-label="${label}">
  <span class="dn-signature__prefix">${prefix}</span><span class="dn-signature__lockup">
    <svg class="dn-signature__mark" viewBox="0 0 160 96" width="30" height="18" aria-hidden="true" focusable="false"><path d="M0 96V0H28L83 65V44L100 64V96H71L28 44V96Z" fill="var(--dn-signature-ink)"/><path d="M60 0H89L130 49V0H160V96H133L78 30V52L60 30Z" fill="#f97316"/></svg>
    <span class="dn-signature__name">DoubleN</span>
  </span></a></div>
${end}`;
    if (footer.includes(start)) return footer.replace(/<!-- DOUBLEN-CREDIT:START -->[\s\S]*?<!-- DOUBLEN-CREDIT:END -->/, signature);
    return footer.replace('</footer>', signature + '\n</footer>');
  });
  html = html.replace(/<(?:link|script)\b[^>]*(?:href|src)="\/assets\/doublen\/doublen-(?:footer\.css|config\.js|footer\.js)(?:\?[^"]*)?"[^>]*>(?:<\/script>)?\s*/g, '');
  return html.replace('</head>', assets.join('\n') + '\n</head>');
}
