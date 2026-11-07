const content = document.querySelector('#menu-content');
const controls = document.querySelector('#menu-controls');
const category = document.querySelector('#menu-category, #menu-day');
const search = document.querySelector('#menu-search');
const empty = document.querySelector('#menu-empty');
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll('’', "'")
  .replace(/\s+/g, ' ').toLowerCase().trim();
const sections = Array.from(content.querySelectorAll('[data-category], [data-day]'), section => ({
  section,
  key: section.dataset.category ?? section.dataset.day,
  label: normalize(section.querySelector('header').textContent),
  dishes: Array.from(section.querySelectorAll('[data-dish]'), dish => [dish, normalize(dish.textContent)]),
}));

function filter() {
  const query = normalize(search.value);
  let visible = 0;
  for (const { section, key, label, dishes } of sections) {
    if (category.value && category.value !== key) {
      section.hidden = true;
      continue;
    }
    const matchesSection = label.includes(query);
    let matchingDishes = 0;
    for (const [dish, name] of dishes) {
      dish.hidden = !matchesSection && !name.includes(query);
      if (!dish.hidden) matchingDishes++;
    }
    section.hidden = !matchesSection && matchingDishes === 0;
    if (!section.hidden) visible++;
  }
  empty.hidden = visible > 0 || (!category.value && !query);
}

function setup() {
  const today = sections.some(({ section }) => section.hasAttribute('data-day'))
    ? new Intl.DateTimeFormat('it-IT', { weekday: 'long', timeZone: 'Europe/Rome' }).format(new Date()) : '';
  const groups = new Map();
  for (const { section, key } of sections) {
    const label = section.dataset.label;
    const name = section.dataset.group;
    if (name && !groups.has(name)) {
      const group = document.createElement('optgroup');
      group.label = name;
      groups.set(name, group);
      category.append(group);
    }
    const option = new Option(label.toLowerCase() === today ? `${label} · oggi` : label, key);
    (groups.get(name) ?? category).append(option);
  }
  controls.hidden = sections.length === 0;
  filter();
}

category.addEventListener('change', filter);
search.addEventListener('input', filter);
setup();
