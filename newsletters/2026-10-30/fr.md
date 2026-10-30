---
issue: "2026-10-30"
locale: "fr"
status: "prepared"
subject: "SDK passkey stable et Extension 0.8.20 publiés"
preheader: "Paquets npm et navigateur vérifiés du 23 au 30 octobre, avec changements de restauration et d'adresse Lightning."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## Les paquets passkey stables sont sur npm

Le registre npm a publié [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) à 20:24 UTC et [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) à 20:25 UTC le 23 octobre. Les deux paquets pointent vers le commit `384023f` et comportent des valeurs d'intégrité du registre. Il s'agit d'une preuve de distribution, pas seulement d'un tag ou d'une compilation du dépôt.

La version stable rend les modes passkey explicites. Une passkey dérivée produit la clé Nostr à partir de la sortie PRF de WebAuthn, tandis qu'une passkey stockée protège une clé, une graine ou un coffre contenant plusieurs comptes. Les anciens identifiants ambigus sont signalés comme tels au lieu d'être interprétés silencieusement. Les enregistrements chiffrés de restauration peuvent utiliser un stockage local, fournisseur ou relais contrôlé par l'hôte, mais l'application reste responsable de WebAuthn, du consentement, du transport, de la vérification des signatures et des essais de restauration.

SDK 3.0.1 prend aussi en charge les sauvegardes Nosskey explicites et un signataire fournisseur qui fixe la fenêtre iframe, l'origine HTTPS et le compte choisi. La prise en charge du protocole ne prouve pas que chaque appareil, navigateur ou fournisseur puisse restaurer un compte. Les développeurs doivent tester l'authentificateur et le parcours de stockage exacts qu'ils souhaitent prendre en charge.

## Extension 0.8.18 unifie importation et restauration

[Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) a été publiée le 24 octobre avec des paquets distincts pour Chrome et Firefox, la source et des sommes SHA-256. Elle détecte les passkeys et sauvegardes prises en charge, affiche l'identité publique restaurée avant l'enregistrement et peut restaurer des sauvegardes Nosskey compatibles sans changer l'identité d'origine. Elle rétablit aussi l'association sonore Wi-Fi facultative sur les appareils audio à 44,1 kHz. L'écoute ne commence que sur demande, s'arrête après une tentative ou 30 secondes et exige toujours une confirmation sur le téléphone.

[La version 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) corrige les erreurs d'ajout de compte qui rouvraient à tort la configuration initiale du verrouillage automatique. Les comptes en double et les échecs de vérification du coffre affichent maintenant l'erreur réelle avec une option de nouvel essai, sans modifier la protection existante.

## Adresses Lightning plus courtes dans 0.8.20

[La version 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) a été publiée le 29 octobre. Les adresses Lightning hébergées utilisent désormais le domaine plus court `@nostrwot.com` dans les réglages, les actions de copie, les QR de réception et les mises à jour facultatives du profil. Les adresses existantes `@zaps.nostr-wot.com` continuent d'atteindre le même portefeuille. Les adresses des fournisseurs personnalisés et le serveur API du portefeuille ne changent pas, et la mise à jour du profil exige toujours une confirmation.

Avant la mise à niveau, installez le paquet du bon navigateur et comparez son SHA-256 aux sommes de la version. Sauvegardez la configuration, vérifiez la clé publique restaurée avant l'enregistrement et testez la restauration sur un deuxième appareil pris en charge. Un changement d'affichage de l'adresse ne nécessite pas d'abandonner une ancienne adresse fonctionnelle.
