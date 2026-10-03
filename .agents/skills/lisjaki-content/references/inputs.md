# Inputs and commands

All commands run from the repository root; `--root /absolute/repo` is available for isolated workspaces. Commands reject unknown JSON fields and invalid records. Writes are staged in memory and audited as a batch; `--dry-run` reports planned files without writing. Inputs are read relative to the shell working directory.

## Match upsert

`npm run content -- match upsert /tmp/match.json`

An existing ID supplies season, teams, kickoff, and location. A new match requires those fields. Scores always use home/away orientation. Kickoff must include a timezone offset; display dates/times use Europe/Ljubljana, including daylight saving. Details, when supplied, replace both sides; omitted details retain existing ones. Use complete side objects even if opponent data is unknown. Partial scorer/lineup corrections should start from the existing details and edit them.

```json
{
  "id": 6683,
  "homeScore": 1,
  "awayScore": 0,
  "details": {
    "home": {"lineup": ["Gašper Martič", "Blaž Logonder", "Tomaž Hribernik"], "goalscorers": [{"player": "Blaž Logonder"}]},
    "away": {"lineup": [], "goalscorers": []}
  },
  "absent": ["Tomaž Hribernik"]
}
```

Optional substitutions are player arrays; goals may have a minute. Every scorer entry represents one goal. Last-name shorthand resolves only when unique. Absences remove club lineup entries; an absent scorer is rejected. Scores with incomplete goal lists produce warnings; more scorer entries than goals are rejected. Example data is illustrative, not a real result.

## League synchronization

`standings sync` updates standings only; `fixtures sync` imports club fixtures and results; `league sync` performs both using one request. Sources, group and season come from settings. All operations validate the complete source group and club fixtures, rejecting incomplete markup. Normalized known team names retain their existing display spelling.

```sh
npm run content -- league sync --dry-run
npm run content -- league sync --html /tmp/fresh-league.html --as-of 2026-10-03 --dry-run
```

Batch input may supply `{"html":"/tmp/fresh-league.html","asOf":"2026-10-03"}`. Do not use saved test HTML as live standings. Missing source matches are retained; review cancellation separately. Results confirmed through `match upsert` survive source corrections; unconfirmed imported scores may refresh. Migration protected all existing detailed match records and the explicit club score correction.

## Article

`npm run content -- article add /tmp/article.json`

```json
{
  "slug": "event-report",
  "title": "Naslov novice",
  "excerpt": "Kratek povzetek znanih dejstev.",
  "publishedAt": "2026-10-03",
  "image": "/images/gallery/event/cover.jpg",
  "gallerySlug": "event",
  "content": "# Naslov novice\n\nBesedilo novice."
}
```

`imageSource` can replace `image` with a local original photo path; it is copied to `public/images/news/` with a content hash. Standalone covers can also use `media import` with `{"source":"~/Pictures/lisjaki/event/photo.jpg","directory":"news"}`; the command reports the resulting repository URL. Source originals remain untouched.

`date` overrides the generated display label (useful for multi-day events). `imageFit: "contain"` preserves full logos/scorecards. `matchId` links a report to a match for score and scorer consistency warnings. Reusing a slug updates the article with the same ID/body filename. Markdown supports headings, emphasis, lists, blockquotes and simple tables. Raw HTML is rejected. Provide a complete article on updates.

## Gallery import/reorder

`npm run content -- gallery import /tmp/album.json`

```json
{
  "slug": "event",
  "title": "Ime dogodka",
  "date": "2026-10-03",
  "source": "~/Pictures/lisjaki/event",
  "cover": "photo-1.jpg",
  "last": ["photo-3.jpg"],
  "exclude": ["unused.jpg"],
  "articleSlugs": ["event-report"],
  "alts": {"photo-1.jpg": "Opis vidne fotografije"},
  "captions": {"photo-1.jpg": "Kratek pripis"}
}
```

Supported extensions: jpg, jpeg, png, webp, avif, mp4, webm. `order` is an optional complete filename list; otherwise filenames sort deterministically. `last` is an ordered subset moved to the end. A re-import replaces the album selection (old files are retained on disk), reuses identical hashes, and updates linked article covers. The cover must be a selected photo. Duplicate media bytes are warned about; files over 25 MiB are rejected. Changed photo bytes produce new URLs. Source files remain intact.

For existing album metadata:

```json
{"slug":"event","last":["image-id"],"cover":"image-id"}
```

Run `gallery reorder`; selectors are item IDs, exact repository URLs, or unique basenames. `order` must cover every album item. Visual categorization (e.g. sleeping photos last) is done by the agent; the script executes the explicit selection.

## Roster and season

`roster upsert` accepts `{"initials":"JJES","number":50,"aliases":["Jan Jesenko"]}`. New players need a name. Changing an ID is not a rename; preserve existing IDs referenced by matches. Ambiguous aliases are rejected.

`season set` accepts `{"season":"2027/28","source":"https://sport-radovljica.si/tekmovanje/example/","group":"B","teamAliases":{}}`. It retains past seasons/results and changes the default match-page season. Refresh standings for the new season before publishing.

## Batch and publishing

```json
{"actions":[
  {"command":"match upsert","input":{"id":6683,"homeScore":1,"awayScore":0}},
  {"command":"league sync"}
]}
```

`npm run content -- batch /tmp/week.json --dry-run` validates the whole batch. Run without `--dry-run` to write. Apply gallery before article when an article uses newly copied media; apply article before gallery when explicit `articleSlugs` must link an existing article.

Run `check` for audit or `verify` for audit + tests + build + diff check. Warnings are separate from errors and require judgment.

Only when publishing is authorized:

```json
{"message":"Update weekly results and club news","files":["src/data/content/matches.json","src/data/content/standings.json","src/data/content/news.json","src/data/articles/event-report.md","public/images/gallery/event"]}
```

`npm run content -- publish /tmp/publish.json` checks, commits these paths, and pushes the current branch. Inspect unrelated changes first. Existing staged changes block publishing. `deployment check --commit <full-sha>` checks production's no-cache build marker, not Git push status. CI runs the same content tests and build.
