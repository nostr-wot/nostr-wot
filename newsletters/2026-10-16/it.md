---
issue: "2026-10-16"
locale: "it"
status: "prepared"
subject: "SDK 2.0.0 pubblicato, Amethyst aggiunge strumenti di fiducia"
preheader: "Versioni verificate di SDK, desktop, firmatario e Web of Trust dal 9 al 16 ottobre."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 è pubblicato su npm

Il registro npm riporta [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) il 12 ottobre alle 22:32 UTC. Il pacchetto pubblicato punta al commit `2937df1`, include un valore di integrità del registro e cambia la licenza del codice proprietario del progetto da MIT a GPL-3.0-only. Le versioni pubblicate in precedenza mantengono la licenza originale. Il [changelog pubblicato](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) elenca le corrispondenti versioni principali dei pacchetti con ambito autenticazione, Blossom, dati, messaggi diretti, grafo, relay, firmatari, interfaccia, portafoglio e WoT.

Si tratta di una versione di licenza, non della prova di una nuova funzione runtime. Prima dell'aggiornamento, gli sviluppatori dovrebbero verificare la compatibilità della licenza, bloccare il valore di integrità del registro e testare l'insieme esatto dei pacchetti installati dall'applicazione. Una versione privata del monorepo, un tag o una build non dimostrerebbero da soli la pubblicazione; qui il record npm è la prova della distribuzione.

## Amethyst arriva sul desktop e amplia il supporto della fiducia

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) è stato pubblicato l'11 ottobre alle 19:27 UTC con artefatti per Android, Linux, macOS e Windows, ciascuno con un digest SHA-256 registrato. Le note includono l'app desktop con interfaccia condivisa e l'integrazione di un indice di rete e di un provider di fiducia NIP-85.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) è seguito il 14 ottobre alle 13:16 UTC con un altro insieme completo di artefatti. La versione aggiunge il supporto del firmatario remoto NIP-46 al flusso di accesso, eventi Calendar Collection e RSVP, supporto nativo Wayland, limiti per client sui relay con attesa NIP-01 e correzioni per la sincronizzazione della rete di fiducia e i download Web of Trust su desktop.

Il cambiamento pratico è la separazione delle responsabilità. NIP-46 consente a un client di richiedere firme a un firmatario remoto invece di conservare la chiave di firma. NIP-85 offre un modo standard per ricevere affermazioni di fiducia, ma queste dipendono ancora dal provider e dai suoi dati. Nessuna delle due funzioni rende oggettivo un punteggio di fiducia o elimina la necessità di controllare le richieste di firma.

## Confine della versione dell'estensione

Nessuna versione di Nostr WoT Extension è stata pubblicata in questa finestra. L'ultima prima del limite è rimasta la [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), che gli store di Chrome e Firefox indicavano come corrente il 9 ottobre. La successiva versione GitHub, 0.8.13, è stata pubblicata il 17 ottobre, dopo il limite di questa edizione, quindi le sue funzioni sono escluse.

## Un controllo prudente prima dell'aggiornamento

Per SDK 2.0.0, verifica il passaggio a GPL-3.0-only, blocca le versioni risolte ed esegui build e test dell'applicazione. Per Amethyst, scarica solo l'artefatto adatto al sistema e all'architettura, confronta il digest registrato, salva una copia della configurazione e prova prima l'abbinamento NIP-46 con un account a basso rischio. Controlla che il firmatario mostri l'evento previsto prima di approvarlo. Considera i risultati NIP-85 come un elemento della decisione, non come un confine di autorizzazione.
