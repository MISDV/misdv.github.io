# Aggiornamento SEO — 12 novembre 2026

Implementato nei generatori e negli HTML statici per GitHub Pages. Lavoro locale: nessun commit, push o pubblicazione eseguiti.

## Modifiche completate

- `/menu/` e `/menu/en/`: schema `Menu` generato dallo stesso catalogo localizzato usato per il contenuto visibile. In ogni lingua: 11 `MenuSection`, 81 `MenuItem`, offerte in EUR con nomi, descrizioni e prezzi allineati all’HTML. Inclusi portate, inclusioni, condizioni dei menù fissi, stagione, coperto, nota sugli allergeni e data del catalogo. Le formule restano 38 e 40 euro a persona; la Fiorentina 50 euro/kg. Le voci indisponibili e le sezioni vuote seguono gli stessi criteri dell’HTML. Le descrizioni esclusivamente presenti in Lume non sono state dichiarate nelle pagine dove non compaiono.
- `/storia.html`: aggiunto `AboutPage`, derivato dai metadati attuali della storia e collegato al sito, al ristorante e al breadcrumb. Il contenuto familiare resta quello già pubblicato.
- Entità locali: aggiunte coordinate verificate nei dati `Restaurant` e `Store`, mantenendo distinti gli identificativi e le schede Google. Dati del ristorante sincronizzati anche con telefono, email e indirizzo della sorgente comune; `hasMenu` collega il ristorante al Menu strutturato.
- Metadati: uniformati Open Graph e Twitter con titolo, descrizione, immagine, testo alternativo, dimensioni e MIME delle immagini locali. Aggiunta l’icona Apple dove mancava. Copertura delle 39 pagine indicizzabili e delle pagine con anteprima social, comprese Lume, privacy e asporto. Le pagine di stampa e i vecchi reindirizzamenti mantengono il loro ruolo.
- Le aggiunte sono eseguite durante la build. Nessun servizio esterno o nuovo script eseguibile viene caricato per generare gli schemi o leggere le dimensioni delle immagini.

## Coordinate verificate

| Attività | Latitudine | Longitudine | Identificativo Google Maps |
| --- | --- | --- | --- |
| Agriturismo Giuggioloni | 43.5008624 | 13.4686844 | 15872387788371118319 |
| Spaccio Aziendale Giuggioloni | 43.5008501 | 13.4688448 | 9272369709286845202 |

Fonti: [scheda agriturismo](https://maps.app.goo.gl/6PyLqpXUET7VkAeW9) e [scheda spaccio](https://maps.app.goo.gl/gq54ttiR5VY8cQ7M6), fornite dal proprietario. Verifica HTTP 302 del 12 novembre: i redirect contengono gli identificativi attesi e i punti POI nei token `!3d` e `!4d`. I diversi centri visuale dopo `@` sono stati scartati. Coordinate e fonte sono conservate nei rispettivi file Maps.

## Verifiche svolte

- Tutti i 49 HTML controllati: 39 indicizzabili, 6 noindex intenzionali, 3 reindirizzamenti e 1 pagina admin esclusa dalla build. Canonical, sitemap, hreflang, favicon, metadati e risorse locali coerenti; JSON-LD leggibile e senza entità principali duplicate.
- Verificata la corrispondenza completa tra menù HTML e schema nelle due lingue: categorie, voci, nomi, prezzi, condizioni, portate, inclusioni e data. Controllati i casi di voci indisponibili, sezioni vuote, prezzi di visualizzazione testuali e serializzazione sicura. L’anteprima home non pubblica un secondo catalogo completo.
- `AboutPage` collegata correttamente; coordinate coerenti in 1 Restaurant e 31 Store (spaccio, catalogo e 29 schede prodotto).
- Ripetuta la build completa: nessuna differenza residua tra esecuzioni consecutive. Verifica diff superata.
- Il confronto dei corpi HTML con la situazione iniziale conferma che tutti i 49 `<body>` sono identici: grafica, contenuti visibili, header, footer e animazioni non sono stati modificati.
- Validatore ufficiale Schema.org, inviando l’HTML locale aggiornato: **0 errori e 0 avvisi** per menù italiano, menù inglese, storia, home, spaccio e scheda Oca. Quest’ultima include il prezzo al kg con supplemento di pelatura separato.
- Google Rich Results Test in modalità codice sul grafo effettivo aggiornato della home: **2 elementi validi**, per attività locale e organizzazione. Un solo problema non critico: campo facoltativo `priceRange` mancante. [Risultato Google](https://search.google.com/test/rich-results/result?id=HyUEO9zHXOluIa84tpu5_g). Il test riguarda il grafo locale inserito, non una nuova scansione della pagina pubblicata.

`Menu` e `AboutPage` sono tipi Schema.org: non corrispondono automaticamente a una specifica anteprima avanzata di Google. La validazione e l’assenza di errori non garantiscono indicizzazione o posizionamento.

## Rivalutazione dell’audit: cosa resta

| Punto | Stato e prossimo intervento |
| --- | --- |
| Menu completo IT/EN | Completato e sincronizzato con la build. |
| AboutPage storia | Completato. |
| Coordinate delle attività | Completate e verificate. |
| Tag social, dimensioni immagini, icona Apple | Completati automaticamente dai generatori. |
| Geo meta tradizionali e preconnect | Nessuna aggiunta necessaria: Google ignora i primi; le risorse iniziali sono locali e Maps/statistiche mantengono la propria attivazione. |
| Foto specifiche dei prodotti | Restano da inserire per le 29 schede. Le fotografie generali dello spaccio sono già usate nelle condivisioni; non vengono dichiarate come immagini dei singoli prodotti. |
| Prezzi da definire | Restano 8 prodotti senza prezzo e la latta d’olio da 3 litri. Nessun prezzo o recensione inventati. Le relative pagine sono comunque indicizzabili come normali pagine. |
| Formati De Carlonis | Restano da definire; prezzo e peso del pacco già noti sono mantenuti. |
| Orari strutturati | Orario del venerdì sera del ristorante e orari dello spaccio da confermare prima di pubblicare una tabella completa. Gli orari del ristorante non sono copiati nello spaccio. |
| Fascia prezzo del ristorante | `priceRange` è facoltativo. Definire una fascia rappresentativa della spesa, evitando di presentare i soli menù fissi come intervallo dell’intera offerta. |
| Riscontro dopo pubblicazione | Dopo il caricamento su GitHub: verificare gli HTML effettivamente pubblicati, ispezione URL in Search Console e successiva scansione Google. Non è stata richiesta né eseguita una pubblicazione in questo intervento. |

I file di verifica, le risposte dei validatori e il confronto dei contenuti sono nella cartella di lavoro `seo-implementazione-2026-11-12` degli artefatti locali, fuori dal sito pubblico.

## Manutenzione

Menu: `admin/menu-schema.mjs`, integrato in `admin/menu-page.mjs` e `admin/menu-english.mjs`. Storia e ristorante: `admin/site-business.mjs`, integrato nel passaggio comune degli asset. Spaccio: `admin/shop-business.mjs`. Metadati social: `admin/site-metadata.mjs`, integrato anche nei generatori di shop, asporto e Lume.

Eseguire la sequenza di build documentata in `admin/README.md` e caricare insieme sorgenti e HTML generati. Nessuna dipendenza nuova è necessaria.
