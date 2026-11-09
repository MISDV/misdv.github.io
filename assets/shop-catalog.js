(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.ShopCatalog=factory();
})(globalThis,function(){
  'use strict';
  const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const currencyFormat=new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
  const money=value=>currencyFormat.format(value);
  const amount=value=>value===null||value===undefined||value===''?null:Number.isFinite(Number(value))?Number(value):null;
  function normalize(item){
    const image=item.immagine||item.image||item.img||'';
    const imageUrl=image?new URL(image,'https://agriturismogiuggioloni.it/'):null;
    const src=imageUrl?(imageUrl.origin==='https://agriturismogiuggioloni.it'?imageUrl.pathname+imageUrl.search:imageUrl.href):'';
    return {...item,titolo:item.titolo||item.title||'Prodotto',immagine:src,categoria:item.categoria||'Altro',tipologia:item.tipologia||'',prezzo:amount(item.prezzo),prezzo_massimo:amount(item.prezzo_massimo),prezzo_scontato:amount(item.prezzo_scontato),varianti:Array.isArray(item.varianti)?item.varianti:[]};
  }
  function priceText(item){
    const p=normalize(item),price=p.prezzo_scontato??p.prezzo;
    if(price===null)return 'Prezzo da definire';
    const value=p.prezzo_massimo!==null?`${money(price)} – ${money(p.prezzo_massimo)}`:money(price);
    return `${p.prezzo_da?'da ':''}${value}${p.unita==='kg'?' / kg':p.unita==='l'?' / l':p.unita==='pezzo'?' al pezzo':''}`;
  }
  const paths={
    Uova:'<path d="M12 3C8 3 5 11 5 15a7 7 0 0 0 14 0c0-4-3-12-7-12Z"/>',
    Olio:'<path d="M10 3h4v4l3 4v10H7V11l3-4V3ZM10 6h4M7 13h10"/>',
    Pasta:'<path d="M4 4c4 0 4 5 8 5s4-5 8-5M4 9c4 0 4 5 8 5s4-5 8-5M4 14c4 0 4 5 8 5s4-5 8-5M4 19c3 0 4 2 8 2s5-2 8-2"/>',
    Carni:'<path d="M5 3v5c0 4 6 4 6 0V3M8 3v18M19 3c-4 4-4 8 0 9v9M19 3v9"/>',
    'Pacchi famiglia':'<path d="m3 7 9-4 9 4v13l-9 3-9-3V7Zm0 0 9 4 9-4M12 11v12M7 5l10 4"/>'
  };
  function media(item,detail=false){
    const p=normalize(item);
    if(p.immagine)return `<img class="shop-product-photo" src="${escape(p.immagine)}" alt="${escape(p.titolo)}" width="640" height="480" ${detail?'fetchpriority="high"':'loading="lazy"'} decoding="async">`;
    return `<div class="shop-product-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${paths[p.categoria]||paths.Carni}</svg><span>Foto in aggiornamento</span></div>`;
  }
  function variants(item){
    const p=normalize(item);
    return p.varianti.length?`<dl class="shop-variants">${p.varianti.map(v=>`<div><dt>${escape(v.nome)}</dt><dd>${escape(priceText(v))}${v.totale!==undefined?`<small>${escape(money(v.totale))} la latta</small>`:''}</dd></div>`).join('')}</dl>`:'';
  }
  function card(item){
    const p=normalize(item),href='/shop/'+p.slug+'/';
    return `<a href="${escape(href)}" class="shop-product-card bg-white dark:bg-[#2c2018] rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-gray-100 dark:border-white/5 overflow-hidden group transition-all duration-300 flex flex-col h-full" data-product="${escape(p.slug)}">
      <div class="shop-card-media${p.immagine?'':' shop-card-placeholder'} relative h-56 overflow-hidden">${media(p)}</div>
      <div class="p-5 flex flex-col flex-grow">${p.promozione===true?'<span class="shop-promo-tag">Offerta dello spaccio</span>':''}<span class="text-xs text-gray-500 uppercase tracking-wide">${escape(p.categoria)}</span>
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-tight group-hover:text-primary transition-colors">${escape(p.titolo)}</h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${escape(p.tipologia)}</p>${p.prenotazione_obbligatoria?'<p class="shop-reservation-tag">Prenotazione telefonica necessaria</p>':''}
      <div class="shop-card-bottom mt-auto pt-4 border-t border-gray-100 dark:border-white/5"><span class="shop-price">${escape(priceText(p))}</span><span class="shop-card-link">Scopri il prodotto <span aria-hidden="true">→</span></span></div></div></a>`;
  }
  function notice(){
    return `<aside class="shop-local-notice" aria-labelledby="shop-local-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 10h18M4 10v11h16V10M2 10l2-7h16l2 7M8 21v-7h5v7"/></svg><div><h2 id="shop-local-title">Solo nello spaccio aziendale</h2><p>Vendita esclusivamente in loco. Nessuna vendita online o spedizione.</p><p class="shop-local-address">Via Acquaviva 34, Osimo</p><a href="tel:+393922529406" aria-label="Chiama lo Spaccio Aziendale Giuggioloni al +39 392 252 9406"><span class="shop-notice-phone">+39 392 252 9406</span></a></div></aside>`;
  }
  return {escape,money,normalize,priceText,media,variants,card,notice};
});
