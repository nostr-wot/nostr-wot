---
issue: "2026-11-06"
locale: "fr"
status: "prepared"
subject: "Extension 0.8.22 améliore la signature distante et la récupération"
preheader: "Versions téléchargeables vérifiées du 30 octobre au 6 novembre, plus Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 ajoute des modèles d'autorisations et une récupération plus sûre

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) a été publiée le 2 novembre à 18:46 UTC. La version comprend des archives téléchargeables pour Chrome, Firefox et le code source, ainsi que des empreintes SHA-256. Ces artefacts prouvent une distribution par GitHub, mais pas l'approbation dans les boutiques des navigateurs.

La version ajoute des modèles d'autorisations facultatifs lors de la connexion d'un site, dont un réglage pour Nostr WoT Playground. Elle regroupe aussi les phrases de récupération, les clés privées et la récupération passkey dans Keys & Backups, rassemble les demandes d'authentification des relais et clarifie les décisions groupées ponctuelles.

Les changements liés à la sécurité revérifient les autorisations du graphe après approbation et ordonnent les changements de consentement afin qu'un refus ou une déconnexion plus récent ne soit pas remplacé par une ancienne action en attente. Les sauvegardes du fournisseur passkey respectent désormais la limite d'écriture de 2 Ko en conservant seulement le matériel de clé associé plutôt qu'un coffre grandissant. Les fichiers de récupération existants et les anciennes sauvegardes restent lisibles.

## Les approbations du signataire distant restent chez le signataire dans 0.8.22

[La version 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) a suivi le 2 novembre à 19:18 UTC avec ses propres archives Chrome, Firefox et source et des empreintes SHA-256. Les comptes Nostr Connect délèguent désormais au signataire externe la signature, l'authentification, les modifications de contacts et le chiffrement ou déchiffrement des messages, sans ajouter de demandes d'approbation en double dans l'extension. Celle-ci continue de contrôler la connexion du site, l'accès à l'identité, la validation et les autorisations du portefeuille et du graphe.

La vérification des boutiques du 5 novembre affichait encore 0.8.17 dans Chrome et Firefox. Les versions 0.8.21 et 0.8.22 sont donc décrites ici comme téléchargeables, et non comme des mises à jour des boutiques. npm affichait toujours [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) et [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), publiés le 23 octobre. Aucun nouveau paquet SDK n'a été publié dans cette fenêtre.

## Amethyst 1.21 intègre de petites applications aux notes

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) a été publié le 1 novembre avec des artefacts Android et bureau. Il exécute des NApplets et applications WebXDC dans les notes, ajoute des formats d'écoute et de jeux et propose une configuration guidée de la toile de confiance. La version limite aussi l'accès des applications intégrées: la lecture d'événements privés exige une autorisation de déchiffrement, les événements signés sont vérifiés avant livraison et les cadres ne reçoivent ni cookies, ni WebRTC, ni clés d'identité.

Il s'agit d'une mise à jour publiée d'un client existant, et non du lancement d'un nouveau projet ou de la preuve d'un incident exploité.

Avant d'installer un paquet, choisissez l'archive adaptée au navigateur et comparez son empreinte SHA-256 aux métadonnées de la version. Sauvegardez la configuration, confirmez l'identité publique avant d'enregistrer une récupération et vérifiez chaque demande affichée par le signataire externe.
