(() => {
  const key = 'giuggioloni-language';
  let saved;
  try { saved = localStorage.getItem(key); } catch {}
  const english = document.documentElement.lang.startsWith('en');
  let language = english ? 'en' : saved === 'en' ? 'en' : 'it';
  const save = value => { language = value; try { localStorage.setItem(key, value); } catch {} };
  if (english) save('en');
  if (language === 'en' && /^\/menu\/(?:index\.html)?$/.test(location.pathname)) {
    location.replace('/menu/en/' + location.search + location.hash);
    return;
  }
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
