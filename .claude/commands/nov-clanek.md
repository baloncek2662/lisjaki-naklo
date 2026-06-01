# Nov članek

Write a new news article and register it in `src/data/news.ts`.

## Inputs

Collect from the user's message (ask only for what is missing):

- **Topic** — which match or event the article is about
- **Key points** — anything specific to highlight (goals, milestones, tone, people to mention)
- **Image** — optional override; fall back to the Unsplash football placeholder used by existing articles

## Steps

1. Read `src/data/matches.ts` to find the relevant match (score, date, location, goalscorers, lineup).
2. Read `src/data/team.ts` to resolve player initials to full names.
3. Read one or two existing articles in `src/data/articles/` for tone and structure reference.
4. Read `src/data/news.ts` to find the current highest `id`.
5. Write the article as a new `.md` file in `src/data/articles/`.
6. Register the article in `src/data/news.ts`.

## Article writing guidelines

- Language: **Slovenian**
- Tone: enthusiastic but grounded — club newsletter, not tabloid
- Length: 200–400 words
- Structure: intro paragraph → match narrative (first half / second half or single flow) → closing section
- Use `**bold**` for player names on first mention and for the final score
- Highlight individual milestones (first goal, first header, etc.) when relevant
- Include a fan/supporter thank-you when the article covers a home win or a significant result
- End with a short rallying closer (one sentence, e.g. "Naprej, Lisjaki!")
- Do **not** include frontmatter or a date line — the date lives in `news.ts`

## Slug convention

`<short-description-of-match-or-event>` in kebab-case Slovenian, e.g.:
- `zmaga-proti-baffi-brezje-maj-2026`
- `poraz-pri-utrip-maj-2026`
- `pripravljalna-tekma-naklani`

## news.ts entry shape

```ts
{
  id: <next>,
  slug: "<slug>",
  title: "<Slovenian title, concise>",
  excerpt: "<2–3 sentence summary, Slovenian>",
  date: "<Slovenian date, e.g. '31. maj 2026'>",
  image: "<url or /images/... path>",
  content: article<N>,  // imported at the top of the file
}
```

- Add the new entry **first** in `newsData` (most recent at top).
- Add the corresponding `import articleN from "./articles/<slug>.md?raw";` at the top of the file.
- Use the Unsplash football placeholder when no image is provided:
  `https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop`
