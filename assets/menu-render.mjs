const weekdays = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const euros = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dates = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'Europe/Rome' });

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function money(value) {
  const label = String(value ?? '').trim();
  if (!label) return '';
  if (/^\d+(?:[.,]\d{1,2})?$/.test(label)) return euros.format(Number(label.replace(',', '.')));
  return label;
}

function renderDish(dish, fixed) {
  const price = fixed ? '' : money(String(dish.price_display ?? '').trim() || dish.price);
  const labels = Array.isArray(dish.tags) ? dish.tags.filter(Boolean).join(' · ') : '';
  const allergens = Array.isArray(dish.allergens) ? dish.allergens.filter(Boolean).join(', ') : '';
  return `<li class="menu-dish" data-dish>
    <div class="dish-title"><h3>${escapeHtml(dish.name || dish.title)}</h3>${price ? `<span class="menu-price">${escapeHtml(price)}</span>` : ''}</div>
    ${dish.description ? `<p>${escapeHtml(dish.description)}</p>` : ''}
    ${labels ? `<p><small>${escapeHtml(labels)}</small></p>` : ''}
    ${allergens ? `<details><summary>Allergeni indicati</summary><p>${escapeHtml(allergens)}</p></details>` : ''}
  </li>`;
}

export function renderMenu(menu) {
  const sections = weekdays.flatMap((day, index) => {
    const entry = menu.days?.[day];
    if (!entry?.enabled) return [];
    const label = day[0].toUpperCase() + day.slice(1);
    const title = String(entry.title ?? '').trim() || 'Menù del giorno';
    const dishes = Array.isArray(entry.dishes) ? entry.dishes.filter(dish => dish?.available !== false && (dish?.name || dish?.title)) : [];
    const price = entry.fisso ? money(entry.fixed_price) : '';
    return `<section class="menu-day" data-day="${index}" data-label="${label}">
  <header class="menu-day-header">
    <p class="eyebrow">${label} · ${entry.fisso ? 'Menù fisso' : 'Alla carta'}</p>
    <h2>${escapeHtml(title)}</h2>
    ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ''}
    ${price ? `<p class="menu-price">${escapeHtml(price)}</p>` : ''}
  </header>
  ${dishes.length ? `<ul class="menu-dishes">${dishes.map(dish => renderDish(dish, entry.fisso)).join('\n')}</ul>`
    : '<p class="menu-note">I piatti di questa giornata saranno comunicati dall’agriturismo.</p>'}
</section>`;
  });
  const date = new Date(menu.updated);
  const updated = menu.updated && Number.isFinite(date.getTime()) ? dates.format(date) : '';
  return `${menu.title ? `<p class="eyebrow">${escapeHtml(menu.title)}</p>` : ''}
${menu.description ? `<p class="lede">${escapeHtml(menu.description)}</p>` : ''}
${sections.join('\n') || '<p>Il menù è in aggiornamento. Contattaci per conoscere i piatti disponibili.</p>'}
${updated ? `<p class="menu-updated">Ultimo aggiornamento <time datetime="${date.toISOString().slice(0, 10)}">${updated}</time></p>` : ''}`;
}
