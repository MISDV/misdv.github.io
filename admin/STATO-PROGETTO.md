# Memoria del progetto — Agriturismo Giuggioloni

Aggiornamento: 13 novembre 2026. Decisione esplicita dell'utente.

**Stato: IN PAUSA.** Il progetto è praticamente completato. Non proseguire con
audit, ottimizzazioni, nuove funzionalità o pubblicazioni di propria iniziativa;
attendere una nuova richiesta dell'utente per riprendere il lavoro.

## Attività residue e priorità

| Priorità | Attività | Dettagli |
|---|---|---|
| Alta | Confermare gli orari | Raccogliere gli orari definitivi dell'agriturismo e dello spaccio. Restano in particolare l'orario del venerdì sera del ristorante e gli orari dello spaccio. Dopo conferma, sincronizzare testi visibili, footer, pagine tradotte e dati strutturati delle rispettive attività. Non inventare orari. |
| Medio-bassa | Nuove foto del locale | Attendere le nuove fotografie dell'utente; selezionarle, ottimizzarle e aggiornare le sezioni pertinenti, preservando lo stile attuale. |
| Molto bassa | Completare gli item dello shop | Aggiungere qualche foto e confermare prezzi e disponibilità dei prodotti. Aggiornare solo le informazioni ricevute, senza presumere disponibilità o prezzi. |

Queste priorità sostituiscono le precedenti liste di possibili miglioramenti:
non trattare le raccomandazioni degli audit storici come attività ancora da
eseguire automaticamente.

## Stato tecnico alla pausa

Ultimo intervento: controllo completo e ottimizzazioni del 13 novembre 2026,
documentati in [AUDIT-COMPLETO-2026-11-13.md](AUDIT-COMPLETO-2026-11-13.md).
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
- Il pannello admin è archiviato e non deve pubblicare aggiornamenti.

Questa è la nota corrente di stato; gli audit precedenti conservano valore storico.
