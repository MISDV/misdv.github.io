import shopMap from '../assets/shop-map.js';
import { origin } from './site-seo.mjs';

export const shopName=shopMap.name;
export const shopId=origin+'/shop/#spaccio';
export function shopBusiness(data){
  const contact=data.contatto;
  return {
    '@type':'Store','@id':shopId,name:shopName,url:origin+'/spaccio/',
    description:'Spaccio aziendale a Osimo con carni, salumi, formaggi, pasta fresca all’uovo, uova, olio e pasta secca. Vendita esclusivamente in loco presso la struttura dell’Agriturismo Giuggioloni.',
    logo:origin+'/logo.png',image:[origin+'/assets/shop-vetrina.webp',origin+'/assets/spaccio/interno-1200.webp',origin+'/assets/spaccio/carni-1200.webp'],
    address:{'@type':'PostalAddress',streetAddress:contact.via,addressLocality:'Osimo',addressRegion:'AN',postalCode:'60027',addressCountry:'IT'},
    telephone:contact.numeri_telefono[0].replace(/[^+\d]/g,''),email:contact.mail,
    hasMap:shopMap.placeUrl,sameAs:[shopMap.profileUrl,shopMap.placeUrl],currenciesAccepted:'EUR',
    mainEntityOfPage:{'@id':origin+'/spaccio/#pagina'}
  };
}
