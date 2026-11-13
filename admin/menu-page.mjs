import { renderMenu } from '../assets/menu-render.mjs';
import { updateMenuSchema } from './menu-schema.mjs';

const object = value => value && typeof value === 'object' && !Array.isArray(value);
const nonEmptyText = value => typeof value === 'string' && value.trim().length > 0;
const validPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function validMenu(menu) {
  if (!object(menu)) return false;
  if (!('categories' in menu)) return object(menu.days);
  if (!Array.isArray(menu.categories) || (menu.cover_charge != null && !validPrice(menu.cover_charge))) return false;
  const ids = new Set();
  function uniqueId(id) {
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) return false;
    ids.add(id);
    return true;
  }
  return menu.categories.every(category => object(category) && uniqueId(category.id) && nonEmptyText(category.title)
    && Array.isArray(category.dishes) && category.dishes.every(dish => object(dish) && uniqueId(dish.id)
      && nonEmptyText(dish.name) && validPrice(dish.price) && (dish.price_unit == null || ['', 'kg'].includes(dish.price_unit))
      && ['courses', 'includes'].every(key => dish[key] == null || (Array.isArray(dish[key]) && dish[key].every(nonEmptyText)))));
}

export function updateMenuPage(html, menu, options) {
  const start = '<!-- MENU-CONTENT:START -->';
  const end = '<!-- MENU-CONTENT:END -->';
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from < 0 || to < from || html.indexOf(start, from + start.length) !== -1 || html.indexOf(end, to + end.length) !== -1) {
    throw new Error('Modello della pagina menù non valido: serve una sola coppia di marcatori MENU-CONTENT.');
  }
  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  const content = renderMenu(menu, options).replace(/\n[ \t]*(?=\n)/g, '').replaceAll('\n', newline);
  const updated = html.slice(0, from + start.length) + newline + content + newline + html.slice(to);
  return !options?.preview && Array.isArray(menu.categories) ? updateMenuSchema(updated, menu, { language: options?.language || 'it' }) : updated;
}
