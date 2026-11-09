# File di gestione e generazione

Il pannello admin è archiviato e non viene più utilizzato per aggiornare il sito.
L’audit mobile più recente è [MOBILE-AUDIT-2026-11-09.md](MOBILE-AUDIT-2026-11-09.md):
include correzioni, verifiche e limiti delle misurazioni locali.
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
La pagina inglese usa lo stesso formato con testi e navigazione tradotti.
La storia e la home si modificano direttamente nei rispettivi HTML.

Il logo comune è `/logo.png`, trasparente, come in `shop/index.html`. Il contenitore
`.shop-brand-mark` mantiene le dimensioni del riferimento: 48/64 px nell’header
e 56 px nel footer, con immagine da 40/48 px. Anche Lume usa lo stesso PNG.
Nel footer scuro il cerchio resta chiaro, così il simbolo mantiene la leggibilità.

Il catalogo è in `shop/index.html` e si apre all’indirizzo `/shop/`.
Il file `shop.html` è soltanto un rimando per i vecchi collegamenti. Le immagini
relative del catalogo sono risolte rispetto a `/items.json`, nella radice del sito.

I prodotti dello spaccio si aggiornano in `items.json`. Dopo le modifiche esegui
`node admin/build-shop.mjs`: genera il catalogo statico, le pagine `/shop/<slug>/`,
la sitemap e le versioni degli asset. Viene eseguito anche da `build-pages.mjs`.
`assets/shop-catalog.js` condivide prezzi e schede fra generazione e filtri del browser;
`assets/shop-products.css` aggiunge avvisi, segnaposto e stile delle schede senza
modificare la grafica generale dello shop. Per aggiungere foto usa `immagine`.
Non indicare zero per un prezzo sconosciuto: usa `prezzo: null`.
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
`admin/shop-business.mjs` definisce l’entità `Store` con ID `/shop/#spaccio`:
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
