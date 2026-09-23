---
issue: "2026-09-11"
locale: it
status: approved
subject: "Nostr WoT 0.7.0: più controllo sulle tue identità"
preheader: "Percorsi personalizzati, autorizzazioni più chiare e sei progetti da esplorare."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## Le tue identità, con più controllo

L’estensione Nostr WoT **0.7.0** è disponibile come [download su GitHub](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), pubblicata il **10 settembre 2026 alle 22:29 UTC**. La [scheda attuale di Chrome](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) mostra anch’essa **0.7.0**, aggiornata l’**11 settembre**. La disponibilità nello store Firefox resta **sconosciuta**: la scheda e la sua API hanno restituito 404. Uno ZIP Firefox su GitHub non dimostra approvazione nello store né compatibilità di installazione.

Il [registro delle modifiche pubblicato](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) include nomi degli account modificabili, percorsi di derivazione personalizzati in Advanced e anteprime della chiave pubblica prima di creare un sottoaccount. Le chiavi standard esistenti restano invariate. Conserva il percorso personalizzato esatto insieme al backup del seed: il nome locale dell’account non è un segreto di recupero.

Altre modifiche consentono il ripristino dei backup cifrati del seed e delle chiavi PQ, distinguono meglio le autorizzazioni una tantum da quelle permanenti e cifrano la cache del portafoglio. Le note richiedono Firefox desktop **140+** o Android **142+** e descrivono nuove richieste di consenso all’aggiornamento. Controlla questi requisiti prima di scegliere un download.

## Oltre l’estensione

**relayer 2.2.19**, [pubblicato l’8 settembre](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), aggiunge un’interfaccia per contare esattamente l’unione di filtri sovrapposti. Il [diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) mostra un limite: il sistema di archiviazione deve implementarla; quelli precedenti sommano ancora conteggi separati e possono contare risultati più volte.

Il **9 settembre**, il [chiarimento sui tipi di pagamento di NIP-A3](https://github.com/nostr-protocol/nips/pull/2463) ha aggiunto `bitcoincash` e `tron` e precisato gli schemi URI per tipi sconosciuti ambigui. È una modifica della specifica, non una prova del supporto in tutti i client.

Abbiamo verificato i registri ufficiali npm di tutti i **12 pacchetti non privati del SDK**. Nessuna versione è stata pubblicata nel periodo di questo numero. Il [pacchetto principale](https://registry.npmjs.org/nostr-wot-sdk) resta alla **1.0.1**, pubblicata il **16 agosto**: contesto, non una novità settimanale.

## Sei nuove schede, non sei lanci

Il nostro [indice dei progetti](https://nostr-wot.com/projects) ha aggiunto **Damus, Amethyst, Primal, Coracle, Amber e Nostur** l’[8 settembre](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7). Sono progetti esistenti appena indicizzati qui. Ogni scheda collega fonti e persone o profili con attribuzione verificata. Lo stato di sviluppo non è una valutazione di sicurezza.

## Sicurezza: rafforzamenti, non un attacco confermato

Il registro di 0.7.0 documenta autorizzazioni più rigorose per account e sessione e l’annullamento di operazioni obsolete dopo il blocco o il cambio di account. Sono correzioni e misure di rafforzamento pubblicate. Le prove esaminate non dimostrano sfruttamento, vittime o una copertura completa degli incidenti.

## Un prossimo passo utile

Leggi la [guida ai percorsi di identità](https://nostr-wot.com/guides/custom-identity-paths) prima di usare Advanced. Comprendi come il seed e il percorso esatto recuperano un’identità e perché cambiarne il nome locale non modifica la chiave pubblica.
