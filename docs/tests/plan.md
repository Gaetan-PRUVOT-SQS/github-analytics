# Plan de tests — GitHub Analytics

## Objectifs

Vérifier de façon automatisée les comportements critiques :

- parsing des saisies (compte vs dépôt)
- agrégations stats (langages, commits, contributeurs, compte entier)
- détection de langages
- parcours fonctionnels (analyser un dépôt / un compte)
- API HTTP et pages (si serveur démarré)

## Périmètre

| In scope | Out of scope |
|----------|----------------|
| Tests unitaires des modules `lib/` | Tests UI navigateur (Playwright) |
| Tests fonctionnels (cas d'utilisation) | Données ou comptes personnels |
| Tests système API (optionnels) | OAuth, perf load |

## Données de test

Uniquement des **comptes / dépôts publics génériques** :

- utilisateur : `octocat`
- dépôts : `facebook/react`, `vercel/next.js`

Aucun compte ni dépôt personnel ne doit apparaître dans les tests.

## Emplacement

| Niveau | Dossier |
|--------|---------|
| Unitaire | `Tests/unit/` |
| Fonctionnel | `Tests/functional/` |
| Système | `Tests/system/` |

## Scénarios fonctionnels

| ID | Scénario |
|----|----------|
| TF-PARSE | Saisie compte / dépôt / URL / invalide |
| TF-REPO | Analyser un dépôt (infos, langages, commits, issues…) |
| TF-USER | Analyser un compte (profil + synthèse dépôts) |
| TF-ERR | Erreurs utilisateur (404, 401, paramètres invalides) |
| TF-PAGE | Pages accueil, dépôt, compte |

## Lancer

```bash
npm test
npm run test:unit
npm run test:functional   # une partie sans serveur ; le reste nécessite npm run dev
npm run test:system       # nécessite npm run dev
```
