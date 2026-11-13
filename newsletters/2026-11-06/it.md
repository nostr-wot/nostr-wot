---
issue: "2026-11-06"
locale: "it"
status: "prepared"
subject: "Extension 0.8.22 migliora firma remota e recupero"
preheader: "Release scaricabili verificate dal 30 ottobre al 6 novembre, più Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 aggiunge modelli di permessi e un recupero più sicuro

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) è stata pubblicata il 2 novembre alle 18:46 UTC. La release include archivi scaricabili per Chrome, Firefox e il codice sorgente, con digest SHA-256. Questi artefatti dimostrano la distribuzione tramite GitHub, ma non l'approvazione nei negozi dei browser.

La versione aggiunge modelli di permessi facoltativi quando si collega un sito, incluso un preset per Nostr WoT Playground. Riordina inoltre seed phrase, chiavi private e recupero passkey in Keys & Backups, raggruppa le richieste di autenticazione dei relay e rende più chiare le decisioni collettive una tantum.

Le modifiche legate alla sicurezza ricontrollano i permessi del grafo dopo l'approvazione e serializzano i cambiamenti di consenso, evitando che un rifiuto o una disconnessione più recente venga sovrascritta da un'azione precedente ancora in attesa. I backup del provider passkey rispettano ora il limite di 2 KB memorizzando solo il materiale della chiave associata invece di un vault crescente. I file di recupero esistenti e i backup precedenti restano leggibili.

## In 0.8.22 le approvazioni del firmatario remoto restano al firmatario

[La versione 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) è seguita il 2 novembre alle 19:18 UTC con archivi propri per Chrome, Firefox e sorgente e digest SHA-256. Gli account Nostr Connect delegano al firmatario esterno firma, autenticazione, modifiche all'elenco dei contatti e cifratura o decifratura dei messaggi, senza richieste duplicate dell'estensione. L'estensione continua a imporre connessione del sito, accesso all'identità, convalida e permessi del portafoglio e del grafo.

Il controllo dei negozi del 5 novembre mostrava ancora 0.8.17 in Chrome e Firefox. Per questo 0.8.21 e 0.8.22 sono indicate come release scaricabili, non come aggiornamenti dei negozi. npm mostrava ancora [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) e [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), pubblicati il 23 ottobre. Nessun nuovo pacchetto SDK è stato pubblicato in questa finestra.

## Amethyst 1.21 porta piccole app nelle note

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) è stato pubblicato il 1 novembre con artefatti Android e desktop. Esegue NApplets e app WebXDC nelle note, aggiunge formati di ascolto e giochi e introduce una configurazione guidata della Web of Trust. La release limita anche l'accesso delle app integrate: la lettura di eventi privati richiede un permesso di decifratura, gli eventi firmati vengono verificati prima della consegna e i frame non ricevono cookie, WebRTC o chiavi di identità.

È un aggiornamento pubblicato di un client esistente, non il lancio di un nuovo progetto né la prova di un incidente sfruttato.

Prima di installare un pacchetto scaricabile, scegli l'archivio corretto per il browser e confronta il digest SHA-256 con i metadati della release. Salva la configurazione, conferma l'identità pubblica prima di memorizzare un recupero e verifica ogni richiesta mostrata dal firmatario esterno.
