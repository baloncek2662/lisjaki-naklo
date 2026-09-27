# Lisjaki Naklo

Website for Lisjaki Naklo, with club news, photo galleries, fixtures, results, league standings, player statistics, and tournament results.

Production: [lisjaki-naklo.si](https://lisjaki-naklo.si).

## Local development

Use Node.js 22 and npm 10. The production build has been verified with npm 10.9.2.

```sh
git clone git@github.com:baloncek2662/lisjaki-naklo.git
cd lisjaki-naklo
npm ci
npm run dev
```

Keep `package-lock.json` as the only dependency lockfile. Cloudflare detects Bun lockfiles and switches to Bun if one is present.

## Build and preview

```sh
npm run build
npm run preview
```

The site uses React, TypeScript, Vite, Tailwind CSS, and shadcn/ui. `vite-react-ssg` generates the static pages in `dist/`.

## Content

- `src/data/matches.ts`: fixtures, results, lineups, and scorers.
- `src/data/standings.ts`: league standings.
- `src/data/team.ts`: player names and jersey numbers.
- `src/data/articles/`: club news articles.
- `public/images/gallery/`: event photos.

## Deployment

Pushes to `main` trigger the Cloudflare Pages project `lisjaki-naklo`. The build command is `npm run build`, and the output directory is `dist/`. Cloudflare configuration is maintained in `wrangler.jsonc`.

The tournament API runs in Pages Functions under `functions/`, with Cloudflare D1 as the authoritative data store. Organizer access and writes are protected by Cloudflare Access. The Vite development server alone does not run these Functions.

See [AGENTS.md](AGENTS.md) for tournament architecture, security requirements, migrations, and verification commands.
