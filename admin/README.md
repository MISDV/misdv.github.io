# Area riservata

La pagina di gestione gira su questo computer con Node.js 22 o superiore. Il sito
pubblico continua a usare file statici. La configurazione in `_config.yml`
esclude la cartella `admin/` dalla pubblicazione statica.

## Avvio su Windows

Apri PowerShell 7 nella radice del progetto. Scegli una password nuova di almeno
16 caratteri e avvia il servizio. I valori inseriti con `Read-Host -MaskInput`
restano nell'ambiente della finestra, senza essere aggiunti ai file del progetto.

```powershell
$env:ADMIN_PASSWORD = Read-Host 'Nuova password amministratore' -MaskInput
$env:GITHUB_TOKEN = Read-Host 'Token GitHub per il repository del sito' -MaskInput
node admin/server.mjs
```

Apri [l'area riservata](http://127.0.0.1:8787/admin/) e accedi con il nome
`admin` e la password scelta. Il token deve essere limitato al repository del
sito e avere il permesso **Contents: Read and write**. Ometti la seconda riga
per vedere i dati locali in sola lettura.

Seleziona **Dati del sito**, **Menù** o **Prodotti**, fai le modifiche e premi
**Pubblica modifiche**. Per una foto, carica il file e pubblica la scheda prodotto
per associarlo al catalogo. La pagina del menù e l'anteprima nella home vengono
aggiornate nello stesso commit del JSON. Se la versione online è cambiata, ricarica la scheda e
riapplica le modifiche.

`menu.json` contiene le categorie e le voci nell'ordine di presentazione.
Usa prezzi numerici in euro; per un prezzo al chilogrammo, imposta anche
`price_unit` su `kg`. Per i menù fissi, inserisci ogni portata e ogni servizio
incluso su una riga separata nell'editor.

Se modifichi `menu.json` a mano, esegui `node admin/sync-menu.mjs` e pubblica
insieme `menu.json`, `menu/index.html`, `index.html` e i file generati in `lume/`.
Il browser usa la carta già inclusa nella pagina. La home mostra fino a tre
voci delle prime due categorie disponibili. Il pannello pubblica anche
le pagine Lume nello stesso commit del catalogo.

Le descrizioni bilingui di Lume si modificano in
`admin/lume/config/descriptions.json`, usando gli ID di `menu.json`.
Il blocco `source` associa le annotazioni al nome, alla descrizione e alle
eventuali portate del catalogo. Se cambiano, la scheda chiede al cliente di
consultare il personale finché le annotazioni non vengono riviste.
`allergenChecks` contiene esclusivamente riferimenti orientativi alla legenda:
non è un elenco di allergeni confermati. Per questi fa fede il libro degli
allergeni del ristorante. La guida pubblica non offre filtri di esclusione.

Fonti per le schede Lume:

- [Allegato II del regolamento UE 1169/2011](https://eur-lex.europa.eu/eli/reg/2011/1169/oj?locale=it) per la legenda.
- [Commissione europea, Vincisgrassi alla maceratese](https://italy.representation.ec.europa.eu/notizie-ed-eventi/notizie/agricoltura-la-commissione-approva-nuove-specialita-tradizionali-garantite-italiane-2022-03-31_it) e [Regione Marche, prodotti tradizionali](https://static.regione.marche.it/Portals/0/Agricoltura/qualita/Prodotti%20Tradizionali/ElencoCompleto2022.pdf) per le preparazioni tipiche.
- [Garofoli, Piancarda](https://garofolivini.it/wp-content/uploads/2026/03/garofoli_piancarda.pdf), [Heineken Italia, Birra Messina](https://heinekenitalia.it/le-nostre-birre/birra-messina/) e [Marzadro, Diciotto Lune](https://www.marzadro.it/grappe/le-diciotto-lune-4.php) per i prodotti di marca.

Il servizio ascolta solo su `127.0.0.1`. Fermalo con Ctrl+C, poi chiudi la
finestra di PowerShell. Per usare il pannello con il sito aggiornato, pubblica
prima questo checkout sul ramo servito. Le variabili facoltative
`GITHUB_REPOSITORY`, `GITHUB_BRANCH`, `ADMIN_PORT` e `ADMIN_USER` cambiano
rispettivamente repository, ramo, porta e nome utente.

## Pubblicazione del sito

In **Settings → Pages**, la sorgente è **Deploy from a branch**, ramo `main`,
cartella `/ (root)`. I file per il browser sono già nella radice e in
`assets/`. La build Jekyll esclude questo pannello, le note del pacchetto
grafico e l'originale della foto del catalogo, che usa
`assets/catalogo-anteprima.webp`.

Se aggiungi classi Tailwind o modifichi lo stile dello shop, rigenera il CSS
dalla radice con la CLI standalone Tailwind **3.4.17**.

```powershell
tailwindcss -c admin/shop-tailwind.config.cjs -i admin/shop-tailwind.css -o assets/shop-tailwind.min.css --minify
```

Pubblica il CSS generato insieme alle modifiche di `shop.html`.

Per il CSS della home, del menù e della pagina della fattoria usa la stessa CLI
dalla radice.

```powershell
tailwindcss -c admin/site-tailwind.config.cjs -i admin/site-tailwind.css -o assets/site-legacy.min.css --minify
```
