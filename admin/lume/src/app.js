'use strict';
(function(){
 const C=window.LumeMenuCore,V=window.LumeMenuView;
 function mount(root,payload){
  if(!root||root.dataset.mounted==='true')return;
  const {site,menu,strings,lang,options={}}=payload,t=strings[lang];
  const errors=C.validate(site,menu);if(errors.length){console.error('Menù non inizializzato: dati non validi.',errors);return;}
  const p=C.prepare(site,menu,lang),$=s=>root.querySelector(s),$$=s=>Array.from(root.querySelectorAll(s)),key='lume:'+site.baseUrl+site.menuPath;
  const getStorage=k=>{try{return localStorage.getItem(key+':'+k);}catch(_){return null;}},setStorage=(k,v)=>{try{localStorage.setItem(key+':'+k,v);}catch(_){}},removeStorage=k=>{try{localStorage.removeItem(key+':'+k);}catch(_){}};
  let favoriteIds=[];try{const stored=JSON.parse(getStorage('favorites')||'[]');if(Array.isArray(stored))favoriteIds=stored.filter(id=>p.items.some(i=>i.id===id));}catch(_){}
  let bodyLocked=false,priorOverflow='';
  function stateFromLocation(){
    const state=C.stateFromUrl(location.href,p.categories);
    if(site.features.allergenGuide)state.exclusions=[];
    if(!p.items.some(i=>i.diet))state.diet='all';
    if(!p.items.some(i=>i.glassPrice!=null))state.priceBasis='bottle';
    return state;
  }
  let state=stateFromLocation(),currentDish=null,skipClose=false,restoreFocus=new WeakMap(),dishOpenedByUs=false,searchTimer,themeMode=getStorage('theme')||'auto';
  let availabilityTimer,displayedAvailability='';
  const hasSchedules=p.items.some(i=>i.schedule);
  const media=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):{matches:false,addEventListener(){}},reduced=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
  state.favorites=favoriteIds;state.badgeLabels={house:t.house,recommended:t.recommended,popular:t.popular};
  function announce(message){$('[data-announcement]').textContent=message;}
  function applyTheme(mode,persist=true){themeMode=['auto','light','dark'].includes(mode)?mode:'auto';const theme=themeMode==='auto'?(media.matches?'dark':'light'):themeMode;root.dataset.theme=theme;const btn=$('[data-action="theme"]');btn.setAttribute('aria-pressed',String(theme==='dark'));btn.innerHTML=V.icon(theme==='dark'?'sun':'moon');$('[data-theme-mode]').value=themeMode;if(document.body.classList.contains('lume-document')){document.body.style.backgroundColor=site.branding[theme].paper;document.documentElement.style.colorScheme=theme;}if(persist){if(themeMode==='auto')removeStorage('theme');else setStorage('theme',themeMode);}}
  applyTheme(themeMode,false);media.addEventListener?.('change',()=>{if(themeMode==='auto')applyTheme('auto',false);});
  function updateFavorites(){state.favorites=favoriteIds;$$('[data-favorite]').forEach(btn=>{const id=btn.dataset.favorite,item=p.items.find(i=>i.id===id),saved=favoriteIds.includes(id);btn.setAttribute('aria-pressed',String(saved));btn.setAttribute('aria-label',(saved?t.unsave:t.save)+': '+item.name);const span=btn.querySelector('span');if(span)span.textContent=saved?t.unsave:t.save;});}
  function chips(){const result=[],add=(field,text,value)=>result.push({field,text,value});if(state.query)add('query','“'+state.query+'”');if(state.category!=='all')add('category',p.categories.find(c=>c.id===state.category).name);if(state.diet!=='all')add('diet',t[state.diet]);if(state.wineType!=='all')add('wineType',t[state.wineType]);if(state.maxPrice!=null)add('maxPrice',t.maxPrice+' '+V.money(state.maxPrice,p));if(state.priceBasis!=='bottle')add('priceBasis',t.priceBasis+': '+t.glass);if(state.onlyAvailable)add('onlyAvailable',t.availableOnly);if(state.favoritesOnly)add('favoritesOnly',t.favoritesOnly);if(state.sort!=='menu')add('sort',t.sort+': '+t[state.sort==='name'?'nameOrder':state.sort==='price-asc'?'priceAsc':'priceDesc']);state.exclusions.forEach(id=>add('exclusion',t.without+' '+p.allergens.find(a=>a.id===id).name,id));return result;}
  function scrollControls(){const nav=$('.lm-mobile-categories'),left=$('[data-action="previous"]'),right=$('[data-action="next"]');left.disabled=nav.scrollLeft<=1;right.disabled=nav.scrollLeft+nav.clientWidth>=nav.scrollWidth-1;}
  function syncControls(){
   $$('[data-field]').forEach(input=>{const field=input.dataset.field;if(field==='query'&&searchTimer!=null)return;if(input.type==='checkbox')input.checked=Boolean(state[field]);else if(input.value!==String(state[field]??''))input.value=state[field]??'';});
   $$('[data-category]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.category===state.category)));$$('[data-diet]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.diet===state.diet)));$$('[data-wine]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.wine===state.wineType)));
   const type=p.categories.find(c=>c.id===state.category)?.type;$('.lm-diet').hidden=!p.items.some(i=>i.diet)||['wine','drink'].includes(type);$('.lm-wine-types').hidden=type!=='wine';$$('[data-exclusion]').forEach(box=>box.checked=state.exclusions.includes(Number(box.dataset.exclusion)));
   $('[data-action="clear-search"]').hidden=!state.query;const n=$('[data-exclusion-count]');n.textContent=state.exclusions.length;n.hidden=!state.exclusions.length;
   const active=chips(),el=$('.lm-active-filters');el.hidden=!active.length;el.innerHTML=active.map(x=>`<button data-remove="${C.escape(x.field)}" ${x.value?`data-value="${x.value}"`:''} aria-label="${C.escape(t.remove+': '+x.text)}">${C.escape(x.text)}${V.icon('x')}</button>`).join('')+(active.length?`<button data-action="reset">${C.escape(t.resetFilters)}</button>`:'');
   const filtered=C.select(p,state,{ignoreCategory:true});$$('[data-count]').forEach(count=>{count.textContent=count.dataset.count==='all'?filtered.length:filtered.filter(i=>i.category===count.dataset.count).length;});
   updateFavorites();scrollControls();
  }
  const availabilityKey=()=>p.items.map(i=>i.id+':'+i.availabilityState).join('|');
  function render(){const items=C.select(p,state);$('.lm-sections').innerHTML=V.sections(items,p,t,{...options,interactive:true},state);$('.lm-empty').hidden=items.length>0;$('.lm-results').textContent=items.length+' '+(items.length===1?t.result:t.resultPlural);const feature=$('.lm-feature-slot'),markup=V.feature(p,t,options);if(feature.innerHTML!==markup)feature.innerHTML=markup;$('.lm-feature')?.toggleAttribute('hidden',state.category!=='all'||chips().length>0);syncControls();imageFallbacks();const next=availabilityKey();if(next!==displayedAvailability){displayedAvailability=next;refreshOpenDish();}}
  function refreshAvailability(){if(printSnapshot!==null)return;C.select(p,C.defaults());if(availabilityKey()!==displayedAvailability)render();}
  function scheduleAvailability(){clearTimeout(availabilityTimer);availabilityTimer=null;if(!hasSchedules||document.hidden)return;availabilityTimer=setTimeout(()=>{availabilityTimer=null;refreshAvailability();scheduleAvailability();},60000-(Date.now()%60000)+25);}
  function writeUrl(push=false,dish=currentDish){const url=C.urlForState(location.href,state,dish);try{history[push?'pushState':'replaceState']({lume:true,dish},'',url);}catch(_){}$$('[data-language]').forEach(a=>{const target=new URL(a.getAttribute('href'),location.href);target.search=url.search;target.hash='';a.href=target.href;});}
  function cancelSearch(){clearTimeout(searchTimer);searchTimer=null;}
  function flushSearch(){if(searchTimer!=null){cancelSearch();state.query=$('[data-field="query"]').value.trim().slice(0,120);}}
  function commit(push=false){flushSearch();render();writeUrl(push);}
  function openPanel(dialog,opener){if(!dialog||dialog.open)return;restoreFocus.set(dialog,opener||document.activeElement);if(!bodyLocked){priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';bodyLocked=true;}if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');dialog.querySelector('.lm-close')?.focus();}
  function closePanel(dialog){if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');dialog.dispatchEvent(new Event('close'));}}
  function dismissUnavailableDish(){currentDish=null;dishOpenedByUs=false;skipClose=true;const dialog=$('#lm-dish-dialog');if(dialog.open)closePanel(dialog);skipClose=false;writeUrl(false,null);announce(t.suspended);}
  function refreshOpenDish(){
   const dialog=$('#lm-dish-dialog');if(!dialog.open||!currentDish)return;
   const item=p.items.find(i=>i.id===currentDish);if(!C.isVisible(item,site)){dismissUnavailableDish();return;}
   const scroll=$('.lm-dish-scroll'),top=scroll.scrollTop,active=document.activeElement,inside=scroll.contains(active),attrs=['data-action','data-favorite','data-dish','data-copy-link'].filter(a=>active?.hasAttribute(a)).map(a=>[a,active.getAttribute(a)]);
   const fallback=scroll.querySelector('.lm-copy-fallback'),copy=fallback&&!fallback.hidden?{value:fallback.querySelector('input').value,start:fallback.querySelector('input').selectionStart,end:fallback.querySelector('input').selectionEnd}:null;
   scroll.innerHTML=V.details(item,p,t,options);updateFavorites();imageFallbacks();
   if(copy){const label=scroll.querySelector('.lm-copy-fallback'),input=label.querySelector('input');label.hidden=false;input.value=copy.value;input.setSelectionRange(copy.start,copy.end);}
   if(inside&&attrs.length){const target=Array.from(scroll.querySelectorAll('button,a,input')).find(el=>attrs.every(([a,v])=>el.getAttribute(a)===v));target?.focus({preventScroll:true});}
   scroll.scrollTop=top;
  }
  function openDish(id,opener,{push=true}={}){refreshAvailability();const item=p.items.find(i=>i.id===id&&C.isVisible(i,site));if(!item){dismissUnavailableDish();return;}const dialog=$('#lm-dish-dialog');if(!dialog.open)restoreFocus.set(dialog,opener||document.activeElement);currentDish=id;$('.lm-dish-scroll').innerHTML=V.details(item,p,t,options);$('.lm-dish-scroll').scrollTop=0;updateFavorites();imageFallbacks();if(!dialog.open)openPanel(dialog,opener);else dialog.querySelector('.lm-close').focus();if(push){dishOpenedByUs=true;writeUrl(true,id);}else writeUrl(false,id);}
  $$('dialog').forEach(dialog=>{
   dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closePanel(dialog);}});
   dialog.addEventListener('close',()=>{if(bodyLocked&&!$$('dialog').some(d=>d.open)){document.body.style.overflow=priorOverflow;bodyLocked=false;}if(dialog.id==='lm-dish-dialog'){if(!skipClose&&currentDish){if(dishOpenedByUs){dishOpenedByUs=false;history.back();}else{currentDish=null;writeUrl(false,null);}}}const previous=restoreFocus.get(dialog);if(previous?.isConnected)previous.focus({preventScroll:true});else $('[data-action="categories"]')?.focus({preventScroll:true});});
  });
  function imageFallbacks(){$$('img').forEach(img=>{if(img.dataset.fallbackBound)return;img.dataset.fallbackBound='true';const fail=()=>{const box=img.closest('.lm-card,.lm-feature');if(box){box.classList.add('lm-image-failed-parent');img.parentElement.classList.add('lm-image-failed');}else img.classList.add('lm-image-failed');};img.addEventListener('error',fail);if(img.complete&&img.naturalWidth===0&&img.currentSrc)fail();});}
  function reset(){cancelSearch();const favorites=favoriteIds;state=C.defaults();state.favorites=favorites;state.badgeLabels={house:t.house,recommended:t.recommended,popular:t.popular};commit(true);}
  root.addEventListener('submit',event=>{if(event.target.matches('.lm-search')){event.preventDefault();cancelSearch();state.query=$('[data-field="query"]').value.trim().slice(0,120);commit();}});
  root.addEventListener('input',event=>{const input=event.target;if(input.dataset.field==='query'){cancelSearch();searchTimer=setTimeout(()=>{searchTimer=null;state.query=input.value.trim().slice(0,120);commit();},120);} });
  root.addEventListener('change',event=>{const el=event.target;if(el.dataset.field){const field=el.dataset.field;if(field==='query')return;if(field==='category')C.changeCategory(state,el.value,p.categories);else if(field==='maxPrice')state.maxPrice=el.value===''||!Number.isFinite(Number(el.value))||Number(el.value)<0?null:Number(el.value);else state[field]=el.type==='checkbox'?el.checked:el.value;commit(field==='category');}else if(el.dataset.exclusion){const id=Number(el.dataset.exclusion);state.exclusions=el.checked?[...new Set([...state.exclusions,id])]:state.exclusions.filter(a=>a!==id);commit();}else if(el.hasAttribute('data-theme-mode'))applyTheme(el.value);});
  root.addEventListener('click',async event=>{const el=event.target.closest('button,a');if(!el||!root.contains(el))return;
   if(el.hasAttribute('data-close')){event.preventDefault();closePanel(el.closest('dialog'));return;}
   if(el.dataset.dish){event.preventDefault();openDish(el.dataset.dish,el);return;}
   if(el.dataset.category){event.preventDefault();C.changeCategory(state,el.dataset.category,p.categories);commit(true);const dialog=el.closest('dialog');if(dialog)closePanel(dialog);const mobile=$('.lm-mobile-categories [data-category="'+state.category+'"]');if(el.closest('.lm-mobile-categories'))mobile?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:reduced.matches?'auto':'smooth'});return;}
   if(el.dataset.diet){state.diet=el.dataset.diet;commit(true);return;}if(el.dataset.wine){state.wineType=el.dataset.wine;commit(true);return;}
   if(el.dataset.favorite){const id=el.dataset.favorite,saved=favoriteIds.includes(id);favoriteIds=saved?favoriteIds.filter(x=>x!==id):[...favoriteIds,id];state.favorites=favoriteIds;setStorage('favorites',JSON.stringify(favoriteIds));if(state.favoritesOnly){render();const replacement=$('[data-favorite="'+id+'"]');(replacement||$('[data-field="favoritesOnly"]')).focus({preventScroll:true});}else updateFavorites();announce(saved?t.favoriteRemoved:t.favoriteSaved);return;}
   if(el.dataset.remove){const f=el.dataset.remove;if(f==='exclusion')state.exclusions=state.exclusions.filter(x=>x!==Number(el.dataset.value));else state[f]=C.defaults()[f];commit();$('[data-action="search-filters"]').focus({preventScroll:true});return;}
   const action=el.dataset.action;if(!action)return;event.preventDefault();
   if(['info','allergens','categories','exclusions','privacy'].includes(action)){openPanel($('#lm-'+action+'-dialog'),el);return;}
   if(action==='search-filters'){const options=$('#lm-search-options');options.hidden=!options.hidden;el.setAttribute('aria-expanded',String(!options.hidden));return;}
   if(action==='theme'){applyTheme(root.dataset.theme==='dark'?'light':'dark');return;}
   if(action==='clear-search'){cancelSearch();state.query='';commit();$('[data-field="query"]').focus();return;}
   if(action==='reset'){reset();return;}if(action==='clear-exclusions'){state.exclusions=[];commit();return;}
   if(action==='previous'||action==='next'){const nav=$('.lm-mobile-categories'),delta=Math.max(160,nav.clientWidth*.75)*(action==='next'?1:-1);if(nav.scrollBy)nav.scrollBy({left:delta,behavior:reduced.matches?'auto':'smooth'});else nav.scrollLeft+=delta;scrollControls();return;}
   if(action==='share'){
    const dialog=el.closest('#lm-dish-dialog'),id=el.dataset.id;if(!dialog?.open||currentDish!==id)return;
    const shareBase=location.protocol==='file:'?site.baseUrl+site.menuPath+(lang===site.defaultLanguage?'':lang+'/'):location.href,url=C.urlForState(shareBase,state,id).href;
    try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(url);if(!dialog.open||currentDish!==id)return;announce(t.copied);dialog.querySelector('[data-action="share"]').innerHTML=V.icon('check')+C.escape(t.copied);dialog.querySelector('.lm-copy-fallback').hidden=true;}
    catch(_){if(!dialog.open||currentDish!==id)return;const label=dialog.querySelector('.lm-copy-fallback'),input=label.querySelector('input');label.hidden=false;input.value=url;input.focus({preventScroll:true});input.select();input.scrollIntoView?.({block:'nearest'});}
    return;
   }
   if(action==='clear-device'){removeStorage('favorites');removeStorage('theme');favoriteIds=[];state.favoritesOnly=false;applyTheme('auto',false);render();$('[data-device-result]').textContent=t.deviceCleared;return;}
   if(action==='top')root.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
  });
  const nav=$('.lm-mobile-categories');let drag=null,blockClick=false;
  nav.addEventListener('pointerdown',ev=>{if(ev.pointerType==='touch'||ev.button!==0)return;drag={id:ev.pointerId,x:ev.clientX,y:ev.clientY,left:nav.scrollLeft,moved:false};});
  nav.addEventListener('pointermove',ev=>{if(!drag||drag.id!==ev.pointerId)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return;}if(Math.abs(dx)>8){drag.moved=true;nav.setPointerCapture?.(ev.pointerId);nav.scrollLeft=drag.left-dx;ev.preventDefault();scrollControls();}});
  const endDrag=()=>{if(drag?.moved){blockClick=true;setTimeout(()=>blockClick=false,0);}drag=null;};nav.addEventListener('pointerup',endDrag);nav.addEventListener('pointercancel',()=>drag=null);nav.addEventListener('click',ev=>{if(blockClick){ev.preventDefault();ev.stopPropagation();blockClick=false;}},true);
  nav.addEventListener('keydown',ev=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;ev.preventDefault();const left=ev.key==='Home'?0:ev.key==='End'?nav.scrollWidth:nav.scrollLeft+(ev.key==='ArrowRight'?180:-180);if(nav.scrollTo)nav.scrollTo({left,behavior:reduced.matches?'auto':'smooth'});else nav.scrollLeft=left;scrollControls();});nav.addEventListener('scroll',scrollControls,{passive:true});window.addEventListener('resize',scrollControls);
  window.addEventListener('popstate',()=>{const priorDish=currentDish,priorOpener=restoreFocus.get($('#lm-dish-dialog'));cancelSearch();state=stateFromLocation();state.favorites=favoriteIds;state.badgeLabels={house:t.house,recommended:t.recommended,popular:t.popular};render();const id=new URL(location.href).searchParams.get('dish');dishOpenedByUs=false;if(id&&p.items.some(i=>i.id===id)){openDish(id,null,{push:false});}else{currentDish=null;skipClose=true;if($('#lm-dish-dialog').open)closePanel($('#lm-dish-dialog'));skipClose=false;writeUrl(false,null);if(priorDish){const focusTarget=priorOpener?.isConnected?priorOpener:$('[data-dish="'+priorDish+'"]');(focusTarget||$('[data-action="categories"]')).focus({preventScroll:true});}}});
  window.addEventListener('storage',event=>{if(event.key===key+':theme')applyTheme(event.newValue||'auto',false);if(event.key===key+':favorites'){try{const value=JSON.parse(event.newValue||'[]');favoriteIds=Array.isArray(value)?value.filter(id=>p.items.some(i=>i.id===id)):[];state.favorites=favoriteIds;render();}catch(_){}}});
  let printSnapshot=null;window.addEventListener('beforeprint',()=>{printSnapshot=$('.lm-sections').innerHTML;$('.lm-sections').innerHTML=V.sections(C.select(p,C.defaults()),p,t,options);$$('.lm-fallback-details,.lm-fallback-info').forEach(d=>d.open=true);});window.addEventListener('afterprint',()=>{if(printSnapshot!==null){$('.lm-sections').innerHTML=printSnapshot;printSnapshot=null;updateFavorites();imageFallbacks();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshAvailability();scheduleAvailability();});
  window.addEventListener('pageshow',()=>{refreshAvailability();scheduleAvailability();});
  window.addEventListener('pagehide',()=>{clearTimeout(availabilityTimer);availabilityTimer=null;});
  window.addEventListener('scroll',()=>{$('[data-action="top"]').hidden=window.scrollY<550;},{passive:true});
  if(new URL(location.href).searchParams.get('mode')==='table'&&site.features.compactQr)root.classList.add('lm-compact');root.classList.add('lm-enhanced');
  if(chips().length||hasSchedules){
   render();
  }else{
   const count=C.select(p,state).length;
   $('.lm-results').textContent=count+' '+(count===1?t.result:t.resultPlural);
   $('.lm-empty').hidden=count>0;
   displayedAvailability=availabilityKey();
   syncControls();
   imageFallbacks();
  }
  root.dataset.mounted='true';
  const deep=new URL(location.href).searchParams.get('dish');if(deep)openDish(deep,null,{push:false});else writeUrl();scheduleAvailability();
  return {getState:()=>({...state,exclusions:[...state.exclusions],favorites:[...favoriteIds]}),getPrepared:()=>p,refresh:()=>{render();scheduleAvailability();},setTheme:applyTheme};
 }
 window.LumeMenu={mount};const root=document.getElementById('lume-menu'),data=root?.nextElementSibling;if(data?.matches('script[data-lume-payload]')){try{window.LumeMenuInstance=mount(root,JSON.parse(data.textContent));}catch(err){console.error('Menù disponibile in modalità statica.',err);}}
})();
