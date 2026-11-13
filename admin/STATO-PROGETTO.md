# Memoria del progetto — Agriturismo Giuggioloni

Aggiornamento: 13 novembre 2026. Decisione esplicita dell'utente.

**Stato: IN PAUSA.** Il progetto è praticamente completato. Non proseguire con
audit, ottimizzazioni, nuove funzionalità o pubblicazioni di propria iniziativa;
attendere una nuova richiesta dell'utente per riprendere il lavoro.

## Attività residue e priorità

| Priorità | Attività | Dettagli |
|---|---|---|
| Alta | Confermare gli orari dello spaccio | Il venerdì del ristorante è stato confermato chiuso e aggiornato in sito, footer, inglese, Lume e dati strutturati. Gli orari sabato/domenica restano 11:30–15:00 e 19:00–23:00. Mancano gli orari dello spaccio: non copiare quelli del ristorante e non inventarli. |
| Medio-bassa | Nuove foto del locale | Attendere le nuove fotografie dell'utente; selezionarle, ottimizzarle e aggiornare le sezioni pertinenti, preservando lo stile attuale. |
| Molto bassa | Completare gli item dello shop | Aggiungere qualche foto e confermare prezzi e disponibilità dei prodotti. Aggiornare solo le informazioni ricevute, senza presumere disponibilità o prezzi. |

Queste priorità sostituiscono le precedenti liste di possibili miglioramenti:
non trattare le raccomandazioni degli audit storici come attività ancora da
eseguire automaticamente.

## Stato tecnico alla pausa

Ultimo intervento autorizzato: aggiornamento del 13 novembre 2026 di orari,
dati societari, Pixel Meta con consenso marketing e pagina `/prenotazione/`,
documentato in [UPDATE-CONTATTI-PIXEL-2026-11-13.md](UPDATE-CONTATTI-PIXEL-2026-11-13.md).
Intervento completato; il progetto torna in pausa in attesa di nuove richieste.
L'audit generale precedente resta in [AUDIT-COMPLETO-2026-11-13.md](AUDIT-COMPLETO-2026-11-13.md).
Modifiche salvate nel checkout locale e verificate; nessun push o deploy eseguito
dall'assistente nell'ultimo intervento. La pausa non autorizza una pubblicazione.

Per la ripresa conservare le decisioni approvate:

- Grafica attuale e animazioni di Lume da preservare, con attenzione al mobile.
- Navigazione: menù completo su `/menu/`, fattoria su `/fattoria/`, prodotti su
  `/spaccio/`. Lume si raggiunge dalla rispettiva pagina menù IT/EN.
- Shop e sottopagine accessibili tramite link diretto o collegamenti interni
  al catalogo: `noindex,follow`, esclusi dalla sitemap, senza link in ingresso
  dalle altre pagine. Lo shop resta esistente.
- Agriturismo e Spaccio Aziendale Giuggioloni sono due attività Google distinte,
  con mappe e dati strutturati separati.
- Scheda completa dei contatti: `/prenotazione/`, collegata dai footer e dal popup.
- Società: `SOCIETA' AGRICOLA GIUGGIOLONI SRL I SAPORI DELL ACQUAVIVA`,
  P. IVA `03044800427`, centralizzata in `dati.json`.
- Pixel Meta `1820829302492303` su tutte le pagine pubbliche, attivato solo dal
  consenso marketing. Statistiche e marketing hanno preferenze distinte; la
  vecchia scelta alle statistiche non autorizza il Pixel.
- Il pannello admin è archiviato e non deve pubblicare aggiornamenti.

Questa è la nota corrente di stato; gli audit precedenti conservano valore storico.
