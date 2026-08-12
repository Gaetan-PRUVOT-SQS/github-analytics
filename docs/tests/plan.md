# Plan de tests — GitHub Analytics

## Objectifs

Vérifier de façon automatisée les comportements critiques :

- parsing des saisies (compte vs dépôt)
- agrégations stats (langages, commits, contributeurs, compte entier)
- détection de langages
- API HTTP (si serveur démarré)

## Périmètre

| In scope | Out of scope |
|----------|----------------|
| Tests unitaires des modules `lib/` | Tests UI navigateur |
| Tests système API (optionnels) | Données ou comptes personnels |
| Régression générique (repos publics) | OAuth, perf load |

## Données de test

Uniquement des **comptes / dépôts publics génériques**, par exemple :

- utilisateur : `octocat`
- dépôts : `facebook/react`, `vercel/next.js`

Aucun compte ni dépôt personnel ne doit apparaître dans les tests.

## Emplacement

| Niveau | Dossier |
|--------|---------|
| Unitaire | `Tests/unit/` |
| Système | `Tests/system/` |

## Lancer

```bash
npm test
npm run test:unit
npm run test:system   # nécessite npm run dev
```
