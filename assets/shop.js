const localPath = document.querySelector('#productsGrid').dataset.catalogSrc || '/items.json';

let allItems = [];
let filteredItems = [];
let categories = new Set();
let currentCategory = null;
let currentTypeFilters = new Set();
let currentSearch = '';
let currentSort = 'relevant';
let maxPrice = 100;
let renderedItems = null;

const productsGrid = document.getElementById('productsGrid');
const categoriesList = document.getElementById('categoriesList');

const catAll = document.getElementById('cat-all');

const typesList = document.getElementById('typesList');
const typesFilter = document.getElementById('shop-types-filter');
const totalCount = document.getElementById('totalCount');
const priceMin = document.getElementById('priceMin');
const priceMinLabel = document.getElementById('priceMinLabel');
const priceMaxLabel = document.getElementById('priceMaxLabel');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sortSelect');

async function fetchItems() {
    try {
        const response = await fetch(localPath);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
        if (!items || !items.every(item => typeof item.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))) throw new Error('Catalogo non valido');
        return items;
    } catch (error) {
        console.warn('Catalogo non disponibile', error);
        return null;
    }
}

function normalize(item) { return ShopCatalog.normalize(item); }

function buildUI(items) {
    // reset
    categories.clear();

    items.forEach(i => {
        const n = normalize(i);
        categories.add(n.categoria);
    });

    // popola categoriesList
    // rimuovi tutti tranne "Tutti i prodotti"
    categoriesList.querySelectorAll('.cat-item')?.forEach(n => n.remove());
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.className = 'cat-item';
        li.innerHTML = `<button type="button" aria-pressed="false" class="shop-category-button flex items-center justify-between p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" data-cat="${escapeHtml(cat)}"><span>${escapeHtml(cat)}</span><span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">0</span></button>`;
        categoriesList.appendChild(li);
    });

    // set price range
    const prices = items.map(i => { const n = normalize(i); return n.prezzo_massimo ?? n.prezzo_scontato ?? n.prezzo; }).filter(p => p !== null && Number.isFinite(p));
    const max = prices.length ? Math.ceil(Math.max(...prices)) : 100;
    maxPrice = max;
    priceMin.min = 0;
    priceMin.max = max;
    priceMin.value = max;
    priceMinLabel.textContent = '€0';
    priceMaxLabel.textContent = ShopCatalog.money(max);

    // update total count
    totalCount.textContent = items.length;

    // attach listeners
    attachListeners();
}

function renderCategoryTypes() {
  currentTypeFilters.clear();
  typesList.replaceChildren();
  typesFilter.hidden = true;
  if (!currentCategory || currentCategory === 'cat-all') return;

  const categoryTypes = [...new Set(allItems.map(normalize)
    .filter(item => item.categoria === currentCategory)
    .map(item => item.tipologia).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'));
  if (categoryTypes.length < 2) return;

  const fragment = document.createDocumentFragment();
  for (const type of categoryTypes) {
    const label = document.createElement('label');
    label.className = 'flex items-center space-x-3 cursor-pointer group';
    label.innerHTML = `<input id="type-${slugify(type)}" data-type="${escapeHtml(type)}" class="form-checkbox text-primary rounded border-gray-300 focus:ring-primary h-5 w-5 transition duration-150 ease-in-out" type="checkbox"/><span class="text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">${escapeHtml(type)}</span>`;
    fragment.append(label);
  }
  typesList.append(fragment);
  typesFilter.hidden = false;
}

function attachListeners() {
  // classi riutilizzate
  const CAT_ACTIVE = ['bg-primary/10','text-primary','font-medium'];
  const CAT_INACTIVE = ['text-gray-600','dark:text-gray-300','hover:bg-gray-50','dark:hover:bg-white/5','transition-colors','cursor-pointer'];
  const CATALL_ACTIVE = ['flex','items-center','justify-between','p-2','rounded-lg','bg-primary/10','text-primary','font-medium','cursor-pointer'];
  const CATALL_INACTIVE = ['flex','items-center','justify-between','p-2','rounded-lg','text-gray-600','dark:text-gray-300','hover:bg-gray-50','dark:hover:bg-white/5','transition-colors','cursor-pointer'];
  const TOTAL_ACTIVE = ['text-xs','bg-white','dark:bg-primary/20','px-2','py-0.5','rounded-full'];
  const TOTAL_INACTIVE = ['text-xs','bg-gray-100','dark:bg-gray-700','px-2','py-0.5','rounded-full'];

  function removeClasses(el, classes) {
    if (!el) return;
    classes.forEach(c => el.classList.remove(c));
  }
  function addClasses(el, classes) {
    if (!el) return;
    classes.forEach(c => el.classList.add(c));
  }

  function deselectAllCategoriesUI() {
    const items = categoriesList.querySelectorAll('[data-cat]');
    items.forEach(x => {
      x.setAttribute('aria-pressed', 'false');
      removeClasses(x, CAT_ACTIVE);
      addClasses(x, CAT_INACTIVE);
    });
  }

  function setCatAllActiveUI() {
    if (!catAll) return;
    catAll.setAttribute('aria-pressed', 'true');
    removeClasses(catAll, CATALL_INACTIVE);
    addClasses(catAll, CATALL_ACTIVE);
    removeClasses(totalCount, TOTAL_INACTIVE);
    addClasses(totalCount, TOTAL_ACTIVE);
    // deseleziona le categorie singole
    deselectAllCategoriesUI();
  }

  function setCatAllInactiveUI() {
    if (!catAll) return;
    catAll.setAttribute('aria-pressed', 'false');
    removeClasses(catAll, CATALL_ACTIVE);
    addClasses(catAll, CATALL_INACTIVE);
    removeClasses(totalCount, TOTAL_ACTIVE);
    addClasses(totalCount, TOTAL_INACTIVE);
  }

  function setCategoryActiveUI(catKey) {
    // disattiva catAll
    setCatAllInactiveUI();
    // togli selezioni e attiva quella richiesta
    deselectAllCategoriesUI();
    const sel = categoriesList.querySelector(`[data-cat="${cssEscape(catKey)}"]`);
    if (sel) {
      sel.setAttribute('aria-pressed', 'true');
      removeClasses(sel, CAT_INACTIVE);
      addClasses(sel, CAT_ACTIVE);
    }
  }

  // Assicuriamoci che ci sia una categoria iniziale: 'cat-all' per default (mostra tutti i prodotti)
  if (!currentCategory) currentCategory = 'cat-all';
  // Aggiorna UI iniziale
  if (currentCategory === 'cat-all') {
    setCatAllActiveUI();
  } else {
    setCategoryActiveUI(currentCategory);
  }
  renderCategoryTypes();

  // Gestore "Tutti i prodotti" — NON è toggle: clicca -> imposta cat-all (mostra tutti)
  if (catAll) {
    catAll.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentCategory !== 'cat-all') {
        currentCategory = 'cat-all';
        setCatAllActiveUI();
        renderCategoryTypes();
        applyFilters();
      }
      // se era già 'cat-all' non facciamo nulla (rimane attivo e mostra tutto)
    });
  }

  // Gestore per le singole categorie
  categoriesList.querySelectorAll('[data-cat]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault && e.preventDefault();
      const cat = e.currentTarget.dataset.cat;
      if (!cat) return;

      // se l'utente clicca la stessa categoria già selezionata => la deselezioniamo e torniamo a 'cat-all'
      if (currentCategory === cat) {
        currentCategory = 'cat-all';
        setCatAllActiveUI();
        renderCategoryTypes();
        applyFilters();
        return;
      }

      // altrimenti selezioniamo la nuova categoria e disattiviamo 'cat-all'
      currentCategory = cat;
      setCategoryActiveUI(cat);
      renderCategoryTypes();
      applyFilters();
    });
  });

  // type checkboxes
  typesList.addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[data-type]');
    if (!checkbox) return;
    if (checkbox.checked) currentTypeFilters.add(checkbox.dataset.type);
    else currentTypeFilters.delete(checkbox.dataset.type);
    applyFilters();
  });

  document.getElementById('shop-filters-reset')?.addEventListener('click', () => {
    currentSearch = '';
    searchInput.value = '';
    currentTypeFilters.clear();
    priceMin.value = maxPrice;
    priceMaxLabel.textContent = ShopCatalog.money(maxPrice);
    if (currentCategory !== 'cat-all') catAll.click();
    else { renderCategoryTypes(); applyFilters(); }
  });

  // price range
  priceMin.addEventListener('input', (e) => {
    const v = Number(e.currentTarget.value);
    priceMaxLabel.textContent = ShopCatalog.money(v);
    applyFilters();
  });

  // search
  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    applyFilters();
  });
  function submitSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    applyFilters();
    if (innerWidth < 1024) {
      searchInput.blur();
      const status = document.getElementById('shop-results-status');
      status?.focus({preventScroll:true});
      status?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
    }
  }
  searchBtn.addEventListener('click', submitSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  });

  // sort
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.currentTarget.value;
    applyFilters();
  });
}

function applyFilters() {
  const maxP = Number(priceMin.value);
  const hasMax = !isNaN(maxP);

  // mappiamo tutti gli elementi con la loro versione normalizzata per non ricalcolare normalize() troppe volte
  const mapped = allItems.map(it => ({ it, n: normalize(it) }));

  // filtri
  const filteredMapped = mapped.filter(({ it, n }) => {
    // price filter (uses prezzo_scontato if present)
    const price = (n.prezzo_scontato !== null && !isNaN(n.prezzo_scontato)) ? n.prezzo_scontato : n.prezzo;
    if (hasMax && ((price !== null && price > maxP) || (price === null && maxP < maxPrice))) return false;

    // category: considera 'cat-all' come "nessun filtro"
    if (currentCategory && currentCategory !== 'cat-all' && n.categoria !== currentCategory) return false;

    // types
    if (currentTypeFilters.size > 0 && !currentTypeFilters.has(n.tipologia)) return false;

    // search
    if (currentSearch) {
      const hay = `${n.titolo} ${n.categoria} ${n.tipologia} ${n.varianti.map(v => v.nome).join(' ')}`.toLowerCase();
      if (!hay.includes(currentSearch)) return false;
    }

    return true;
  });

  // sorting (usando i valori già normalizzati)
  if (currentSort === 'price-asc' || currentSort === 'price-desc') {
    filteredMapped.sort((a, b) => {
      const pa = a.n.prezzo_scontato ?? a.n.prezzo;
      const pb = b.n.prezzo_scontato ?? b.n.prezzo;
      if (pa === null) return pb === null ? 0 : 1;
      if (pb === null) return -1;
      return currentSort === 'price-asc' ? pa - pb : pb - pa;
    });
  }

  // ricava gli items finali e renderizza
  filteredItems = filteredMapped.map(x => x.it);

  renderProducts(filteredItems);
  updateCategoryCounts();
}

function renderProducts(items) {
    if (!renderedItems || renderedItems.length !== items.length || items.some((item,index) => item !== renderedItems[index])) {
        productsGrid.innerHTML = items.length ? items.map(ShopCatalog.card).join('') : '<p class="shop-empty" role="status">Nessun prodotto trovato.</p>';
        renderedItems = items.slice();
    }
    const status = document.querySelector('#shop-results-status');
    const resultLabel = items.length === 1 ? '1 prodotto' : `${items.length} prodotti`;
    if (status && status.textContent !== resultLabel) status.textContent = resultLabel;
    const count = (currentCategory && currentCategory !== 'cat-all' ? 1 : 0) + currentTypeFilters.size + (Number(priceMin.value) < maxPrice ? 1 : 0);
    const badge = document.getElementById('shop-active-filters');
    if (badge) { badge.hidden = count === 0; badge.textContent = count; }
    const toggle = document.getElementById('filtersToggle');
    toggle.disabled = false;
    toggle.setAttribute('aria-label', count ? `Apri filtri, ${count} ${count === 1 ? 'filtro attivo' : 'filtri attivi'}` : 'Apri filtri');
    const show = document.getElementById('shop-filters-show');
    if (show) { show.disabled = false; show.textContent = `Mostra ${items.length} ${items.length === 1 ? 'prodotto' : 'prodotti'}`; }
    const reset = document.getElementById('shop-filters-reset');
    if (reset) reset.disabled = false;
}

function updateCategoryCounts() {
    const counts = {};
    allItems.forEach(i => {
        const n = normalize(i);
        counts[n.categoria] = (counts[n.categoria] || 0) + 1;
    });
    categoriesList.querySelectorAll('[data-cat]').forEach(a => {
        const cat = a.dataset.cat;
        const badge = a.querySelector('span:last-child');
        if (badge) badge.textContent = counts[cat] || 0;
    });
}

// utility
function slugify(str){ return String(str||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function escapeHtml(unsafe) { return String(unsafe||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }
function cssEscape(s){ return s.replace(/([\\"'\[\]\/])/g,'\\$1'); }

// init
(async function(){
    allItems = await fetchItems();
    if (allItems === null) {
        document.querySelectorAll('.shop-sidebar,.shop-search-controls,#filtersToggle').forEach(element => { element.style.display = 'none'; });
        return; // Keep the complete static catalog and working product links.
    }
    buildUI(allItems);
    currentSearch = searchInput.value.trim().toLowerCase();
    currentSort = sortSelect.value || 'relevant';
    // initial render
    filteredItems = allItems.slice();
    applyFilters();
})();
