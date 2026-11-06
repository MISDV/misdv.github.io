import { renderMenu } from './menu-render.mjs';

const content = document.querySelector('#menu-content');
const controls = document.querySelector('#menu-controls');
const day = document.querySelector('#menu-day');
const search = document.querySelector('#menu-search');
const empty = document.querySelector('#menu-empty');
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

function filter() {
  const query = normalize(search.value);
  let visible = 0;
  for (const section of content.querySelectorAll('[data-day]')) {
    const selected = !day.value || day.value === section.dataset.day;
    const matchesDay = normalize(section.querySelector('header').textContent).includes(query);
    let matchingDishes = 0;
    for (const dish of section.querySelectorAll('[data-dish]')) {
      dish.hidden = Boolean(query) && !matchesDay && !normalize(dish.textContent).includes(query);
      if (!dish.hidden) matchingDishes++;
    }
    section.hidden = !selected || (Boolean(query) && !matchesDay && matchingDishes === 0);
    if (!section.hidden) visible++;
  }
  empty.hidden = visible > 0 || (!day.value && !query);
}

function setup() {
  const selected = day.value;
  day.replaceChildren(new Option('Tutti i giorni', ''));
  const today = new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'Europe/Rome' }).format(new Date());
  for (const section of content.querySelectorAll('[data-day]')) {
    const label = section.dataset.label;
    day.add(new Option(label.toLowerCase() === today ? `${label} · oggi` : label, section.dataset.day));
  }
  if (Array.from(day.options).some(option => option.value === selected)) day.value = selected;
  controls.hidden = day.options.length <= 1;
  filter();
}

day.addEventListener('change', filter);
search.addEventListener('input', filter);
document.querySelector('#menu-print').addEventListener('click', () => window.print());
setup();

try {
  const response = await fetch('/menu.json', { cache: 'no-cache' });
  if (response.ok) {
    const menu = await response.json();
    if (menu.days && typeof menu.days === 'object' && !Array.isArray(menu.days)) {
      content.innerHTML = renderMenu(menu);
      setup();
    }
  }
} catch {
  // La carta inclusa nella pagina resta consultabile.
}
