# File di gestione e generazione

**Progetto IN PAUSA dal 13 novembre 2026, su richiesta dell'utente.**
Prima di riprendere leggere [STATO-PROGETTO.md](STATO-PROGETTO.md): orari da
confermare (alta), nuove foto del locale (medio-bassa), foto/prezzi/disponibilità
degli item dello shop (molto bassa). Attendere una nuova richiesta dell'utente.

Il pannello admin è archiviato e non viene più utilizzato per aggiornare il sito.
L’audit più recente è [AUDIT-COMPLETO-2026-11-13.md](AUDIT-COMPLETO-2026-11-13.md):
include SEO, prestazioni, verifiche mobile e limiti delle misurazioni locali.
Il servizio permette soltanto richieste GET e restituisce dati in sola lettura:
non pubblica modifiche, menù o immagini. La cartella `admin/` resta esclusa
dalla pubblicazione Pages tramite `_config.yml`.

I contenuti si aggiornano nei file locali. Dopo modifiche a `menu.json`, esegui:

```powershell
node admin/sync-menu.mjs
node admin/build-site-assets.mjs
```

Il comando aggiorna la carta `/menu/`, l’anteprima nella home e le versioni
italiana e inglese di Lume, comprese le pagine di stampa.

Per allineare header e footer, rigenerare le pagine informative e aggiornare i menù:

```powershell
node admin/sync-layout.mjs
node admin/build-pages.mjs
node admin/sync-menu.mjs
node admin/build-site-assets.mjs
```

Le sorgenti sono `admin/build-pages.mjs` e `admin/build-english.mjs`.
Header e footer comuni sono ricavati dalla home tramite `admin/site-layout.mjs`.

La firma **Firmato DoubleN** viene inserita nei footer pubblici da
`admin/site-credit.mjs`, integrato nei generatori di sito, shop e Lume.
I file del kit sono in `assets/doublen/`: CSS, configurazione e popup JavaScript;
il logo SVG è incluso nel componente e non richiede immagini esterne.
Per compilare i recapiti DoubleN modifica `assets/doublen/doublen-config.js`:
telefono, email e profilo Google sono inizialmente vuoti, come nel kit fornito.
Il sito del portfolio è già configurato. I contatti dell’agriturismo restano distinti.
Con JavaScript la firma apre il popup; senza JavaScript apre il portfolio.
Nelle pagine inglesi firma e popup sono tradotti. La firma segue il tema di
shop e Lume e viene nascosta soltanto nella stampa. Non carica servizi esterni
automaticamente. Dopo modifiche al kit esegui la sequenza completa dei quattro
comandi sopra: i parametri di versione degli asset sono calcolati dai contenuti.

`dati.json` resta la sorgente dei contatti, degli orari, dei social e dei testi
condivisi. `admin/site-data.mjs` li inserisce direttamente negli HTML durante
la generazione: il browser non richiede più questo JSON e non deve eseguire
JavaScript per leggere questi contenuti. Dopo modifiche a `dati.json`, esegui
la sequenza completa dei quattro comandi sopra e pubblica anche gli HTML generati.
Le traduzioni inglesi restano nelle rispettive sorgenti; orari, contatti e link
social sono sincronizzati anche nelle pagine inglesi. Il file tecnico JSON non
è una pagina da aggiungere alla sitemap: sono le pagine HTML a presentare le
informazioni da rendere ricercabili. `menu.json` e `items.json` continuano a
gestire, rispettivamente, piatti e prodotti; i filtri dello shop usano `items.json`.
La pagina inglese usa lo stesso formato con testi e navigazione tradotti.
La storia e la home si modificano direttamente nei rispettivi HTML.
Gli schemi SEO sono generati durante la build: `admin/menu-schema.mjs`
usa lo stesso catalogo localizzato dell’HTML per le carte italiana e inglese,
compresi condizioni, portate, inclusioni, prezzi e unità di misura.
`admin/site-business.mjs` mantiene il ristorante sincronizzato con i contatti
e genera AboutPage dai metadati della storia. `admin/shop-business.mjs`
gestisce l’identità distinta dello spaccio nelle sue pagine e nei prodotti.
Le coordinate dei due punti Google Maps, verificate dai link del proprietario
il 12 novembre 2026, sono centralizzate in `assets/place-map.js` e
`assets/shop-map.js`: non sostituirle con il centro della vista dell’iframe.
`admin/site-metadata.mjs` completa Open Graph, Twitter e icona Apple nei
generatori, leggendo dimensioni e tipo delle immagini locali durante la build.
Non aggiunge richieste o JavaScript al caricamento delle pagine.
I collegamenti al menù del sito portano a `/menu/`. L’accesso a `/lume/`
è nel riquadro finale della pagina `/menu/`; Lume mantiene i propri link interni
per lingue, piatti e stampa.
La navigazione pubblica porta a `/fattoria/` per animali, orto, storia e locale,
e a `/spaccio/` per i prodotti. Dal 13 novembre 2026 il catalogo `/shop/` e le
relative schede sono disponibili tramite link diretto: nessuna pagina esterna
alla cartella shop deve collegarli. Tutti i suoi HTML hanno `noindex,follow`
e sono esclusi dalla sitemap, anche dopo una nuova build. Non bloccare questi
URL in robots.txt: Google deve poter leggere il noindex. La navigazione tra
catalogo e prodotti rimane interna allo shop; i link pubblici «Prodotti»
nell’header e nel footer portano allo spaccio. Il vecchio `/shop.html`
reindirizza a `/spaccio/`. L’identità strutturata dello spaccio è
`https://agriturismogiuggioloni.it/spaccio/#spaccio`.
La carta inglese è `/menu/en/` e apre `/lume/en/`. `sync-menu.mjs` rigenera
entrambe le carte dagli stessi prezzi in `menu.json`; `admin/menu-english.mjs`
riutilizza le traduzioni di Lume per nomi, descrizioni e portate dei menù fissi.
Le due carte hanno selettore Italiano/English e riferimenti hreflang reciproci.
`assets/language.js` ricorda la lingua in `giuggioloni-language`, dando sempre
precedenza alla lingua dichiarata dalla pagina: le pagine italiane e lo shop
aprono `/menu/`, quelle inglesi aprono `/menu/en/`. La preferenza salvata serve
solo come ripiego se una pagina non dichiara Italiano o English. I link di cambio
lingua restano espliciti e non ci sono reindirizzamenti automatici da `/menu/`.
Gli script sono versionati
da `admin/site-language.mjs` e inseriti dai generatori.

Il logo comune è `/logo.png`, trasparente, come in `shop/index.html`. Il contenitore
`.shop-brand-mark` mantiene le dimensioni del riferimento: 48/64 px nell’header
e 56 px nel footer, con immagine da 40/48 px. Anche Lume usa lo stesso PNG.
Nel footer scuro il cerchio resta chiaro, così il simbolo mantiene la leggibilità.

Il catalogo è in `shop/index.html` e si apre all’indirizzo `/shop/`.
La pagina di presentazione dello **Spaccio Aziendale Giuggioloni** è `/spaccio/`:
foto del punto vendita e dei prodotti, informazioni sulla vendita in loco,
contatti e mappa della distinta attività Google. Si rigenera con
`node admin/build-spaccio.mjs`, eseguito anche da `build-pages.mjs`.
Lo stile specifico è `assets/spaccio.css`; il catalogo conserva la sua grafica.
Il prezzo del pacco famiglia è letto da `items.json`, i contatti da `dati.json`.
Gli orari del ristorante non sono applicati allo spaccio: finché non confermati,
la pagina invita a telefonare e non dichiara orari nel dato strutturato Store.
L’identificatore dello Store resta `/shop/#spaccio` per mantenere la stessa entità
nelle pagine prodotto; il suo URL di presentazione punta a `/spaccio/`.
Le foto del proprietario sono in `assets/spaccio/`, con varianti AVIF/WebP
480, 800 e 1200 px; viene riutilizzata anche l’insegna `assets/shop-vetrina.webp`.
Gli originali selezionati sono `IMG20261107183323.jpg` (interno),
`IMG20261107154932.jpg` (carni), `IMG20261107155916.jpg` (uova),
`IMG20261107004642.jpg` (olio/pasta).
La foto social 1200×630 deriva da `IMG20261107183308.jpg` (insegna).
La sezione del frigo usa `IMG20261107183049.jpg` (salumi),
`IMG20261107183043.jpg` (formaggi) e `IMG20261107004713.jpg` (altri prodotti).
È distinta dal banco macelleria e ha una galleria statica, senza slider.
`pasta fresca dietro.jpg` mostra la pasta fresca all’uovo esposta nel banco carne:
chitarrine, tagliatelle, cappelletti e ravioli. La pagina la distingue dalla pasta
secca De Carlonis; per prezzi e disponibilità rimanda al telefono, senza inserire
prezzi non confermati nel catalogo. Anche queste foto hanno varianti AVIF/WebP.
Il file `shop.html` è soltanto un rimando per i vecchi collegamenti. Le immagini
relative del catalogo sono risolte rispetto a `/items.json`, nella radice del sito.

I prodotti dello spaccio si aggiornano in `items.json`. Dopo le modifiche esegui
`node admin/build-shop.mjs`: genera il catalogo statico e le pagine `/shop/<slug>/`
con noindex, aggiorna le versioni degli asset e mantiene gli URL shop esclusi
dalla sitemap. Viene eseguito anche da `build-pages.mjs`.

Il listino **asporto** è separato, all’URL `/shop/asporto/`, e si aggiorna in
`admin/asporto.json`. Non è presente in `items.json`, nelle categorie dello shop,
nei menu di navigazione o nella sitemap; l’HTML contiene `noindex,follow`.
Si accede tramite il link diretto, senza aggiungere una voce nel catalogo dello shop.
`node admin/build-asporto.mjs` lo rigenera; viene eseguito anche da `build-shop.mjs`.
Per i prezzi non ancora confermati usa `prezzo: null` e `unita: null`: i prezzi
di pollo e oca da asporto restano distinti da quelli del catalogo dello spaccio.
`tipologie_da_confermare: true` mostra la nota sulle tipologie di pasta fresca.
I contenuti sono nell’HTML, senza richieste JSON dal browser; lo stile specifico
è in `assets/shop-asporto.css` e riutilizza header, footer e firma DoubleN dello shop.

`assets/shop-catalog.js` condivide prezzi e schede fra generazione e filtri del browser;
`assets/shop-products.css` aggiunge avvisi, segnaposto e stile delle schede senza
modificare la grafica generale dello shop. Per aggiungere foto usa `immagine`.
Non indicare zero per un prezzo sconosciuto: usa `prezzo: null`.
Le unità `uovo` e `pacco` rendono espliciti i prezzi per singolo uovo e per
confezione; `peso_confezione_g` descrive il peso del pacco di pasta.
La pasta De Carlonis mantiene l’URL `/shop/pasta-secca-campofilone/` già utilizzato,
con titolo, marchio, confezione da 250 g e prezzo aggiornati.
I costi aggiuntivi vanno in `supplementi`, con `nome` e `prezzo`: la pelatura
dell’oca è mostrata separatamente dal prezzo al kg, sia nel catalogo sia nella
pagina prodotto. Anche il dato strutturato distingue il prezzo a peso dal
supplemento fisso tramite `CompoundPriceSpecification`.
Il pacco famiglia è in evidenza con `promozione: true` in `items.json`: il prezzo
della promo viene generato dal prezzo del prodotto. Il richiamo nello shop,
la scheda nel catalogo e la pagina del pacco riportano l’offerta, senza aggiungere
sconti o scadenze. Per disattivarla imposta il valore a `false` e rigenera lo shop.
Il catalogo JSON viene richiesto con una versione legata al contenuto. Se il
caricamento dei filtri fallisce, rimangono visibili le schede statiche con i link.
La barra categorie/filtri ha uno scorrimento indipendente su desktop; su mobile
scorre il contenuto del pannello mantenendo visibile il pulsante di chiusura.
Le tipologie sono create solo per una categoria selezionata che ne abbia almeno
due. Cambiando categoria vengono azzerate, per evitare filtri rimasti attivi.
Su mobile l’ordinamento usa il selettore nativo, il pannello offre Azzera/Mostra
prodotti e blocca lo sfondo mantenendo la posizione di scorrimento. I controlli
sono in `assets/shop-controls.js`. I segnaposto delle foto sono più compatti;
la griglia viene aggiornata soltanto se cambia l’elenco dei risultati.
Le varianti dell’olio riportano sia il prezzo al litro sia il totale della latta.
Il pacco famiglia richiede prenotazione telefonica; tutte le pagine indicano
la vendita esclusivamente nello spaccio. Non sono previste vendita online o spedizioni.

Il popup prenotazioni è gestito da `assets/booking.js` e `assets/booking.css`.
Il CSS del sito viene riunito in `assets/site.min.css` da `admin/site-assets.mjs`:
include lo stile storico, gli extra, il popup e `admin/site-accessibility.css`.
Dopo modifiche a questi CSS esegui `node admin/build-site-assets.mjs` e pubblica
anche gli HTML aggiornati: il parametro di versione dipende dal contenuto.
Shop e Lume mantengono i propri fogli di stile separati.
I font del sito pubblico usano sottoinsiemi locali dei caratteri comuni, con gli
stessi glifi, pesi, kerning e legature. I font originali restano disponibili come
fallback per gli altri caratteri. `admin/site-fonts.css` viene riunito nel CSS
comune; i WOFF2 generati sono già inclusi nel repository. Solo per rigenerare
i sottoinsiemi, con `fonttools[woff]` installato, eseguire `python admin/build-fonts.py`
e poi `node admin/build-site-assets.mjs`. Non serve Python nella build ordinaria
o su GitHub Pages. Le licenze sono in `assets/site-fonts/OFL-*.txt`.

`build-site-assets.mjs` aggiorna anche le versioni di `site.js`, `booking.js`,
`consent.js` e `menu.mjs` dai rispettivi contenuti, e rigenera la sitemap con
`admin/build-sitemap.mjs`. La sitemap include solo HTML indicizzabili con
canonical corrispondente al proprio percorso, escludendo redirect, privacy,
Lume e catalogo privato. La generazione si interrompe se una pagina shop perde
il noindex o se un'altra pagina introduce un collegamento al catalogo.
Non aggiungere un Disallow per lo shop nel robots.txt: Google deve poter leggere
il suo noindex. Le date lastmod non vengono inventate a ogni build.

Il numero di prenotazione è +39 392 252 9406. La mappa si carica soltanto
quando il popup viene aperto; senza JavaScript i pulsanti chiamano direttamente.

La scheda Google Maps e l’iframe sono definiti in `assets/place-map.js`.
Footer, popup, pagina inglese e Lume usano lo stesso riferimento, ripreso anche
dal campo SEO `hasMap` della home.

Lo spaccio è una distinta attività Google: **Spaccio Aziendale Giuggioloni**.
La sua scheda, con CID `9272369709286845202`, e l’embed esatto fornito dal
proprietario sono in `assets/shop-map.js`; la mappa si carica solo su richiesta.
Il link condiviso `https://share.google/qXPCdwBKjSw6ZjSwz` apre la scheda Google
dello spaccio ed è riportato anche in `sameAs`. Le indicazioni e l’iframe
mantengono il riferimento Maps tramite CID fornito dal proprietario.
`admin/shop-business.mjs` definisce l’entità `Store` con ID `/spaccio/#spaccio`:
catalogo e prodotti usano questa entità come attività e venditore, con una
propria scheda Maps. L’agriturismo mantiene l’entità Restaurant e la sua mappa.
Non copiare gli orari del ristorante nello spaccio: non sono stati comunicati.
Le coordinate di centratura nell’iframe non vengono usate come coordinate
dell’attività. Il riferimento è la scheda specifica indicata dal proprietario.
Riferimenti: [Google LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)
e [Schema.org Store](https://schema.org/Store).

Prima del push pubblica insieme i file sorgente modificati e i file HTML,
CSS e JavaScript generati. GitHub Pages continua a servire file statici.
I controlli prima della pubblicazione servono a verificare link, immagini,
numero di piatti e assenza di errori, senza richiedere il pannello admin.

Le descrizioni di Lume si trovano in `admin/lume/config/descriptions.json`.
Le indicazioni sugli allergeni restano da verificare con il personale e il libro
allergeni del ristorante; non sono certificazioni di assenza di allergeni.

Per rigenerare il CSS Tailwind usa la CLI standalone 3.4.17:

```powershell
tailwindcss -c admin/site-tailwind.config.cjs -i admin/site-tailwind.css -o assets/site-legacy.min.css --minify
tailwindcss -c admin/shop-tailwind.config.cjs -i admin/shop-tailwind.css -o assets/shop-tailwind.min.css --minify
node admin/build-site-assets.mjs
```
