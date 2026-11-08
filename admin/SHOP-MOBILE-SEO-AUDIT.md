# Shop: mobile e identità SEO dello spaccio

Controllo concluso il 9 novembre 2026. File statici pronti per GitHub Pages;
nessuna pubblicazione o modifica alla scheda Google effettuata da questi script.

Lo shop e le 19 schede prodotto identificano **Spaccio Aziendale Giuggioloni**
come attività di vendita. L’entità ha tipo `Store`, ID
`https://agriturismogiuggioloni.it/shop/#spaccio` e URL `/shop/`.
Nome, titolo, descrizione, intestazione, footer, anteprime social, venditore
delle offerte e dati delle pagine sono coerenti con questa identità.
L’agriturismo mantiene la propria entità `Restaurant` e la propria mappa.

La scheda dello spaccio usa il riferimento fornito dal proprietario:
`0x132d87924f3b24d1:0x80ae131f9c226b12`, CID `9272369709286845202`.
Il codice conserva l’URL esatto dell’iframe in `assets/shop-map.js`.
Il link Google condiviso dal proprietario, `https://share.google/qXPCdwBKjSw6ZjSwz`,
è usato dal collegamento alla scheda e incluso in `sameAs` su tutte le 20 pagine.
`hasMap`, `sameAs`, indicazioni e mappe del catalogo e dei prodotti puntano
alla scheda dello spaccio. L’iframe viene creato solo premendo il pulsante
della mappa e viene rimosso alla chiusura. Nessuna connessione Google iniziale.

Indirizzo e contatti sono quelli già comunicati nel sito, essendo la struttura
condivisa. Non sono stati copiati nello spaccio gli orari del ristorante,
né dedotte coordinate del negozio dai parametri dell’iframe. Non sono state
aggiunte recensioni, valutazioni, disponibilità in magazzino o dati non forniti.
I prezzi e i dati dei 19 prodotti restano identici a quelli ricevuti.

Le correzioni mobile riguardano ricerca e ordinamento su due righe, selettore
nativo per l’ordinamento, segnaposto delle foto più compatti e controlli più
facili da toccare. Il pannello filtri usa tutta la larghezza disponibile,
mantiene visibili chiusura e pulsanti Azzera/Mostra prodotti, blocca lo sfondo
e ripristina focus e posizione della pagina. Mostra prodotti porta al conteggio
dei risultati; Cerca e il tasto di ricerca della tastiera fanno lo stesso.
Le tipologie continuano a comparire soltanto per categorie che ne hanno almeno due.
L’elenco delle schede non viene ricreato se gli stessi prodotti restano nello stesso ordine.
Sono stati corretti anche i contrasti di marchio testuale, categoria selezionata
e titoli delle schede al passaggio del puntatore.

| Misura a 390×844, dopo caricamento dei font | Prima | Dopo |
| --- | ---: | ---: |
| Altezza del blocco ricerca/ordinamento | 198 px | 132 px |
| Altezza della prima scheda | 435 px | 307 px |
| Posizione verticale del primo prezzo dall’inizio pagina | 1.037 px | 758 px |
| Altezza totale del documento | 10.300 px | 8.248 px |

Il confronto include anche la nuova sezione informativa dello spaccio e della
mappa, aggiunta in fondo al catalogo. Le misure descrivono lo spazio occupato,
non il tempo di caricamento della pagina. Non è stato generato un punteggio PageSpeed.

Verifiche: flussi su 320×640, 390×844, 768×1024, 844×390 e desktop 1280;
ricerca, ordinamento, categorie, tipologie, prezzo, reset, conteggio risultati,
gesti touch, tastiera, focus, ripristino dello scorrimento, rotazione e movimento
ridotto. Provati il trascinamento touch del prezzo e il riuso dei nodi delle
schede quando i risultati non cambiano. Provati catalogo senza JavaScript e
mappe su catalogo, olio, cappone e pacco famiglia. Verificati 20 nodi Store,
19 nodi Product, collegamenti al venditore, JSON-LD, sitemap e riferimenti locali.
Nessun errore JavaScript o elemento fuori larghezza nei controlli eseguiti.

Le prove usano Chrome con viewport mobili e file locali intercettati, non la
rete e il server di produzione. Google Maps è simulato nei test: sono verificati
URL, identità della scheda, attributi dell’iframe e caricamento su richiesta,
non l’interfaccia remota di Google. Artefatti, schermate, tracce e risultati sono
in `Documents/ChatGPT/Agriturismo Giuggioloni/mobile-seo-shop-2026-11-08/`.

Il sito da associare al profilo Google dello spaccio è
`https://agriturismogiuggioloni.it/shop/`. La pubblicazione dei file e una nuova
scansione sono necessarie perché Google rilevi le modifiche; il markup non
garantisce uno specifico risultato o posizionamento. Riferimenti:
[Google LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business),
[Schema.org Store](https://schema.org/Store).
