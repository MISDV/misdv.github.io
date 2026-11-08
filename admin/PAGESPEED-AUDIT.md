# PageSpeed: interventi su prestazioni e accessibilità

8 novembre 2026. Analisi dell’HTML del report fornito dall’utente, relativo alla home.
Il report originale indica 98 prestazioni, 96 accessibilità, 100 best practice e 100 SEO.
Questi sono i punteggi iniziali: non rappresentano una nuova misurazione dopo le modifiche.

| Metrica del report originale | Valore |
| --- | ---: |
| First Contentful Paint | 0,9 s |
| Largest Contentful Paint | 2,0 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 3,7 s |

## Correzioni applicate

- Immagini AVIF: ricompressione delle quattro foto della fattoria nelle varianti 480/800, senza cambiare soggetto o proporzioni. I quattro file da 800 passano complessivamente da 203.904 a 120.705 byte, circa −41%.
- Hero mobile: variante 640 da 64.670 a 53.137 byte; variante 480 da 69.860 a 27.970 byte, ricavata dalla stessa immagine mobile. Restano priorità alta e caricamento immediato.
- Texture decorativa del richiamo prodotti: da 58.552 a 14.256 byte. Logo comune: riutilizzato il WebP già presente, 1.026 byte invece dei 7.275 del PNG; stesse dimensioni e contenitore.
- `sizes` delle immagini della home allineato alla larghezza reale della griglia e ai suoi margini. Rimangono varianti adatte agli schermi densi, caricamento lazy e fallback WebP.
- Un solo CSS per home, menù e pagine informative, al posto delle tre richieste bloccanti segnalate. Include anche il popup prenotazioni. Versione calcolata dal contenuto; bundle già generato e pronto per Pages.
- Font icone: `font-display: swap`, preload del piccolo sottoinsieme e spazio del glifo riservato. Nessuna dipendenza aggiunta da font o servizi esterni.
- Contrasto: arancio più scuro per testi e pulsanti con scritte bianche nelle pagine del sito; conservati arancio decorativo, sfondi, foto e tipografia. CSS separato per non modificare il catalogo shop o il tema di Lume.

| Elemento respinto nel report | Contrasto verificato dopo la modifica |
| --- | ---: |
| Pulsante «Menù completo» della hero | 5,02:1 |
| Etichetta «La Fattoria» | 5,33:1 |
| Collegamento «Scopri i Prodotti!» | 5,50:1 |

Rapporti calcolati sui colori effettivi restituiti dal browser. Tutti e tre superano 4,5:1.

## Cache e punti da ricontrollare online

Il report segnala TTL di 10 minuti e stima 462 KiB di risparmio tramite cache più lunga.
Il TTL è un’intestazione HTTP dell’hosting: un meta tag HTML, un file `.htaccess` o
un file `_headers` nel repository non lo impostano su GitHub Pages. La risposta dello
[staff GitHub sul supporto delle intestazioni personalizzate](https://github.com/orgs/community/discussions/60087)
descrive questo limite. Non sono state introdotte configurazioni fittizie o cache
offline che possano conservare menù e prezzi obsoleti.

La riduzione dei file diminuisce anche il costo delle visite a cache scaduta.
Il parametro di versione del CSS permette l’aggiornamento del bundle, ma non allunga il TTL.
L’avviso sulla cache potrà quindi restare. Anche un CSS unico resta una risorsa
bloccante: sono state eliminate due richieste, non promessi 440 ms di risparmio reale.

Le stime originali di 244 KiB per immagini, 440 ms per CSS e 140 ms per font
sono indicazioni di Lighthouse, non risultati misurati dopo l’intervento.

## Confronto locale prima/dopo

Chrome, viewport 390×844, DPR 2, CPU rallentata 4 volte, attesa artificiale di
80 ms per risposta. Tre esecuzioni per versione, mediana. Il peso è una stima
dei corpi delle risposte: gzip per HTML/CSS/JS/JSON e byte dei file binari,
senza intestazioni HTTP. «Completa» include lo scorrimento fino al footer.

| Pagina / risorse | Prima | Dopo | Differenza |
| --- | ---: | ---: | ---: |
| Home, caricamento iniziale | 301,7 KiB | 240,3 KiB | −20,3% |
| Home, visita completa | 500,8 KiB | 358,1 KiB | −28,5% |
| `/menu/`, caricamento iniziale | 180,4 KiB | 173,5 KiB | −3,8% |
| `/lume/`, caricamento iniziale | 120,1 KiB | 120,1 KiB | invariato |

CLS delle tre pagine: 0 in tutte le esecuzioni del confronto.
Le mediane LCP locali sono 1.768→1.528 ms per la home, 1.352→1.164 ms per
`/menu/` e 1.924→2.792 ms per Lume. I tempi variano molto, anche su Lume,
che serve esattamente gli stessi file e gli stessi byte prima e dopo.
Questi tempi non consentono di attribuire miglioramenti o regressioni reali
alle modifiche. La riduzione di peso e richieste è invece verificabile.
Non è stato generato un nuovo punteggio Lighthouse: va rieseguito PageSpeed
sulla versione pubblicata.

## Riproducibilità

Verifiche superate: 44 combinazioni di pagina/larghezza (11 pagine a 320, 390,
768 e 1280 px), senza errori JavaScript, file mancanti o elementi che fuoriescono
orizzontalmente. Controllati navigazione da tastiera, ricerca e categorie del menù,
81 piatti, schede e preferiti di Lume in entrambe le lingue, popup prenotazioni,
numero telefonico e caricamento/rimozione dell’iframe su richiesta.
Cinque pagine menù/stampa conservano gli 81 piatti senza JavaScript; verificato
anche il rispetto di `prefers-reduced-motion` in Lume.

Controllati visivamente hero, intestazione, menù e footer su mobile e desktop.
Tutti i riferimenti locali dei 15 HTML pubblici esistono; JSON e sitemap validi.
La rigenerazione completa non cambia i 12 HTML e il CSS già prodotti: sorgenti
e file pronti per la pubblicazione sono allineati.

Le prove, le immagini originali conservate per confronto, le schermate e le tracce
sono nella cartella locale `Documents/ChatGPT/Agriturismo Giuggioloni/pagespeed-2026-11-08/`,
fuori dal sito pubblicato. I test usano Chrome locale e richieste intercettate dai file
del repository: non misurano la rete, la compressione o il server di produzione.
Google Maps viene simulato nei test delle interazioni; l’URL dell’iframe è verificato
rispetto alla scheda fornita dall’utente.

La cartella `admin/` resta esclusa dalla pubblicazione. Nessuna modifica al pannello,
al catalogo shop, ai dati dei piatti o alle sorgenti e animazioni di Lume.
