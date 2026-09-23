---
issue: "2026-09-18"
locale: "de"
status: "prepared"
subject: "Amethyst findet verschachtelte Kommentare früher"
preheader: "Eine veröffentlichte Korrektur und die Versionsstände vom 11. bis 18. September."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## Eine veröffentlichte Verbesserung beim Finden von Antworten

[Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), veröffentlicht am 12. September um 14:42 UTC, bietet Downloads für Android und Desktop. Die [Änderung der NIP-22-Filter](https://github.com/vitorpamplona/amethyst/pull/4095) findet verschachtelte Kommentare über den Ursprung der Unterhaltung, zusätzlich zu den bisherigen Abfragen für direkte Antworten.

Der Unterschied ist klein, aber wichtig: Eine Antwort auf einen Kommentar bezeichnet die ursprüngliche Unterhaltung mit einem großgeschriebenen Tag. Das kleingeschriebene Tag verweist auf den unmittelbaren Elternbeitrag. Wer nur nach diesem Elternbeitrag sucht, findet beim Abfragen des ursprünglichen Beitrags die verschachtelte Antwort nicht. Getrennte Filter für den Ursprung korrigieren die Abfrage. Verfügbare Relays und zeitliche Grenzen bestimmen weiterhin, welche Ereignisse ankommen; die Änderung garantiert nicht, dass jede Antwort geladen wird.

Dieselbe Version korrigiert das Auffinden von NIP-34-Aktualisierungen für Pull Requests. Unsere [Codeanalyse](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) erklärt beide Fälle. GitHub-Downloads belegen die Verteilung dort, nicht den Stand der Veröffentlichung in einem App Store.

## Erweiterung und SDK zum Redaktionsschluss

Diese nachgeholte Ausgabe umfasst den Zeitraum vom 11. September, 08:00 UTC, bis zum 18. September, 08:00 UTC. Der [Download 0.7.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) der Erweiterung, veröffentlicht am 10. September um 22:29 UTC, bleibt zu diesem Zeitpunkt der GitHub-Referenzstand. Er gehört zum Hintergrund der vorherigen Ausgabe. Das [veröffentlichte Änderungsprotokoll](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) beschreibt Änderungen an Identitätspfaden und Wiederherstellung; eine herunterladbare Firefox-ZIP-Datei belegt keine Verfügbarkeit im Firefox-Store.

Die offiziellen npm-Veröffentlichungsdaten aller 12 nicht privaten SDK-Pakete zeigen keine neue Version in diesem Zeitraum. Der Referenzstand des [Hauptpakets](https://registry.npmjs.org/nostr-wot-sdk) ist 1.0.1 vom 16. August. Veröffentlichungen vom 19. und 20. September gehören in die nächste Ausgabe und bleiben hier ausgeschlossen.

## Eine nützliche Prüfung für Client-Entwickler

Wenn eine verschachtelte Antwort erst beim Öffnen des Threads erscheint, vergleichen Sie die Filter für den direkten Elternbeitrag und den Ursprung, bevor Sie fehlende Inhalte vermuten. Der Amethyst-Patch bietet eine konkrete Implementierung zum Nachvollziehen. Verwenden Sie entbehrliche Testereignisse und prüfen Sie die tatsächliche Relay-Abfrage. Ein Protokoll-Tag und seine Verarbeitung im Client sind zwei verschiedene Dinge.
