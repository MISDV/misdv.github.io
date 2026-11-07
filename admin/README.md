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

Se modifichi `menu.json` a mano, esegui `node admin/sync-menu.mjs` e pubblica
insieme `menu.json`, `menu/index.html` e `index.html`. Il browser usa la carta
già inclusa nella pagina.

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
