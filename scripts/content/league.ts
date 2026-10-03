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
export function parseLeague(html:string, config:Settings, season:string, asOf:string, names:string[]) {
  const league = config.seasons[season];
  if (!league) throw new Error(`Unconfigured season ${season}`);
  const dom = parse(html) as unknown as Node;
  const groups = byClass(dom,'competition__group-title');
  const group = groups.filter(n=>content(n).trim()===league.group);
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
    return {pos:number(content(rank).replace(/[▲▼]/g,'').trim()),team,played:num('played'),won:num('won'),draw:num('drawn'),lost:num('lost'),goalsFor:num('gf'),goalsAgainst:num('ga'),goalDiff:num('gd'),points:num('points'),...(normalize(team)===normalize(config.club)?{isHighlighted:true}:{})};
  });
  if (rows.filter(r=>r.isHighlighted).length!==1 || (names.length && (rows.length!==names.length || rows.some(r=>!names.some(name=>normalize(name)===normalize(r.team)))))) throw new Error('Unexpected group membership; review season configuration');
  const table = standings.parse({season,group:league.group,source:league.source,asOf,rows});
  validateStandings(table);
  const games = byClass(dom,'match-list__item').filter(n=>has(n,'match-slim'));
  const imported = new Map<number,ReturnType<typeof match.parse>|ReturnType<typeof fixture.parse>>();
  for (const game of games) {
    const home = canonical(value(game,'match-slim__team-home-title'));
    const away = canonical(value(game,'match-slim__team-away-title'));
    if (![home,away].some(n=>normalize(n)===normalize(config.club))) continue;
    const kickoff = attr(game,'data-fl-game-kickoff');
    const base = {id:number(attr(game,'data-anwp-match')),season,kickoff,home,away,date:displayDate(kickoff),location:value(game,'match-slim__stadium') || 'Lokacija ni objavljena'};
    const hs=value(game,'match-slim__scores-home'), as=value(game,'match-slim__scores-away');
    const record = hs==='-' && as==='-' ? fixture.parse({...base,time:displayTime(kickoff)}) : match.parse({...base,homeScore:number(hs),awayScore:number(as)});
    const old = imported.get(record.id);
    if (old && JSON.stringify(old)!==JSON.stringify(record)) throw new Error(`Conflicting source entries for match ${record.id}`);
    imported.set(record.id,record);
  }
  if (!imported.size) throw new Error('No club fixtures parsed; league markup may have changed');
  return {standings:table,matches:[...imported.values()]};
}
