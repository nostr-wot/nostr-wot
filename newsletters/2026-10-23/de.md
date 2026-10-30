---
issue: "2026-10-23"
locale: "de"
status: "prepared"
subject: "Extension 0.8.17 verbessert Passkeys und lokales Signieren"
preheader: "Geprüfte Browser-Pakete vom 16. bis 23. Oktober und die genaue SDK-Release-Grenze."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Fünf geprüfte Extension-Releases

Die Nostr WoT Extension veröffentlichte im Zeitfenster dieser Ausgabe die Versionen [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) bis [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17). Jedes GitHub-Release enthält getrennte Chrome- und Firefox-Pakete, reproduzierbaren Quellcode, SHA-256-Prüfsummen und einen endgültigen Veröffentlichungszeitpunkt. Die Chrome- und Firefox-Stores führten am 23. Oktober jeweils 0.8.17 als aktuelle Version.

Version 0.8.13 ergänzt das Erstellen und Wiederherstellen von Passkey-geschützten Tresoren, verschlüsselte Wiederherstellungsdateien, ausdrückliche Relay-Wiederherstellung und einen Archiv-Explorer. Anbieter, Datei und Relay sind getrennte Optionen. Eine Relay-Bestätigung beweist nicht, dass ein anderes Gerät das Konto wiederherstellen kann. Bewahren Sie deshalb die verschlüsselte Datei auf und testen Sie den gewählten Weg.

## Signieren mit dem Telefon bleibt experimentell

Version [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) ergänzt eine experimentelle lokale Brücke zu einer kompatiblen Nostr-WoT-Version auf dem Telefon über Wi-Fi oder Bluetooth, wenn der Browser Web Bluetooth unterstützt. Beim Koppeln wird ein übereinstimmender Code bestätigt. Der Computer erhält ein vorübergehendes Network-Konto und sendet Signatur- oder Verschlüsselungsfreigaben an das Telefon.

Die Brücke unterstützt NIP-07-Signaturen sowie klassische NIP-04- und NIP-44-Verschlüsselung. Wallet-Identitätsoperationen, interne Veröffentlichungen und Post-Quanten-Operationen sind während der Telefonsignatur nicht verfügbar. Das Schließen der Brücke entfernt das vorübergehende Konto. Ein getrenntes Telefon wechselt nie auf lokale Schlüssel. Tonkopplung ist in dieser Version nicht verfügbar.

## Würfel, Münzen und klarere Berechtigungen

Version [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) ergänzt einen offline prüfbaren Wiederherstellungsphrasen-Ablauf mit 256 Münzwürfen als direkten Bits oder Würfeleingaben, die mit SHA-256 verarbeitet werden. Der getrennte Spiel-Tab zeichnet die Eingaben auf, zeigt aber nicht die resultierende Phrase. Das Release fasst außerdem Post-Quanten-Schlüssel, Web of Trust und lokale Brücke unter Experimental zusammen, erlaubt Namen für unbenannte Konten und verhindert, dass unerreichbare Relays die Einrichtung unbegrenzt blockieren.

Version [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) verringert wiederholte Relay-Anmeldeaufforderungen. Eine ausdrückliche Always-Auswahl kann alle wartenden Relay-Anfragen für die gewählte Website oder alle verbundenen Websites abdecken. Freigaben bleiben unter Permissions sichtbar und widerrufbar. Breiter Zugriff sollte deshalb nach der Nutzung geprüft werden.

Version [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) hält den Passkey-Assistenten offen, während das erste Konto gespeichert wird, und verwendet die kürzliche Prüfung für die erste Auto-Lock-Auswahl erneut. Die einmalige Autorisierung läuft nach fünf Minuten ab und wird durch Sperren, Kontowechsel oder erneute Authentifizierung widerrufen.

## Release-Grenze und Upgrade-Prüfung

Vor dem Stichtag am 23. Oktober um 08:00 UTC wurde kein neues SDK-Paket veröffentlicht. nostr-wot-sdk 2.0.0 blieb daher die letzte innerhalb des Zeitfensters geprüfte SDK-Version. Der Pull Request für SDK 3.0.1 wurde erst um 20:21 UTC an diesem Tag zusammengeführt und gehört in die nächste Ausgabe.

Wählen Sie vor dem Upgrade das Paket für den richtigen Browser, vergleichen Sie dessen SHA-256-Wert mit den Release-Prüfsummen und behalten Sie eine funktionierende Wiederherstellungsmethode. Behandeln Sie die Telefonbrücke als experimentell, prüfen Sie gespeicherte Relay-Freigaben und testen Sie die Passkey-Wiederherstellung auf einem zweiten unterstützten Gerät, bevor Sie sich darauf verlassen.
