# Weekly content harness

Tell your coding agent the result, actual attendees, scorers, article topics and relevant event folder. Use natural language or screenshots; the repo skill translates them into validated inputs. The shared skill lives at `.agents/skills/lisjaki-content/SKILL.md`. Agents that support this discovery path can load it for relevant content tasks. In Codex, you can also invoke `$lisjaki-content` explicitly.

Claude Code discovers the same skill through `.claude/skills/lisjaki-content`, a relative symlink to the shared folder. Root `CLAUDE.md` imports `AGENTS.md` for compatibility with older Claude versions. In Claude, the explicit command is `/lisjaki-content`. Once these files are committed and pulled, a fresh repo session can also use plain-language requests such as “What updates can we make to the data on the page?” or “Add a match with these scorers.” Review requests inspect current data without changing it; update requests prepare and verify the requested changes. A fresh checkout needs Node.js 22 and `npm ci` before running the harness. Photos must be supplied or present on that person’s machine. Windows clones need Git symlink support for the Claude skill link, or a local copy of the shared skill directory.

Example: “Add today's result, lineup attached except Tomaž, Logonder scored; update standings and write a short report using the photos in ~/Pictures/lisjaki/event.” The agent identifies the fixture, checks unclear facts, builds one update batch, and verifies it. Say “push” to authorize publishing if it wasn't included in the request.

## Commands

```sh
npm run content -- help
npm run content -- check
npm run content -- league sync --dry-run
npm run content -- batch /tmp/weekly-update.json --dry-run
npm run content -- batch /tmp/weekly-update.json
npm run content -- verify
```

Use the skill's `references/inputs.md` for all JSON schemas/examples and `references/editorial.md` for article conventions. Commands include match upsert, standings/fixtures/league sync, roster upsert, season set, article add, gallery import/reorder, check, verify, content-only publish and deployment check. Input errors and content errors prevent the batch from writing; IO failures roll back files. Interrupted processes are not a multi-file transactional database; review Git diff before rerunning after an interruption. Repeated inputs are safe and deterministic.

## Storage

`src/data/content/` holds matches, standings, players, settings, gallery and article metadata as JSON. Existing `src/data/*.ts` exports remain compatible adapters; article Markdown stays in `src/data/articles/`. New article routes are discovered by the existing SSG routes. Standings metadata drives the display date, season, group and source link. Settings drive the default match season. Player statistics still derive from match details.

All existing match details were retained. The migration marks detailed historical matches and the explicit 3–3 correction as confirmed so imports cannot overwrite club evidence. Manual match updates are also confirmed. Imported unconfirmed results may refresh; lineups remain intact. An imported ID cannot change teams and reuse existing player details. Missing fixtures remain available for human review rather than being deleted as a side effect of a partial source page.

The importer reads the configured AnWP league HTML, validates group membership and standings arithmetic, and deduplicates club matches by source ID. It fails if expected markup is missing. Tests use a stripped real HTML capture with no external request; live updates use a fresh fetch or a freshly saved `--html` snapshot. If the source changes its HTML structure, repair the parser and update fixtures; do not silently replace the site with partial records. The checked date is source retrieval date, not inferred from a match date. Future seasons require a source and group through `season set`, followed by a league refresh; old results remain intact.

Gallery imports preserve source originals, select supported media, copy to repository assets with content hashes, and set order/cover. Re-importing replaces album selection but does not delete old repository files automatically. Explicitly review unused assets before removing them. The audit validates media existence and Pages' 25 MiB limit, warns about duplicate bytes/large originals, checks album/article links, and flags linked-report score/scorer inconsistencies. These checks assist editorial review; they do not verify every claim.

Gallery cards use responsive Cloudflare variants (320/640/960 px, quality 80), lightboxes use 960/1600/2560 px at quality 85, and only adjacent photos are prefetched. Development uses original URLs; failed transformations fall back to originals. Both lightboxes expose original links. Gallery assets have a conservative one-day browser cache to cover older filenames that can still be replaced. No service worker, Worker or new storage service is introduced.

## Publishing and verification

`verify` audits data, runs content behavior tests, builds static pages and checks whitespace. Implementation changes should also lint changed files and typecheck `scripts/content/tsconfig.json`; tournament/API changes retain the separate AGENTS.md checks. The GitHub workflow runs content verification with a clean npm install. Existing unrelated full-app TypeScript/lint errors are outside these checks.

Publishing requires a user request. `publish /tmp/publish.json` accepts explicit paths under content/Markdown or gallery/news media, refuses existing staged changes, verifies, commits and pushes the current branch. Implementation files use the normal scoped Git workflow. A push to a feature branch doesn't publish production. `main` triggers Cloudflare Pages.

Builds emit `dist/deployment.json` with `CF_PAGES_COMMIT_SHA` (or local HEAD), served with no-store. `deployment check --commit <full-sha>` verifies the deployed SHA. Until this implementation is deployed the marker will be absent; a push alone is never reported as confirmed deployment.

Tournament persistence/authentication is unchanged and does not go through this harness. No credentials or API write secrets are added.
