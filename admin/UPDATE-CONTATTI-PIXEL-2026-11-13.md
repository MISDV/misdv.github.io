# Aggiornamento contatti, società, orari e Pixel — 13 novembre 2026

Modifiche locali complete e verificate; nessun push o deploy eseguito.

- Venerdì del ristorante chiuso in sorgente comune, footer, riepiloghi IT/EN,
  Lume e dati strutturati. Sabato e domenica restano 11:30–15:00 e 19:00–23:00.
  Gli orari dello spaccio non sono stati comunicati e restano da richiedere.
- Ragione sociale esatta `SOCIETA' AGRICOLA GIUGGIOLONI SRL I SAPORI DELL ACQUAVIVA`
  e P. IVA `03044800427` centralizzate in `dati.json`. Tutti i 47 footer, incluse
  stampe e Lume, le riportano. `legalName` e `vatID` aggiornati nelle attività
  strutturate; non è stato dichiarato un codice fiscale non comunicato.
- Nuova `/prenotazione/`: telefono grande cliccabile, email, indirizzo, social,
  informazioni pratiche e due schede Maps distinte, con iframe caricati su richiesta.
  Pagina collegata dai footer e dal popup, con ContactPage, breadcrumb, canonical
  e anteprime social. Sitemap aggiornata a 11 URL pubblici.
- Pixel Meta `1820829302492303` installato nell'head di tutti i 50 HTML pubblici
  tramite loader locale. L'SDK remoto e PageView partono solo con consenso Marketing;
  nessun tracciamento automatico su scroll, filtri o cambio di scheda piatto Lume.
  I tre redirect legacy non inviano PageView, evitando un doppio conteggio.
- Nuovo consenso IT/EN con caselle separate per statistiche e marketing, rifiuto,
  salvataggio selettivo e accettazione completa. Nessuna casella preselezionata;
  la vecchia preferenza analytics non abilita Meta. Revoca sincronizzata tra schede
  e rimozione dei cookie di prima parte accessibili. Informativa aggiornata.

Il blocco noscript di tracciamento fornito con il codice base è stato omesso per
evitare una richiesta non subordinata al consenso. L'integrazione segue il
[template ufficiale Meta](https://github.com/meta/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl)
per disattivare autoConfig e history tracking e le
[indicazioni del Garante](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876)
per la scelta preventiva. Il precedente consenso riguardava solo le statistiche.

## Verifiche

- Analisi statica di 50 HTML: un solo script Pixel e consenso per head, nessun link
  pubblico al catalogo privato e nessun collegamento locale mancante. Le 31 pagine
  shop conservano noindex e restano fuori dalla sitemap.
- 19 pagine rappresentative e 29 stati del browser: zero errori JavaScript/HTTP
  e zero violazioni rilevate da axe nei criteri selezionati. Layout contatti provato
  a 320, 390, 768 e 1280 px, anche con testo al 200%, senza overflow orizzontale.
- Verificati due iframe con CID distinti, chiusura delle mappe, link telefono/email,
  accesso alla scheda dal popup e funzionamento senza JavaScript.
- Pixel simulato: nessuna richiesta prima del consenso o con sole statistiche;
  ID corretto, un init e un PageView per pagina, nessun duplicato dopo riaccettazione,
  revoca fra schede. Verifica aggiuntiva in memoria della revoca durante il caricamento
  SDK, del retry dopo errore e delle preferenze scadute/non valide.
- SDK e richieste Google/Meta simulati durante le prove: nessuna visita di test
  reale inviata. Il riscontro in Gestione eventi richiederà la pubblicazione e una
  visita con consenso Marketing; non è stato verificato un account Meta.
- Validatore ufficiale Schema.org su home e nuova pagina: zero errori e zero avvisi.
- Build completa ripetuta senza variazioni negli output; controllo diff superato.

Schermate, risultati e risposte dei validatori sono nella cartella esterna al sito
`contatti-pixel-societa-2026-11-13`. Le prove automatiche sono campioni tecnici,
non una certificazione di accessibilità o una garanzia di indicizzazione.

Intervento richiesto completato. Il progetto rimane in pausa per ulteriori lavori,
con priorità residue riportate in `STATO-PROGETTO.md`.
