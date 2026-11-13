(() => {
  if (window.GiuggioloniConsent || document.querySelector('meta[http-equiv="refresh" i]')) return;
  const id = 'G-D754GXFBLZ';
  const storageKey = 'giuggioloni-cookie-v2';
  const analyticsPage = document.body.hasAttribute('data-analytics');
  const english = document.documentElement.lang.toLowerCase().startsWith('en');
  const words = english ? {
    title: 'Cookie preferences', intro: 'Choose whether to allow visit statistics and marketing tracking. Essential functions stay available with any choice.',
    privacy: 'Privacy notice (Italian)', statistics: 'Statistics', statisticsInfo: 'Google Analytics measures visits to the Italian home page.',
    marketing: 'Marketing', marketingInfo: 'Meta Pixel measures visits and advertising results on this website.',
    reject: 'Reject optional cookies', save: 'Save preferences', all: 'Accept all',
    none: 'No choice saved. Statistics and marketing are disabled.', on: 'enabled', off: 'disabled',
  } : {
    title: 'Preferenze cookie', intro: 'Scegli se consentire le statistiche sulle visite e il tracciamento di marketing. Le funzioni essenziali restano disponibili con qualsiasi scelta.',
    privacy: 'Informativa privacy e cookie', statistics: 'Statistiche', statisticsInfo: 'Google Analytics misura le visite alla home italiana.',
    marketing: 'Marketing', marketingInfo: 'Il Pixel Meta misura le visite e i risultati delle campagne pubblicitarie su questo sito.',
    reject: 'Rifiuta non necessari', save: 'Salva preferenze', all: 'Accetta tutti',
    none: 'Nessuna scelta salvata. Statistiche e marketing disattivati.', on: 'attivi', off: 'disattivati',
  };
  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('data-nosnippet', '');
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.hidden = true;
  banner.innerHTML = `<h2 id="cookie-title" tabindex="-1">${words.title}</h2>
    <p>${words.intro} <a href="/privacy/#cookie"${english ? ' lang="it"' : ''}>${words.privacy}</a>.</p>
    <div class="cookie-options">
      <label><input id="cookie-analytics" type="checkbox"><span><strong>${words.statistics}</strong><small>${words.statisticsInfo}</small></span></label>
      <label><input id="cookie-marketing" type="checkbox"><span><strong>${words.marketing}</strong><small>${words.marketingInfo}</small></span></label>
    </div>
    <div class="cookie-actions">
      <button type="button" data-cookie-choice="essential">${words.reject}</button>
      <button type="button" data-cookie-choice="save">${words.save}</button>
      <button type="button" data-cookie-choice="all">${words.all}</button>
    </div>`;
  document.body.append(banner);
  const analyticsInput = banner.querySelector('#cookie-analytics');
  const marketingInput = banner.querySelector('#cookie-marketing');
  function parse(value) {
    try {
      const saved = JSON.parse(value);
      if (saved?.version !== 2 || typeof saved.analytics !== 'boolean' || typeof saved.marketing !== 'boolean') return null;
      const date = Date.parse(saved.updatedAt);
      if (!Number.isFinite(date) || date > Date.now() || Date.now() - date > 180 * 86400000) return null;
      return saved;
    } catch { return null; }
  }
  let choice = null, analyticsLoaded = false, opener;
  try { choice = parse(localStorage.getItem(storageKey)); } catch { /* storage unavailable */ }
  function setAnalytics(allowed) {
    window['ga-disable-' + id] = !allowed;
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: allowed ? 'granted' : 'denied' });
    if (!allowed || !analyticsPage || analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 15552000, cookie_update: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function clearCookies(pattern) {
    const domains = ['', '; Domain=' + location.hostname, '; Domain=agriturismogiuggioloni.it'];
    for (const entry of document.cookie.split(';')) {
      const name = entry.trim().split('=')[0];
      if (!pattern.test(name)) continue;
      for (const domain of domains) document.cookie = name + '=; Max-Age=0; Path=/' + domain;
    }
  }
  function apply() {
    const analytics = choice?.analytics === true, marketing = choice?.marketing === true;
    setAnalytics(analytics);
    window.GiuggioloniMetaPixel?.setConsent(marketing);
    if (!analytics) clearCookies(/^(_ga(?:_[a-z\d]+)?|_gid|_gat(?:_[a-z\d_]+)?)$/i);
    if (!marketing) clearCookies(/^_fb[pc]$/i);
    analyticsInput.checked = analytics;
    marketingInput.checked = marketing;
    const status = document.querySelector('#cookie-status');
    if (status) status.textContent = !choice ? words.none : `${words.statistics}: ${analytics ? words.on : words.off}. ${words.marketing}: ${marketing ? words.on : words.off}.`;
  }
  function open(trigger) {
    opener = trigger;
    analyticsInput.checked = choice?.analytics === true;
    marketingInput.checked = choice?.marketing === true;
    banner.hidden = false;
    banner.querySelector('h2').focus();
  }
  for (const button of document.querySelectorAll('[data-cookie-settings]')) {
    button.hidden = false;
    button.addEventListener('click', event => { event.preventDefault(); open(button); });
  }
  banner.addEventListener('click', event => {
    const action = event.target.closest('[data-cookie-choice]')?.dataset.cookieChoice;
    if (!['essential', 'save', 'all'].includes(action)) return;
    choice = { version: 2, analytics: action === 'all' || action === 'save' && analyticsInput.checked,
      marketing: action === 'all' || action === 'save' && marketingInput.checked, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(storageKey, JSON.stringify(choice)); } catch { /* apply for this page */ }
    apply();
    banner.hidden = true;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    choice = parse(event.newValue);
    apply();
    banner.hidden = !!choice;
  });
  window.GiuggioloniConsent = Object.freeze({ open: () => open(document.activeElement) });
  apply();
  // The previous analytics-only choice never authorizes the newly added Meta Pixel.
  if (!choice) banner.hidden = false;
})();
