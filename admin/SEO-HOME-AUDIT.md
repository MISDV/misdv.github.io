# Audit SEO della home — 7 novembre 2026

Ambito: `index.html`, le risorse che carica, i dati di `dati.json`, i collegamenti
in uscita dalla home e le direttive locali di indicizzazione. Le correzioni sono
nei file locali; questo audit non ha eseguito commit, push o pubblicazioni.

## Risultato e correzioni

| Priorità | Riscontro iniziale | Intervento / stato |
| --- | --- | --- |
| Alta | Dopo i menù fissi era rimasta una sezione «Primi piatti», con tre piatti, due foto, un secondo collegamento al menù e tag di chiusura senza apertura. Due marcatori `MENU-CONTENT:END`. | Eliminati i residui. La home contiene solo le due formule fisse. Il generatore ora rifiuta modelli con marcatori mancanti o duplicati. |
| Media | H1 «Autenticità e Natura / Sulla Tua Tavola», privo di nome dell’attività e località. | H1 visibile «Agriturismo Giuggioloni / Ristorante a Osimo, nelle Marche». Aggiornato anche `dati.json`, che prima avrebbe sovrascritto il testo nel browser. Slogan conservato sopra il titolo. |
| Media | Introduzione poco specifica rispetto all’intento locale. | Testo introduttivo con Osimo, provincia di Ancona, cucina marchigiana e fattoria; descrizione SEO coerente con i contenuti. |
| Media | Pulsanti del menù con destinazioni diverse; categoria e sezione principale allo stesso livello di titolazione. | Tutti i collegamenti «Menù completo» vanno a `/lume/`. Link contestuale «piatti e prezzi del ristorante» a `/menu/`. Gerarchia H2 → H3 → H4 nella sezione dei menù fissi. |
| Media | `Restaurant` e `WebSite` non collegati tra loro; immagine del logo usata anche come foto del ristorante. | Grafo JSON-LD con `Restaurant`, `WebSite`, `WebPage`, riferimenti coerenti, logo separato dalle foto reali e proprietà `menu` documentata da Google. |
| Bassa | Anteprime social non esplicite per Twitter/X; icone decorative leggibili come parole. | Completati i metadati delle anteprime; icone decorative escluse dall’albero accessibile. Banner cookie marcato `data-nosnippet` per escluderne il testo dagli snippet che supportano questa direttiva. |
| Bassa | Logo principale senza collegamento e link Home senza stato corrente. | Logo collegato alla radice, Home con `aria-current="page"`. Aggiunta favicon PNG 48×48 già disponibile. |

Titolo conservato: **Agriturismo Giuggioloni a Osimo | Ristorante nelle Marche**
(57 caratteri). La descrizione aggiornata ha 154 caratteri: la lunghezza è un
dato descrittivo, non un limite garantito di visualizzazione su Google.

La foto principale, i colori, i caratteri, i loghi e le schede Fattoria sono
conservati. Le due foto eliminate appartenevano al blocco menù residuo, già
richiesto senza immagini. Nessuna modifica alla grafica dello shop in questo audit.

## Verifiche tecniche

| Controllo | Esito locale |
| --- | --- |
| Lingua, codifica e viewport | `lang="it"`, UTF-8, viewport responsive. |
| Indicizzazione | Home `index,follow,max-image-preview:large`; `robots.txt` permette la scansione; URL della home presente in `sitemap.xml`. |
| URL canonico | Unico, assoluto e HTTPS: `https://agriturismogiuggioloni.it/`; coerente con `CNAME`, Open Graph, sitemap e dati strutturati. |
| Metadati | Titolo e descrizione unici nella home; anteprime social coerenti; immagine OG esistente di 1200×630 pixel. |
| HTML | Un solo H1; nessun ID duplicato; tag bilanciati; nessun errore segnalato dal parser HTML usato. |
| Link e risorse | Verificati 50 riferimenti locali e ancore nell’HTML: nessun file o ancoraggio mancante. Richieste del browser senza errori o immagini mancanti dopo lo scorrimento. |
| Dati strutturati | JSON valido; nomi, indirizzo, telefono principale ed email coerenti con i dati e i contatti visibili; riferimenti fra i tre nodi risolti. Verifica locale, non certificazione del Rich Results Test. |
| Contenuti senza JavaScript | H1, testi, due menù fissi, quattro pagine Fattoria, telefoni e indicazioni stradali presenti nell’HTML. |
| Immagini | Testi alternativi, dimensioni dichiarate, formati AVIF/WebP con fallback, immagini sotto la piega lazy; hero con priorità alta. |
| Mobile e desktop | Chrome a 320, 390, 768, 1024 e 1440 pixel: nessuno scorrimento orizzontale, menù mobile funzionante, nessun errore JavaScript. Screenshot controllati a 390 e 1440 pixel. |
| Cookie e terze parti | Nessuna richiesta a terze parti al primo caricamento senza consenso. La mappa mantiene il caricamento su azione esplicita. |
| Generazione del menù | Rigenerazione idempotente di home e `/menu/`; rifiuto verificato di marcatori duplicati o mancanti; controlli sintattici JavaScript e `git diff --check` superati. |

La home è la radice del sito: non necessita di un breadcrumb composto soltanto
da «Home». Non è stata aggiunta una gerarchia artificiale. I collegamenti alle
pagine interne e i loro breadcrumb restano disponibili.

## Caricamento mobile osservato

Tre caricamenti a cache fredda in Chrome, viewport 390×844, DPR 2 e CPU rallentata
4 volte. Risorse locali fornite al browser tramite intercettazione delle
richieste: **nessuna simulazione della latenza Internet o della CDN GitHub Pages**.

| Misura | Risultato |
| --- | --- |
| LCP | 768 / 804 / 892 ms; mediana **804 ms** |
| FCP | 768 / 804 / 892 ms; mediana **804 ms** |
| CLS, finestra massima osservata | **0,0163** nei tre caricamenti |
| Richieste iniziali | **18**, tutte locali |
| Peso iniziale stimato | **304.699 byte**, circa 298 KiB |
| Peso dopo lo scorrimento completo a 390 px | **508.603 byte**, circa 497 KiB |

I pesi stimano gzip per testo, CSS, JavaScript, JSON e SVG; non sono byte
effettivamente trasferiti dalla produzione. La rimozione delle due foto residue
evita 107.056 byte di immagini quando quella sezione sarebbe stata caricata.
LCP/FCP/CLS sono misure di laboratorio: non equivalgono a dati CrUX, a un punteggio
Lighthouse né a una verifica di INP sul traffico reale. La velocità della versione
pubblicata va misurata dopo il deploy.

## Verifiche rimaste esterne ai file

1. **Orari da confermare.** `dati.json` indica venerdì a cena senza orario,
   sabato e domenica 11:30–15:00 / 19:00–23:00 e chiusura da lunedì a giovedì.
   La copia della home restituita dallo strumento web, indicata come acquisita
   tre giorni prima, mostra invece giovedì 19:00–23:00 e sabato 12:30–15:00.
   Potrebbe essere una copia precedente. I dati locali non sono stati cambiati
   sulla base della cache; `openingHoursSpecification` resta omesso fino alla
   conferma degli orari effettivi. Anche le coordinate geografiche esatte sono
   da verificare prima di introdurre `geo`.
2. **Pubblicazione e risposte HTTP.** La copia recuperata dal web differisce dai
   file locali. Il terminale non ha potuto risolvere il dominio: non sono stati
   verificati in diretta status HTTP, `X-Robots-Tag`, compressione, cache o redirect
   HTTP→HTTPS / www→dominio canonico. Dopo il push, controllare questi punti,
   `robots.txt`, sitemap e che URL inesistenti restituiscano davvero 404.
3. **Google Search Console.** Nessun accesso alla proprietà è stato usato.
   Dopo la pubblicazione eseguire Ispezione URL della home, controllare il canonico
   scelto da Google e l’indicizzazione, verificare la sitemap e i Core Web Vitals.
   Eseguire anche il Rich Results Test sulla versione pubblicata. Posizionamenti,
   impressioni e clic non sono stati misurati da questo audit.
4. **Scheda dell’attività e social.** Allineare nome, indirizzo, telefoni e orari
   della scheda Google dell’attività ai dati confermati. Instagram e Facebook
   indicati dall’utente sono già collegati e presenti in `sameAs`; il profilo
   TikTok preesistente non è stato autenticato come ufficiale durante l’audit.
5. **Aggiornamenti successivi dei dati.** L’editor «Dati del sito» attualmente
   pubblica `dati.json`; i testi statici e JSON-LD della home vanno aggiornati
   insieme quando cambiano contatti, identità o informazioni rilevanti. Il browser
   aggiorna i testi dal JSON, ma questo da solo non aggiorna l’HTML iniziale o lo
   schema. Nell’attuale versione è stata verificata la coerenza fra le due fonti.

## Riferimenti

- [Google: titoli dei risultati](https://developers.google.com/search/docs/appearance/title-link), per titolo descrittivo e coerenza con il titolo visibile.
- [Google: nome del sito](https://developers.google.com/search/docs/appearance/site-names), per `WebSite` e nome dell’attività.
- [Google: attività locali](https://developers.google.com/search/docs/appearance/structured-data/local-business), per proprietà di `Restaurant` e verifica dopo la pubblicazione.
- [Google: URL canonici](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), per uniformità degli URL.
- [Google: SEO delle immagini](https://developers.google.com/search/docs/appearance/google-images), per immagini accessibili, responsive e testi alternativi.
- [Home pubblica consultata tramite strumento web](https://agriturismogiuggioloni.it/), usata solo per confronto con la copia restituita, non come prova dello stato live del deploy.
