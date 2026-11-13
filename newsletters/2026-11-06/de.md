---
issue: "2026-11-06"
locale: "de"
status: "prepared"
subject: "Extension 0.8.22 verbessert Fernsignatur und Wiederherstellung"
preheader: "Verifizierte Downloads vom 30. Oktober bis 6. November sowie Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 bringt Berechtigungsvorlagen und sicherere Wiederherstellung

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) wurde am 2. November um 18:46 UTC veröffentlicht. Die Version enthält herunterladbare Archive für Chrome, Firefox und den Quellcode sowie SHA-256-Prüfsummen. Diese Artefakte belegen die Verteilung über GitHub, aber nicht die Freigabe in den Browser-Stores.

Die Version ergänzt optionale Berechtigungsvorlagen beim Verbinden einer Website, darunter eine Voreinstellung für den Nostr WoT Playground. Seed-Phrasen, private Schlüssel und Passkey-Wiederherstellung werden unter Keys & Backups zusammengefasst. Relay-Authentifizierungsanfragen sind gruppiert und einmalige Sammelentscheidungen klarer.

Sicherheitsbezogene Änderungen prüfen Graph-Berechtigungen nach einer Freigabe erneut und ordnen Zustimmungsänderungen, damit eine neuere Ablehnung oder Trennung nicht von einer älteren ausstehenden Aktion überschrieben wird. Passkey-Provider-Backups bleiben nun unter dem 2-KB-Limit, indem nur das zugehörige Schlüsselmaterial statt eines wachsenden Tresors gespeichert wird. Bestehende Wiederherstellungsdateien und ältere Backups bleiben lesbar.

## In 0.8.22 bleiben Entscheidungen beim entfernten Signierer

[Version 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) folgte am 2. November um 19:18 UTC mit eigenen Chrome-, Firefox- und Quellcode-Archiven und SHA-256-Prüfsummen. Nostr-Connect-Konten überlassen Signatur, Authentifizierung, Änderungen an der Kontaktliste sowie Nachrichtenver- oder -entschlüsselung dem externen Signierer, ohne doppelte Freigabeabfragen der Erweiterung. Die Erweiterung kontrolliert weiterhin Website-Verbindung, Identitätszugriff, Validierung sowie Wallet- und Graph-Berechtigungen.

Die Store-Prüfung vom 5. November zeigte in Chrome und Firefox weiterhin 0.8.17. Deshalb werden 0.8.21 und 0.8.22 als herunterladbare Releases beschrieben, nicht als Store-Updates. npm zeigte weiterhin [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) und [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), beide vom 23. Oktober. In diesem Fenster erschien kein neues SDK-Paket.

## Amethyst 1.21 bringt kleine Anwendungen in Notizen

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) wurde am 1. November mit Android- und Desktop-Artefakten veröffentlicht. Es führt NApplets und WebXDC-Apps in Notizen aus, ergänzt Audio- und Spielformate und bietet eine geführte Web-of-Trust-Einrichtung. Der Zugriff eingebetteter Apps wird ebenfalls begrenzt: Das Lesen privater Ereignisse braucht eine Entschlüsselungsfreigabe, signierte Ereignisse werden vor der Übergabe geprüft und Frames erhalten weder Cookies noch WebRTC oder Identitätsschlüssel.

Dies ist ein veröffentlichtes Update eines bestehenden Clients, kein Start eines neuen Projekts und kein Beleg für einen ausgenutzten Vorfall.

Wählen Sie vor der Installation das richtige Browser-Archiv und vergleichen Sie dessen SHA-256 mit den Release-Metadaten. Sichern Sie die Konfiguration, bestätigen Sie die öffentliche Identität vor dem Speichern einer Wiederherstellung und prüfen Sie jede Anfrage des externen Signierers.
