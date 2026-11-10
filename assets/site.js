const englishSite = document.documentElement.lang.startsWith('en');
const restaurantMap = window.GiuggioloniMap;

function setupNavigation() {
  const button = document.querySelector('#mobileMenuButton');
  const panel = document.querySelector('#mobileMenu');
  const overlay = document.querySelector('#mobileOverlay');
  if (!button || !panel || !overlay) return;
  const header = document.querySelector('#siteNav');
  if (header) {
    let height = matchMedia('(min-width: 768px)').matches ? 96 : 80;
    const syncHeight = next => {
      if (next === height) return;
      height = next;
      document.documentElement.style.setProperty('--site-nav-height', `${height}px`);
    };
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(([entry]) => syncHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)).observe(header);
    } else {
      const measure = () => syncHeight(header.getBoundingClientRect().height);
      measure();
      window.addEventListener('resize', measure);
    }
  }
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

// Public content is generated into HTML before publication.
setupNavigation();
setupMaps();
