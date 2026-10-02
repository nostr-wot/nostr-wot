---
issue: "2026-09-25"
locale: "de"
status: "prepared"
subject: "Nostr WoT ergänzt begrenzte Wallet-Verbindungen pro App"
preheader: "Erweiterung 0.8.3, Graph-Pakete auf npm und Amber 6.6.5, geprüft für den 18. bis 25. September."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Getrennter Wallet-Zugang für jede App

[Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), veröffentlicht am 23. September um 07:28 UTC, kann mehrere Nostr-Wallet-Connect-Verbindungen für die LNbits-Wallet der Erweiterung erstellen. Jede App kann eine eigene benannte Verbindung mit täglichem Ausgabenlimit und Ablaufdatum erhalten. Die Wallet-Einstellungen zeigen aktive Verbindungen und die Budgetnutzung. Dort können Nutzer eine Verbindungszeichenfolge kopieren, ihren QR-Code anzeigen oder die Verbindung widerrufen, ohne den Zugang aller anderen Apps zu ersetzen.

Laut Versionshinweisen bleiben die Verbindungsgeheimnisse lokal verschlüsselt und unterbrochene Registrierungen können wiederhergestellt werden. Bei der Validierung wurde eine leere LNbits-Wallet verwendet, um Verbindungen zu erstellen, aufzulisten und zu widerrufen sowie einen signierten NWC-`get_info`-Austausch abzuschließen. Es wurde keine echte Zahlung gesendet. Eigene LNbits-Server benötigen einen passenden Verwaltungsadapter, daher bietet nicht jeder NWC-Dienst zwangsläufig dieselben Kontrollen.

Version 0.8.3 enthält die vorherigen 0.8-Versionen. [Version 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) stellte die experimentelle API `window.nostr.wot` als ausdrückliche, standardmäßig deaktivierte Option wieder her. Hinzu kamen begrenzte Graph-Synchronisierung, Warnungen vor dem Ersetzen einer Kontaktliste und eine Gewichtung stummgeschalteter Konten. GitHub stellt ZIP-Dateien für Chrome, Firefox und den Quellcode mit erfassten SHA-256-Prüfsummen bereit. Diese Downloads belegen die Verteilung über GitHub, nicht die Veröffentlichung in Browser-Stores. Der aktuelle Chrome-Eintrag wurde bei der Wiederherstellung geprüft, kann aber die am 25. September verfügbare Store-Version nicht nachträglich belegen. In Firefox Add-ons wurde kein passender Nostr-WoT-Eintrag gefunden. Diese Ausgabe behauptet daher keine Verfügbarkeit im Firefox-Store.

## Die Graph-Pakete erreichen npm

Die npm-Registry verzeichnet [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) am 20. September um 00:17 UTC und das Hauptpaket [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) eine Minute später. Die Graph-Version bündelt Relay-Abfragen, fügt eine ausdrückliche Begrenzung der Sprungzahl hinzu, bewahrt deterministische Versionen ersetzbarer Ereignisse und komprimiert gespeicherte Kontaktlisten. Außerdem begrenzt sie gebündelte Distanzabfragen und behält ausstehende Schreibvorgänge nach einem fehlgeschlagenen Flush.

Eine Migrationsgrenze muss eingeplant werden: Die Graph-Datenbank wechselt auf IndexedDB-Schema 2, und ältere SDK-Versionen können einen aktualisierten Namensraum nicht wieder öffnen. Testen Sie das Update mit einem entbehrlichen Profil oder einem neu aufbaubaren Cache, bevor Sie es auf dauerhaft gespeicherte Daten anwenden. Version 0.3.1 folgte um 10:47 UTC und ist zum Redaktionsschluss die neueste Graph-Version. Ihr Änderungsprotokoll beschreibt ausschließlich Dokumentationsänderungen und nennt keine Laufzeitänderung.

## Amber verengt die Grenze einer Backup-Berechtigung

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), veröffentlicht am 21. September um 14:32 UTC, verschlüsselt Signer-Backups mit einem eigenen, per HKDF abgeleiteten Schlüssel außerhalb des NIP-44-Ableitungsraums. Den Versionshinweisen zufolge verhindert dies, dass eine App mit gespeicherter `nip44_decrypt`-Berechtigung damit Backup-Inhalte mit app-spezifischen NIP-46-Geheimnissen und lokalen Schlüsseln liest.

Alte, mit dem Identitätsschlüssel verschlüsselte Backups können weiterhin wiederhergestellt werden, bis eine spätere Veröffentlichung sie überschreibt. Die Version bietet Android-APKs und ein signiertes Prüfsummenmanifest. Das belegt verfügbare Artefakte und einen Prüfweg, nicht die Installation auf einem bestimmten Gerät oder die Verteilung über jeden Store. Das Projekt beschreibt eine korrigierte Grenze, keinen ausgenutzten Vorfall und keine Zahl betroffener Nutzer.

## Eine praktische Prüfung beim Upgrade

Geben Sie jeder Wallet-App eine getrennte Verbindung mit dem kleinsten sinnvollen Tageslimit und einem Ablaufdatum. Prüfen Sie anschließend, dass der Widerruf einer Verbindung die anderen unberührt lässt. Testen Sie beim SDK die Schema-Migration und den Neuaufbau des Caches, bevor Sie das neue Graph-Paket mit dauerhaften Daten verwenden. Prüfen Sie bei Amber die installierte Version und veröffentlichen Sie ein frisches Backup, wenn Sie auf die Wiederherstellung über Relays angewiesen sind. Diese Prüfungen verringern gemeinsam genutzte Zugänge und Formatüberraschungen, ohne Versionshinweise als Beweis für jede Bereitstellung zu behandeln.
