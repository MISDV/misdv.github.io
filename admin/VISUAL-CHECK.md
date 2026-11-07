# Controllo visivo e sincronizzazione — 7 novembre 2026

Controllo dei file locali in Chrome con screenshot di header, contenuto e footer.
Undici pagine provate a 320, 390, 1024 e 1280 pixel: home, menù, storia, animali,
orto, locale, privacy, introduzione inglese, shop e le due versioni di Lume.

## Correzioni

- Header e footer comuni derivano ora dalla home mediante `site-layout.mjs`.
  Lo stesso formato è applicato alla pagina inglese, con testi e navigazione
  tradotti. Le pagine generate non dipendono più da copie divergenti della storia.
- Marchi principali collegati alla home; formato circolare e contenimento delle
  immagini uniformati. Nome «I sapori dell’Acquaviva» normalizzato anche nei dati
  dello shop e nel copyright. Email dello shop resa cliccabile.
- Navigazione compatta fino a 1199 px per lasciare spazio al marchio; passaggio
  al desktop a 1200 px, coordinato con il comportamento JavaScript.
- Migliorati contenimento dell’email, leggibilità del copyright e formato degli
  orari. Pranzo e cena occupano righe distinte: gli intervalli non si spezzano.
- Stesso numero di prenotazione, indirizzo ed email verificati nelle pagine.
  I contenuti familiari e la precisazione sulla fattoria non visitabile restano
  presenti nelle pagine interessate. Il catalogo dello shop è ancora provvisorio.

## Verifiche

- 44 combinazioni pagina/larghezza senza sbordamenti o errori JavaScript.
- Apertura e chiusura della navigazione compatta verificate anche a 1024 px.
- Header e footer confrontati con il modello condiviso su otto pagine, comprese
  le versioni tradotte della pagina inglese.
- Numero, email, indirizzo, file del logo e collegamenti dei marchi confrontati
  su nove pagine. Nessun collegamento o ancoraggio locale mancante.
- Rigenerazione completa di layout, pagine e menù verificata senza cambiamenti
  inattesi nei dodici HTML interessati.
- Lume mantiene il proprio impianto grafico; lo shop mantiene il layout del
  catalogo. Il controllo riguarda l’identità, i contatti e i componenti comuni.

Screenshot e risultati sono salvati fuori dal sito nella cartella
`Documents/ChatGPT/Agriturismo Giuggioloni/controllo-visivo-2026-11-07`.
Nessun commit, push o deploy è stato eseguito. Non è una certificazione di resa
su tutti i browser o su dispositivi fisici.
