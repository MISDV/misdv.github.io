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
per associarlo al catalogo. Il menù aggiornato e il suo HTML vengono pubblicati
nello stesso commit. Se la versione online è cambiata, ricarica la scheda e
riapplica le modifiche.

Il servizio ascolta solo su `127.0.0.1`. Fermalo con Ctrl+C, poi chiudi la
finestra di PowerShell. Per usare il pannello con il sito aggiornato, pubblica
prima questo checkout sul ramo servito. Le variabili facoltative
`GITHUB_REPOSITORY`, `GITHUB_BRANCH`, `ADMIN_PORT` e `ADMIN_USER` cambiano
rispettivamente repository, ramo, porta e nome utente.
