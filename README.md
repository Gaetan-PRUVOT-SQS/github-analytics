# GitHub Analytics

Tableau de bord web pour analyser un **compte GitHub** ou un **dépôt** : langages, commits, contributeurs, issues, pull requests et releases.

Stack : **Next.js** (App Router), **React**, **JavaScript**, **Recharts**.

---

## Fonctionnalités

### Analyse d’un dépôt
- Infos générales (stars, forks, licence, dates, topics…)
- Langages avec pourcentages et graphiques
- Contributeurs et parts de contributions
- Commits (timeline, jours de la semaine, heures UTC, heatmap)
- Issues et pull requests ouvertes
- Releases
- Thème clair / sombre

### Analyse d’un compte
- Profil (bio, followers, âge du compte…)
- Synthèse de tous les dépôts publics (jusqu’à 300)
- Langages agrégés (par nombre de dépôts et par stars)
- Top dépôts et liens pour analyser chaque dépôt en détail

### Saisie flexible
- Compte : `octocat` ou `https://github.com/octocat`
- Dépôt : `owner/repo` ou URL GitHub complète
- Token GitHub optionnel (session navigateur ou `.env.local`)

---

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus
- npm
- (Optionnel) un [token GitHub](https://github.com/settings/tokens) pour augmenter les limites de l’API

---

## Installation

```bash
git clone <url-du-repo>
cd github-analytics
npm install
cp .env.local.example .env.local
```

Édite `.env.local` si tu veux un token serveur :

```env
GITHUB_TOKEN=ton_token_ici
```

Ne commit jamais ton token.

---

## Démarrage

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production (après build) |
| `npm run lint` | ESLint |
| `npm test` | Tous les tests |
| `npm run quality` | Lint + tests unitaires + tests fonctionnels |

---

## Utilisation

1. Sur la page d’accueil, saisis un **compte** ou un **dépôt**.
2. (Optionnel) colle un token GitHub pour éviter le rate limit.
3. Clique sur **Analyser**.

### Exemples

| Type | Exemple |
|------|---------|
| Compte | `octocat` |
| Compte (URL) | `https://github.com/octocat` |
| Dépôt | `vercel/next.js` |
| Dépôt (URL) | `https://github.com/facebook/react` |

---

## Structure du projet

```
app/                 # Pages et API Routes Next.js
  api/repo/          # API analyse d’un dépôt
  api/user/          # API analyse d’un compte
  repo/              # Dashboard dépôt
  user/              # Dashboard compte
components/          # Composants React (graphiques, listes, formulaires)
lib/                 # Logique métier, GitHub, sécurité, stats
styles/              # CSS global (thème clair / sombre)
Tests/               # Tests automatisés
  unit/              # Tests unitaires
  functional/        # Tests fonctionnels
  system/            # Tests système (API HTTP)
docs/                # Documentation tests, sécurité, qualité
```

---

## API (aperçu)

Toutes les routes passent par le serveur Next (pas d’appel GitHub direct depuis le navigateur).

### Dépôt
- `GET /api/repo/[owner]/[repo]`
- `GET /api/repo/[owner]/[repo]/languages`
- `GET /api/repo/[owner]/[repo]/contributors`
- `GET /api/repo/[owner]/[repo]/commits`
- `GET /api/repo/[owner]/[repo]/issues`
- `GET /api/repo/[owner]/[repo]/pulls`
- `GET /api/repo/[owner]/[repo]/releases`

### Compte
- `GET /api/user/[username]`
- `GET /api/user/[username]/repos`

Header optionnel : `x-github-token` (token collé dans l’UI).

---

## Tests

Plan détaillé : [`docs/tests/plan.md`](docs/tests/plan.md)

```bash
npm run test:unit          # unitaires
npm run test:functional    # fonctionnels (parcours métier)
npm run test:system        # système HTTP (nécessite npm run dev)
npm test                   # tout
```

Les fixtures de test utilisent uniquement des comptes / dépôts **publics génériques** (`octocat`, `facebook/react`, `vercel/next.js`).

---

## Sécurité et qualité

Détails : [`docs/securite-qualite.md`](docs/securite-qualite.md)

- Validation des noms (owner, repo, user) — anti path traversal
- Nettoyage des tokens (jamais loggés, jamais en URL)
- Chemins API GitHub relatifs uniquement (anti-SSRF)
- En-têtes HTTP (CSP, X-Frame-Options, etc.)
- CI GitHub Actions : lint, tests unitaires, build

```bash
npm run quality
```

---

## Licence

Projet personnel / portfolio — usage libre pour l’apprentissage et la démonstration.
