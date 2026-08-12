# Sécurité et qualité

## Sécurité

| Mesure | Détail |
|--------|--------|
| Validation des noms | `lib/security.js` — owner, repo, username (anti path traversal) |
| Tokens | nettoyage, longueur max, pas de retours ligne ; jamais en URL ni log |
| Appels GitHub | chemins relatifs uniquement vers `api.github.com` (anti-SSRF) |
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
| Tests complets | `npm test` |
| Build production | `npm run build` |
| Gate qualité | `npm run quality` |

### CI GitHub Actions

Fichier `.github/workflows/ci.yml` :

1. install
2. lint
3. tests unitaires
4. build

## Bonnes pratiques dev

1. Ne jamais committer un token GitHub
2. Préférer un token serveur dans `.env.local` en local
3. Lancer `npm run quality` avant un push
4. Garder les tests sur des dépôts **publics génériques** uniquement
