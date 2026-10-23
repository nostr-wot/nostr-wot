---
issue: "2026-10-16"
locale: "fr"
status: "prepared"
subject: "SDK 2.0.0 publié, Amethyst ajoute des outils de confiance"
preheader: "Versions vérifiées du SDK, du bureau, du signataire et du Web of Trust du 9 au 16 octobre."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 est publié sur npm

Le registre npm indique [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) le 12 octobre à 22:32 UTC. Le paquet publié pointe vers le commit `2937df1`, contient une valeur d'intégrité du registre et fait passer le code propre au projet de MIT à GPL-3.0-only. Les versions déjà publiées conservent leur licence d'origine. Le [journal des modifications publié](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) énumère les versions majeures correspondantes des paquets d'authentification, Blossom, données, messages directs, graphe, relais, signataires, interface, portefeuille et WoT.

Il s'agit d'une version de licence, pas de la preuve d'une nouvelle fonction à l'exécution. Avant de mettre à niveau, les développeurs devraient vérifier la compatibilité de la licence, verrouiller la valeur d'intégrité du registre et tester l'ensemble exact de paquets installé par leur application. Une version privée du monorepo, un tag ou une compilation ne suffiraient pas à prouver la publication; l'enregistrement npm est ici la preuve de distribution.

## Amethyst arrive sur ordinateur et étend la prise en charge de la confiance

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) a été publié le 11 octobre à 19:27 UTC avec des artefacts Android, Linux, macOS et Windows, chacun accompagné d'un condensat SHA-256 enregistré. Les notes incluent l'application de bureau à interface partagée ainsi qu'un index de réseau NIP-85 et l'intégration d'un fournisseur de confiance.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) a suivi le 14 octobre à 13:16 UTC avec un autre ensemble complet d'artefacts. La version ajoute le signataire distant NIP-46 au parcours de connexion, les événements Calendar Collection et RSVP, la prise en charge native de Wayland, une limitation par client pour les relais avec repli NIP-01, ainsi que des corrections pour la synchronisation du réseau de confiance et les téléchargements Web of Trust sur ordinateur.

Le changement pratique concerne la séparation des responsabilités. NIP-46 permet à un client de demander des signatures à un signataire distant au lieu de conserver la clé de signature. NIP-85 offre une méthode standard pour recevoir des assertions de confiance, mais celles-ci dépendent toujours du fournisseur et de ses données. Aucune de ces fonctions ne transforme un score de confiance en vérité objective ni ne dispense d'examiner les demandes de signature.

## Limite de version de l'extension

Aucune version de Nostr WoT Extension n'a été publiée pendant cette fenêtre. La dernière avant la date limite restait la [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), affichée comme courante par les boutiques Chrome et Firefox le 9 octobre. La version GitHub suivante, 0.8.13, a été publiée le 17 octobre, après la limite de cette édition; ses fonctions sont donc volontairement exclues.

## Une vérification prudente avant la mise à niveau

Pour SDK 2.0.0, examinez le passage à GPL-3.0-only, verrouillez les versions résolues et lancez la compilation et les tests de l'application. Pour Amethyst, téléchargez uniquement l'artefact correspondant au système et à l'architecture, comparez son condensat enregistré, sauvegardez la configuration et testez d'abord l'association NIP-46 avec un compte à faible risque. Vérifiez que le signataire affiche l'événement attendu avant de l'approuver. Considérez les résultats NIP-85 comme un élément de décision, pas comme une frontière d'autorisation.
