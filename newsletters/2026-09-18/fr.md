---
issue: "2026-09-18"
locale: "fr"
status: "prepared"
subject: "Amethyst découvre plus tôt les commentaires imbriqués"
preheader: "Une correction publiée et les versions de référence du 11 au 18 septembre."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## Une amélioration publiée de la découverte des réponses

[Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), publié le 12 septembre à 14:42 UTC, propose des téléchargements pour Android et ordinateur. Sa [modification des filtres NIP-22](https://github.com/vitorpamplona/amethyst/pull/4095) permet aux requêtes de découvrir les commentaires imbriqués par la racine de la conversation, en complément des requêtes existantes pour les réponses directes.

La distinction est petite mais importante : une réponse à un commentaire désigne la conversation initiale par une balise en majuscule, tandis que sa balise en minuscule pointe vers le parent immédiat. Chercher uniquement le parent exclut cette réponse imbriquée lors de la consultation de l’élément initial. Des filtres de racine séparés corrigent la requête. La disponibilité des relais et les limites temporelles déterminent toujours les événements reçus ; la modification ne garantit pas le chargement de toutes les réponses.

La même version corrige la découverte des mises à jour de demandes de fusion NIP-34. Notre [analyse du code](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) explique les deux cas. Les téléchargements GitHub prouvent la distribution sur ce canal, pas le déploiement dans une boutique d’applications.

## Notre extension et notre SDK à la clôture de cette édition

Cette édition rattrapée couvre la période du 11 septembre à 08:00 UTC au 18 septembre à 08:00 UTC. Le [téléchargement 0.7.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) de l’extension, publié le 10 septembre à 22:29 UTC, reste la référence GitHub à cette échéance. Il s’agit du contexte de l’édition précédente. Son [journal publié](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) décrit les changements de chemins d’identité et de récupération ; un ZIP Firefox téléchargeable ne prouve pas sa disponibilité dans la boutique Firefox.

Les registres officiels npm des 12 paquets non privés du SDK ne montrent aucune version publiée pendant cette période. La référence du [paquet principal](https://registry.npmjs.org/nostr-wot-sdk) est 1.0.1, publiée le 16 août. Les versions des 19 et 20 septembre relèvent de la prochaine édition et sont exclues ici.

## Une vérification utile pour les développeurs de clients

Si une réponse imbriquée apparaît seulement après l’ouverture du fil, comparez les filtres de parent direct et de racine avant de conclure à un contenu manquant. Le correctif Amethyst fournit une implémentation concrète à étudier. Utilisez des événements de test jetables et inspectez la requête réelle au relais ; une balise du protocole et son traitement par un client sont deux choses distinctes.
