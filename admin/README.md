# File di gestione e generazione

Il pannello admin è archiviato e non viene più utilizzato per aggiornare il sito.
Il servizio permette soltanto richieste GET e restituisce dati in sola lettura:
non pubblica modifiche, menù o immagini. La cartella `admin/` resta esclusa
dalla pubblicazione Pages tramite `_config.yml`.

I contenuti si aggiornano nei file locali. Dopo modifiche a `menu.json`, esegui:

```powershell
node admin/sync-menu.mjs
```

Il comando aggiorna la carta `/menu/`, l’anteprima nella home e le versioni
italiana e inglese di Lume, comprese le pagine di stampa.

Per allineare header e footer, rigenerare le pagine informative e aggiornare i menù:

```powershell
node admin/sync-layout.mjs
node admin/build-pages.mjs
node admin/sync-menu.mjs
```

Le sorgenti sono `admin/build-pages.mjs` e `admin/build-english.mjs`.
Header e footer comuni sono ricavati dalla home tramite `admin/site-layout.mjs`.
La pagina inglese usa lo stesso formato con testi e navigazione tradotti.
La storia e la home si modificano direttamente nei rispettivi HTML.

Il popup prenotazioni è gestito da `assets/booking.js` e `assets/booking.css`.
Il numero di prenotazione è +39 392 252 9406. La mappa si carica soltanto
quando il popup viene aperto; senza JavaScript i pulsanti chiamano direttamente.

La scheda Google Maps e l’iframe sono definiti in `assets/place-map.js`.
Footer, popup, pagina inglese e Lume usano lo stesso riferimento, ripreso anche
dal campo SEO `hasMap` della home.

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
```
