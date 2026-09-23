---
issue: "2026-09-11"
locale: fr
status: approved
subject: "Nostr WoT 0.7.0 : davantage de contrôle sur vos identités"
preheader: "Chemins personnalisés, autorisations plus claires et six projets à découvrir."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## Vos identités, avec davantage de contrôle

L’extension Nostr WoT **0.7.0** est disponible en [téléchargement sur GitHub](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), publiée le **10 septembre 2026 à 22:29 UTC**. La [fiche actuelle de Chrome](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) indique également **0.7.0**, mise à jour le **11 septembre**. La disponibilité dans la boutique Firefox reste **inconnue** : la fiche et son API ont renvoyé 404. Un ZIP Firefox sur GitHub ne prouve ni l’approbation en boutique ni la compatibilité d’installation.

Le [journal des modifications publié](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) comprend des noms de compte modifiables, des chemins de dérivation personnalisés dans Advanced et un aperçu de la clé publique avant de créer un sous-compte. Les clés standard existantes restent inchangées. Conservez le chemin personnalisé exact avec la sauvegarde de votre phrase de récupération : le nom local du compte n’est pas un secret de récupération.

La version permet aussi de restaurer les sauvegardes chiffrées de la phrase de récupération et des clés PQ, distingue mieux les autorisations ponctuelles des permanentes et chiffre le cache du portefeuille. Les notes exigent Firefox pour ordinateur **140+** ou Android **142+** et décrivent de nouvelles demandes de consentement lors de la mise à jour. Vérifiez ces exigences avant de choisir un téléchargement.

## Au-delà de l’extension

**relayer 2.2.19**, [publié le 8 septembre](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), ajoute une interface pour compter exactement l’union de filtres qui se chevauchent. Le [diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) montre une limite : le stockage doit l’implémenter ; les anciens systèmes additionnent encore les comptes séparés et peuvent compter plusieurs fois un même résultat.

Le **9 septembre**, la [clarification des types de paiement de NIP-A3](https://github.com/nostr-protocol/nips/pull/2463) a ajouté `bitcoincash` et `tron` et précisé les schémas URI pour les types inconnus ambigus. C’est une modification de spécification, pas une preuve de prise en charge par tous les clients.

Nous avons vérifié les registres officiels npm des **12 paquets non privés du SDK**. Aucune version n’a été publiée dans la période de ce numéro. Le [paquet principal](https://registry.npmjs.org/nostr-wot-sdk) reste en **1.0.1**, publié le **16 août** : du contexte, pas une nouveauté de la semaine.

## Six nouvelles fiches, pas six lancements

Notre [index de projets](https://nostr-wot.com/projects) a accueilli **Damus, Amethyst, Primal, Coracle, Amber et Nostur** le [8 septembre](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7). Ce sont des projets existants nouvellement indexés. Chaque fiche renvoie aux sources et aux personnes ou profils dont l’attribution est vérifiée. L’état du développement n’est pas une note de sécurité.

## Sécurité : durcissement, pas de piratage confirmé

Le journal de 0.7.0 décrit une autorisation plus stricte par compte et session et l’annulation des opérations obsolètes après verrouillage ou changement de compte. Ce sont des corrections et des mesures de durcissement publiées. Les éléments examinés ne démontrent ni exploitation, ni victimes, ni couverture exhaustive des incidents.

## Une prochaine étape utile

Lisez le [guide des chemins d’identité](https://nostr-wot.com/guides/custom-identity-paths) avant d’utiliser Advanced. Comprenez comment la phrase de récupération et le chemin exact permettent de retrouver une identité, et pourquoi changer son nom local ne modifie pas sa clé publique.
