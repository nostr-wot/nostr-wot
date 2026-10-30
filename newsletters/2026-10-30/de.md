---
issue: "2026-10-30"
locale: "de"
status: "prepared"
subject: "Stabiles Passkey-SDK und Extension 0.8.20 veröffentlicht"
preheader: "Geprüfte npm- und Browser-Pakete vom 23. bis 30. Oktober mit Änderungen an Wiederherstellung und Lightning-Adressen."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## Stabile Passkey-Pakete sind auf npm verfügbar

Die npm-Registry veröffentlichte [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) am 23. Oktober um 20:24 UTC und [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) um 20:25 UTC. Beide Pakete verweisen auf Commit `384023f` und enthalten Registry-Integritätswerte. Dies ist ein Distributionsnachweis und nicht nur ein Repository-Tag oder Build.

Das stabile Release macht die Passkey-Modi ausdrücklich. Ein abgeleiteter Passkey erzeugt den Nostr-Schlüssel aus der WebAuthn-PRF-Ausgabe. Ein gespeicherter Passkey schützt dagegen einen vorhandenen Schlüssel, Seed oder Tresor mit mehreren Konten. Mehrdeutige ältere Anmeldedaten werden als mehrdeutig gemeldet, statt stillschweigend interpretiert zu werden. Verschlüsselte Wiederherstellungsdatensätze können lokalen, Anbieter- oder Relay-Speicher unter Kontrolle der Host-Anwendung nutzen. Die Anwendung bleibt jedoch für WebAuthn, Zustimmung, Transport, Signaturprüfung und Wiederherstellungstests verantwortlich.

SDK 3.0.1 unterstützt außerdem ausdrückliche Nosskey-Sicherungen und einen Anbieter-Signer, der iframe-Fenster, HTTPS-Ursprung und ausgewähltes Konto bindet. Protokollunterstützung beweist nicht, dass jedes Gerät, jeder Browser oder Anbieter ein Konto wiederherstellen kann. Entwickler sollten genau den Authentifikator und Speicherweg testen, den sie unterstützen möchten.

## Extension 0.8.18 vereint Import und Wiederherstellung

[Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) wurde am 24. Oktober mit getrennten Chrome- und Firefox-Paketen, Quellcode und SHA-256-Prüfsummen veröffentlicht. Sie erkennt unterstützte Passkeys und Sicherungen, zeigt die wiederhergestellte öffentliche Identität vor dem Speichern und kann kompatible Nosskey-Sicherungen wiederherstellen, ohne die ursprüngliche Identität zu ändern. Außerdem ist die optionale Wi-Fi-Tonkopplung auf Audiogeräten mit 44,1 kHz wieder verfügbar. Das Zuhören beginnt nur auf Anforderung, endet nach einem Versuch oder 30 Sekunden und verlangt weiterhin eine Bestätigung auf dem Telefon.

[Version 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) korrigiert Fehler beim Hinzufügen von Konten, die fälschlich die erste Auto-Lock-Einrichtung öffneten. Doppelte Konten und fehlgeschlagene Tresorprüfungen zeigen nun den tatsächlichen Fehler mit einer Wiederholungsoption und behalten den bestehenden Schutz bei.

## Kürzere Lightning-Adressen in 0.8.20

[Version 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) wurde am 29. Oktober veröffentlicht. Gehostete Lightning-Adressen verwenden nun die kürzere Domain `@nostrwot.com` in Wallet-Einstellungen, Kopieraktionen, Empfangs-QR-Codes und optionalen Profilaktualisierungen. Vorhandene Adressen mit `@zaps.nostr-wot.com` erreichen weiterhin dasselbe Wallet. Adressen eigener Anbieter und der Wallet-API-Server bleiben unverändert. Profilaktualisierungen benötigen weiterhin eine Bestätigung.

Installieren Sie vor dem Upgrade das Paket für den richtigen Browser und vergleichen Sie den SHA-256-Wert mit den Release-Prüfsummen. Sichern Sie die Kontokonfiguration, prüfen Sie den wiederhergestellten öffentlichen Schlüssel vor dem Speichern und testen Sie die Wiederherstellung auf einem zweiten unterstützten Gerät. Eine geänderte Adressanzeige ist kein Grund, eine ältere funktionierende Adresse aufzugeben.
