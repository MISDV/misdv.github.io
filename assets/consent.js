(() => {
  const id = 'G-D754GXFBLZ';
  const storageKey = 'giuggioloni-cookie-v1';
  const analyticsPage = document.body.hasAttribute('data-analytics');
  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('data-nosnippet', '');
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.hidden = true;
  banner.innerHTML = `<h2 id="cookie-title" tabindex="-1">Preferenze cookie</h2>
    <p>Con il tuo consenso usiamo Google Analytics per misurare le visite alla home. Puoi continuare con le sole funzioni essenziali o cambiare scelta in qualsiasi momento. <a href="/privacy/#cookie">Leggi l’informativa</a>.</p>
    <div class="cookie-actions">
      <button type="button" data-cookie-choice="essential">Solo essenziali</button>
      <button type="button" data-cookie-choice="analytics">Accetta statistiche</button>
    </div>`;
  document.body.append(banner);

  let choice;
  let loaded = false;
  try { choice = localStorage.getItem(storageKey); } catch { /* storage unavailable */ }

  function setAnalytics(allowed) {
    window['ga-disable-' + id] = !allowed;
    if (!allowed || !analyticsPage || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    });
    gtag('js', new Date());
    gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }

  function clearAnalyticsCookies() {
    const domains = ['', '; Domain=' + location.hostname, '; Domain=agriturismogiuggioloni.it'];
    for (const entry of document.cookie.split(';')) {
      const name = entry.trim().split('=')[0];
      if (!/^(_ga(?:_[a-z\d]+)?|_gid|_gat(?:_[a-z\d_]+)?)$/i.test(name)) continue;
      for (const domain of domains) document.cookie = name + '=; Max-Age=0; Path=/' + domain;
    }
  }

  const status = document.querySelector('#cookie-status');
  function showStatus() {
    if (status) status.textContent = choice === 'analytics' ? 'Statistiche attive.' : choice === 'essential' ? 'Solo strumenti essenziali.' : 'Nessuna scelta salvata. Statistiche disattivate.';
  }

  let opener;
  for (const button of document.querySelectorAll('[data-cookie-settings]')) {
    button.hidden = false;
    button.addEventListener('click', event => {
      event.preventDefault();
      opener = button;
      banner.hidden = false;
      banner.querySelector('h2').focus();
    });
  }
  banner.addEventListener('click', event => {
    const action = event.target.closest('[data-cookie-choice]')?.dataset.cookieChoice;
    if (!action) return;
    choice = action;
    try { localStorage.setItem(storageKey, choice); } catch { /* apply for the current page */ }
    setAnalytics(choice === 'analytics');
    if (choice === 'essential') clearAnalyticsCookies();
    banner.hidden = true;
    showStatus();
    opener?.focus();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    choice = event.newValue;
    setAnalytics(choice === 'analytics');
    if (choice !== 'analytics') clearAnalyticsCookies();
    showStatus();
  });
  setAnalytics(choice === 'analytics');
  showStatus();
  if (analyticsPage && !choice) banner.hidden = false;
})();
