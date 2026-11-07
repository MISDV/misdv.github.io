function setText(selector, value) {
  if (typeof value !== 'string' || !value.trim()) return;
  document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
}

function listItem(text, href) {
  const item = document.createElement('li');
  if (href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    item.append(link);
  } else {
    item.textContent = text;
  }
  return item;
}

function setupNavigation() {
  const button = document.querySelector('#mobileMenuButton');
  const panel = document.querySelector('#mobileMenu');
  const overlay = document.querySelector('#mobileOverlay');
  if (!button || !panel || !overlay) return;
  const close = panel.querySelector('#mobileMenuClose');
  const setOpen = open => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Chiudi menu principale' : 'Apri menu principale');
    panel.hidden = !open;
    overlay.hidden = !open;
    button.querySelector('#menuIconOpen').classList.toggle('hidden', open);
    button.querySelector('#menuIconClose').classList.toggle('hidden', !open);
    if (open) close.focus();
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => { setOpen(false); button.focus(); });
  overlay.addEventListener('click', () => { setOpen(false); button.focus(); });
  panel.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', event => {
    if (event.matches) setOpen(false);
  });
}

function setupMaps() {
  for (const map of document.querySelectorAll('[data-map]')) {
    const button = map.querySelector('[data-map-toggle]');
    const slot = map.querySelector('[data-map-slot]');
    const directions = map.querySelector('[data-maps]');
    button.hidden = false;
    button.addEventListener('click', () => {
      if (!slot.hidden) {
        slot.replaceChildren();
        slot.hidden = true;
      } else {
        const query = new URL(directions.href).searchParams.get('query');
        const url = new URL('https://maps.google.com/maps');
        url.searchParams.set('q', query);
        url.searchParams.set('z', '15');
        url.searchParams.set('output', 'embed');
        const iframe = document.createElement('iframe');
        iframe.title = 'Google Maps — Agriturismo Giuggioloni, Osimo';
        iframe.referrerPolicy = 'no-referrer';
        iframe.src = url.href;
        slot.append(iframe);
        slot.hidden = false;
      }
      button.setAttribute('aria-expanded', String(!slot.hidden));
      button.textContent = slot.hidden ? 'Mostra la mappa Google' : 'Chiudi la mappa';
    });
  }
}

function renderHours(hours) {
  const list = document.querySelector('[data-hours]');
  if (!list || !hours || !Object.keys(hours).length) return;
  list.replaceChildren(...Object.entries(hours).map(([day, service]) => {
    const times = [service?.pranzo, service?.cena].filter(Boolean).map(time => String(time).replace('-', '–'));
    const label = times.join(' · ') || (service?.note === 'Cena' ? 'Cena, orario da confermare' : service?.note || 'Orario da confermare');
    const item = document.createElement('li');
    const name = document.createElement('span');
    const schedule = document.createElement('span');
    name.textContent = day;
    schedule.textContent = label;
    if (service?.note === 'Chiuso') schedule.className = 'closed';
    item.append(name, schedule);
    return item;
  }));
}

function renderCards(cards) {
  const container = document.querySelector('[data-cards]');
  const template = document.querySelector('#farm-card-template');
  if (!container || !template || !Array.isArray(cards)) return;
  const fragment = document.createDocumentFragment();
  for (const card of cards) {
    const item = template.content.cloneNode(true);
    item.querySelector('[data-card-title]').textContent = card.titolo;
    item.querySelector('[data-card-body]').textContent = card.valore;
    for (const icon of item.querySelectorAll('.material-icons')) {
      const name = /^[a-z_]+$/.test(card.icona || '') ? card.icona : 'info';
      icon.textContent = name;
      icon.classList.toggle('material-icons-full', !['agriculture', 'restaurant_menu', 'favorite', 'info'].includes(name));
    }
    fragment.append(item);
  }
  container.replaceChildren(fragment);
}

async function updateSite() {
  const response = await fetch('/dati.json');
  if (!response.ok) return;
  const data = await response.json();

  for (const element of document.querySelectorAll('[data-text]')) {
    const value = element.dataset.text.split('.').reduce((object, key) => object?.[key], data);
    if (typeof value === 'string' && value.trim()) element.textContent = value;
  }
  for (const link of document.querySelectorAll('[data-social]')) {
    const url = data.socials?.[link.dataset.social]?.link;
    if (typeof url === 'string' && /^https:\/\//i.test(url)) link.href = url;
  }

  const contact = data.contatto;
  if (contact) {
    setText('[data-via]', contact.via);
    setText('[data-comune]', contact.comune);
    if (contact.via && contact.comune) {
      const query = encodeURIComponent(`${contact.via}, ${contact.comune}`);
      document.querySelectorAll('[data-maps]').forEach(map => { map.href = `https://www.google.com/maps/search/?api=1&query=${query}`; });
    }
    const email = document.querySelector('[data-email]');
    if (email && typeof contact.mail === 'string' && /^[^\s@]+@[^\s@]+$/.test(contact.mail)) {
      email.href = `mailto:${contact.mail}`;
      email.textContent = contact.mail;
    }
    const phones = Array.isArray(contact.numeri_telefono) ? contact.numeri_telefono.filter(phone => typeof phone === 'string' && /\d/.test(phone)) : [];
    const phoneList = document.querySelector('[data-phones]');
    if (phoneList && phones.length) {
      phoneList.replaceChildren(...phones.map(phone => listItem(phone, `tel:${phone.replace(/[^+\d]/g, '')}`)));
    }
  }

  renderHours(data.orari);
  renderCards(data.cards);
}

setupNavigation();
setupMaps();
updateSite().catch(() => {
  // I contenuti principali sono disponibili nell'HTML.
});
