---
issue: "2026-09-11"
locale: de
status: approved
subject: "Nostr WoT 0.7.0: mehr Kontrolle über Ihre Identitäten"
preheader: "Eigene Ableitungspfade, klarere Berechtigungen und sechs Projekte zum Entdecken."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## Ihre Identitäten, mit mehr Kontrolle

Die Nostr-WoT-Erweiterung **0.7.0** ist als [Download auf GitHub](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) verfügbar, veröffentlicht am **10. September 2026 um 22:29 UTC**. Der [aktuelle Chrome-Eintrag](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) zeigt ebenfalls **0.7.0**, aktualisiert am **11. September**. Die Verfügbarkeit im Firefox-Store bleibt **unbekannt**: Eintrag und API lieferten 404. Ein Firefox-ZIP auf GitHub belegt weder die Store-Freigabe noch die Installationskompatibilität.

Das [veröffentlichte Änderungsprotokoll](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) enthält bearbeitbare Kontonamen, eigene Ableitungspfade unter Advanced und eine Vorschau des öffentlichen Schlüssels vor dem Anlegen eines Unterkontos. Bestehende Standardschlüssel bleiben unverändert. Bewahren Sie den genauen eigenen Pfad zusammen mit Ihrer Seed-Sicherung auf: Der lokale Kontoname ist kein Wiederherstellungsgeheimnis.

Weitere Änderungen ermöglichen die Wiederherstellung verschlüsselter Seed- und PQ-Sicherungen, unterscheiden klarer zwischen einmaligen und dauerhaften Berechtigungen und verschlüsseln den Wallet-Cache. Die Hinweise verlangen Firefox für Desktop **140+** oder Android **142+** und beschreiben neue Einwilligungsabfragen beim Aktualisieren. Prüfen Sie diese Anforderungen vor dem Download.

## Über die Erweiterung hinaus

**relayer 2.2.19**, [veröffentlicht am 8. September](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), ergänzt eine Schnittstelle zur exakten Zählung der Vereinigungsmenge überlappender Filter. Der [Diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) zeigt eine Grenze: Das Speicher-Backend muss sie implementieren; ältere Backends addieren weiterhin einzelne Zählungen und können Ergebnisse mehrfach zählen.

Am **9. September** ergänzte die [Klarstellung zu Zahlungstypen in NIP-A3](https://github.com/nostr-protocol/nips/pull/2463) `bitcoincash` und `tron` sowie Hinweise zu URI-Schemata für mehrdeutige unbekannte Typen. Das ist eine Spezifikationsänderung, kein Beleg für Unterstützung in allen Clients.

Wir haben die offiziellen npm-Daten aller **12 nicht privaten SDK-Pakete** geprüft. Keine Version wurde im Berichtszeitraum veröffentlicht. Das [übergreifende Paket](https://registry.npmjs.org/nostr-wot-sdk) bleibt bei **1.0.1**, veröffentlicht am **16. August**: Hintergrund, keine Neuerscheinung dieser Woche.

## Sechs neue Einträge, keine sechs neuen Projekte

Unser [Projektverzeichnis](https://nostr-wot.com/projects) nahm am [8. September](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7) **Damus, Amethyst, Primal, Coracle, Amber und Nostur** auf. Es handelt sich um bestehende, hier neu erfasste Projekte. Jeder Eintrag verlinkt Quellen und gegebenenfalls verifizierte Personen- und Profilzuordnungen. Der Entwicklungsstatus ist keine Sicherheitsbewertung.

## Sicherheit: Härtung, kein bestätigter Angriff

Das Änderungsprotokoll von 0.7.0 dokumentiert strengere Autorisierung pro Konto und Sitzung sowie das Abbrechen veralteter Vorgänge nach dem Sperren oder Kontowechsel. Das sind veröffentlichte Korrekturen und Härtungsmaßnahmen. Die geprüften Belege bestätigen weder Ausnutzung noch Betroffene oder eine vollständige Erfassung aller Vorfälle.

## Ein sinnvoller nächster Schritt

Lesen Sie die [Anleitung zu Identitätspfaden](https://nostr-wot.com/guides/custom-identity-paths), bevor Sie Advanced nutzen. Verstehen Sie, wie Seed und genauer Pfad eine Identität wiederherstellen und warum ein anderer lokaler Name den öffentlichen Schlüssel nicht ändert.
