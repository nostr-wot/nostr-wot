---
issue: "2026-10-09"
locale: "fr"
status: "prepared"
subject: "Account Archive arrive sur Chrome et Firefox"
preheader: "Extension 0.8.12 et SDK 1.0.4, vérifiés du 2 au 9 octobre."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive arrive dans les deux boutiques de navigateurs

[Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) est désormais indiquée en version 0.8.12 dans le [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) et dans [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/). Les deux boutiques affichent une mise à jour au 7 octobre. La version GitHub a été publiée le 6 octobre à 22:22 UTC et fournit des archives distinctes pour Chrome, Firefox et le code source correspondant, avec des empreintes SHA-256 enregistrées.

La version précédente, 0.8.11, a ajouté Account Archive dans les réglages. Il peut synchroniser les relais sélectionnés manuellement, toutes les heures, chaque jour ou chaque semaine, conserver un stockage local chiffré, regrouper les relais et reprendre à partir de points de contrôle. Il affiche le nombre d'événements, la taille de l'archive, la progression et les erreurs par relais. La migration vérifie une destination avant confirmation, conserve les signatures d'origine, ignore les événements non admissibles et garde les détails des échecs disponibles pour examen.

La version 0.8.12 permet de télécharger et d'importer un NDJSON ordinaire d'événements signés sans mot de passe de fichier, tout en conservant la prise en charge des anciennes exportations chiffrées. Avant la fusion, les événements importés sont vérifiés pour confirmer leur appartenance au compte et la validité de leur signature. Les fenêtres d'importation et de téléchargement s'ouvrent aussi au-dessus de toute la fenêtre de l'extension, et non dans la carte des réglages.

## SDK 1.0.4 publie des composants de protocole partagés

Le registre npm indique [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) le 8 octobre à 13:41 UTC et 1.0.4 à 16:23 UTC. La version 1.0.3 a déplacé les responsabilités réutilisables liées aux relais, au portefeuille, aux données et aux messages directs vers des paquets dédiés. Le client NIP-47 partagé négocie le chiffrement, valide les réponses, borne les attentes et distingue un échec de paiement certain d'un résultat incertain. Les options natives de connexion NIP-46 proposent des actions traduites et un transfert vers la plateforme sans correctifs DOM propres à chaque application.

La version 1.0.4 ajoute des téléversements Blossom gérés avec une copie stable des octets d'entrée, une annulation par l'appelant et des contrôles de session active. Les redirections sont refusées avant de tenter un autre serveur configuré. Les téléversements chiffrés utilisent une nouvelle identité de signature jetable et une autorisation liée à chaque serveur. Le paquet de données peut aussi vider des caches observables indexés sans supprimer leurs abonnés.

Le journal des modifications principal du dépôt s'arrête encore à SDK 1.0.2. Le détail de ces deux versions du registre repose donc sur le [PR des protocoles](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), le [PR Blossom et cache](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) déjà fusionnés et le contenu publié des paquets. Une version du registre ne prouve pas que toutes les applications consommatrices ont été mises à jour.

## Limites à garder visibles

Une archive NDJSON non chiffrée doit être traitée comme une donnée locale sensible, même si les événements conservent leurs signatures. Les contrôles d'appartenance et de signature protègent l'intégrité, mais ne rendent pas le fichier confidentiel. La synchronisation dépend des relais choisis par l'utilisateur et ne promet ni conservation permanente ni historique complet.

Pour Blossom, les identités jetables et HTTPS réduisent les possibilités de corrélation et l'exposition pendant le transport des téléversements chiffrés, mais un serveur peut toujours observer la taille et l'empreinte du texte chiffré, l'adresse IP et le moment. Le refus des redirections maintient les octets et l'autorisation dans la liste configurée, mais ne rend pas privé un serveur non fiable.

## Une vérification pratique après la mise à niveau

Confirmez que l'extension installée indique la version 0.8.12 avant de tester Archive. Commencez par une synchronisation manuelle sur un petit ensemble de relais connus, examinez les nombres et les erreurs, puis conservez les fichiers exportés dans un stockage protégé. Les développeurs qui adoptent SDK 1.0.4 devraient épingler la valeur d'intégrité publiée, tester l'annulation et les changements de session, et séparer les résultats de paiement incertains des échecs confirmés.
