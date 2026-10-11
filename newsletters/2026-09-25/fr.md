---
issue: "2026-09-25"
locale: "fr"
status: "prepared"
subject: "Nostr WoT ajoute des connexions de portefeuille limitées par application"
preheader: "Extension 0.8.3, versions du graphe sur npm et Amber 6.6.5, vérifiées du 18 au 25 septembre."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Un accès distinct au portefeuille pour chaque application

[Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), publiée le 23 septembre à 07:28 UTC, peut créer plusieurs connexions Nostr Wallet Connect pour le portefeuille LNbits de l'extension. Chaque application peut recevoir sa propre connexion nommée, avec une limite quotidienne de dépenses et une date d'expiration. Les réglages du portefeuille affichent les connexions actives et l'utilisation du budget. Ils permettent aussi de copier une chaîne de connexion, d'afficher son code QR ou de la révoquer sans remplacer l'accès des autres applications.

Les notes de version indiquent que les secrets de connexion restent chiffrés localement et que les inscriptions interrompues peuvent être récupérées. La validation a utilisé un portefeuille LNbits vide pour créer, lister et révoquer des connexions, puis effectuer un échange NWC `get_info` signé. Aucun paiement réel n'a été envoyé. Les serveurs LNbits personnalisés nécessitent un adaptateur de gestion compatible, donc tous les services NWC ne proposent pas nécessairement les mêmes contrôles.

La version 0.8.3 inclut les versions 0.8 précédentes. La [version 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) a rétabli l'API expérimentale `window.nostr.wot` comme option explicite, désactivée par défaut. Elle a également ajouté une synchronisation bornée du graphe, des avertissements avant le remplacement d'une liste de contacts et une pondération des comptes masqués. GitHub fournit des archives ZIP pour Chrome, Firefox et le code source avec des empreintes SHA-256 enregistrées. Ces téléchargements prouvent une distribution sur GitHub, pas une publication dans les boutiques. La fiche Chrome actuelle a été vérifiée pendant la récupération, mais elle ne permet pas de reconstituer la version disponible au 25 septembre. Aucune fiche Nostr WoT correspondante n'a été trouvée dans Firefox Add-ons, donc cette édition ne revendique aucune disponibilité dans cette boutique.

## Les paquets du graphe arrivent sur npm

Le registre npm indique [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) le 20 septembre à 00:17 UTC et le paquet principal [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) une minute plus tard. Cette version du graphe regroupe les explorations de relais, ajoute une limite explicite de sauts, conserve des versions déterministes des événements remplaçables et compresse les listes de contacts persistées. Elle borne aussi les requêtes de distance par lots et conserve les écritures en attente après l'échec d'une synchronisation.

Une limite de migration doit être anticipée : la base du graphe passe au schéma IndexedDB 2 et les anciennes versions du SDK ne peuvent pas rouvrir un espace de noms mis à niveau. Testez la mise à jour avec un profil jetable ou un cache reconstructible avant de l'appliquer à des données persistantes. La version 0.3.1 a suivi à 10:47 UTC et constitue la dernière version du graphe à la clôture. Son journal de modifications ne décrit que de la documentation et précise qu'il n'y a aucun changement d'exécution.

## Amber réduit la portée d'une autorisation de sauvegarde

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), publiée le 21 septembre à 14:32 UTC, chiffre les sauvegardes du signataire avec une clé dédiée dérivée par HKDF en dehors de l'espace de dérivation NIP-44. Selon les notes, cela empêche une application disposant d'une autorisation `nip44_decrypt` mémorisée de s'en servir pour lire les sauvegardes contenant des secrets NIP-46 par application et des clés locales.

Les anciennes sauvegardes chiffrées avec la clé d'identité restent restaurables jusqu'à ce qu'une nouvelle publication les remplace. La version fournit des APK Android et un manifeste de sommes de contrôle signé. Cela établit l'existence des artefacts et une méthode de vérification, pas leur installation sur un appareil particulier ni leur déploiement dans toutes les boutiques. Le projet décrit une frontière corrigée, pas un incident exploité ni un nombre d'utilisateurs touchés.

## Une vérification pratique lors de la mise à niveau

Attribuez à chaque application de portefeuille une connexion distincte, avec la plus petite limite quotidienne utile et une date d'expiration. Vérifiez ensuite que la révocation de l'une laisse les autres intactes. Pour le SDK, testez la migration du schéma et la reconstruction du cache avant d'utiliser le nouveau paquet du graphe avec des données persistantes. Pour Amber, vérifiez la version installée et publiez une nouvelle sauvegarde si vous dépendez de la restauration depuis les relais. Ces contrôles réduisent les accès partagés et les surprises de format sans prendre une note de version pour la preuve de chaque déploiement.
