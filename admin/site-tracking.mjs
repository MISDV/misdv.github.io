import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const asset = name => '/assets/' + name + '?v=' + createHash('sha256').update(readFileSync(new URL('../assets/' + name, import.meta.url))).digest('hex').slice(0, 12);
const tags = `<link rel="stylesheet" href="${asset('consent.css')}">\n<script src="${asset('meta-pixel.js')}" defer></script>\n<script src="${asset('consent.js')}" defer></script>`;
const start = '<!-- SITE-TRACKING:START -->', end = '<!-- SITE-TRACKING:END -->';

export function applyTracking(html) {
  if (!/<head\b/i.test(html)) return html;
  html = html.replace(/<!-- SITE-TRACKING:START -->[\s\S]*?<!-- SITE-TRACKING:END -->\s*/g, '')
    .replace(/<script\b[^>]*\bsrc="\/assets\/(?:consent|meta-pixel)\.js(?:\?[^"]*)?"[^>]*>\s*<\/script>\s*/gi, '')
    .replace(/<link\b[^>]*\bhref="\/assets\/consent\.css(?:\?[^"]*)?"[^>]*>\s*/gi, '');
  if (!html.includes('data-cookie-settings')) {
    const english = /<html\b[^>]*\blang="en(?:-[^"]*)?"/i.test(html);
    html = html.replace('</footer>', `<p class="cookie-footer-settings" data-nosnippet><a href="/privacy/#preferenze-cookie" data-cookie-settings>${english ? 'Cookie preferences' : 'Preferenze cookie'}</a></p>\n</footer>`);
  }
  return html.replace(/<\/head>/i, `${start}\n${tags}\n${end}\n</head>`);
}
