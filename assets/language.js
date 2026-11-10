(() => {
  const key = 'giuggioloni-language';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const pageLanguage = document.documentElement.lang.toLowerCase().split('-')[0];
  // An explicitly Italian or English page always keeps its own menu language.
  let language = ['it', 'en'].includes(pageLanguage) ? pageLanguage : saved === 'en' ? 'en' : 'it';
  const save = value => { language = value; try { localStorage.setItem(key, value); } catch {} };
  if (pageLanguage === 'it' || pageLanguage === 'en') save(pageLanguage);
  function updateLinks() {
    for (const link of document.querySelectorAll('a[href]')) {
      if (link.hasAttribute('hreflang')) continue;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/^\/menu\/(?:en\/)?$/.test(url.pathname)) continue;
      link.href = (language === 'en' ? '/menu/en/' : '/menu/') + url.search + url.hash;
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[hreflang]');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const value = link.getAttribute('hreflang');
    if (value === 'it' || value === 'en') save(value);
  }, { capture: true });
  updateLinks();
})();
