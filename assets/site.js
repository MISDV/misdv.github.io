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
      document.querySelector('[data-maps]').href = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    const email = document.querySelector('[data-email]');
    if (typeof contact.mail === 'string' && /^[^\s@]+@[^\s@]+$/.test(contact.mail)) {
      email.href = `mailto:${contact.mail}`;
      email.textContent = contact.mail;
    }
    const phones = Array.isArray(contact.numeri_telefono) ? contact.numeri_telefono.filter(phone => typeof phone === 'string' && /\d/.test(phone)) : [];
    if (phones.length) {
      document.querySelector('[data-phones]').replaceChildren(...phones.map(phone => listItem(phone, `tel:${phone.replace(/[^+\d]/g, '')}`)));
    }
  }

  const hours = data.orari;
  if (hours && Object.keys(hours).length) {
    document.querySelector('[data-hours]').replaceChildren(...Object.entries(hours).map(([day, service]) => {
      const times = [service?.pranzo, service?.cena].filter(Boolean).map(time => time.replace('-', '–'));
      const label = times.join(' e ') || (service?.note === 'Cena' ? 'Cena, orario da confermare' : service?.note || 'Orario da confermare');
      return listItem(`${day} · ${label}`);
    }));
  }

  const cards = document.querySelector('[data-cards]');
  if (cards && Array.isArray(data.cards)) {
    cards.replaceChildren(...data.cards.map(card => {
      const article = document.createElement('article');
      article.className = 'card';
      const title = document.createElement('h3');
      title.textContent = card.titolo;
      const body = document.createElement('p');
      body.textContent = card.valore;
      article.append(title, body);
      return article;
    }));
  }
}

updateSite().catch(() => {
  // I contenuti principali sono disponibili nell'HTML.
});
