import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { article, gallery, matches, normalize, player, settings, standings, validateStandings } from './model';

export function load(root:string) {
  const read=(file:string)=>JSON.parse(fs.readFileSync(path.join(root,'src/data/content',file+'.json'),'utf8'));
  return {matches:matches.parse(read('matches')),standings:standings.parse(read('standings')),players:player.array().parse(read('players')),settings:settings.parse(read('settings')),gallery:gallery.parse(read('gallery')),news:article.array().parse(read('news'))};
}
export type Store = ReturnType<typeof load>;
export const safePath = (base:string,relative:string) => {
  const resolved=path.resolve(base,relative);
  if (resolved!==path.resolve(base) && !resolved.startsWith(path.resolve(base)+path.sep)) throw new Error(`Path escapes ${base}: ${relative}`);
  return resolved;
};
export function publicPath(root:string,url:string) {
  if (!url.startsWith('/images/') || /[?#\\]/.test(url)) throw new Error(`Expected a repository image path: ${url}`);
  const file=safePath(path.join(root,'public'),decodeURIComponent(url.slice(1)));
  // Existing symlinks must not make writes escape public assets.
  let ancestor=file;
  while(!fs.existsSync(ancestor)) ancestor=path.dirname(ancestor);
  if(fs.realpathSync(ancestor)!==ancestor) throw new Error(`Symlink media is unsupported: ${url}`);
  return file;
}
export function audit(root:string,data:Store,files:Map<string,Buffer|string>=new Map()) {
  const errors:string[]=[],warnings:string[]=[];
  const unique=(values:(string|number)[],label:string)=>{if(new Set(values).size!==values.length) errors.push(`Duplicate ${label}`);};
  unique(data.players.map(p=>normalize(p.initials)),'player IDs');
  unique([...data.matches.played,...data.matches.upcoming,...data.matches.pending].map(m=>m.id),'match IDs');
  unique(data.news.map(n=>n.slug),'article slugs');unique(data.news.map(n=>n.id),'article IDs');
  unique(data.gallery.events.map(g=>g.slug),'album slugs');unique(data.gallery.events.map(g=>g.id),'album IDs');
  unique(Object.keys(data.settings.playerAliases).map(normalize),'normalized player aliases');
  for(const [alias,id] of Object.entries(data.settings.playerAliases)) if(!data.players.some(p=>p.initials===id)) errors.push(`Unknown alias target ${alias}: ${id}`);
  if(!data.settings.seasons[data.settings.activeSeason]) errors.push('Active season is unconfigured');
  try{validateStandings(data.standings);}catch(e){errors.push((e as Error).message);}
  const league=data.settings.seasons[data.standings.season];
  if(!league || league.group!==data.standings.group || league.source!==data.standings.source) errors.push('Standings source/group does not match season configuration');
  if(data.standings.rows.filter(r=>r.isHighlighted).length!==1 || !data.standings.rows.some(r=>r.isHighlighted && normalize(r.team)===normalize(data.settings.club))) errors.push('Standings must highlight the club once');
  for(const m of [...data.matches.played,...data.matches.upcoming,...data.matches.pending]) {
    if(!data.settings.seasons[m.season] && !m.season.toLowerCase().includes('prijatelj')) warnings.push(`Match ${m.id}: season ${m.season} has no league source`);
    if(normalize(m.home)!==normalize(data.settings.club) && normalize(m.away)!==normalize(data.settings.club)) errors.push(`Match ${m.id}: club absent`);
    if('details' in m && m.details) for(const side of ['home','away'] as const) {
      const d=m.details[side];unique([...d.lineup,...(d.substitutions??[])],`appearance players in ${m.id}/${side}`);
      if(normalize(m[side])===normalize(data.settings.club) && [...d.lineup,...d.goalscorers.map(g=>g.player),...(d.substitutions??[])].some(id=>data.players.find(p=>p.initials===id)?.opponent)) errors.push(`Match ${m.id}: opponent player assigned to club`);
      for(const id of [...d.lineup,...d.goalscorers.map(g=>g.player),...(d.substitutions??[])]) if(!data.players.some(p=>p.initials===id)) errors.push(`Match ${m.id}: unknown player ${id}`);
      if(d.goalscorers.length>m[side+'Score' as 'homeScore'|'awayScore']) errors.push(`Match ${m.id}: more scorers than goals`);
      if(normalize(m[side])===normalize(data.settings.club) && d.goalscorers.length!==m[side+'Score' as 'homeScore'|'awayScore']) warnings.push(`Match ${m.id}: incomplete club scorer list`);
      if(d.lineup.length) for(const g of d.goalscorers) if(!d.lineup.includes(g.player)) warnings.push(`Match ${m.id}: scorer ${g.player} absent from lineup`);
    }
  }
  for(const id of data.matches.confirmedResults) if(!data.matches.played.some(m=>m.id===id)) errors.push(`Confirmed result ${id} does not exist`);
  const refs=new Set<string>();
  const media=(url:string)=>{
    if(/^https:\/\//.test(url)){warnings.push(`External media: ${url}`);return;}
    refs.add(url);
    try{const file=publicPath(root,url);if(!files.has(file) && !fs.existsSync(file)) errors.push(`Missing media: ${url}`);else if((files.get(file)?.length ?? fs.statSync(file).size)>25*1024*1024) errors.push(`Media exceeds Pages 25 MiB limit: ${url}`);}catch(e){errors.push((e as Error).message);}
  };
  for(const g of data.gallery.events) {
    unique(g.images.map(i=>i.id),`media IDs in ${g.slug}`);unique(g.images.map(i=>i.src),`media paths in ${g.slug}`);
    media(g.coverImage);g.images.forEach(i=>media(i.src));
    if(!g.images.some(i=>i.src===g.coverImage && i.type!=='video')) errors.push(`Album ${g.slug}: cover is not an album photo`);
  }
  data.gallery.featured.forEach(i=>media(i.src));
  for(const n of data.news) {
    media(n.image);
    if(n.gallerySlug && !data.gallery.events.some(g=>g.slug===n.gallerySlug)) errors.push(`Article ${n.slug}: missing album ${n.gallerySlug}`);
    const file=safePath(path.join(root,'src/data/articles'),n.body);
    const body=files.get(file)?.toString() ?? (fs.existsSync(file)?fs.readFileSync(file,'utf8'):null);
    if(body===null) errors.push(`Article ${n.slug}: missing Markdown`);
    // Renderer supports a deliberately small Markdown subset; HTML is not needed.
    else if(/<\s*\/?[a-z][^>]*>/i.test(body)) errors.push(`Article ${n.slug}: raw HTML is unsupported`);
    if(n.matchId!==undefined) {
      const m=data.matches.played.find(m=>m.id===n.matchId);
      if(!m) errors.push(`Article ${n.slug}: missing match ${n.matchId}`);
      else {
        const side=normalize(m.home)===normalize(data.settings.club)?m.details?.home:m.details?.away;
        const prose=normalize(n.title+' '+n.excerpt+' '+body);
        for(const id of new Set(side?.goalscorers.map(g=>g.player)??[])) {
          const scorer=data.players.find(p=>p.initials===id);
          if(scorer && !prose.includes(normalize(scorer.name))) warnings.push(`Article ${n.slug}: expected scorer ${scorer.name} is not named`);
        }
        const scores=[...((n.title+' '+n.excerpt+' '+body).matchAll(/\b(\d+)\s*[:–-]\s*(\d+)\b/g))];for(const s of scores) if(!((Number(s[1])===m.homeScore && Number(s[2])===m.awayScore)||(Number(s[2])===m.homeScore && Number(s[1])===m.awayScore))) warnings.push(`Article ${n.slug}: score ${s[0]} differs from match ${m.id}`);}
    }
  }
  const hashes=new Map<string,string>();
  for(const url of refs) try{
    const file=publicPath(root,url);if(!files.has(file) && !fs.existsSync(file)) continue;
    const bytes=files.get(file)??fs.readFileSync(file);
    const hash=createHash('sha256').update(bytes).digest('hex');
    if(hashes.has(hash) && hashes.get(hash)!==url) warnings.push(`Duplicate media bytes: ${hashes.get(hash)} and ${url}`);else hashes.set(hash,url);
    if(bytes.length>2*1024*1024 && !/\.(mp4|webm)$/i.test(url)) warnings.push(`Large original (responsive delivery advised): ${url}`);
  }catch{/* Already reported above. */}
  return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
// Stage everything, validate the entire batch, then write. Roll back on IO failure.
export function commit(root:string,data:Store,files:Map<string,Buffer|string>,dryRun:boolean) {
  const report=audit(root,data,files);
  if(report.errors.length) throw new Error(report.errors.join('\n'));
  for(const [name,value] of Object.entries(data)) files.set(path.join(root,'src/data/content',name+'.json'),JSON.stringify(value,null,2)+'\n');
  const changed=[...files].filter(([file,value])=>!fs.existsSync(file)||!fs.readFileSync(file).equals(Buffer.from(value)));
  if(!dryRun) {
    const backup=new Map(changed.map(([file])=>[file,fs.existsSync(file)?fs.readFileSync(file):null]));
    try {for(const [file,value] of changed){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.content-tmp';fs.writeFileSync(temp,value);fs.renameSync(temp,file);}}
    catch(error){for(const [file,value] of backup){if(value===null)fs.rmSync(file,{force:true});else fs.writeFileSync(file,value);fs.rmSync(file+'.content-tmp',{force:true});}throw error;}
  }
  return {changed:changed.map(([file])=>path.relative(root,file)),warnings:report.warnings,dryRun};
}
