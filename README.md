# Atelier PMPS 200

Application web installable (PWA) pour apprendre à souder avec un **Parkside Performance PMPS 200 B** : réglages de départ, diagnostic des défauts, parcours de 21 exercices de l'acier à l'aluminium, carnet de réglages et diagnostic photo par IA.

React + Vite, sans backend. Les données restent sur le téléphone (localStorage).

## Fonctions

| Onglet | Rôle |
| --- | --- |
| Réglages | Réglage de départ selon le procédé (MAG, pulsé acier, pulsé alu, double pulsé, électrode), l'épaisseur et la position |
| Diagnostic | 18 symptômes, cause probable, une correction |
| Parcours | 21 exercices en 5 niveaux, progression enregistrée |
| Photo IA | Photo d'un cordon → diagnostic par un modèle vision Groq (clé de l'utilisateur, stockée dans le téléphone) |
| Carnet | Essais et réglages validés, export CSV (protégé contre l'injection de formules) |
| Poste | Caractéristiques du PMPS 200 B, check-lists de changement de fil acier ↔ alu |
| Mémo | Sécurité, teintes, check-lists de séance, tri de la documentation |
| Paramètres | Clé et modèle Groq, sauvegarde / restauration JSON, remise à zéro |

Hors connexion : tout fonctionne sauf le diagnostic photo (service worker `public/sw.js`).

## Déployer sur Vercel

1. Sur vercel.com : **Add New → Project**, importer le dépôt `atelier-soudure`.
2. Vercel détecte Vite : commande `npm run build`, dossier `dist`. Ne rien changer.
3. **Deploy**. Chaque push sur `main` redéploie.

## Installer sur l'iPhone

Ouvrir l'adresse Vercel dans Safari → Partager → **Sur l'écran d'accueil**.

## Développer

```bash
npm install
npm run dev
```

## Données

- `src/data.json` : tout le contenu (réglages, diagnostic, exercices, sécurité). Modifier ce fichier suffit pour corriger une valeur.
- Stockage : clé `atelier-pmps.v1` dans localStorage, avec `schemaVersion` pour les migrations.
- La sauvegarde JSON n'inclut jamais la clé API.

## Sources du contenu

Guide CSMOFMI (Québec), ESAB *Les fondamentaux du MIG/MAG*, Air Products *Manuel du soudeur*, SD Service, Arc Clair, notice Parkside PMPS 200, test [apprentisoudeur.fr](https://apprentisoudeur.fr/poste-a-souder-parkside-performance-pmps200b1/). Les réglages sont des points de départ à valider sur une chute.
