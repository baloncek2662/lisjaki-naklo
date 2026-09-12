# Lisjaki Naklo project context

This file is the durable handoff for future coding agents. Keep it current when deployment architecture, security boundaries, or tournament persistence changes.

## Project and deployment

- Vite + React + TypeScript static site, rendered with `vite-react-ssg`.
- Production: Cloudflare Pages project `lisjaki-naklo`.
- Production hostname: `https://lisjaki-naklo.si`.
- `main` is the production branch; pushes trigger the Pages deployment.
- Cloudflare Pages Functions live under `functions/`. Do not create a separate Worker for the tournament API.
- `wrangler.jsonc` is the source-controlled Cloudflare configuration.
- The site intentionally has no service worker or application-level offline cache. Cloudflare Pages and Vite's hashed assets provide normal HTTP/CDN caching without risking stale API data.
- `src/main.tsx` retains best-effort cleanup for the former root service worker and `lisjaki-turnir-*` caches. Keep it long enough for infrequent returning visitors to receive the cleanup.

## Tournament architecture

- Public results: `/turnir`.
- Organizer console: `/turnir/vodenje`. Its link is intentionally absent from the public page; organizers use the direct URL.
- Public API: `GET /api/tournament`, implemented in `functions/api/tournament.ts`.
- Admin API: `PUT /api/admin/tournament`, implemented in `functions/api/admin/tournament.ts`.
- The browser never accesses D1 directly. React calls the Pages Functions on the same origin.
- D1 is the sole authority. IndexedDB, localStorage, `BroadcastChannel`, and localhost-only organizer gating were deliberately removed. Do not restore them as persistence or authorization fallbacks.
- Public clients fetch on initial load, every 15 seconds while visible, and when the window regains focus. They send the last ETag; unchanged data returns `304`. A publish-to-public delay of up to roughly 15 seconds is expected.
- The admin client automatically publishes a quiet batch of changes after a 750 ms debounce. The UI reports loading/saving/saved/error state.
- At the start, organizers can pre-draw 1–20 preliminary rounds. The first is active and the rest are scheduled. Completing a round does not automatically start the next one: the organizer can start the next scheduled round or finish early and generate finals, which removes unused scheduled rounds. After all pre-drawn rounds are completed, additional rounds can still be drawn one at a time.
- Completing a preliminary round does not permanently lock its matches. Organizers can use “Popravi” to unlock a previous result, edit it, and confirm it again; rankings recalculate from confirmed results.
- Updates use an integer revision. Stale writers receive `409 Conflict`; do not remove this optimistic-concurrency check.
- Server-side timestamps and the authenticated Access email are recorded on writes.
- The latest state is stored as one validated JSON document. D1 retains the latest 50 snapshots for recovery/auditing; there is currently no snapshot-restore UI.
- Each player has a `male`/`female` gender used by both preliminary and finals draws. New and legacy players default to male until the organizer marks the “Ženska” checkbox. When possible, every three-person team has at most one woman. If the number of female appearances exceeds the number of teams, teams may have two women, but never three, and opposing teams may differ by at most one woman (so 2–0 is forbidden).

## D1

- Binding used by code: `TOURNAMENT_DB` (`context.env.TOURNAMENT_DB`).
- Cloudflare database name: `lisjaki-tournament`.
- Database ID: `beb61278-a3e0-42a4-b48a-1b54a9ac08eb`.
- Schema/migration: `migrations/0001_tournament_state.sql`.
- Migration `0001_tournament_state.sql` was applied successfully to the remote production database on 2026-08-29.
- It creates `tournament_state`, `tournament_snapshots`, Cloudflare's migration tracking, and seeds revision 1.

Useful diagnostics:

```bash
npx wrangler d1 migrations list TOURNAMENT_DB --remote
npx wrangler d1 execute TOURNAMENT_DB --remote --command="SELECT id, revision, updated_at, updated_by FROM tournament_state"
npx wrangler d1 execute TOURNAMENT_DB --remote --command="SELECT revision, updated_at, updated_by FROM tournament_snapshots ORDER BY revision DESC LIMIT 10"
```

Remote D1 commands change or inspect production depending on the SQL. Treat mutation commands as production operations and require clear user authorization.

## Authentication and security invariants

- Cloudflare Access protects these custom-domain paths:
  - `lisjaki-naklo.si/turnir/vodenje*`
  - `lisjaki-naklo.si/api/admin/*`
- The Access application is restricted to the organizer identity in the Cloudflare dashboard. The session duration was set to one month as of 2026-08-29.
- Access team domain: `https://green-star-fe14.cloudflareaccess.com`.
- Access application AUD: `f8d1fdf9e8f92ffa28a8fc70845d2c9fde17d2dc432850a5d0bd507ccedffdb9`.
- These Access identifiers are not passwords. The signed Access session/JWT is the credential.
- `functions/api/admin/_middleware.ts` validates the signed Access assertion against the configured team domain and AUD. It must fail closed when configuration or authentication is absent.
- The admin write Function also validates the entire tournament payload, limits request size, and writes through prepared D1 statements.
- Public `GET /api/tournament` remains unauthenticated and read-only.
- Protecting/hiding only the admin UI is never sufficient. Every mutation must remain behind server-side authentication.
- Do not add passwords, API tokens, or write secrets to client bundles, `VITE_*` variables, or public assets.
- The `pages.dev` hostname may display static admin assets unless separately protected, but the admin API must still reject writes without a valid Access JWT. Keep Function-level JWT verification as defense in depth.
- No internet-facing system is “completely secure.” Main residual risks are Cloudflare/account compromise, theft of an authenticated browser session, Access policy mistakes, XSS, vulnerable dependencies, and operator error.

## Key files

- `src/hooks/use-tournament.ts`: public polling and serialized admin publishing.
- `src/lib/tournament-api.ts`: browser API client.
- `src/lib/tournament.ts`: tournament model, draws, results, rankings, and import validation.
- `server/tournament-api.ts`: strict server validation, D1 loading, ETags, and response helpers.
- `functions/api/tournament.ts`: public read endpoint.
- `functions/api/admin/_middleware.ts`: Cloudflare Access validation.
- `functions/api/admin/tournament.ts`: authenticated central write endpoint.
- `migrations/0001_tournament_state.sql`: production schema and initial state.
- `wrangler.jsonc`: Pages/D1/Access runtime configuration.
- `scripts/tournament-smoke.ts`: tournament and server-boundary smoke tests.

## Verification

Run these after tournament/API changes:

```bash
npm run test:tournament
npx tsc -p functions/tsconfig.json
WRANGLER_LOG_PATH=/tmp/lisjaki-wrangler.log npx wrangler pages functions build --outdir /tmp/lisjaki-pages-functions
npm run build
git diff --check
```

Lint only changed files when appropriate. As of 2026-08-29, the full `npm run lint` has unrelated pre-existing errors in shadcn/generated or older files (`command.tsx`, `textarea.tsx`, `NovicaDetail.tsx`, `Tekme.tsx`, and `tailwind.config.ts`). Do not attribute those to tournament changes without checking the diff.

`npm install` reported dependency advisories on 2026-08-29. They were not triaged in the tournament migration; distinguish production/runtime advisories from development-tool advisories before changing versions.

## Troubleshooting

- Public API returns `503 Tournament database is not initialized`: check the `TOURNAMENT_DB` Pages binding, remote migration, and seeded `tournament_state` row.
- Admin API returns `503 Cloudflare Access is not configured`: check `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc` and the deployed Pages configuration.
- Admin redirects to Access repeatedly: verify the custom-domain Access paths, allowed identity, session cookies, team domain, and AUD.
- Admin reports a conflict/HTTP 409: another revision was published. Reload before editing further; do not blindly overwrite.
- Public page updates slowly: the expected polling window is 15 seconds plus network latency. Returning to the tab triggers an immediate refresh.
- Public page never updates: inspect `GET /api/tournament`, its ETag/revision, the admin publish status, and the current D1 row.
- Admin UI opens but cannot publish on a `pages.dev` URL: that hostname may not share the custom-domain Access application session. Use `https://lisjaki-naklo.si/turnir/vodenje` or configure Access for the Pages hostname too.

## Historical handoff

- Central tournament persistence and Access authentication landed in feature commit `fd01e10` and merge commit `b88519c` on 2026-08-29.
- The migration intentionally replaced browser-only IndexedDB state. Any old tournament data in a browser was never authoritative and is not imported automatically.
