---
issue: "2026-09-25"
locale: "it"
status: "prepared"
subject: "Nostr WoT aggiunge connessioni wallet limitate per applicazione"
preheader: "Estensione 0.8.3, versioni del grafo su npm e Amber 6.6.5, verificate dal 18 al 25 settembre."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Accesso separato al wallet per ogni applicazione

[Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), pubblicata il 23 settembre alle 07:28 UTC, può creare più connessioni Nostr Wallet Connect per il wallet LNbits dell'estensione. Ogni applicazione può ricevere una connessione dedicata con nome, limite giornaliero di spesa e data di scadenza. Le impostazioni del wallet mostrano le connessioni attive e l'uso del budget e permettono di copiare una stringa di connessione, visualizzarne il codice QR o revocarla senza sostituire l'accesso delle altre applicazioni.

Le note di versione indicano che i segreti delle connessioni restano cifrati localmente e che le registrazioni interrotte possono essere recuperate. La convalida ha usato un wallet LNbits vuoto per creare, elencare e revocare connessioni e completare uno scambio NWC `get_info` firmato. Non è stato inviato alcun pagamento reale. I server LNbits personalizzati richiedono un adattatore di gestione compatibile, quindi non tutti i servizi NWC offrono necessariamente gli stessi controlli.

La versione 0.8.3 include le precedenti versioni 0.8. La [versione 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) ha ripristinato l'API sperimentale `window.nostr.wot` come opzione esplicita, disabilitata per impostazione predefinita, e ha aggiunto la sincronizzazione limitata del grafo, avvisi prima di sostituire una lista di contatti e punteggi basati sugli account silenziati. GitHub fornisce archivi ZIP per Chrome, Firefox e il codice sorgente con hash SHA-256 registrati. Questi download provano la distribuzione su GitHub, non la pubblicazione negli store. La scheda Chrome attuale è stata controllata durante il recupero, ma non permette di ricostruire la versione disponibile al 25 settembre. Non è stata trovata una scheda Nostr WoT corrispondente in Firefox Add-ons, quindi questa edizione non dichiara una disponibilità in quello store.

## I pacchetti del grafo arrivano su npm

Il registro npm riporta [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) il 20 settembre alle 00:17 UTC e il pacchetto principale [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) un minuto dopo. La versione del grafo raggruppa le scansioni dei relay, aggiunge un limite esplicito ai salti, conserva versioni deterministiche degli eventi sostituibili e comprime le liste di contatti persistenti. Limita anche le interrogazioni di distanza in batch e mantiene le scritture in sospeso dopo un flush fallito.

C'è un limite di migrazione da pianificare: il database del grafo passa allo schema IndexedDB 2 e le vecchie versioni dell'SDK non possono riaprire uno spazio dei nomi aggiornato. Prova l'aggiornamento con un profilo usa e getta o con una cache ricostruibile prima di applicarlo a dati persistenti. La versione 0.3.1 è seguita alle 10:47 UTC ed è l'ultima versione del grafo al termine del periodo. Il suo changelog descrive solo modifiche alla documentazione e dichiara che non ci sono cambiamenti in fase di esecuzione.

## Amber restringe il confine di un permesso di backup

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), pubblicata il 21 settembre alle 14:32 UTC, cifra i backup del firmatario con una chiave dedicata derivata tramite HKDF fuori dallo spazio di derivazione NIP-44. Secondo le note, questo impedisce a un'applicazione con permesso `nip44_decrypt` memorizzato di usare quel permesso per leggere backup contenenti segreti NIP-46 per applicazione e chiavi locali.

I vecchi backup cifrati con la chiave di identità possono ancora essere ripristinati finché una pubblicazione successiva non li sostituisce. La versione fornisce APK Android e un manifesto di checksum firmato. Ciò prova la disponibilità degli artefatti e offre un percorso di verifica, non l'installazione su uno specifico dispositivo né la distribuzione in ogni store. Il progetto segnala un confine corretto, non un incidente sfruttato o un numero di utenti interessati.

## Un controllo pratico durante l'aggiornamento

Assegna a ogni applicazione wallet una connessione separata, con il minimo limite giornaliero utile e una data di scadenza. Verifica poi che la revoca di una connessione lasci intatte le altre. Per l'SDK, prova la migrazione dello schema e la ricostruzione della cache prima di usare il nuovo pacchetto del grafo con dati persistenti. Per Amber, verifica la versione installata e pubblica un nuovo backup se dipendi dal recupero tramite relay. Questi controlli riducono l'accesso condiviso e le sorprese di formato senza considerare una nota di versione come prova di ogni distribuzione.
