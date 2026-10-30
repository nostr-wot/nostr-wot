---
issue: "2026-10-23"
locale: "fr"
status: "prepared"
subject: "Extension 0.8.17 renforce passkeys et signature locale"
preheader: "Paquets de navigateur vérifiés du 16 au 23 octobre et limite exacte de la version du SDK."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Cinq versions vérifiées de l'extension

Nostr WoT Extension a publié les versions [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) à [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) pendant la fenêtre de cette édition. Chaque version GitHub comprend des paquets distincts pour Chrome et Firefox, une source reproductible, des sommes SHA-256 et une heure de publication définitive. Les boutiques Chrome et Firefox affichaient toutes deux la version 0.8.17 comme courante le 23 octobre.

La version 0.8.13 ajoute la création et la restauration de coffres protégés par passkey, des fichiers de restauration chiffrés, une restauration explicite par relais et un explorateur d'archives. Fournisseur, fichier et relais sont des choix séparés. L'accusé de réception d'un relais ne prouve pas qu'un autre appareil peut restaurer le compte. Conservez donc le fichier chiffré et testez le parcours choisi.

## La signature sur téléphone reste expérimentale

La version [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) ajoute un pont local expérimental vers une version compatible de Nostr WoT sur téléphone, par Wi-Fi ou Bluetooth lorsque le navigateur prend en charge Web Bluetooth. L'association vérifie un code identique. L'ordinateur reçoit un compte Network temporaire et envoie au téléphone les demandes de signature ou de chiffrement.

Le pont prend en charge la signature NIP-07 et le chiffrement classique NIP-04 et NIP-44. Les opérations d'identité du portefeuille, la publication interne et les opérations post-quantiques ne sont pas disponibles lorsque la signature par téléphone est sélectionnée. La fermeture du pont supprime le compte temporaire et un téléphone déconnecté ne bascule jamais vers des clés locales. L'association sonore n'est pas disponible dans cette version.

## Dés, pièces et permissions plus claires

La version [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) ajoute un parcours de phrase de restauration vérifiable hors ligne, avec 256 lancers de pièce comme bits directs ou des entrées de dés traitées par SHA-256. L'onglet de jeu séparé enregistre les entrées mais n'affiche pas la phrase obtenue. La version regroupe aussi les clés post-quantiques, le Web of Trust et le pont local sous Experimental, permet de nommer les comptes sans libellé et empêche des relais injoignables de bloquer indéfiniment l'intégration.

La version [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) réduit les demandes répétées de connexion aux relais. Un choix explicite Always peut couvrir toutes les demandes en attente pour le site choisi ou tous les sites connectés. Les autorisations restent visibles et révocables dans Permissions. Il faut donc réexaminer les accès étendus après utilisation.

La version [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) garde l'assistant passkey ouvert pendant l'enregistrement du premier compte et réutilise la vérification récente pour le choix initial du verrouillage automatique. L'autorisation à usage unique expire après cinq minutes et est révoquée par le verrouillage, le changement de compte ou une nouvelle authentification.

## Limite de version et vérification de mise à niveau

Aucun nouveau paquet SDK n'a été publié avant la limite du 23 octobre à 08:00 UTC. nostr-wot-sdk 2.0.0 est donc resté la dernière version vérifiée dans la fenêtre. La demande de modification pour SDK 3.0.1 n'a été fusionnée qu'à 20:21 UTC ce jour-là et relève de l'édition suivante.

Avant la mise à niveau, choisissez le paquet du bon navigateur, comparez son SHA-256 aux sommes de la version et conservez une méthode de restauration fonctionnelle. Considérez le pont téléphonique comme expérimental, réexaminez les autorisations de relais mémorisées et vérifiez la restauration passkey sur un deuxième appareil pris en charge avant d'en dépendre.
