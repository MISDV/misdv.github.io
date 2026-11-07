const englishSite = document.documentElement.lang.startsWith('en');
const restaurantMap = window.GiuggioloniMap;

function setText(selector, value) {
  if (typeof value !== 'string' || !value.trim()) return;
  document.querySelectorAll(selector).forEach(element => {
    if (element.textContent.trim() !== value.trim()) element.textContent = value;
  });
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
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', englishSite ? 'Main navigation' : 'Menu principale');
  let scrollLock;
  const background = [...document.querySelectorAll('main, body > footer')];
  const setOpen = open => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', englishSite ? (open ? 'Close navigation menu' : 'Open navigation menu') : (open ? 'Chiudi menu principale' : 'Apri menu principale'));
    panel.hidden = !open;
    overlay.hidden = !open;
    button.querySelector('#menuIconOpen').classList.toggle('hidden', open);
    button.querySelector('#menuIconClose').classList.toggle('hidden', !open);
    if (open) {
      if (!scrollLock) {
        scrollLock = [document.documentElement.style.overflow, document.body.style.overflow];
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        background.forEach(element => { element.inert = true; });
      }
      close.focus();
    } else if (scrollLock) {
      [document.documentElement.style.overflow, document.body.style.overflow] = scrollLock;
      scrollLock = null;
      background.forEach(element => { element.inert = false; });
    }
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => { setOpen(false); button.focus(); });
  overlay.addEventListener('click', () => { setOpen(false); button.focus(); });
  panel.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (panel.hidden) return;
    if (event.key === 'Tab') {
      const links = [...panel.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    }
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });
  matchMedia('(min-width: 1200px)').addEventListener('change', event => {
    if (event.matches) setOpen(false);
  });
}

function setupMaps() {
  for (const map of document.querySelectorAll('[data-map]')) {
    const button = map.querySelector('[data-map-toggle]');
    const slot = map.querySelector('[data-map-slot]');
    button.hidden = false;
    button.addEventListener('click', () => {
      if (!slot.hidden) {
        slot.replaceChildren();
        slot.hidden = true;
      } else {
        const iframe = document.createElement('iframe');
        iframe.title = 'Google Maps — Agriturismo Giuggioloni, Osimo';
        iframe.width = '600';
        iframe.height = '450';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.src = restaurantMap.embedUrl;
        slot.append(iframe);
        slot.hidden = false;
      }
      button.setAttribute('aria-expanded', String(!slot.hidden));
      button.textContent = englishSite ? (slot.hidden ? 'Show Google map' : 'Close map') : (slot.hidden ? 'Mostra la mappa Google' : 'Chiudi la mappa');
    });
  }
}

function renderHours(hours) {
  const list = document.querySelector('[data-hours]');
  if (!list || !hours || !Object.keys(hours).length) return;
  list.replaceChildren(...Object.entries(hours).map(([day, service]) => {
    const times = [service?.pranzo, service?.cena].filter(Boolean).map(time => String(time).replace('-', '–'));
    const label = times.join(' · ') || (englishSite ? (service?.note === 'Cena' ? 'Dinner, time to be confirmed' : service?.note === 'Chiuso' ? 'Closed' : 'Time to be confirmed') : (service?.note === 'Cena' ? 'Cena, orario da confermare' : service?.note || 'Orario da confermare'));
    const item = document.createElement('li');
    const name = document.createElement('span');
    const schedule = document.createElement('span');
    name.textContent = englishSite ? ({ 'Lunedì': 'Monday', 'Martedì': 'Tuesday', 'Mercoledì': 'Wednesday', 'Giovedì': 'Thursday', 'Venerdì': 'Friday', 'Sabato': 'Saturday', 'Domenica': 'Sunday' }[day] || day) : day;
    if (times.length) {
      for (const time of times) {
        const range = document.createElement('span');
        range.className = 'service-time';
        range.textContent = time;
        schedule.append(range);
      }
    } else schedule.textContent = label;
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
    if (typeof value === 'string' && value.trim() && element.textContent.trim() !== value.trim()) element.textContent = value;
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
      document.querySelectorAll('[data-maps]').forEach(map => { map.href = restaurantMap.placeUrl; });
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
