const weekdays = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const euros = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const dates = new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeZone: 'Europe/Rome' });

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function money(value) {
  if (Number.isFinite(value)) return euros.format(value).replace('\u00a0', ' ');
  const label = String(value ?? '').trim();
  if (!label) return '';
  if (/^\d+(?:[.,]\d{1,2})?$/.test(label)) return money(Number(label.replace(',', '.')));
  return label;
}

function renderList(title, items) {
  return Array.isArray(items) && items.length ? `<div><h4>${title}</h4><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : '';
}

function renderDish(dish, { fixed = false, preview = false } = {}) {
  const basePrice = money(String(dish.price_display ?? '').trim() || dish.price);
  const price = fixed ? '' : basePrice + (basePrice && dish.price_unit === 'kg' ? '/kg' : '');
  const labels = Array.isArray(dish.tags) ? dish.tags.filter(Boolean).join(' · ') : '';
  const allergens = Array.isArray(dish.allergens) ? dish.allergens.filter(Boolean).join(', ') : '';
  const details = preview ? '' : renderList('Il percorso', dish.courses) + renderList('Inclusi nel prezzo', dish.includes);
  return `<li class="menu-dish" data-dish>
    <div class="dish-title"><h3>${escapeHtml(dish.name || dish.title)}</h3>${price ? `<span class="menu-price">${escapeHtml(price)}</span>` : ''}</div>
    ${dish.description ? `<p>${escapeHtml(dish.description)}</p>` : ''}
    ${labels ? `<p><small>${escapeHtml(labels)}</small></p>` : ''}
    ${allergens ? `<details><summary>Allergeni indicati</summary><p>${escapeHtml(allergens)}</p></details>` : ''}
    ${details ? `<div class="menu-fixed-details">${details}</div>` : ''}
  </li>`;
}

function renderUpdated(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? `<p class="menu-updated">Ultimo aggiornamento <time datetime="${date.toISOString().slice(0, 10)}">${dates.format(date)}</time></p>` : '';
}

function renderCatalog(menu, preview) {
  const categories = menu.categories.flatMap(category => {
    const dishes = category.dishes.filter(dish => dish.available !== false);
    return dishes.length ? [{ ...category, dishes }] : [];
  });
  const sections = (preview ? categories.slice(0, 2) : categories).map(category => {
    const title = escapeHtml(category.title);
    const dishes = preview ? category.dishes.slice(0, 3) : category.dishes;
    return `<section class="menu-day" data-category="${escapeHtml(category.id)}" data-label="${title}"${category.group ? ` data-group="${escapeHtml(category.group)}"` : ''}>
  <header class="menu-day-header">
    ${category.group ? `<p class="eyebrow">${escapeHtml(category.group)}</p>` : ''}
    <h2>${title}</h2>
    ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}
    ${category.subtitle ? `<p>${escapeHtml(category.subtitle)}</p>` : ''}
  </header>
  <ul class="menu-dishes">${dishes.map(dish => renderDish(dish, { preview })).join('\n')}</ul>
</section>`;
  });
  const intro = preview ? '' : `<header class="menu-intro">
  ${menu.season ? `<p class="eyebrow">Stagione ${escapeHtml(menu.season)}</p>` : ''}
  ${menu.title ? `<h2>${escapeHtml(menu.title)}</h2>` : ''}
  ${menu.description ? `<p class="lede">${escapeHtml(menu.description)}</p>` : ''}
</header>`;
  const notes = [
    Number.isFinite(menu.cover_charge) ? `<p><strong>Coperto: ${money(menu.cover_charge)}</strong></p>` : '',
    menu.a_la_carte_note ? `<p>${escapeHtml(menu.a_la_carte_note)}</p>` : '',
    menu.allergen_note ? `<p>${escapeHtml(menu.allergen_note)}</p>` : '',
  ].filter(Boolean);
  return [intro, !preview && notes.length ? `<aside class="menu-notice" aria-label="Coperto e allergeni">${notes.join('\n')}</aside>` : '',
    sections.join('\n') || '<p>Il menù è in aggiornamento. Contattaci per conoscere i piatti disponibili.</p>',
    preview ? '' : renderUpdated(menu.updated)].filter(Boolean).join('\n');
}

export function renderMenu(menu, { preview = false } = {}) {
  if (Array.isArray(menu.categories)) return renderCatalog(menu, preview);
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
  ${dishes.length ? `<ul class="menu-dishes">${dishes.map(dish => renderDish(dish, { fixed: entry.fisso })).join('\n')}</ul>`
    : '<p class="menu-note">I piatti di questa giornata saranno comunicati dall’agriturismo.</p>'}
</section>`;
  });
  return `${menu.title ? `<p class="eyebrow">${escapeHtml(menu.title)}</p>` : ''}
${menu.description ? `<p class="lede">${escapeHtml(menu.description)}</p>` : ''}
${sections.join('\n') || '<p>Il menù è in aggiornamento. Contattaci per conoscere i piatti disponibili.</p>'}
${renderUpdated(menu.updated)}`;
}
