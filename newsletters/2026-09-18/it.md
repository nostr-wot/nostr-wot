---
issue: "2026-09-18"
locale: "it"
status: "prepared"
subject: "Amethyst trova prima i commenti annidati"
preheader: "Una correzione distribuita e le versioni di riferimento dall’11 al 18 settembre."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## Un miglioramento distribuito per trovare le risposte

[Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), pubblicato il 12 settembre alle 14:42 UTC, include download per Android e desktop. La [modifica ai filtri NIP-22](https://github.com/vitorpamplona/amethyst/pull/4095) permette alle query di trovare commenti annidati tramite la radice della conversazione, insieme alle query già esistenti per le risposte dirette.

La distinzione è piccola ma importante: una risposta a un commento identifica la conversazione originale con un tag maiuscolo, mentre il tag minuscolo punta al genitore immediato. Cercare solo il genitore esclude quella risposta annidata quando si interroga l’elemento originale. Filtri separati per la radice correggono la query. La disponibilità dei relay e i limiti temporali continuano a determinare quali eventi arrivano; la modifica non garantisce il caricamento di ogni risposta.

La stessa versione corregge il rilevamento degli aggiornamenti delle pull request NIP-34. La nostra [analisi del codice](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) spiega entrambi i casi. I download GitHub dimostrano la distribuzione su quel canale, non lo stato della pubblicazione negli app store.

## Estensione e SDK alla chiusura di questa edizione

Questa edizione recuperata copre il periodo dall’11 settembre alle 08:00 UTC al 18 settembre alle 08:00 UTC. Il [download 0.7.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) dell’estensione, pubblicato il 10 settembre alle 22:29 UTC, resta il riferimento GitHub alla chiusura. È contesto dell’edizione precedente. Il [changelog pubblicato](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) descrive modifiche ai percorsi delle identità e al recupero; uno ZIP Firefox scaricabile non dimostra la disponibilità nello store Firefox.

I registri ufficiali npm dei 12 pacchetti non privati dell’SDK non mostrano versioni pubblicate nel periodo. Il riferimento del [pacchetto principale](https://registry.npmjs.org/nostr-wot-sdk) è 1.0.1, pubblicata il 16 agosto. Le versioni del 19 e 20 settembre appartengono alla prossima edizione e sono escluse qui.

## Un controllo utile per chi sviluppa client

Se una risposta annidata compare solo aprendo la discussione, confronta i filtri del genitore diretto e della radice prima di attribuire il problema a contenuti mancanti. La patch di Amethyst offre un’implementazione concreta da studiare. Usa eventi di prova eliminabili e controlla la query effettiva al relay; un tag del protocollo e il modo in cui un client lo gestisce sono cose diverse.
