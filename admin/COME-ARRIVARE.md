# Come arrivare all’Agriturismo Giuggioloni

La pagina è in `/come-arrivare/`. Modifica gli itinerari in `come-arrivare.json`,
poi esegui `node admin/build-come-arrivare.mjs` e `node admin/build-site-assets.mjs`.
Per aggiornare anche la navigazione comune, segui la sequenza completa nel
[README](README.md).

La foto dell’insegna fornita per questa pagina è `Immagine ChatGPT 16 nov 2026, 10_09_05.jpg`.
`assets/come-arrivare/` contiene le copie WebP a 480, 960 e 1536 px, con le proporzioni originali.

## File aggiornati

- Pagina, sorgenti e immagini: `come-arrivare/index.html`, `admin/build-come-arrivare.mjs`, `admin/come-arrivare.json`, `assets/come-arrivare.css`, `assets/come-arrivare.js` e `assets/come-arrivare/ingresso-*.webp`.
- Integrazione e build: `index.html`, `admin/site-layout.mjs`, `admin/build-pages.mjs`, `admin/build-prenotazione.mjs`, `admin/build-site-assets.mjs`, `admin/site-metadata.mjs`, `assets/site-extras.css`, `assets/site.min.css`, `assets/booking.js` e `assets/consent.js`.
- Pagine rigenerate e riferimenti agli asset: `en/`, `fattoria/`, `menu/`, `prenotazione/`, `privacy/`, `spaccio/`, `lume/`, `shop/`, `storia.html`, `menu.html`, `piatti.html`, `shop.html` e `sitemap.xml`.
- Documentazione: `admin/README.md` e questa nota.

## Verifiche sul posto e sui telefoni

- Controllare che il punto stimato `43.4981617,13.4658884` coincida con l’insegna di Via Acquaviva. Aggiornare `entrance.point` e impostare `entrance.confirmed` quando verificato.
- Confermare nomi e percorribilità dei tre itinerari, i punti di partenza delle stime e il riferimento al parcheggio. Distanze e tempi del brief restano nella configurazione.
- Aprire i tre pulsanti su Android e iPhone e verificare ordine delle tappe e arrivo alla scheda del ristorante. I collegamenti usano il Place ID della destinazione e fino a tre tappe. [Documentazione di Google Maps](https://developers.google.com/maps/documentation/urls/get-started#directions-action).

## Foto da raccogliere

1. Bivio per Via Acquaviva arrivando da Santo Stefano, con la chiesa se visibile.
2. Incrocio Via Chiaravallese / Via Fontemurata arrivando da San Paterniano.
3. Bivio da Via Fontemurata verso il raccordo di Via Rosciano.
4. Incrocio Via Rosciano / Via Acquaviva nella direzione di marcia.
5. Bivio Via Roncisvalle / Via Acquaviva arrivando dal Borgo.
6. Imbocco della strada privata arrivando da Santo Stefano o Via Rosciano.
7. Imbocco della stessa strada arrivando dal Borgo.
8. Ingresso del parcheggio all’arrivo all’agriturismo.
