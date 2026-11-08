(function(root){
  // Separate Google business profile supplied by the owner for the farm shop.
  const place=Object.freeze({
    name:'Spaccio Aziendale Giuggioloni',
    featureId:'0x132d87924f3b24d1:0x80ae131f9c226b12',
    cid:'9272369709286845202',
    profileUrl:'https://share.google/qXPCdwBKjSw6ZjSwz',
    placeUrl:'https://www.google.com/maps?cid=9272369709286845202',
    embedUrl:'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5157.701182183927!2d13.478493986174648!3d43.48852461000009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132d87924f3b24d1%3A0x80ae131f9c226b12!2sSpaccio%20Aziendale%20Giuggioloni!5e0!3m2!1sit!2sit!4v1794177326367!5m2!1sit!2sit'
  });
  if(typeof module==='object'&&module.exports){module.exports=place;return;}
  root.GiuggioloniShopMap=place;
  for(const region of document.querySelectorAll('[data-shop-map]')){
    const button=region.querySelector('[data-shop-map-toggle]'),slot=region.querySelector('[data-shop-map-slot]');
    if(!button||!slot)continue;
    button.hidden=false;
    button.addEventListener('click',()=>{
      if(slot.hidden){
        const frame=document.createElement('iframe');
        frame.src=place.embedUrl;frame.title='Google Maps — '+place.name;
        frame.width='600';frame.height='450';frame.loading='lazy';
        frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
        slot.replaceChildren(frame);slot.hidden=false;
      }else{slot.replaceChildren();slot.hidden=true;}
      button.setAttribute('aria-expanded',String(!slot.hidden));
      button.textContent=slot.hidden?'Mostra la mappa dello spaccio':'Chiudi la mappa';
    });
  }
})(globalThis);
