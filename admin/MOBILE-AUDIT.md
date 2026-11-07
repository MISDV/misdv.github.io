# Audit mobile — 7 novembre 2026

Audit ripreso dalle misure precedenti, con priorità a `/menu/` e `/lume/`.
Correzioni applicate ai file locali e alle sorgenti dei generatori. Nessun push
o deploy eseguito durante questo lavoro.

## Correzioni applicate

| Area | Problema verificato | Intervento |
| --- | --- | --- |
| `/menu/` | La carta completa richiede il layout di molte sezioni anche fuori schermo. Il font del titolo viene scoperto attraverso il CSS. | `content-visibility: auto` sulle categorie, con dimensione provvisoria memorizzata dal browser, e preload del font Playfair già utilizzato. Stampa esclusa dal rendering differito. |
| `/menu/` | La data di aggiornamento diventava chiara su fondo chiaro se il sistema operativo preferiva il tema scuro, pur restando la pagina chiara. | Colore scuro applicato soltanto quando il sito usa effettivamente la classe del tema scuro. |
| `/lume/` | «Giuggioloni» si spezzava in due righe nell’header a 390 px. | Nome intero sulla prima riga e controlli su una seconda riga, mantenendo caratteri, colori e pulsanti originali. |
| `/lume/` | Ogni scheda includeva una copia nascosta del titolo, prezzo, descrizione e pulsanti del dettaglio. Le liste ricostruite dai filtri ripetevano anche il fallback senza JavaScript. | Eliminati i duplicati inutili. L’HTML iniziale mantiene i dettagli accessibili senza JavaScript; le liste interattive usano la finestra del piatto. La stampa ricrea la carta completa. |
| Navigazione comune | Con il pannello mobile aperto, Shift+Tab usciva dal pannello; la pagina sottostante poteva scorrere. | Focus contenuto nel pannello, semantica dialog, blocco dello scorrimento, contenuto sottostante inattivo e ripristino alla chiusura. Altezza del pannello collegata all’altezza reale dell’header. |
| Shop | Filtri mobili senza gestione del focus; chiusura completata sia dalla transizione sia dal timer; campo ricerca da 14 px in orizzontale. | Gestione del focus e nome accessibile del pannello, pulizia del timer e del listener di chiusura, ricerca da 16 px fino a 1023 px. Grafica del catalogo conservata. |
| Dati condivisi | I testi venivano riscritti nel DOM anche quando coincidevano già con l’HTML. | Aggiornamento dei nodi di testo soltanto quando il valore cambia. |

Le regole originali dell’animazione `lm-arrive`, delle transizioni delle schede,
della finestra dei piatti e della preferenza `prefers-reduced-motion` sono state
confrontate con la copia precedente e risultano conservate. Controllati anche
gli screenshot dell’header, delle schede e della finestra di dettaglio.

## Risultati del confronto

Chrome, viewport 390×844, DPR 2, CPU rallentata 4 volte, contesti nuovi e tre
caricamenti per versione. Le prove prima/dopo sono state alternate. La versione
precedente è conservata negli artefatti dell’audit, senza ricostruirla dal ramo Git.

| Misura (mediana) | `/menu/` prima | `/menu/` dopo | `/lume/` prima | `/lume/` dopo |
| --- | ---: | ---: | ---: | ---: |
| LCP | 1.332 ms | 1.284 ms | 988 ms | 996 ms |
| CLS | 0 | 0 | 0 | 0 |
| Peso iniziale stimato gzip | 180.388 B | 180.943 B | 122.008 B | 119.478 B |
| Elementi DOM osservati | 648 | 649 | 4.675 | 3.298 |
| Selezione «Menù fissi», click simulato → due frame | 117 ms | 62 ms | 238 ms | 220 ms |

Lume riduce gli elementi iniziali del **29,5%** e il trasferimento stimato del
**2,1%**. Il risparmio principale riguarda il lavoro di parsing e gestione dei
nodi, perché gzip comprimeva già bene le ripetizioni. In `/menu/` il peso cresce
di circa 0,5 KiB per le correzioni condivise; il lavoro sulle sezioni fuori schermo
viene differito. La prova dei filtri è favorevole, ma non è una misura di INP.

I tempi di caricamento restano sostanzialmente comparabili. Le tre prove hanno
varianza elevata: LCP `/menu/` prima 496–1.664 ms, dopo 1.256–1.708 ms; Lume prima
856–1.132 ms, dopo 872–1.224 ms. Non si deduce da questi campioni un’accelerazione
stabile del caricamento. Anche le attività lunghe del thread principale sono
variabili; non viene attribuito un punteggio Lighthouse.

**Limiti della misura:** il browser non può accedere nemmeno al server locale
via HTTP in questo ambiente (`ERR_NETWORK_ACCESS_DENIED`). Le risorse sono
quindi fornite tramite intercettazione delle richieste. Non sono misurati
latenza Internet, cache, compressione effettiva o CDN di GitHub Pages. I pesi
usano gzip stimato per i file testuali. L’audit è una verifica locale in Chrome,
non una prova su telefoni fisici, Safari iOS o dati CrUX degli utenti reali.

## Copertura delle verifiche

- Dieci pagine in verticale a 320 e 390 px e in orizzontale a 844×390:
  home, `/menu/`, `/lume/`, `/lume/en/`, storia, animali, orto, locale, shop e privacy.
  Nessuno sbordamento orizzontale del contenuto o errore JavaScript nei percorsi testati.
- `/menu/` e `/lume/` anche a 1024 e 1440 px: controllo dei breakpoint desktop.
- Navigazione mobile: apertura, chiusura con Escape, focus, blocco e ripristino
  dello scorrimento. Filtri dello shop: apertura, focus e chiusura.
- `/menu/`: 81 voci, selezione categoria, ricerca Fiorentina con prezzo al kg,
  nessun risultato, ripristino della carta, box allergeni e stampa senza
  `content-visibility`.
- Lume IT/EN: 81 voci, categoria menù fissi, ricerca, cancellazione ricerca,
  dettagli, preferiti, tema scuro/chiaro, legenda allergeni e animazione delle schede.
- Lume: rispetto del movimento ridotto; finestra di dettaglio utilizzabile anche
  con viewport alta soltanto 390 px; tema scuro automatico verificato.
- Carta leggibile senza JavaScript in `/menu/`, `/lume/`, `/lume/en/` e nelle due
  pagine di stampa. Disponibili i dettagli delle schede statiche.
- Lume: stampa avviata da una ricerca filtrata ricostruisce tutte le 81 voci e
  ripristina la ricerca dopo la stampa; ricaricamento di un link diretto al piatto
  riapre correttamente la finestra di dettaglio.
- Dodici pagine controllate per ID duplicati e file collegati mancanti; controlli
  sintattici JavaScript e `git diff --check` superati.

Le sorgenti modificate sono `assets/site.js`, `assets/site-extras.css`,
`menu/index.html`, il comportamento dei filtri in `shop.html` e i sorgenti Lume
in `admin/lume/src/`. I generatori usano le nuove versioni delle risorse condivise;
i file pubblici delle pagine Fattoria/privacy e Lume sono stati rigenerati.

Gli screenshot, le tracce Chrome e i risultati sono nella cartella di lavoro
`Documents/ChatGPT/Agriturismo Giuggioloni/audit-mobile-2026-11-07`, fuori dal sito
da pubblicare. Questo rapporto è in `admin/`, già esclusa dalla build Pages.

## Interventi successivi consigliati

1. **Misure dopo la pubblicazione.** Ripetere l’audit su GitHub Pages, su un
   Android e un iPhone reali, con rete mobile. Verificare cache/redirect e dati
   Search Console, come già indicato nell’audit SEO della home.
2. **Aggiornamenti dei dati.** Collegare il salvataggio di `dati.json` alla
   rigenerazione atomica di HTML e JSON-LD: il precedente audit SEO segnala il
   rischio di disallineamento dopo modifiche a contatti e testi.
3. **Accesso più rapido ai piatti in `/menu/`.** Valutare un’introduzione più
   compatta o un collegamento «Vai ai piatti»: a 390×844 i filtri sono già visibili,
   mentre le prime portate richiedono scorrimento. È una scelta di presentazione
   da valutare separatamente dall’ottimizzazione applicata.
4. **Informazioni definitive.** Confermare orari e indicazioni degli allergeni
   con il ristorante; completare poi dati strutturati e contenuti. Integrare le
   nuove foto reali con misure responsive, senza reintrodurre slider pesanti.

Riferimenti: [Web Vitals](https://web.dev/articles/vitals) distingue misure di
laboratorio e dati sul campo; [content-visibility](https://web.dev/articles/content-visibility)
descrive il rendering differito del contenuto fuori schermo;
[Chrome Performance](https://developer.chrome.com/docs/devtools/performance)
documenta l’analisi delle attività del browser.
