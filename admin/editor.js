const weekdays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const editor = document.querySelector('#editor');
const status = document.querySelector('#status');
const save = document.querySelector('#save');
const reload = document.querySelector('#reload');
const tabs = Array.from(document.querySelectorAll('[data-path]'));
const cache = new Map();
let path = 'dati.json';
let busy = false;

async function requestData(file, body) {
  const options = body ? {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } : {};
  const response = await fetch('/admin/api?path=' + encodeURIComponent(file), options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Operazione non riuscita.');
  return result;
}

function element(tag, text) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  return node;
}

function group(title) {
  const box = element('fieldset');
  box.append(element('legend', title));
  return box;
}

function action(text, run) {
  const button = element('button', text);
  button.type = 'button';
  button.addEventListener('click', run);
  return button;
}

function field(box, title, data, key, type = 'text') {
  const label = element('label', title);
  const multiline = type === 'textarea' || type === 'lines';
  const input = element(multiline ? 'textarea' : 'input');
  if (!multiline) input.type = type === 'list' ? 'text' : type;
  if (type === 'number') input.step = '0.01';
  if (type === 'checkbox') input.checked = key === 'available' ? data[key] !== false : Boolean(data[key]);
  else if (type === 'list') input.value = (data[key] || []).join(', ');
  else if (type === 'lines') input.value = (data[key] || []).join('\n');
  else input.value = data[key] ?? '';
  input.addEventListener('input', () => {
    if (type === 'checkbox') data[key] = input.checked;
    else if (type === 'number') data[key] = input.value === '' ? null : input.valueAsNumber;
    else if (type === 'list') data[key] = input.value.split(',').map(value => value.trim()).filter(Boolean);
    else if (type === 'lines') data[key] = input.value.split('\n').map(value => value.trim()).filter(Boolean);
    else data[key] = input.value;
    markDirty();
  });
  label.append(input);
  box.append(label);
}

function markDirty() {
  cache.get(path).dirty = true;
  updateButtons();
}

function collection(box, items, title, create, draw) {
  const list = element('div');
  box.append(list, action('Aggiungi ' + title, () => {
    items.push(create());
    renderList();
    markDirty();
  }));
  function renderList() {
    list.replaceChildren();
    items.forEach((item, index) => {
      const card = group(`${title} ${index + 1}`);
      draw(card, item, index);
      card.append(action('Rimuovi', () => {
        if (!confirm('Rimuovere questa voce?')) return;
        items.splice(index, 1);
        renderList();
        markDirty();
      }));
      list.append(card);
    });
  }
  renderList();
}

function renderData(data) {
  const socials = group('Social');
  const contact = group('Contatti');
  const hours = group('Orari');
  const cards = group('Schede della home');
  data.socials ??= {};
  data.contatto ??= {};
  data.orari ??= {};
  for (const [key, name] of [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']]) {
    field(socials, name, data.socials[key] ??= {}, 'link', 'url');
  }
  for (const [key, label] of [['via', 'Indirizzo'], ['comune', 'Comune'], ['mail', 'Email']]) {
    field(contact, label, data.contatto, key);
  }
  field(contact, 'Telefoni (separati da virgola)', data.contatto, 'numeri_telefono', 'list');
  const days = element('div');
  days.className = 'grid';
  for (const day of weekdays) {
    const box = group(day);
    const entry = data.orari[day] ??= {};
    field(box, 'Pranzo', entry, 'pranzo');
    field(box, 'Cena', entry, 'cena');
    field(box, 'Nota', entry, 'note');
    days.append(box);
  }
  hours.append(days);
  collection(cards, data.cards ??= [], 'scheda', () => ({}), (box, card) => {
    field(box, 'Titolo', card, 'titolo');
    field(box, 'Testo', card, 'valore', 'textarea');
    field(box, 'Icona', card, 'icona');
  });
  editor.append(socials, contact, hours, cards);
}

function renderMenu(data) {
  const heading = group('Informazioni generali');
  field(heading, 'Titolo', data, 'title');
  field(heading, 'Introduzione', data, 'description', 'textarea');
  editor.append(heading);
  if (Array.isArray(data.categories)) {
    field(heading, 'Stagione', data, 'season');
    field(heading, 'Coperto', data, 'cover_charge', 'number');
    field(heading, 'Nota per la carta', data, 'a_la_carte_note');
    field(heading, 'Avviso sugli allergeni', data, 'allergen_note', 'textarea');
    const categories = group('Categorie del menù');
    collection(categories, data.categories, 'categoria', () => ({ id: crypto.randomUUID(), dishes: [] }), (card, category) => {
      const panel = element('details');
      panel.append(element('summary', category.title || 'Nuova categoria'));
      field(panel, 'Titolo', category, 'title');
      field(panel, 'Gruppo (facoltativo, es. Bevande)', category, 'group');
      field(panel, 'Descrizione', category, 'description', 'textarea');
      field(panel, 'Sottotitolo', category, 'subtitle');
      collection(panel, category.dishes, 'voce', () => ({ id: crypto.randomUUID(), available: true }), (box, dish) => {
        field(box, 'Nome', dish, 'name');
        field(box, 'Prezzo', dish, 'price', 'number');
        field(box, 'Unità di prezzo (kg oppure vuoto)', dish, 'price_unit');
        field(box, 'Descrizione', dish, 'description', 'textarea');
        if (category.id === 'menu-fissi' || dish.courses?.length || dish.includes?.length) {
          field(box, 'Portate (una per riga)', dish, 'courses', 'lines');
          field(box, 'Inclusi nel prezzo (uno per riga)', dish, 'includes', 'lines');
        }
        field(box, 'Allergeni verificati (separati da virgola)', dish, 'allergens', 'list');
        field(box, 'Disponibile', dish, 'available', 'checkbox');
      });
      card.append(panel);
    });
    editor.append(categories);
    return;
  }
  data.days ??= {};
  for (const day of weekdays) {
    const entry = data.days[day.toLowerCase()] ??= { enabled: false, dishes: [] };
    const panel = element('details');
    const box = group('Impostazioni');
    panel.append(element('summary', day + (entry.enabled ? ' · Pubblicato' : '')), box);
    field(box, 'Mostra nel menù', entry, 'enabled', 'checkbox');
    field(box, 'Titolo del giorno', entry, 'title');
    field(box, 'Descrizione', entry, 'description', 'textarea');
    field(box, 'Menù fisso', entry, 'fisso', 'checkbox');
    field(box, 'Prezzo del menù fisso', entry, 'fixed_price');
    collection(box, entry.dishes ??= [], 'piatto', () => ({ id: crypto.randomUUID(), available: true }), (card, dish) => {
      field(card, 'Nome', dish, 'name');
      field(card, 'Descrizione', dish, 'description', 'textarea');
      field(card, 'Prezzo alla carta', dish, 'price', 'number');
      field(card, 'Prezzo da mostrare (facoltativo)', dish, 'price_display');
      field(card, 'Etichette (separate da virgola)', dish, 'tags', 'list');
      field(card, 'Allergeni indicati (separati da virgola)', dish, 'allergens', 'list');
      field(card, 'Disponibile', dish, 'available', 'checkbox');
    });
    editor.append(panel);
  }
}

function renderItems(data) {
  const box = group('Catalogo');
  collection(box, data, 'prodotto', () => ({ titolo: '', prezzo: 0 }), (card, item) => {
    field(card, 'Titolo', item, 'titolo');
    field(card, 'Categoria', item, 'categoria');
    field(card, 'Tipologia', item, 'tipologia');
    field(card, 'Prezzo', item, 'prezzo', 'number');
    field(card, 'Prezzo scontato', item, 'prezzo_scontato', 'number');
    field(card, 'Percorso della foto', item, 'immagine');
    const file = element('input');
    file.type = 'file';
    file.accept = 'image/jpeg,image/png,image/webp';
    const label = element('label', 'Carica una foto');
    label.append(file);
    card.append(label);
    file.addEventListener('change', async () => {
      const selected = file.files[0];
      if (!selected) return;
      await withBusy('Caricamento foto…', async () => {
        const extension = selected.name.split('.').pop().toLowerCase();
        if (selected.size > 5 * 1024 * 1024 || !/^(?:jpe?g|png|webp)$/.test(extension)) {
          throw new Error('Scegli una foto JPG, PNG o WebP di massimo 5 MB.');
        }
        const image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(selected);
        });
        const result = await requestData('img/' + crypto.randomUUID() + '.' + extension, { image });
        item.immagine = result.path;
        markDirty();
        renderActive();
        status.textContent = 'Foto caricata. Pubblica le modifiche per associarla al prodotto.';
      });
    });
  });
  editor.append(box);
}

function updateButtons() {
  const state = cache.get(path);
  save.disabled = busy || !state?.writable || !state.dirty;
  reload.disabled = busy;
  tabs.forEach(tab => {
    tab.disabled = busy;
    tab.setAttribute('aria-pressed', String(tab.dataset.path === path));
  });
  editor.querySelectorAll('input, textarea, button').forEach(field => { field.disabled = busy || !state?.writable; });
}

function renderActive() {
  editor.replaceChildren();
  const data = cache.get(path)?.data;
  if (!data) return;
  if (path === 'dati.json') renderData(data);
  if (path === 'menu.json') renderMenu(data);
  if (path === 'items.json') renderItems(data);
}

async function withBusy(message, run) {
  if (busy) return;
  busy = true;
  updateButtons();
  status.textContent = message;
  try {
    await run();
  } catch (error) {
    status.textContent = error.message || 'Operazione non riuscita.';
  } finally {
    busy = false;
    updateButtons();
  }
}

async function loadActive() {
  await withBusy('Caricamento…', async () => {
    const loaded = await requestData(path);
    cache.set(path, loaded);
    renderActive();
    status.textContent = loaded.writable ? 'Dati caricati.' : 'Anteprima locale in sola lettura.';
  });
}

for (const tab of tabs) {
  tab.addEventListener('click', async () => {
    path = tab.dataset.path;
    renderActive();
    if (cache.has(path)) {
      status.textContent = cache.get(path).dirty ? 'Modifiche da pubblicare.' : 'Dati caricati.';
      updateButtons();
    } else {
      await loadActive();
    }
  });
}
reload.addEventListener('click', () => {
  if (!cache.get(path)?.dirty || confirm('Annullare le modifiche locali e ricaricare?')) loadActive();
});
save.addEventListener('click', () => withBusy('Pubblicazione…', async () => {
  const state = cache.get(path);
  const data = structuredClone(state.data);
  if (path !== 'items.json') data.updated = new Date().toISOString();
  const result = await requestData(path, { data, sha: state.sha });
  state.sha = result.sha;
  state.dirty = false;
  status.textContent = 'Salvato. Il sito si aggiornerà al termine della pubblicazione.';
}));
window.addEventListener('beforeunload', event => {
  if (!Array.from(cache.values()).some(state => state.dirty)) return;
  event.preventDefault();
  event.returnValue = '';
});
loadActive();
