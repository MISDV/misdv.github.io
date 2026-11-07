(() => {
  const restaurantMap = window.GiuggioloniMap;
  const phone = '+39 392 252 9406';
  const number = 'tel:+393922529406';
  const email = 'info@agriturismogiuggioloni.it';
  const address = 'Via Acquaviva 34, 60027 Osimo (AN), Marche';
  const english = document.documentElement.lang.startsWith('en');
  const dialog = document.createElement('dialog');
  dialog.className = 'site-booking';
  dialog.id = 'booking-dialog';
  dialog.setAttribute('aria-labelledby', 'booking-title');
  dialog.innerHTML = `<header><div><p>Agriturismo Giuggioloni</p><h2 id="booking-title">${english ? 'Book your table' : 'Prenota il tuo tavolo'}</h2></div><button type="button" data-booking-close aria-label="${english ? 'Close' : 'Chiudi'}">×</button></header>
    <div class="booking-content"><p>${english ? 'Call us to arrange your reservation.' : 'Chiamaci per concordare la prenotazione.'}</p>
    <a class="booking-phone" href="${number}">${phone}</a>
    <section aria-labelledby="booking-map-title"><h3 id="booking-map-title">${english ? 'Find us' : 'Dove siamo'}</h3><p>${address}</p><div class="booking-map"></div><a class="booking-directions" href="${restaurantMap.placeUrl}" target="_blank" rel="noopener noreferrer">${english ? 'Directions on Google Maps' : 'Indicazioni su Google Maps'} ↗</a></section>
    <section class="booking-email"><h3>${english ? 'Email' : 'Scrivici'}</h3><a href="mailto:${email}">${email}</a></section>
    <p class="booking-note">${english ? 'Map provided by Google.' : 'Mappa fornita da Google.'} <a href="/privacy/">${english ? 'Privacy information' : 'Informativa privacy'}</a></p></div>`;
  document.body.append(dialog);
  let opener;
  let overflow;
  function close() { dialog.close(); }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-booking]');
    if (!trigger || typeof dialog.showModal !== 'function' || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = trigger;
    overflow = [document.documentElement.style.overflow, document.body.style.overflow];
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const frame = document.createElement('iframe');
    frame.title = english ? 'Google Maps — Agriturismo Giuggioloni' : 'Mappa Google — Agriturismo Giuggioloni';
    frame.width = '600';
    frame.height = '450';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = restaurantMap.embedUrl;
    dialog.querySelector('.booking-map').replaceChildren(frame);
    dialog.showModal();
    dialog.querySelector('.booking-content').scrollTop = 0;
    dialog.querySelector('[data-booking-close]').focus();
  });
  dialog.querySelector('[data-booking-close]').addEventListener('click', close);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('a[href],button:not([disabled]),iframe')].filter(element => element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
  });
  dialog.addEventListener('close', () => {
    dialog.querySelector('.booking-map').replaceChildren();
    if (overflow) [document.documentElement.style.overflow, document.body.style.overflow] = overflow;
    const target = opener?.getClientRects().length ? opener : document.querySelector('#mobileMenuButton');
    target?.focus({ preventScroll: true });
  });
})();
