---
issue: "2026-10-16"
locale: "de"
status: "prepared"
subject: "SDK 2.0.0 veröffentlicht, Amethyst ergänzt Vertrauenswerkzeuge"
preheader: "Geprüfte SDK-, Desktop-, Signer- und Web-of-Trust-Releases vom 9. bis 16. Oktober."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 ist auf npm veröffentlicht

Die npm-Registry verzeichnet [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) am 12. Oktober um 22:32 UTC. Das veröffentlichte Paket verweist auf Commit `2937df1`, enthält einen Registry-Integritätswert und stellt den projekteigenen Code von MIT auf GPL-3.0-only um. Bereits veröffentlichte Versionen behalten ihre ursprüngliche Lizenz. Das [veröffentlichte Änderungsprotokoll](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) nennt die passenden Hauptversionen der Pakete für Authentifizierung, Blossom, Daten, Direktnachrichten, Graph, Relays, Signer, Oberfläche, Wallet und WoT.

Dies ist ein Lizenz-Release und kein Nachweis für eine neue Laufzeitfunktion. Vor dem Upgrade sollten Entwickler die Lizenzkompatibilität prüfen, den Registry-Integritätswert festschreiben und genau den Paketsatz testen, den ihre Anwendung installiert. Eine private Monorepo-Version, ein Tag oder ein Build allein würden keine Veröffentlichung belegen; hier ist der npm-Eintrag der Distributionsnachweis.

## Amethyst erreicht den Desktop und erweitert die Vertrauensunterstützung

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) wurde am 11. Oktober um 19:27 UTC mit Artefakten für Android, Linux, macOS und Windows veröffentlicht. Für jedes ist ein SHA-256-Wert verzeichnet. Die Versionshinweise nennen die Desktop-App mit gemeinsamer Oberfläche sowie einen NIP-85-Netzwerkindex und die Integration eines Vertrauensanbieters.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) folgte am 14. Oktober um 13:16 UTC mit einem weiteren vollständigen Artefaktsatz. Die Version ergänzt NIP-46-Remote-Signer im Anmeldeablauf, Calendar-Collection- und RSVP-Ereignisse, native Wayland-Unterstützung, clientbezogene Relay-Begrenzung mit NIP-01-Backoff sowie Korrekturen für die Synchronisierung des Vertrauensnetzes und Web-of-Trust-Downloads auf dem Desktop.

Praktisch geht es um die Trennung von Verantwortlichkeiten. Mit NIP-46 kann ein Client Signaturen von einem entfernten Signer anfordern, anstatt den Signaturschlüssel selbst zu halten. NIP-85 bietet einen Standard zum Abruf von Vertrauensaussagen, doch diese hängen weiterhin vom Anbieter und dessen Daten ab. Keine der Funktionen macht einen Vertrauenswert zur objektiven Wahrheit oder ersetzt die Prüfung von Signaturanfragen.

## Release-Grenze der Erweiterung

In diesem Zeitfenster wurde keine Version der Nostr WoT Extension veröffentlicht. Die letzte Version vor dem Stichtag blieb [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), die Chrome- und Firefox-Stores am 9. Oktober als aktuell auswiesen. Das nächste GitHub-Release 0.8.13 erschien am 17. Oktober, nach dem Stichtag dieser Ausgabe. Seine Funktionen sind deshalb bewusst ausgeschlossen.

## Eine sorgfältige Prüfung vor dem Upgrade

Prüfen Sie für SDK 2.0.0 die Umstellung auf GPL-3.0-only, fixieren Sie die aufgelösten Versionen und führen Sie Build und Tests der Anwendung aus. Laden Sie für Amethyst nur das Artefakt für das passende System und die passende Architektur, vergleichen Sie den verzeichneten Hash, sichern Sie die Kontokonfiguration und testen Sie die NIP-46-Kopplung zuerst mit einem Konto mit geringem Risiko. Prüfen Sie vor der Freigabe, ob der Signer das erwartete Ereignis anzeigt. Nutzen Sie NIP-85-Ergebnisse als Entscheidungshilfe, nicht als Autorisierungsgrenze.
