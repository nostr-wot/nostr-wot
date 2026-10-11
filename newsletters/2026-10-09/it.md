---
issue: "2026-10-09"
locale: "it"
status: "prepared"
subject: "Account Archive arriva su Chrome e Firefox"
preheader: "Estensione 0.8.12 e SDK 1.0.4, verificati dal 2 al 9 ottobre."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive arriva in entrambi gli store dei browser

[Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) è ora indicata come versione 0.8.12 sia nel [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) sia in [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/). Entrambi gli store mostrano il 7 ottobre come data di aggiornamento. La versione GitHub è stata pubblicata il 6 ottobre alle 22:22 UTC e offre archivi separati per Chrome, Firefox e il codice sorgente corrispondente, oltre a digest SHA-256 registrati.

La precedente versione 0.8.11 ha introdotto Account Archive nelle Impostazioni. Può sincronizzare i relay selezionati manualmente oppure ogni ora, giorno o settimana, mantenere uno spazio locale cifrato, raggruppare i relay e riprendere dai checkpoint. Mostra il numero di eventi, la dimensione dell'archivio, l'avanzamento e gli errori per relay. La migrazione controlla una destinazione prima della conferma, conserva le firme originali, salta gli eventi non idonei e mantiene disponibili i dettagli degli eventi non riusciti.

La versione 0.8.12 permette di scaricare e importare normali file NDJSON di eventi firmati senza password, continuando a supportare le vecchie esportazioni cifrate. Prima di unire gli eventi importati, verifica che appartengano all'account e che le firme siano valide. Le finestre di importazione e download si aprono inoltre sopra l'intero popup, invece che dentro la scheda delle impostazioni.

## SDK 1.0.4 pubblica componenti di protocollo condivisi

Il registro npm riporta [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) l'8 ottobre alle 13:41 UTC e 1.0.4 alle 16:23 UTC. La versione 1.0.3 ha spostato responsabilità riutilizzabili per relay, wallet, dati e messaggi diretti in pacchetti dedicati. Il client NIP-47 condiviso negozia la cifratura, convalida le risposte, limita le attese e distingue un fallimento certo del pagamento da un esito incerto. Le opzioni native di collegamento NIP-46 offrono azioni tradotte e passaggio alla piattaforma senza modifiche DOM specifiche per ogni applicazione.

La versione 1.0.4 aggiunge caricamenti Blossom gestiti con una copia stabile dei byte in ingresso, annullamento da parte del chiamante e controlli sulla sessione attiva. I reindirizzamenti vengono rifiutati prima di provare un altro server configurato. I caricamenti cifrati usano una nuova identità di firma usa e getta e un'autorizzazione legata a ciascun server. Il pacchetto dati può anche svuotare cache osservabili con chiave senza rimuovere gli iscritti.

Il registro delle modifiche principale del repository termina ancora con SDK 1.0.2. Il dettaglio di queste due versioni del registro deriva quindi dal [PR sui protocolli](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), dal [PR su Blossom e cache](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) già uniti e dal contenuto dei pacchetti pubblicati. Una versione nel registro non dimostra che tutte le applicazioni che la usano siano state aggiornate.

## Limiti da mantenere visibili

Un archivio NDJSON non cifrato va trattato come dato locale sensibile, anche se gli eventi conservano le firme. I controlli di proprietà e firma proteggono l'integrità, ma non rendono il file riservato. La sincronizzazione dipende dai relay scelti dall'utente e non promette conservazione permanente o una cronologia completa.

Per Blossom, identità usa e getta e HTTPS riducono la possibilità di collegamento e l'esposizione durante il trasporto dei caricamenti cifrati, ma un server può ancora osservare dimensione e hash del testo cifrato, indirizzo IP e tempi. Il rifiuto dei reindirizzamenti mantiene byte e autorizzazione entro l'elenco configurato, ma non rende privato un server non attendibile.

## Un controllo pratico dopo l'aggiornamento

Verifica che l'estensione installata mostri la versione 0.8.12 prima di provare Archive. Inizia con una sincronizzazione manuale su un piccolo insieme di relay noti, controlla conteggi ed errori e conserva i file esportati in uno spazio protetto. Chi adotta SDK 1.0.4 dovrebbe fissare il valore di integrità pubblicato, provare annullamento e cambi di sessione e tenere separati gli esiti di pagamento incerti dai fallimenti confermati.
