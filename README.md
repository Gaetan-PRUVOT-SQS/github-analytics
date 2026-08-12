# GitHub Analytics

Tableau de bord pour analyser un dépôt ou un compte GitHub (commits, contributeurs, langages, issues, releases).

## Prérequis

- Node.js 18+
- (Optionnel) un token GitHub

## Installation

```bash
npm install
cp .env.local.example .env.local
# éditer .env.local et coller GITHUB_TOKEN si besoin
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Utilisation

1. Compte entier : `octocat` ou `https://github.com/octocat`
2. Dépôt : `owner/repo` (ex. `vercel/next.js`) ou URL GitHub
3. Optionnel : coller un token GitHub pour augmenter les limites API
4. Cliquer sur **Analyser**

## Tests

Plan : `docs/tests/plan.md`  
Dossier : `Tests/`

```bash
# tous les tests (unitaires + système ; le système se skip si pas de serveur)
npm test

# unitaires seuls
npm run test:unit

# système (nécessite npm run dev sur le port 3000)
npm run dev
# autre terminal :
npm run test:system
```

Les tests utilisent uniquement des dépôts / comptes **publics génériques** (ex. `octocat`, `facebook/react`, `vercel/next.js`).

## Sécurité et qualité

Détails : `docs/securite-qualite.md`

```bash
# lint + tests unitaires (à lancer avant un push)
npm run quality
```

- Validation des entrées (owner / repo / user)
- Tokens nettoyés, jamais loggés
- En-têtes HTTP de sécurité (CSP, X-Frame-Options…)
- CI GitHub Actions : lint + tests + build
