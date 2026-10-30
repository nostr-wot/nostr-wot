---
issue: "2026-10-23"
locale: "it"
status: "prepared"
subject: "Extension 0.8.17 migliora passkey e firma locale"
preheader: "Pacchetti browser verificati dal 16 al 23 ottobre e confine esatto della versione SDK."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Cinque versioni verificate dell'estensione

Nostr WoT Extension ha pubblicato le versioni dalla [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) alla [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) durante la finestra di questa edizione. Ogni versione GitHub include pacchetti separati per Chrome e Firefox, sorgente riproducibile, somme SHA-256 e un orario di pubblicazione non preliminare. Gli store Chrome e Firefox mostravano la 0.8.17 come versione corrente il 23 ottobre.

La versione 0.8.13 aggiunge creazione e recupero di vault protetti da passkey, file di recupero cifrati, recupero esplicito tramite relay e un esploratore dell'archivio. Provider, file e relay sono opzioni separate. La conferma di un relay non dimostra che un altro dispositivo possa recuperare l'account, quindi conserva il file cifrato e prova il percorso scelto.

## La firma dal telefono resta sperimentale

La versione [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) aggiunge un bridge locale sperimentale verso una build compatibile di Nostr WoT sul telefono via Wi-Fi, oppure Bluetooth quando il browser supporta Web Bluetooth. L'abbinamento usa un codice corrispondente. Il computer riceve un account Network temporaneo e invia al telefono le richieste di firma o cifratura.

Il bridge supporta firma NIP-07 e cifratura classica NIP-04 e NIP-44. Le operazioni di identità del portafoglio, la pubblicazione interna e le operazioni post-quantistiche non sono disponibili quando è selezionata la firma dal telefono. La chiusura del bridge rimuove l'account temporaneo e un telefono disconnesso non usa mai le chiavi locali come ripiego. L'abbinamento sonoro non è disponibile in questa versione.

## Dadi, monete e permessi più chiari

La versione [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) aggiunge un flusso per la frase di recupero verificabile offline, usando 256 lanci di moneta come bit diretti o input di dadi elaborati con SHA-256. La scheda di gioco separata registra l'input ma non mostra la frase risultante. La versione riunisce inoltre chiavi post-quantistiche, Web of Trust e bridge locale in Experimental, permette di etichettare gli account senza nome e impedisce ai relay irraggiungibili di bloccare indefinitamente la configurazione.

La versione [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) riduce le richieste ripetute di accesso ai relay. Una scelta esplicita Always può coprire tutte le richieste in attesa per il sito selezionato o per tutti i siti connessi. Le autorizzazioni restano visibili e revocabili in Permissions, quindi l'accesso ampio va riesaminato dopo l'uso.

La versione [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) mantiene aperta la procedura passkey mentre viene salvato il primo account e riutilizza la verifica recente per la scelta iniziale del blocco automatico. L'autorizzazione monouso scade dopo cinque minuti e viene revocata dal blocco, dal cambio di account o da una nuova autenticazione.

## Confine della versione e controllo dell'aggiornamento

Nessun nuovo pacchetto SDK è stato pubblicato prima del limite del 23 ottobre alle 08:00 UTC. nostr-wot-sdk 2.0.0 è quindi rimasta l'ultima versione verificata nella finestra. La richiesta di modifica per SDK 3.0.1 è stata integrata soltanto alle 20:21 UTC di quel giorno, quindi appartiene alla prossima edizione.

Prima di aggiornare, scegli il pacchetto per il browser corretto, confronta il suo SHA-256 con le somme della versione e conserva un metodo di recupero funzionante. Considera sperimentale il bridge del telefono, riesamina i permessi relay ricordati e verifica il recupero passkey su un secondo dispositivo supportato prima di farvi affidamento.
