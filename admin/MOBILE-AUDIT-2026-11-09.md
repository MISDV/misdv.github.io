# Audit mobile completo — 9 novembre 2026

Audit dei file locali destinati a GitHub Pages. Correzioni applicate anche alle
sorgenti di generazione; nessun push o deploy effettuato. Ripresi i rapporti
MOBILE-AUDIT.md, PAGESPEED-AUDIT.md e SHOP-MOBILE-SEO-AUDIT.md.

## Problemi verificati e corretti

| Priorità | Area | Riscontro | Correzione |
| --- | --- | --- | --- |
| Alta | Header comune | Con il testo al 200% il marchio spingeva il comando del menù oltre il bordo dello schermo. | Marchio e testi possono restringersi e andare a capo; il pulsante rimane disponibile. L’altezza dell’header si adatta al contenuto e il pannello segue l’altezza effettiva, compreso il bordo. |
| Media | Home con testo ingrandito | A 320 px e testo al 200%, hero e richiamo prodotti superavano lo spazio disponibile. | Contenitori e parole lunghe si adattano alla larghezza disponibile. |
| Alta | Lume IT/EN | Su mobile i testi di Filtri e Allergeni sono nascosti graficamente, lasciando i due comandi senza nome accessibile. | Etichette ARIA tradotte, senza modificare le icone o la loro posizione. |
| Alta | Legenda allergeni Lume | La zona con l’elenco scorrevole non era raggiungibile da tastiera. | Regione denominata, raggiungibile con Tab e scorribile con PageDown; vale anche per gli altri pannelli informativi. |
| Media | Prenotazione | Il link privacy si distingueva dal testo circostante soltanto per un colore troppo simile. | Sottolineatura esplicita, verificata nel dialogo aperto. |
| Media | Filtri shop | Il ruolo dialog era applicato a un elemento aside, combinazione segnalata da axe-core. | Contenitore generico con semantica dialog; comportamento e grafica conservati. |
| Media | Footer shop/prodotti | Titoli h4 dopo h2 e un paragrafo annidato in un titolo creavano una gerarchia impropria. | Titoli h2 e markup valido, mantenendo le classi grafiche. |
| Media | Stampa Lume IT/EN | Il titolo principale era nascosto e alcuni controlli erano fuori dai landmark. | Titolo accessibile della carta e navigazione identificata per i controlli di stampa. |
| Media | Movimento ridotto | Lo scorrimento fluido del sito comune restava attivo con prefers-reduced-motion. | Scorrimento immediato quando richiesto dal dispositivo. Le animazioni normali di Lume sono conservate. |

L’aggiornamento dell’altezza dell’header usa ResizeObserver e i valori già
calcolati dal browser. Evita una lettura sincrona del layout al caricamento;
aggiorna la variabile CSS soltanto quando l’altezza cambia. I browser senza
ResizeObserver conservano una misurazione di fallback.

## Copertura e risultati

- 32 pagine di contenuto a 390×844: home, menù, Lume IT/EN, home inglese,
  storia, animali, orto, locale, privacy, catalogo, tutte le 19 schede prodotto
  e le due pagine di stampa.
- Le 11 pagine rappresentative anche a 320×640, 844×390, 768×1024 e
  1280×800: **76 combinazioni** complessive. Nessun errore JavaScript,
  riferimento richiesto mancante o sbordamento orizzontale rilevato.
- Ulteriore verifica dell’header dopo la correzione, compreso testo al 200%,
  apertura/chiusura del pannello, allineamento e spazio disponibile.
- **26 stati con axe-core 4.14.0:** pagina iniziale, navigazione, menù fissi,
  prenotazione, piatto, allergeni, tema scuro, filtri e stampa. Da 20
  segnalazioni distribuite fra 8 regole a **zero violazioni rilevate** nei
  controlli eseguiti. Questo non equivale a una certificazione completa WCAG.
- **20 scenari funzionali** per navigazione, prenotazioni, ricerca e categorie,
  preferiti, tema, cookie, movimento ridotto e consultazione senza JavaScript;
  **12 scenari shop** per categorie/tipologie, prezzo, ricerca, ordinamento,
  reset, focus, scorrimento, rotazione, mappe e fallback statico.
- Cookie: nessuna richiesta Analytics prima della scelta; accettazione,
  persistenza della scelta, riapertura e revoca provate con provider simulato.
- Mappe: nessun iframe iniziale; caricamento su richiesta e rimozione alla
  chiusura. Verificati separatamente i riferimenti di agriturismo e spaccio.
  Le risposte Google sono simulate: non è un controllo dell’interfaccia remota.
- Carta di 81 voci e catalogo di 19 prodotti disponibili senza JavaScript.
  Controllati anche allergeni, prezzo al kg, ricerca senza risultati e preferiti
  dopo il ricaricamento.
- Confronto delle schermate iniziali a 390 px: **zero pixel modificati per
  Lume IT/EN**. Foglio di stile Lume invariato, animazione lm-arrive conservata
  e disattivata soltanto con movimento ridotto. Controllati visivamente anche
  header, menù, shop e dialoghi.
- 35 HTML, 56 blocchi JSON-LD, sitemap, ID e riferimenti locali controllati;
  sintassi JavaScript valida e rigenerazione completa senza differenze.
  menu.json, items.json, dati.json e logo.png conservati.

## Prestazioni misurate

Chrome su Windows, viewport 390×844, DPR 2, CPU rallentata 4 volte e attesa
artificiale di 80 ms per risposta. Tre caricamenti nuovi per versione e pagina,
alternando prima/dopo. Baseline conservata prima delle modifiche.

| Pagina | LCP prima, mediana | LCP dopo, mediana | CLS dopo | Peso iniziale dopo, gzip stimato |
| --- | ---: | ---: | ---: | ---: |
| /menu/ | 1016 ms | 1052 ms | 0 | 180,0 KiB |
| /lume/ | 1312 ms | 1192 ms | 0 | 128,0 KiB |
| /shop/ | 1032 ms | 912 ms | 0 | 145,0 KiB |
| Home | 1100 ms | 1156 ms | 0 | 246,7 KiB |

LCP dei singoli campioni dopo: menù 956–1096 ms, Lume 1168–1336 ms,
shop 900–960 ms, home 1084–1168 ms. Le variazioni non dimostrano un guadagno
stabile di velocità. Le correzioni aggiungono circa 0,1–0,4 KiB compressi per
pagina; non aggiungono librerie, font o immagini.

Le interazioni provate, misurate dall’azione fino a due frame, hanno mediane
di 59 ms per la categoria del menù, 81 ms per i filtri Lume e 135 ms per il
pannello shop. **Non sono misure INP.** INP degli utenti reali e TBT Lighthouse
non sono stati determinati. Non è stato assegnato un nuovo punteggio PageSpeed.

CLS iniziale zero in tutti i campioni del confronto. Anche lo scorrimento touch
della carta è risultato stabile. Un primo test con salti programmati molto
ravvicinati e ritorno immediato all’inizio produceva spostamenti del footer:
il problema non si riproduce con gesti touch o scorrimento controllato, anche
con la baseline. Non è stato attribuito alla correzione un miglioramento CLS
ottenuto cambiando la procedura di prova; content-visibility è conservato.

## Limiti e passaggi dopo la pubblicazione

Le richieste locali sono intercettate e soddisfatte dai file del repository:
il browser in questo ambiente non raggiunge il server locale via HTTP.
Le misure non includono rete mobile reale, cache, compressione effettiva,
latenza e CDN di GitHub Pages. I pesi usano gzip per i file testuali e byte
originali per i file binari. Non sono prove su Safari iOS o telefoni fisici.

1. Dopo il push ripetere PageSpeed mobile su home, /menu/, /lume/ e /shop/;
   confrontare dati di laboratorio e dati reali di Search Console, se disponibili.
2. Provare un iPhone e un Android reali, soprattutto tastiera, barre del browser,
   ridimensionamento del testo e scorrimento dei dialoghi.
3. Quando disponibili, sostituire i segnaposto dei prodotti con foto reali
   dimensionate e compresse; mantenere varianti responsive e caricamento differito.

La cache HTTP dipende dall’hosting: non sono stati aggiunti file di configurazione
che promettano di modificare le intestazioni di GitHub Pages.

Sorgenti interessate: assets/site.js, assets/site-extras.css, assets/booking.css,
admin/lume/src/view.js, admin/lume/build.mjs, shop/index.html e generatori delle
pagine. I file pubblici sono già rigenerati. La cartella admin resta esclusa
dalla pubblicazione Pages; strumenti e risultati dettagliati sono fuori dal sito:
Documents/ChatGPT/Agriturismo Giuggioloni/audit-mobile-2026-11-09/.

Riferimenti: [Web Vitals](https://web.dev/articles/vitals),
[Chrome Performance](https://developer.chrome.com/docs/devtools/performance),
[W3C, dimensione dei bersagli](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
