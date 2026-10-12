import { parse } from 'parse5';
import { displayDate, displayTime, fixture, match, normalize, standings, validateStandings, type Settings } from './model';

// Read actual DOM classes rather than treating league HTML as executable code.
interface Node { nodeName:string; value?:string; attrs?:{name:string;value:string}[]; childNodes?:Node[] }
const attr = (node:Node, name:string) => node.attrs?.find(a=>a.name===name)?.value ?? '';
const has = (node:Node, cls:string) => attr(node,'class').split(/\s+/).includes(cls);
const content = (node:Node):string => node.nodeName==='noscript' ? '' : node.value ?? (node.childNodes ?? []).map(content).join(' ');
function all(node:Node, predicate:(node:Node)=>boolean): Node[] { return [...(predicate(node)?[node]:[]),...(node.childNodes??[]).flatMap(n=>all(n,predicate))]; }
const byClass = (node:Node,cls:string) => all(node,n=>has(n,cls));
const value = (node:Node,cls:string) => content(byClass(node,cls)[0] ?? {nodeName:'missing'}).replace(/\s+/g,' ').trim();
function number(value:string) { if (!/^-?\d+$/.test(value.trim())) throw new Error(`Expected a league number, received "${value}"`);return Number(value); }
export function parseLeague(html:string, config:Settings, season:string, asOf:string, names:string[], confirmedMatches:ReturnType<typeof match.parse>[] = []) {
  const league = config.seasons[season];
  if (!league) throw new Error(`Unconfigured season ${season}`);
  const dom = parse(html) as unknown as Node;
  const groups = byClass(dom,'competition__group-title');
  const group = groups.filter(n=>[league.group,`Skupina ${league.group}`].includes(content(n).trim()));
  if (group.length !== 1) throw new Error(`Expected exactly one standings group ${league.group}`);
  // A group heading and its standing wrapper are siblings in the AnWP markup.
  const parent = all(dom,n=>(n.childNodes??[]).includes(group[0]))[0];
  const siblings = parent?.childNodes ?? [];
  const index = siblings.indexOf(group[0]);
  const wrapper = siblings.slice(index+1).find(n=>has(n,'standing'));
  if (!wrapper) throw new Error('League standings markup changed');
  const canonical = (v:string) => {
    const alias = Object.entries(config.teamAliases).find(([key])=>normalize(key)===normalize(v))?.[1];
    return alias ?? names.find(name=>normalize(name)===normalize(v)) ?? v;
  };
  const cells = all(wrapper,n=>has(n,'anwp-grid-table__td'));
  const ranks = cells.filter(n=>has(n,'standing-table__rank'));
  const rows = ranks.map(rank=>{
    const club = attr(rank,'class').split(/\s+/).find(c=>/^club-\d+$/.test(c));
    if (!club) throw new Error('Missing club ID');
    const own = cells.filter(n=>has(n,club));
    const get = (cls:string) => own.find(n=>has(n,`standing-table__${cls}`));
    const num = (cls:string) => number(content(get(cls) ?? {nodeName:'missing'}).trim());
    const link = all(get('club')!,n=>has(n,'club__link'))[0];
    if (!link) throw new Error('Missing club name');
    const team = canonical(content(link).trim());
    const form = byClass(get('club')!, 'club-form__item-pro').filter(item=>attr(item,'data-match-id')).flatMap(item => {
      const label = content(item).trim().toLowerCase();
      if (label === '>') return []; // Upcoming fixture, not a form result.
      const outcome = label === 'z' ? 'win' : label === 'n' ? 'draw' : label === 'p' ? 'loss' : undefined;
      if (!outcome) throw new Error(`Unknown form result: ${label}`);
      return [{matchId:number(attr(item,'data-match-id')),outcome}];
    });
    return {pos:number(content(rank).replace(/[▲▼]/g,'').trim()),team,played:num('played'),won:num('won'),draw:num('drawn'),lost:num('lost'),goalsFor:num('gf'),goalsAgainst:num('ga'),goalDiff:num('gd'),points:num('points'),...(form.length ? {form} : {}),...(normalize(team)===normalize(config.club)?{isHighlighted:true}:{})};
  });
  if (rows.filter(r=>r.isHighlighted).length!==1 || (names.length && (rows.length!==names.length || rows.some(r=>!names.some(name=>normalize(name)===normalize(r.team)))))) throw new Error('Unexpected group membership; review season configuration');
  const table = standings.parse({season,group:league.group,source:league.source,asOf,rows});
  validateStandings(table);
  const games = byClass(dom,'match-list__item').filter(n=>has(n,'match-slim'));
  const groupKickoffs = new Map<number,string>();
  const groupResults = new Map<number,ReturnType<typeof match.parse>>();
  const imported = new Map<number,ReturnType<typeof match.parse>|ReturnType<typeof fixture.parse>>();
  for (const game of games) {
    const home = canonical(value(game,'match-slim__team-home-title'));
    const away = canonical(value(game,'match-slim__team-away-title'));
    const kickoff = attr(game,'data-fl-game-kickoff');
    const base = {id:number(attr(game,'data-anwp-match')),season,kickoff,home,away,date:displayDate(kickoff),location:value(game,'match-slim__stadium') || 'Lokacija ni objavljena'};
    const hs=value(game,'match-slim__scores-home'), as=value(game,'match-slim__scores-away');
    const record = hs==='-' && as==='-' ? fixture.parse({...base,time:displayTime(kickoff)}) : match.parse({...base,homeScore:number(hs),awayScore:number(as)});
    groupKickoffs.set(record.id,record.kickoff);
    if ('homeScore' in record && [home,away].every(team=>rows.some(row=>normalize(row.team)===normalize(team)))) {
      const oldGroup = groupResults.get(record.id);
      if (oldGroup && JSON.stringify(oldGroup)!==JSON.stringify(record)) throw new Error(`Conflicting group result ${record.id}`);
      groupResults.set(record.id,record);
    }
    if (![home,away].some(n=>normalize(n)===normalize(config.club))) continue;
    const old = imported.get(record.id);
    if (old && JSON.stringify(old)!==JSON.stringify(record)) throw new Error(`Conflicting source entries for match ${record.id}`);
    imported.set(record.id,record);
  }
  if (!imported.size) throw new Error('No club fixtures parsed; league markup may have changed');
  for (const record of confirmedMatches) {
    if (record.season!==season || ![record.home,record.away].some(team=>normalize(team)===normalize(config.club))) continue;
    groupResults.set(record.id,record);
    groupKickoffs.set(record.id,record.kickoff);
  }
  for (const row of table.rows) {
    const games = [...groupResults.values()].filter(game=>[game.home,game.away].some(team=>normalize(team)===normalize(row.team)))
      .sort((a,b)=>b.kickoff.localeCompare(a.kickoff)||b.id-a.id).slice(0,5).reverse();
    const outcomeFor = (game:ReturnType<typeof match.parse>) => {
      const difference=normalize(game.home)===normalize(row.team)?game.homeScore-game.awayScore:game.awayScore-game.homeScore;
      return {matchId:game.id,outcome:(difference>0?'win':difference<0?'loss':'draw') as 'win'|'loss'|'draw'};
    };
    if (games.length && (!row.form || row.form.every(entry=>groupResults.has(entry.matchId)))) row.form=games.map(outcomeFor);
    else if (row.form?.length && row.form.every(entry=>groupKickoffs.has(entry.matchId))) {
      // Table form can include an awarded result absent from the fixture scores.
      // Keep it, then append later played fixtures rather than dropping it.
      const latest=row.form.map(entry=>groupKickoffs.get(entry.matchId)!).sort().at(-1)!;
      const newer=games.filter(game=>game.kickoff>latest);
      row.form=[...row.form,...newer.map(outcomeFor)].slice(-5);
    }
  }
  return {standings:table,matches:[...imported.values()]};
}
