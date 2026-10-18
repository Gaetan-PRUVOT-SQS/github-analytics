# Sécurité et qualité

## Sécurité

| Mesure | Détail |
|--------|--------|
| Validation des noms | `lib/security.js` : owner, repo, username (anti path traversal) |
| Tokens | nettoyage, longueur max, pas de retours ligne ; jamais en URL ni log |
| Appels GitHub | chemins relatifs uniquement vers `api.github.com` (anti-SSRF) ; redirections suivies à la main, 3 au plus, seulement vers `https://api.github.com` |
| En-têtes HTTP | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy |
| Secrets | `.env*` ignoré par git ; modèle `.env.local.example` sans secret |

### Entrées refusées (exemples)

- `../etc/passwd`
- `owner/repo` dans un seul paramètre de nom
- token avec `\n` (injection d’en-tête)

## Qualité

| Outil | Commande |
|-------|----------|
| Lint ESLint | `npm run lint` |
| Tests unitaires | `npm run test:unit` |
| Tests fonctionnels et système | `npm run test:server` (après `npm run build`) |
| Build production | `npm run build` |
| Gate qualité | `npm run quality` |

### CI GitHub Actions

Fichier `.github/workflows/ci.yml` :

- job `quality` : install, lint, tests unitaires, build
- job `server-tests` : install, build, puis `npm run test:server` (next start sur 127.0.0.1 et faux GitHub)
- actions épinglées par SHA, `permissions: contents: read`, `persist-credentials: false`, `timeout-minutes`
- Node lu dans `.nvmrc`

## Bonnes pratiques dev

1. Ne jamais committer un token GitHub
2. Préférer un token serveur dans `.env.local` en local
3. Lancer `npm run quality` avant un push
4. Garder les tests sur des dépôts **publics génériques** uniquement
