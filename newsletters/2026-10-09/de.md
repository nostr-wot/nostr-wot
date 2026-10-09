---
issue: "2026-10-09"
locale: "de"
status: "prepared"
subject: "Account Archive erreicht Chrome und Firefox"
preheader: "Erweiterung 0.8.12 und SDK 1.0.4, geprüft für den 2. bis 9. Oktober."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive erreicht beide Browser-Stores

[Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) wird jetzt sowohl im [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) als auch bei [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/) als Version 0.8.12 geführt. Beide Stores nennen den 7. Oktober als Aktualisierungsdatum. Das GitHub-Release wurde am 6. Oktober um 22:22 UTC veröffentlicht und enthält getrennte Archive für Chrome, Firefox und den passenden Quellcode sowie erfasste SHA-256-Prüfsummen.

Die vorherige Version 0.8.11 führte Account Archive in den Einstellungen ein. Es kann ausgewählte Relays manuell, stündlich, täglich oder wöchentlich synchronisieren, verschlüsselte lokale Daten halten, Relays gruppieren und an Prüfpunkten fortsetzen. Angezeigt werden Ereignisanzahl, Archivgröße, Fortschritt und Fehler je Relay. Eine Migration prüft das Ziel vor der Bestätigung, bewahrt Originalsignaturen, überspringt ungeeignete Ereignisse und hält Details fehlgeschlagener Ereignisse zur Prüfung bereit.

Version 0.8.12 erlaubt das Herunterladen und Importieren gewöhnlicher NDJSON-Dateien mit signierten Ereignissen ohne Dateipasswort und unterstützt weiterhin ältere verschlüsselte Exporte. Importierte Ereignisse werden vor dem Zusammenführen auf Kontozugehörigkeit und gültige Signaturen geprüft. Die Dialoge für Import und Download öffnen sich außerdem über dem gesamten Erweiterungsfenster statt innerhalb der Einstellungskarte.

## SDK 1.0.4 veröffentlicht gemeinsame Protokollbausteine

Das npm-Register verzeichnet [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) am 8. Oktober um 13:41 UTC und 1.0.4 um 16:23 UTC. Version 1.0.3 verlagerte wiederverwendbare Aufgaben für Relays, Wallet, Daten und Direktnachrichten in eigene Pakete. Der gemeinsame NIP-47-Client handelt Verschlüsselung aus, prüft Antworten, begrenzt Wartezeiten und unterscheidet einen sicheren Zahlungsfehler von einem ungewissen Zahlungsergebnis. Native NIP-46-Verbindungsoptionen bieten übersetzte Aktionen und Plattformübergabe ohne anwendungsspezifische DOM-Eingriffe.

Version 1.0.4 ergänzt verwaltete Blossom-Uploads mit einer stabilen Kopie der Eingabebytes, Abbruch durch den Aufrufer und Prüfungen der aktiven Sitzung. Weiterleitungen werden abgelehnt, bevor ein anderer konfigurierter Server versucht wird. Verschlüsselte Uploads verwenden eine neue Wegwerfidentität zum Signieren und eine an jeden Server gebundene Autorisierung. Das Datenpaket kann zudem beobachtbare Caches mit Schlüssel leeren, ohne Abonnenten zu entfernen.

Das zentrale Änderungsprotokoll des Repositorys endet weiterhin bei SDK 1.0.2. Die Details zu den beiden neuen Registerversionen stammen daher aus dem zusammengeführten [Protokoll-PR](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), dem zusammengeführten [Blossom- und Cache-PR](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) und den veröffentlichten Paketinhalten. Eine Registerveröffentlichung beweist nicht, dass jede nutzende Anwendung bereits aktualisiert wurde.

## Grenzen, die sichtbar bleiben sollten

Eine unverschlüsselte NDJSON-Datei sollte als sensible lokale Datei behandelt werden, auch wenn ihre Ereignisse Signaturen behalten. Zugehörigkeits- und Signaturprüfungen schützen die Integrität, machen die Datei aber nicht vertraulich. Die Synchronisierung hängt von den vom Nutzer gewählten Relays ab und verspricht weder dauerhafte Aufbewahrung noch eine vollständige Historie.

Bei Blossom verringern Wegwerfidentitäten und HTTPS die Verknüpfbarkeit und die Offenlegung während verschlüsselter Uploads. Ein Server kann jedoch weiterhin Größe und Hash des Chiffrats, IP-Adresse und Zeitpunkt beobachten. Das Ablehnen von Weiterleitungen hält Bytes und Autorisierung innerhalb der konfigurierten Serverliste, macht einen nicht vertrauenswürdigen Server aber nicht privat.

## Eine praktische Prüfung nach dem Upgrade

Prüfen Sie vor einem Archive-Test, ob die installierte Erweiterung Version 0.8.12 meldet. Beginnen Sie mit einer manuellen Synchronisierung über eine kleine, bekannte Relay-Auswahl, prüfen Sie Zähler und Fehler und bewahren Sie exportierte Dateien geschützt auf. Wer SDK 1.0.4 einsetzt, sollte den veröffentlichten Integritätswert festschreiben, Abbruch und Sitzungswechsel testen und ungewisse Zahlungsergebnisse von bestätigten Fehlern trennen.
