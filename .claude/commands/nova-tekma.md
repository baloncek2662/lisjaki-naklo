# Nova tekma

Add a new match result to `src/data/matches.ts`.

## Steps

1. Read `src/data/matches.ts` to find the current highest `id` and the array order (most recent first).
2. Read `src/data/team.ts` to look up player initials for any names the user provides.
3. Collect from the user (or from their message):
   - Home team, away team, score (home:away)
   - Date (Slovenian format: "1. jun. 2026")
   - Location
   - Goalscorers for Lisjaki (names → resolve to initials)
   - Lineup and substitutions (all players whose appearance should be counted)
4. Insert the new match as the first entry in `playedMatches` with `id = previous_max + 1`.

## Match entry shape

```ts
{
  id: <next>,
  home: "...",
  away: "...",
  homeScore: <n>,
  awayScore: <n>,
  date: "<Slovenian date>",
  location: "...",
  details: {
    home: {
      goalscorers: [{ player: "XX" }, ...],  // Lisjaki scorers only
      lineup: ["XX", ...],
      substitutions: ["XX", ...],
    },
    away: {
      goalscorers: [],
      lineup: [],
      substitutions: [],
    },
  },
}
```

## Rules

- Lisjaki home ground: "Športni park Radovljica"
- Only players in `lineup` + `substitutions` get an appearance counted — make sure every player the user lists is in one of these arrays.
- Scorers must also appear in `lineup` or `substitutions`.
- Leave away `goalscorers`/`lineup`/`substitutions` as empty arrays unless provided.
- Do not add `details` at all if no player data is provided (matches without details are valid).
