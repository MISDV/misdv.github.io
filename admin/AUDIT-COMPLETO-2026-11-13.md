# Verifica completa del sito — 13 novembre 2026

Il controllo riguarda il checkout locale pronto per GitHub Pages. Non è stata
eseguita una pubblicazione. Le modifiche precedenti a navigazione, fattoria e
accesso diretto al catalogo sono state mantenute.

## Modifiche eseguite

- Font del sito pubblico alleggeriti con sottoinsiemi WOFF2 locali. Sono conservati
  disegno dei glifi, pesi, kerning, legature e varianti numeriche; i font originali
  restano il fallback per caratteri meno comuni. Incluse le licenze originali.
  Shop e Lume mantengono i propri font e fogli di stile.
- Preload del titolo aggiornato al font effettivamente utilizzato. I sottoinsiemi
  hanno nomi legati al contenuto; non richiedono servizi esterni.
- Versioni di `menu.mjs`, `booking.js` e `consent.js` calcolate dai contenuti,
  insieme a `site.js`, per evitare che una modifica lasci script vecchi in cache.
- Sitemap generata dagli HTML finali: 10 URL indicizzabili, canonical controllati,
  esclusione automatica di redirect e pagine noindex. La build si interrompe se
  una pagina del catalogo perde il noindex o compare un collegamento allo shop
  fuori dalla sua cartella. Nessuna data lastmod fittizia.
- Footer del sito pubblico: sostituito il secondo collegamento duplicato allo
  spaccio con il collegamento alla pagina Fattoria. Prodotti continua a portare
  a `/spaccio/`, con lo stesso stile già approvato.

## Prestazioni misurate

Campione mobile 390 × 844, DPR 2, Chrome headless, CPU rallentata 4 volte e
80 ms aggiunti a ogni risposta locale, cache nuova per ogni visita. Tre esecuzioni
alternate prima/dopo per home, menù, fattoria, spaccio e Lume.

I valori sotto sono il peso delle risorse richieste inizialmente: gzip stimato
per HTML/CSS/JS/SVG e byte effettivi per immagini e WOFF2, senza header HTTP.
Il valore finale tiene conto anche dell'ultima correzione al footer. Non sono
punteggi PageSpeed né misure CrUX degli utenti reali.

| Pagina | Prima | Dopo | Riduzione |
|---|---:|---:|---:|
| Home | 257,6 KB | 231,7 KB | 10,1% |
| `/menu/` | 192,8 KB | 142,8 KB | 25,9% |
| `/fattoria/` | 283,5 KB | 263,5 KB | 7,1% |
| `/spaccio/` | 248,7 KB | 206,8 KB | 16,9% |
| `/lume/` | 138,6 KB | 138,6 KB | invariato |

Nel menù i font richiesti scendono da 149,0 a 98,2 KB, circa il 34% in meno.
Le catture della prima schermata delle cinque pagine coincidono al pixel tra
prima e dopo l'ottimizzazione dei font; coincidono anche le misure degli elementi
di testo confrontati. Il successivo cambio del collegamento nel footer è
intenzionale. Lume conserva gli stessi asset, animazioni e resa grafica.

CLS pari a zero nelle 30 visite del confronto controllato. I tempi LCP locali
variano tra esecuzioni, anche su Lume il cui codice è invariato: non vengono
presentati come miglioramenti garantiti del sito pubblicato.

## SEO e contenuti

- Analizzati 49 HTML pubblicabili, escluso l'admin: nessun riferimento locale
  mancante, ancora rotta o ID duplicato rilevato dal controllo statico.
- Le 10 pagine indicizzabili hanno titolo e descrizione univoci, lingua, H1,
  canonical, metadati Open Graph/Twitter e JSON-LD. Hreflang reciproci corretti
  per home e menù IT/EN; favicon e icone locali disponibili.
- In ciascuna carta: 11 categorie e 81 voci nell'HTML e nello schema Menu.
  Formule a 38 e 40 euro a persona; Fiorentina a 50 euro/kg con unità KGM.
  AboutPage della storia e riferimenti alle attività mantenuti.
- Ristorante e spaccio conservano coordinate, identificativi e mappe distinti;
  l'entità Store pubblica usa `/spaccio/#spaccio`.
- Validatore ufficiale Schema.org su fattoria e spaccio: zero errori e zero avvisi.
  I precedenti controlli sui menù e sulla storia sono documentati nell'audit SEO
  del 12 novembre; i relativi dati strutturati non sono stati modificati qui.
- Tutte le 31 pagine nella cartella shop, compreso l'asporto, restano
  `noindex,follow`, fuori dalla sitemap e senza collegamenti in ingresso dalle
  altre pagine. Il robots.txt consente la scansione necessaria a leggere noindex.

## Verifiche funzionali, mobile e accessibilità

- 18 pagine rappresentative controllate con axe: home e menu IT/EN, fattoria e
  sottopagine, storia, spaccio, privacy, Lume IT/EN e stampe, shop, olio, asporto.
  Nessuna violazione automatica rilevata dei criteri WCAG selezionati.
- Ulteriori controlli sui pannelli di navigazione e filtri, dialoghi prenotazione
  e DoubleN, preferenze cookie, schede piatto e allergeni di Lume, tema scuro.
  Sono stati provati anche Escape, ritorno del focus e blocco dello sfondo.
- Home, menu, fattoria, spaccio e Lume senza overflow orizzontale a 320, 768 e
  1280 px, anche con dimensione del testo al 200%; controllo ordinario a 390 px.
- Filtri menu: categorie, due formule fisse, ricerca, nessun risultato e ripristino;
  prezzi e lingua corretti. HTML consultabile senza JS: 81 voci e 4 percorsi fattoria.
- Telefono corretto nel popup; iframe del ristorante e dello spaccio con gli
  identificativi previsti, caricati su richiesta e rimossi alla chiusura.
- Nessuna richiesta esterna automatica nelle visite iniziali. Analytics compare
  solo sulla home dopo consenso; scelta essenziale e revoca verificate. Le
  richieste a Google durante i test sono simulate, senza inviare statistiche reali.
- Foto sotto la prima schermata caricate e decodificate scorrendo le pagine:
  4 nella fattoria, 9 nello spaccio, 3 nell'orto e 3 nel locale.
- Nessun errore JavaScript o risposta HTTP di errore rilevato nei percorsi provati.
  Il server Python standard su Windows assegnava text/plain ai moduli .mjs:
  l'anteprima è stata corretta. Il sito GitHub Pages risponde già text/javascript.
- Rigenerazione completa ripetibile, senza differenze negli output a parità di
  sorgenti; `git diff --check` superato. L'admin resta escluso da Pages e in sola
  lettura nel servizio locale archiviato.

I controlli automatici e i campioni manuali non costituiscono una certificazione
di accessibilità. Per le prestazioni pubblicate serve una nuova verifica dopo il
push: cache CDN, rete e dispositivo reale incidono sui risultati. Le indicazioni
seguono le [linee guida web.dev sui font](https://web.dev/learn/performance/optimize-web-fonts)
e le [indicazioni Google sulle sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Dati e controlli ancora dipendenti dall'attività

Restano da comunicare gli orari dello spaccio e l'orario preciso del venerdì sera
del ristorante, i formati della pasta De Carlonis e i prezzi non ancora confermati
nei listini privati. Non sono stati inventati orari, disponibilità o certificazioni
sugli allergeni. Foto specifiche dei singoli prodotti potranno sostituire i segnaposto.

Dopo la pubblicazione: ricontrollare sitemap, HTML online e Search Console. La
correttezza tecnica non garantisce indicizzazione, posizioni o rich result; per
lo shop va verificata invece la progressiva esclusione dopo la lettura di noindex.

Misure, schermate, risposte Schema.org, controlli statici e prove del browser sono
archiviati fuori dal sito, nella cartella `audit-completo-2026-11-13` della cartella
di lavoro Agriturismo Giuggioloni.
