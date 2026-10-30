---
issue: "2026-10-30"
locale: "it"
status: "prepared"
subject: "SDK passkey stabile ed Extension 0.8.20 pubblicati"
preheader: "Pacchetti npm e browser verificati dal 23 al 30 ottobre, con modifiche a recupero e indirizzi Lightning."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## I pacchetti passkey stabili sono su npm

Il registro npm ha pubblicato [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) alle 20:24 UTC e [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) alle 20:25 UTC del 23 ottobre. Entrambi i pacchetti puntano al commit `384023f` e includono valori di integrità del registro. Questa è una prova di distribuzione, non soltanto un tag o una build del repository.

La versione stabile rende esplicite le modalità passkey. Una passkey derivata produce la chiave Nostr dall'output PRF di WebAuthn, mentre una passkey memorizzata protegge una chiave, un seed o un vault con più account. Le credenziali precedenti ambigue vengono indicate come ambigue invece di essere interpretate in silenzio. I record di recupero cifrati possono usare archiviazione locale, del provider o su relay controllata dall'host, ma l'applicazione resta responsabile di WebAuthn, consenso, trasporto, verifica delle firme e prove di recupero.

SDK 3.0.1 supporta anche backup Nosskey espliciti e un firmatario provider che fissa la finestra iframe, l'origine HTTPS e l'account selezionato. Il supporto del protocollo non dimostra che ogni dispositivo, browser o provider possa recuperare un account. Gli sviluppatori devono provare l'autenticatore e il percorso di archiviazione esatti che intendono supportare.

## Extension 0.8.18 unifica importazione e recupero

[Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) è stata pubblicata il 24 ottobre con pacchetti separati per Chrome e Firefox, sorgente e somme SHA-256. Rileva passkey e backup supportati, mostra l'identità pubblica recuperata prima del salvataggio e può recuperare backup Nosskey compatibili senza cambiare l'identità originale. Ripristina inoltre l'abbinamento sonoro Wi-Fi facoltativo su dispositivi audio a 44,1 kHz. L'ascolto parte solo su richiesta, termina dopo un tentativo o 30 secondi e richiede comunque conferma sul telefono.

[La versione 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) corregge gli errori di aggiunta dell'account che riaprivano per sbaglio la configurazione iniziale del blocco automatico. Account duplicati e controlli vault non riusciti mostrano ora l'errore effettivo con un'opzione di nuovo tentativo, conservando la protezione esistente.

## Indirizzi Lightning più brevi nella 0.8.20

[La versione 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) è stata pubblicata il 29 ottobre. Gli indirizzi Lightning ospitati usano ora il dominio più breve `@nostrwot.com` nelle impostazioni, nelle azioni di copia, nei QR di ricezione e negli aggiornamenti facoltativi del profilo. Gli indirizzi esistenti `@zaps.nostr-wot.com` continuano a raggiungere lo stesso portafoglio. Gli indirizzi di provider personalizzati e il server API del portafoglio non cambiano, e l'aggiornamento del profilo richiede ancora conferma.

Prima di aggiornare, installa il pacchetto per il browser corretto e confronta il suo SHA-256 con le somme della versione. Salva la configurazione, controlla la chiave pubblica recuperata prima di salvare e prova il recupero su un secondo dispositivo supportato. Un cambiamento nella visualizzazione dell'indirizzo non obbliga a scartare un vecchio indirizzo funzionante.
