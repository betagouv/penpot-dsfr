---
id: penpot
title: Concevoir avec Penpot
shortTitle: Penpot
description: Installer et utiliser les bibliothèques du Système de Design de l’État dans Penpot, l’outil de conception libre et open source.
shortDescription: Utiliser le DSFR dans l’outil de conception libre Penpot.
keywords: penpot, figma, maquette, conception, bibliothèque, open source, souveraineté, DSFR, design
cover: ./_asset/files_preview.png
excerpt: Le DSFR est converti automatiquement pour Penpot. Un parcours interactif vous guide pour les installer dans votre équipe et y transférer vos maquettes existantes.
summary: Penpot est un outil de conception d’interfaces libre, open source et auto-hébergeable. Pour y utiliser le DSFR, ses bibliothèques Figma (Fondamentaux, Composants, Pictogrammes, Modèles et Bêta) sont converties automatiquement pour Penpot. Un parcours interactif guide leur installation et le transfert de maquettes existantes depuis Figma. Cette page présente aussi les limites connues de cette expérimentation.
order: 10
---

# Concevoir avec Penpot

[Penpot](https://penpot.app/) est un outil de conception d’interfaces libre et open source, alternative à Figma. Pour permettre d’y utiliser le DSFR, ses fichiers Figma sont convertis automatiquement pour Penpot à chaque nouvelle version.

Un parcours interactif vous guide pour installer le DSFR dans votre équipe Penpot, puis, si vous en avez, pour y transférer vos maquettes Figma. Comptez une quinzaine de minutes.

::dsfr-doc-iframe-modal[Lancer le parcours d’installation]{src="https://betagouv.github.io/penpot-dsfr/" title="Installer le DSFR sur Penpot"}

![Aperçu des fichiers du DSFR dans Penpot](./_asset/files_preview.png)

## Penpot en quelques mots

Penpot est proche de Figma dans son usage : pages, calques, composants et variantes, bibliothèques partagées, prototypes interactifs et commentaires.

- **Libre et open source** : son code est publié sous licence [MPL 2.0](https://github.com/penpot/penpot), développé par l’entreprise Kaleidos et une communauté de contributeurs.
- **Sans licence** : Penpot peut être utilisé gratuitement, une équipe sans abonnement Figma peut donc utiliser le DSFR.
- **Dans le navigateur** : aucune installation n’est nécessaire sur votre poste, et plusieurs personnes peuvent travailler en même temps sur un fichier.
- **Installable par votre administration** : le Service d’information du Gouvernement (SIG) propose [une instance Penpot](https://penpot.systeme-de-design.gouv.fr/) aux administrations, et Penpot peut aussi être [hébergé](https://help.penpot.app/technical-guide/getting-started/) sur vos propres serveurs pour que des maquettes sensibles ne quittent jamais votre infrastructure.

## Limites connues

Penpot est moins performant que Figma sur les très gros fichiers. Pour rester utilisables, les fichiers convertis ont été allégés :

- **Le fichier _Composants_ ne contient pas les planches d’exemples** présentant chaque composant en contexte (desktop et mobile, thèmes clair et sombre) : elles représentaient la moitié du fichier. Il diffère donc du fichier Figma, mais tous les composants, en thème clair comme en thème sombre, sont présents : votre usage n’est normalement pas affecté.
- **Certaines propriétés de composants ne sont pas disponibles** : Penpot ne gère pas encore l’affichage conditionnel d’un élément pour toutes les variantes, ni la modification d’un texte depuis le panneau de propriétés. Le texte se modifie directement dans la maquette.
- **Les textes peuvent différer légèrement de Figma** : un texte peut passer sur une ligne de plus, et Penpot ne sait pas encore tronquer un texte trop long avec des points de suspension.

Pour découvrir le DSFR en détail, consultez la documentation des composants sur ce site ou [les fichiers Figma du DSFR](https://www.figma.com/@gouvfr), consultables sans abonnement.

## Questions fréquentes

:::fr-accordion[Pourquoi Penpot est-il parfois lent ?]{id='accordion-penpot-slow'}

Activez le nouveau moteur de rendu (**Votre compte**, **Configuration**, **Rendu WebGL**), préférez un navigateur basé sur Chromium (Chrome, Edge…), limitez le nombre d’onglets ouverts et utilisez les fichiers du DSFR comme bibliothèques plutôt que de les ouvrir.

:::

:::fr-accordion[Les composants sont-ils nommés comme dans le code ?]{id='accordion-penpot-names'}

Les composants reprennent les noms des fichiers Figma, en français : « En-tête » (_Header_), « Pied de page » (_Footer_), « Bouton »…

:::

:::fr-accordion[Le DSFR est déjà installé dans mon équipe, comment l’utiliser ?]{id='accordion-penpot-use'}

Dans votre fichier, ouvrez l’onglet **Ressources**, cliquez sur **Bibliothèques** et ajoutez _Composants_, _Fondamentaux_ et _Pictogrammes_. Le parcours interactif détaille cette étape et les bonnes pratiques : la liste de ses étapes permet d’y accéder directement.

:::

:::fr-accordion[Comment mettre à jour le DSFR dans mon espace ?]{id='accordion-penpot-update'}

Ce n’est pas encore simple. Installer une nouvelle version dans un nouveau projet (par exemple `DSFR v1.16`) fonctionne, mais Penpot ne permet pas encore de remplacer facilement une bibliothèque par une autre dans des fichiers existants. Cette étape reste à éprouver et sera documentée au fil des évolutions de Penpot.

:::

:::fr-accordion[À qui signaler un problème ?]{id='accordion-penpot-support'}

Cette conversion est une expérimentation portée par [beta.gouv.fr](https://beta.gouv.fr/). Écrivez à [penpot-dsfr@beta.gouv.fr](mailto:penpot-dsfr@beta.gouv.fr) ou ouvrez un ticket sur [le dépôt penpot-dsfr](https://github.com/betagouv/penpot-dsfr/issues).

:::
