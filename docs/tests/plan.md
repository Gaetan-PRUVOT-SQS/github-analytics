# Plan de tests : GitHub Analytics

## Objectifs

Vérifier de façon automatisée les comportements critiques :

- parsing des saisies (compte vs dépôt)
- agrégations stats (langages, commits, contributeurs, compte entier)
- détection de langages
- parcours fonctionnels (analyser un dépôt / un compte)
- API HTTP et pages, contre un vrai `next start`
- redirections de l'API GitHub (dépôt transféré) sans perdre la protection anti-SSRF

## Périmètre

| In scope | Out of scope |
|----------|----------------|
| Tests unitaires des modules `lib/` | Tests UI navigateur (Playwright) |
| Tests fonctionnels (cas d'utilisation) | Données ou comptes personnels |
| Tests système API | OAuth, perf load |

## Données de test

Uniquement des **comptes / dépôts publics génériques** :

- utilisateur : `octocat`
- dépôts : `nodejs/node`, `vercel/next.js`
- dépôt transféré : `facebook/react`, que l'API GitHub redirige (301) vers `react/react`

Les tests fonctionnels et système ne touchent jamais le vrai GitHub : `next start` est branché
sur un faux GitHub local (`Tests/helpers/mock-github.js`) qui rejoue des réponses figées
(`Tests/fixtures/github.js`). Les résultats sont donc exacts et reproductibles, sans limite d'API.

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
| TF-REPO | Analyser un dépôt (infos, langages, commits, issues...), dépôt transféré |
| TF-USER | Analyser un compte (profil + synthèse dépôts) |
| TF-ERR | Erreurs utilisateur (404, 401, 400, limite d'API, redirections refusées) |
| TF-PAGE | Pages accueil, dépôt, compte |

## Tests unitaires de `lib/github.js`

`Tests/unit/github.test.js` (TC-U-GH) remplace `fetch` par un faux :

- redirection suivie (301, 302, 307, 308, Location relative), 3 sauts au plus ;
- 4e saut refusé (`too_many_redirects`, 502) ;
- cible refusée (`bad_redirect`, 502) : autre hôte, sous-domaine piège, port, identifiants,
  `http`, autre protocole, Location vide ou absente ; le token n'est jamais envoyé ailleurs ;
- erreurs réseau et pannes GitHub en 502, plus jamais en 500 ;
- `GITHUB_API_BASE` : seul `http://127.0.0.1:<port>` est accepté en plus de `https://api.github.com`.

## Lancer

```bash
npm run test:unit      # sans serveur
npm run build
npm run test:server    # next start sur 127.0.0.1 + faux GitHub, puis Tests/functional et Tests/system
```

Sans serveur, `npm run test:functional` et `npm run test:system` échouent avec un message clair :
un test ne passe jamais à vide.
