(function(){
  const container = document.querySelector('[data-dropdown]');
  if (!container) return;

  const native = document.getElementById('sortSelect'); // usa la select esistente
  const btn = container.querySelector('#sortButton');
  const list = container.querySelector('#sortList');
  const options = Array.from(list.querySelectorAll('.option'));
  const label = btn.querySelector('#sortButtonLabel');
  const chevron = btn.querySelector('#chev');

  let open = false;
  let focused = -1;
  let selected = 0;

  // trova l'indice iniziale basato sul valore della select nativa
  function findIndexByValue(val){
    return options.findIndex(o => o.dataset.value === val);
  }

  function openList(focusIndex = selected){
    open = true;
    list.classList.remove('hidden');
    btn.setAttribute('aria-expanded','true');
    chevron.style.transform = 'rotate(180deg)';
    focusOption(focusIndex);
  }

  function closeList(){
    open = false;
    list.classList.add('hidden');
    btn.setAttribute('aria-expanded','false');
    chevron.style.transform = '';
    focused = -1;
    options.forEach(el => el.classList.remove('bg-gray-50','dark:bg-gray-800'));
  }

  function focusOption(index){
    if(index < 0) index = 0;
    if(index >= options.length) index = options.length - 1;
    focused = index;
    options.forEach((el,i) => {
      el.classList.toggle('bg-gray-50', i === index);
      el.classList.toggle('dark:bg-gray-800', i === index);
      if(i === index) {
        el.scrollIntoView({ block: 'nearest' });
        el.focus();
      }
    });
  }

  // aggiorna l'UI (label + check icons). dispatch = se vogliamo anche aggiornare la select nativa e sparare change
  function updateUI(index, dispatch = false){
    selected = index;
    const opt = options[index];
    const val = opt.dataset.value;
    // aggiorna etichetta
    label.textContent = opt.querySelector('.font-medium').textContent;
    // mostra check
    options.forEach((el,i) => { el.querySelector('.check').classList.toggle('hidden', i !== index); el.setAttribute('aria-selected', String(i === index)); });
    // aggiorna select nativa se richiesto
    if(dispatch && native){
      native.value = val;
      // invia evento change per compatibilità con codice legacy
      native.dispatchEvent(new Event('change', { bubbles: true }));
      // se vuoi submit automatico, decommenta la linea seguente:
      // native.form?.submit();
    }
  }

  // seleziona e chiudi
  function selectOption(index){
    updateUI(index, true);
    closeList();
    btn.focus();
  }

  // inizializza: usa il valore attuale della select nativa (se presente)
  (function init(){
    let idx = 0;
    if (native) {
      const i = findIndexByValue(native.value);
      if (i >= 0) idx = i;
    }
    updateUI(idx, false); // inizializza interfaccia senza dispatch change
  })();

  // eventi
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    open ? closeList() : openList(selected);
  });

  options.forEach((opt, idx) => {
    opt.setAttribute('tabindex', '-1');
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectOption(idx);
    });
    opt.addEventListener('mouseenter', () => {
      focusOption(idx);
    });
  });

  // keyboard sul button
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); openList(Math.max(0, selected)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); openList(Math.max(0, selected)); focusOption(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open ? closeList() : openList(selected); }
  });

  // keyboard sulla lista
  list.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusOption(focused + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusOption(focused - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusOption(0); }
    else if (e.key === 'End') { e.preventDefault(); focusOption(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectOption(focused >= 0 ? focused : selected); }
    else if (e.key === 'Escape') { e.preventDefault(); closeList(); btn.focus(); }
    else if (e.key.length === 1) {
      const ch = e.key.toLowerCase();
      const idx = options.findIndex(o => o.textContent.trim().toLowerCase().startsWith(ch));
      if (idx >= 0) focusOption(idx);
    }
  });

  matchMedia('(max-width: 1023px)').addEventListener('change', event => { if (event.matches) closeList(); });

  // chiudi cliccando fuori
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) closeList();
  });

  // se la select nativa cambia da codice esterno, sincronizziamo l'interfaccia
  if (native) {
    native.addEventListener('change', () => {
      const i = findIndexByValue(native.value);
      if (i >= 0) updateUI(i, false);
    });
  }
})();

(function(){
  const toggle=document.getElementById('filtersToggle'),overlay=document.getElementById('mobileFiltersOverlay');
  const panel=document.getElementById('mobileFiltersPanel'),content=document.getElementById('mobileFiltersContent');
  const close=document.getElementById('mobileFiltersClose'),show=document.getElementById('shop-filters-show');
  const sidebar=document.querySelector('main>.shop-sidebar');
  if(!toggle||!overlay||!panel||!content||!close||!sidebar)return;
  const parent=sidebar.parentNode,next=sidebar.nextSibling,wasHidden=sidebar.classList.contains('hidden');
  const background=[...document.querySelectorAll('body>nav,body>main,body>footer')];
  const bodyProperties=['position','top','left','right','width'];
  let saved=null,inertState=[],timer=null,onEnd=null,openFrame=null,closing=false,showResults=false;

  function lock(){
    if(saved)return;
    saved={x:scrollX,y:scrollY,overflow:document.documentElement.style.overflow,body:bodyProperties.map(p=>document.body.style[p])};
    document.documentElement.classList.add('no-scroll');
    document.documentElement.style.overflow='hidden';
    Object.assign(document.body.style,{position:'fixed',top:-saved.y+'px',left:'0',right:'0',width:'100%'});
    inertState=background.map(element=>[element,element.inert]);
    background.forEach(element=>{element.inert=true;});
  }
  function unlock(){
    if(!saved)return;
    const previous=saved;saved=null;
    document.documentElement.classList.remove('no-scroll');
    document.documentElement.style.overflow=previous.overflow;
    bodyProperties.forEach((p,i)=>{document.body.style[p]=previous.body[i];});
    inertState.forEach(([element,value])=>{element.inert=value;});inertState=[];
    const behavior=document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior='auto';
    window.scrollTo({left:previous.x,top:previous.y,behavior:'auto'});
    document.documentElement.style.scrollBehavior=behavior;
  }
  function cancelClose(){
    if(timer!==null){clearTimeout(timer);timer=null;}
    if(onEnd){panel.removeEventListener('transitionend',onEnd);onEnd=null;}
    closing=false;
  }
  function finish(){
    if(!overlay.classList.contains('show'))return;
    cancelClose();
    if(openFrame!==null){cancelAnimationFrame(openFrame);openFrame=null;}
    panel.classList.remove('open');overlay.classList.remove('show');
    if(next&&next.parentNode===parent)parent.insertBefore(sidebar,next);else parent.append(sidebar);
    sidebar.classList.toggle('hidden',wasHidden);
    unlock();
    toggle.setAttribute('aria-expanded','false');overlay.setAttribute('aria-hidden','true');
    if(showResults){
      showResults=false;
      const target=document.getElementById('shop-results-status');
      target?.focus({preventScroll:true});
      target?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
    }else{
      const target=innerWidth<1024?toggle:sidebar.querySelector('.shop-filter-scroll');
      target?.focus({preventScroll:true});
    }
  }
  function open(){
    if(innerWidth>=1024||(overlay.classList.contains('show')&&!closing))return;
    cancelClose();showResults=false;
    content.append(sidebar);sidebar.classList.remove('hidden');
    overlay.classList.add('show');lock();
    toggle.setAttribute('aria-expanded','true');overlay.setAttribute('aria-hidden','false');
    close.focus({preventScroll:true});
    openFrame=requestAnimationFrame(()=>{openFrame=null;if(overlay.classList.contains('show'))panel.classList.add('open');});
  }
  function shut(options={}){
    if(!overlay.classList.contains('show')||closing)return;
    showResults=options.showResults===true;closing=true;panel.classList.remove('open');
    if(options.immediate||matchMedia('(prefers-reduced-motion:reduce)').matches){finish();return;}
    onEnd=event=>{if(event.target===panel&&event.propertyName==='transform')finish();};
    panel.addEventListener('transitionend',onEnd);timer=setTimeout(finish,350);
  }
  toggle.addEventListener('click',open);
  close.addEventListener('click',()=>shut());
  document.getElementById('mobileFiltersBackdrop')?.addEventListener('click',()=>shut());
  show?.addEventListener('click',()=>shut({showResults:true}));
  document.addEventListener('keydown',event=>{
    if(!overlay.classList.contains('show'))return;
    if(event.key==='Escape'){event.preventDefault();shut();}
    if(event.key==='Tab'){
      const controls=[...panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(e=>e.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first?.focus();}
    }
  });
  window.addEventListener('resize',()=>{if(innerWidth>=1024)shut({immediate:true});});
  window.addEventListener('pagehide',()=>shut({immediate:true}));
})();

