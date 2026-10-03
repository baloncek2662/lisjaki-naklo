import { z } from 'zod';

const text = z.string().trim().min(1);
export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => new Date(v).toISOString().slice(0,10) === v, 'Invalid date');
const integer = z.number().int().nonnegative();
const goal = z.object({ player: text, minute: integer.optional() }).strict();
const side = z.object({ goalscorers: z.array(goal), lineup: z.array(text), substitutions: z.array(text).optional() }).strict();
export const fixture = z.object({ id: z.number().int(), season: text, kickoff: z.string().datetime({ offset: true }), home: text, away: text, date: text, time: text, location: text }).strict();
export const match = fixture.omit({time:true}).extend({ homeScore: integer, awayScore: integer, details: z.object({home:side,away:side}).strict().optional() }).strict();
export const matches = z.object({ played: z.array(match), upcoming: z.array(fixture), pending: z.array(fixture), confirmedResults: z.array(z.number().int()) }).strict();
export const player = z.object({ initials: text, name: text, number: integer.optional(), opponent: z.boolean().optional() }).strict();
const row = z.object({ pos: integer, team: text, played: integer, won: integer, draw: integer, lost: integer, goalsFor: integer, goalsAgainst: integer, goalDiff: z.number().int(), points: integer, isHighlighted: z.boolean().optional() }).strict();
export const standings = z.object({ season: text, group: text, source: z.string().url(), asOf: day, rows: z.array(row).min(2) }).strict();
const media = z.object({ id: text, src: text, alt: z.string(), caption: z.string().optional(), type: z.enum(['image','video']).optional() }).strict();
export const event = z.object({ id: text, slug, title: text, date: day, coverImage: text, dateLabel: text.optional(), images: z.array(media).min(1) }).strict();
export const gallery = z.object({ featured: z.array(media), events: z.array(event) }).strict();
export const article = z.object({ id: integer, slug, title: text, excerpt: text, date: text, image: text, imageFit: z.literal('contain').optional(), gallerySlug: slug.optional(), publishedAt: day, body: z.string().regex(/^[a-z0-9-]+\.md$/), matchId: z.number().int().optional() }).strict();
export const settings = z.object({ club: text, activeSeason: text, seasons: z.record(z.object({source:z.string().url(),group:text}).strict()), teamAliases:z.record(text), playerAliases:z.record(text) }).strict();
export type Match = z.infer<typeof match>;
export type Fixture = z.infer<typeof fixture>;
export type Matches = z.infer<typeof matches>;
export type Settings = z.infer<typeof settings>;
export type Player = z.infer<typeof player>;
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('sl').replace(/[^a-z0-9]/g,'');
export const displayDate = (kickoff: string) => new Intl.DateTimeFormat('sl-SI', { day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Ljubljana' }).format(new Date(kickoff));
export const displayTime = (kickoff: string) => new Intl.DateTimeFormat('sl-SI', { hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/Ljubljana' }).format(new Date(kickoff));
export function resolvePlayer(value: string, players: Player[], aliases: Record<string,string>): string {
  const aliased = Object.entries(aliases).find(([key]) => normalize(key) === normalize(value))?.[1] ?? value;
  const candidates = players.filter(p => normalize(p.initials) === normalize(aliased) || normalize(p.name) === normalize(aliased) || normalize(p.name.split(' ').at(-1)!) === normalize(aliased));
  if (candidates.length !== 1) throw new Error(`Unknown or ambiguous player "${value}". Use a full name or player ID.`);
  return candidates[0].initials;
}
export function upsertMatch(data: Matches, incoming: Match, confirmed = true): Matches {
  const next = structuredClone(data);
  const existing = next.played.find(m => m.id === incoming.id);
  next.played = next.played.filter(m => m.id !== incoming.id);
  next.played.push({...existing,...incoming,details:incoming.details ?? existing?.details});
  next.played.sort((a,b) => b.kickoff.localeCompare(a.kickoff)||a.id-b.id);
  next.upcoming = next.upcoming.filter(m => m.id !== incoming.id);
  next.pending = next.pending.filter(m => m.id !== incoming.id);
  if (confirmed && !next.confirmedResults.includes(incoming.id)) next.confirmedResults.push(incoming.id);
  return next;
}
export function mergeLeague(data: Matches, imported: (Match | Fixture)[], season: string, now: number) {
  let next = structuredClone(data);
  const conflicts: string[] = [];
  for (const incoming of imported) {
    if (incoming.season !== season) throw new Error('Imported season mismatch');
    const existing = next.played.find(m => m.id === incoming.id);
    if ('homeScore' in incoming) {
      if (existing && next.confirmedResults.includes(incoming.id)) {
        if (existing.homeScore !== incoming.homeScore || existing.awayScore !== incoming.awayScore || normalize(existing.home) !== normalize(incoming.home) || normalize(existing.away) !== normalize(incoming.away)) conflicts.push(`Match ${incoming.id}: club-confirmed ${existing.homeScore}:${existing.awayScore}; source ${incoming.homeScore}:${incoming.awayScore}. Preserved club record.`);
        continue;
      }
      if (existing && (normalize(existing.home) !== normalize(incoming.home) || normalize(existing.away) !== normalize(incoming.away))) throw new Error(`Match ${incoming.id} teams changed; cannot retain lineup safely`);
      next = upsertMatch(next, incoming, false);
    } else if (!existing) {
      next.upcoming = next.upcoming.filter(m => m.id !== incoming.id);
      next.pending = next.pending.filter(m => m.id !== incoming.id);
      (Date.parse(incoming.kickoff) <= now ? next.pending : next.upcoming).push(incoming);
    }
  }
  next.upcoming.sort((a,b) => a.kickoff.localeCompare(b.kickoff)||a.id-b.id);
  next.pending.sort((a,b) => b.kickoff.localeCompare(a.kickoff)||a.id-b.id);
  return {data:next,conflicts};
}
export function validateStandings(value: z.infer<typeof standings>) {
  const rows = value.rows;
  if (new Set(rows.map(r=>normalize(r.team))).size !== rows.length) throw new Error('Duplicate standings teams');
  rows.forEach((r,i) => {
    if (r.pos !== i+1 || r.played !== r.won+r.draw+r.lost || r.goalDiff !== r.goalsFor-r.goalsAgainst || r.points !== 3*r.won+r.draw) throw new Error(`Invalid standings arithmetic: ${r.team}`);
  });
  if (rows.reduce((n,r)=>n+r.goalsFor-r.goalsAgainst,0) !== 0 || rows.reduce((n,r)=>n+r.won-r.lost,0) !== 0 || rows.reduce((n,r)=>n+r.draw,0)%2) throw new Error('Unbalanced standings totals');
}
