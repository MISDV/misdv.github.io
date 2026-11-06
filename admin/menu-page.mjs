import { renderMenu } from '../assets/menu-render.mjs';

export function updateMenuPage(html, menu) {
  const start = '<!-- MENU-CONTENT:START -->';
  const end = '<!-- MENU-CONTENT:END -->';
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from < 0 || to < from) throw new Error('Modello della pagina menù non disponibile.');
  return html.slice(0, from + start.length) + '\n' + renderMenu(menu) + '\n' + html.slice(to);
}
