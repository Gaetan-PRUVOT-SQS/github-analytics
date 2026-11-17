# GitHub Analytics

English · [Français](README.fr.md)

Web dashboard to analyze a **GitHub account** or a **repository**: languages, commits, contributors, issues, pull requests, and releases.

**Stack:** Next.js (App Router) · React · JavaScript · Recharts

**License:** [Apache License 2.0](LICENSE)

---


## Features

### Repository analysis
- General info (stars, forks, license, dates, topics, etc.)
- Languages with percentages and charts
- Contributors and contribution shares
- Commits (timeline, weekdays, UTC hours, heatmap)
- Open issues and pull requests
- Releases
- Light / dark theme

### Account analysis
- Profile (bio, followers, account age, etc.)
- Summary of public repositories (up to 300)
- Aggregated languages (by repo count and by stars)
- Top repositories with links to deep-dive analysis

### Flexible input
- Account: `octocat` or `https://github.com/octocat`
- Repository: `owner/repo` or full GitHub URL
- Optional GitHub token (browser session or `.env.local`)

## Prerequisites

- [Node.js](https://nodejs.org/) 24 (exact version in `.nvmrc`, 24.22.0 or a newer 24.x)
- npm
- (Optional) a [GitHub token](https://github.com/settings/tokens)

## Installation

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

## Getting started

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

## Usage

1. On the home page, enter an **account** or a **repository**.
2. (Optional) paste a GitHub token to avoid rate limits.
3. Click **Analyser** / Analyze.

| Type | Example |
|------|---------|
| Account | `octocat` |
| Account (URL) | `https://github.com/octocat` |
| Repository | `vercel/next.js` |
| Repository (URL) | `https://github.com/facebook/react` |

## Project structure

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

## API (overview)

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

## Tests

Plan: [`docs/tests/plan.md`](docs/tests/plan.md)

```bash
npm run test:unit
npm run build
npm run test:server    # next start on 127.0.0.1 + local fake GitHub
```

Functional and system tests run against a real `next start` wired to a fake GitHub that replays
fixed responses: no call to the real GitHub, no rate limit. Without a server they fail. Public data
only (`octocat`, `nodejs/node`, `vercel/next.js`, and `facebook/react` for the transferred repo case).

## Security and quality

Details: [`docs/securite-qualite.md`](docs/securite-qualite.md)

```bash
npm run quality
```

- Input validation (owner, repo, user)
- Sanitized tokens (never logged)
- Security HTTP headers
- GitHub Actions CI (lint, unit tests, build, functional and system tests), actions pinned by SHA

## License

This project is licensed under the **Apache License 2.0**.  
See the [LICENSE](LICENSE) file.
