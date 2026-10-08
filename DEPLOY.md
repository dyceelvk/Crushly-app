# Deploying Crushly

The built app is a static `dist/` folder. `vite.config.ts` sets `base: './'`, so
the **same artifact serves from a Netlify root and from a GitHub Pages
sub-path** with no per-host config.

Both supported targets are pre-configured in this repo:

| File | Purpose |
| --- | --- |
| `netlify.toml` | `npm run build` → publish `dist/`, SPA redirect, immutable cache on `/assets/*` |
| `.github/workflows/deploy.yml` | Builds, runs `npm run verify` + `npm run smoke`, publishes to Pages |

The CI gate is deliberate: a deploy fails on a §43 terminology leak or a broken
connection flow rather than shipping it.

## Netlify

No environment variables are needed — there is no server, no secret, no API.

1. <https://app.netlify.com/start> → **Import an existing project** → GitHub →
   `dyceelvk/Crushly-app`.
2. Branch: `main` (or `arena/2cb1816f-crushly-app` to preview the current work).
3. Build command / publish directory are read from `netlify.toml`; leave them alone.
4. **Deploy site.**

Deploy previews then open for every pull request automatically.

Settings worth changing once it is live: Site configuration → Build & deploy →
production branch `main`; and Domain management for a custom domain.

## GitHub Pages

Needs one setting this repo's automation token is not permitted to change.

```bash
gh api -X POST repos/dyceelvk/Crushly-app/pages -f build_type=workflow
```

That is equivalent to Settings → Pages → Build and deployment → Source:
**GitHub Actions**. On the next push, the workflow builds and publishes; the URL
appears in the deploy job summary and at
`https://dyceelvk.github.io/Crushly-app/`.

To re-deploy by hand: `gh workflow run "Build and deploy to Pages"`.

## Rolling back

Both hosts keep prior deploys. Netlify: Deploys → previous → **Publish deploy**.
Pages: re-run the workflow from an earlier commit, or roll the site back with
`gh api -X POST /repos/dyceelvk/Crushly-app/pages/...`.

## Before you make this public

The app currently ships with fixture data in `src/data/mock.ts` and no backend.
That is fine for a preview, and not fine for real users: there is no account
system, no photo storage, no moderation queue behind **Flag**, and no age
verification behind the 18+ gate (§36). Treat any deploy as a design review
target, not a launch.
