# GitHub Analytics

[Français](#français) · [English](#english)

Tableau de bord web pour analyser un **compte GitHub** ou un **dépôt** : langages, commits, contributeurs, issues, pull requests et releases.

Web dashboard to analyze a **GitHub account** or a **repository**: languages, commits, contributors, issues, pull requests, and releases.

**Stack :** Next.js (App Router) · React · JavaScript · Recharts  

**Licence / License :** [Apache License 2.0](LICENSE)

---

## Français

### Fonctionnalités

#### Analyse d’un dépôt
- Infos générales (stars, forks, licence, dates, topics…)
- Langages avec pourcentages et graphiques
- Contributeurs et parts de contributions
- Commits (timeline, jours de la semaine, heures UTC, heatmap)
- Issues et pull requests ouvertes
- Releases
- Thème clair / sombre

#### Analyse d’un compte
- Profil (bio, followers, âge du compte…)
- Synthèse des dépôts publics (jusqu’à 300)
- Langages agrégés (par nombre de dépôts et par stars)
- Top dépôts et liens pour analyser chaque dépôt en détail

#### Saisie flexible
- Compte : `octocat` ou `https://github.com/octocat`
- Dépôt : `owner/repo` ou URL GitHub complète
- Token GitHub optionnel (session navigateur ou `.env.local`)

### Prérequis

- [Node.js](https://nodejs.org/) 24 (version exacte dans `.nvmrc`, 24.22.0 ou plus récent en 24.x)
- npm
- (Optionnel) un [token GitHub](https://github.com/settings/tokens)

### Installation

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

### Démarrage

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
| `npm run test:unit` | Tests unitaires |
| `npm run test:server` | Tests fonctionnels et système (après build) |
| `npm run quality` | Lint + tests unitaires + build + tests fonctionnels et système |

### Utilisation

1. Sur la page d’accueil, saisis un **compte** ou un **dépôt**.
2. (Optionnel) colle un token GitHub pour éviter le rate limit.
3. Clique sur **Analyser**.

| Type | Exemple |
|------|---------|
| Compte | `octocat` |
| Compte (URL) | `https://github.com/octocat` |
| Dépôt | `vercel/next.js` |
| Dépôt (URL) | `https://github.com/facebook/react` |

### Structure du projet

```
app/                 # Pages et API Routes Next.js
  api/repo/          # API analyse d’un dépôt
  api/user/          # API analyse d’un compte
  repo/              # Dashboard dépôt
  user/              # Dashboard compte
components/          # Composants React
lib/                 # Logique métier, GitHub, sécurité, stats
styles/              # CSS global (thème clair / sombre)
Tests/               # Tests automatisés
docs/                # Documentation
```

### API (aperçu)

Les appels GitHub passent par le serveur Next (pas d’appel direct depuis le navigateur).

**Dépôt**
- `GET /api/repo/[owner]/[repo]`
- `GET /api/repo/[owner]/[repo]/languages`
- `GET /api/repo/[owner]/[repo]/contributors`
- `GET /api/repo/[owner]/[repo]/commits`
- `GET /api/repo/[owner]/[repo]/issues`
- `GET /api/repo/[owner]/[repo]/pulls`
- `GET /api/repo/[owner]/[repo]/releases`

**Compte**
- `GET /api/user/[username]`
- `GET /api/user/[username]/repos`

Header optionnel : `x-github-token`.

### Tests

Plan : [`docs/tests/plan.md`](docs/tests/plan.md)

```bash
npm run test:unit
npm run build
npm run test:server    # next start sur 127.0.0.1 + faux GitHub local
```

Les tests fonctionnels et système tournent contre un vrai `next start`, branché sur un faux GitHub
qui rejoue des réponses figées : aucun appel au vrai GitHub, aucune limite d'API. Sans serveur, ils
échouent. Données publiques uniquement (`octocat`, `nodejs/node`, `vercel/next.js`, et
`facebook/react` pour le cas du dépôt transféré).

### Sécurité et qualité

Détails : [`docs/securite-qualite.md`](docs/securite-qualite.md)

```bash
npm run quality
```

- Validation des entrées (owner, repo, user)
- Tokens nettoyés, jamais loggés
- En-têtes HTTP de sécurité
- CI GitHub Actions (lint, tests unitaires, build, tests fonctionnels et système), actions épinglées par SHA

### Licence

Ce projet est sous licence **Apache License 2.0**.  
Voir le fichier [LICENSE](LICENSE).

---

## English

### Features

#### Repository analysis
- General info (stars, forks, license, dates, topics…)
- Languages with percentages and charts
- Contributors and contribution shares
- Commits (timeline, weekdays, UTC hours, heatmap)
- Open issues and pull requests
- Releases
- Light / dark theme

#### Account analysis
- Profile (bio, followers, account age…)
- Summary of public repositories (up to 300)
- Aggregated languages (by repo count and by stars)
- Top repositories with links to deep-dive analysis

#### Flexible input
- Account: `octocat` or `https://github.com/octocat`
- Repository: `owner/repo` or full GitHub URL
- Optional GitHub token (browser session or `.env.local`)

### Prerequisites

- [Node.js](https://nodejs.org/) 24 (exact version in `.nvmrc`, 24.22.0 or a newer 24.x)
- npm
- (Optional) a [GitHub token](https://github.com/settings/tokens)

### Installation

```bash
git clone <repo-url>
cd github-analytics
npm install
cp .env.local.example .env.local
```

Edit `.env.local` if you want a server-side token:

```env
GITHUB_TOKEN=your_token_here
```

Never commit your token.

### Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server (after build) |
| `npm run lint` | ESLint |
| `npm run test:unit` | Unit tests |
| `npm run test:server` | Functional and system tests (after build) |
| `npm run quality` | Lint + unit tests + build + functional and system tests |

### Usage

1. On the home page, enter an **account** or a **repository**.
2. (Optional) paste a GitHub token to avoid rate limits.
3. Click **Analyser** / Analyze.

| Type | Example |
|------|---------|
| Account | `octocat` |
| Account (URL) | `https://github.com/octocat` |
| Repository | `vercel/next.js` |
| Repository (URL) | `https://github.com/facebook/react` |

### Project structure

```
app/                 # Next.js pages and API routes
  api/repo/          # Repository analysis API
  api/user/          # Account analysis API
  repo/              # Repository dashboard
  user/              # Account dashboard
components/          # React components
lib/                 # Business logic, GitHub, security, stats
styles/              # Global CSS (light / dark theme)
Tests/               # Automated tests
docs/                # Documentation
```

### API (overview)

GitHub is called from the Next.js server only (no direct browser calls to GitHub).

**Repository**
- `GET /api/repo/[owner]/[repo]`
- `GET /api/repo/[owner]/[repo]/languages`
- `GET /api/repo/[owner]/[repo]/contributors`
- `GET /api/repo/[owner]/[repo]/commits`
- `GET /api/repo/[owner]/[repo]/issues`
- `GET /api/repo/[owner]/[repo]/pulls`
- `GET /api/repo/[owner]/[repo]/releases`

**Account**
- `GET /api/user/[username]`
- `GET /api/user/[username]/repos`

Optional header: `x-github-token`.

### Tests

Plan: [`docs/tests/plan.md`](docs/tests/plan.md)

```bash
npm run test:unit
npm run build
npm run test:server    # next start on 127.0.0.1 + local fake GitHub
```

Functional and system tests run against a real `next start` wired to a fake GitHub that replays
fixed responses: no call to the real GitHub, no rate limit. Without a server they fail. Public data
only (`octocat`, `nodejs/node`, `vercel/next.js`, and `facebook/react` for the transferred repo case).

### Security and quality

Details: [`docs/securite-qualite.md`](docs/securite-qualite.md)

```bash
npm run quality
```

- Input validation (owner, repo, user)
- Sanitized tokens (never logged)
- Security HTTP headers
- GitHub Actions CI (lint, unit tests, build, functional and system tests), actions pinned by SHA

### License

This project is licensed under the **Apache License 2.0**.  
See the [LICENSE](LICENSE) file.
