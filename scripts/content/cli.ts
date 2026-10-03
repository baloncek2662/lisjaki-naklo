import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { z } from 'zod';
import { article, displayDate, event, match, mergeLeague, normalize, player, resolvePlayer, settings, slug, upsertMatch } from './model';
import { parseLeague } from './league';
import { audit, commit, load, publicPath, safePath, type Store } from './store';

const help = `Lisjaki content harness (run from repository root)
  content match upsert input.json [--dry-run]
  content standings sync [--html snapshot.html] [--as-of YYYY-MM-DD] [--dry-run]
  content fixtures sync [--html snapshot.html] [--dry-run]
  content league sync [--html snapshot.html] [--dry-run]
  content article add input.json [--dry-run]
  content media import input.json [--dry-run]
  content gallery import input.json [--dry-run]
  content gallery reorder input.json [--dry-run]
  content roster upsert input.json [--dry-run]
  content season set input.json [--dry-run]
  content batch input.json [--dry-run]
  content check | verify | publish input.json [--dry-run]
  content deployment check [--commit SHA]
JSON examples and source rules: .agents/skills/lisjaki-content/references/inputs.md
`;
const args=process.argv.slice(2);
function flag(name:string) { const i=args.indexOf(name);if(i<0)return undefined;const value=args[i+1];if(!value || value.startsWith('--'))throw new Error(`Missing value for ${name}`);args.splice(i,2);return value; }
const root=fs.realpathSync(path.resolve(flag('--root')??process.cwd()));
const htmlFile=flag('--html'), asOf=flag('--as-of'), sha=flag('--commit');
const dryRun=args.includes('--dry-run');if(dryRun)args.splice(args.indexOf('--dry-run'),1);
const unknown=args.find(a=>a.startsWith('--'));if(unknown)throw new Error(`Unknown option ${unknown}`);
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Ljubljana',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const read=(file:string)=>JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
const files=new Map<string,Buffer|string>();
function stageImage(source:string,directory:string) {
  const file=path.resolve(source.startsWith('~/')?path.join(os.homedir(),source.slice(2)):source);
  if(!/\.(jpe?g|png|webp|avif)$/i.test(file) || !fs.lstatSync(file).isFile())throw new Error('Expected a regular supported image file');
  const bytes=fs.readFileSync(file);
  if(bytes.length>25*1024*1024)throw new Error('Image exceeds Pages 25 MiB asset limit');
  const hash=createHash('sha256').update(bytes).digest('hex').slice(0,16);
  const stem=path.parse(file).name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80);
  const url=`/images/${directory}/${stem}-${hash}${path.extname(file).toLowerCase()}`;
  files.set(publicPath(root,url),bytes);return url;
}
let data:Store;
const notices:string[]=[];
function resolveDetails(details:unknown) {
  const d=z.object({home:z.unknown(),away:z.unknown()}).strict().parse(details);
  const side=(v:unknown)=>{
    const s=z.object({lineup:z.string().array(),goalscorers:z.array(z.object({player:z.string(),minute:z.number().optional()}).strict()),substitutions:z.string().array().optional()}).strict().parse(v);
    const resolve=(id:string)=>resolvePlayer(id,data.players,data.settings.playerAliases);
    return {...s,lineup:s.lineup.map(resolve),goalscorers:s.goalscorers.map(g=>({...g,player:resolve(g.player)})),...(s.substitutions?{substitutions:s.substitutions.map(resolve)}:{})};
  };
  return {home:side(d.home),away:side(d.away)};
}
async function leagueHTML(file?:string) {
  if(file)return fs.readFileSync(path.resolve(file),'utf8');
  const url=data.settings.seasons[data.settings.activeSeason].source;
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`League returned HTTP ${response.status}; no files changed`);
  const text=await response.text();if(text.length>5_000_000)throw new Error('League response too large');return text;
}
async function apply(command:string,input:unknown) {
  if(command==='match upsert') {
    const raw=z.object({id:z.number().int(),season:z.string().optional(),kickoff:z.string().optional(),home:z.string().optional(),away:z.string().optional(),location:z.string().optional(),homeScore:z.number().int().nonnegative().optional(),awayScore:z.number().int().nonnegative().optional(),details:z.unknown().optional(),absent:z.string().array().optional()}).strict().parse(input);
    const existing=[...data.matches.played,...data.matches.upcoming,...data.matches.pending].find(m=>m.id===raw.id);
    const {absent,details,...patch}=raw;
    const base={...existing,...patch,season:raw.season??existing?.season??data.settings.activeSeason};
    const {time: _time,...played}=base as typeof base & {time?:string};
    const incoming=match.parse({...played,date:base.kickoff?displayDate(base.kickoff):undefined,...(details?{details:resolveDetails(details)}:{})});
    if(absent?.length && incoming.details) {
      const ids=absent.map(p=>resolvePlayer(p,data.players,data.settings.playerAliases));
      for(const side of ['home','away'] as const) {
        if(normalize(incoming[side])!==normalize(data.settings.club))continue;
        incoming.details[side].lineup=incoming.details[side].lineup.filter(p=>!ids.includes(p));
        if(incoming.details[side].substitutions)incoming.details[side].substitutions=incoming.details[side].substitutions!.filter(p=>!ids.includes(p));
        if(incoming.details[side].goalscorers.some(g=>ids.includes(g.player)))throw new Error('An absent player is listed as a scorer');
      }
    }
    data.matches=upsertMatch(data.matches,incoming);
  } else if(['standings sync','fixtures sync','league sync'].includes(command)) {
    const options=z.object({html:z.string().optional(),asOf:z.string().optional(),season:z.string().optional()}).strict().parse(input??{});
    const season=options.season??data.settings.activeSeason;
    if(season!==data.settings.activeSeason)throw new Error('Activate the season before syncing');
    const names=data.standings.season===season?data.standings.rows.map(r=>r.team):[];
    const imported=parseLeague(await leagueHTML(options.html??htmlFile),data.settings,season,options.asOf??asOf??today(),names);
    if(command!=='fixtures sync') {
      if(imported.standings.asOf<data.standings.asOf)throw new Error('Refusing an older standings date');
      data.standings=imported.standings;
    }
    if(command!=='standings sync') {const merged=mergeLeague(data.matches,imported.matches,season,Date.now());data.matches=merged.data;notices.push(...merged.conflicts);}
  } else if(command==='roster upsert') {
    const raw=z.object({initials:z.string(),name:z.string().optional(),number:z.number().int().nonnegative().optional(),opponent:z.boolean().optional(),aliases:z.string().array().optional()}).strict().parse(input);
    const {aliases,...patch}=raw;
    const entry=player.parse({...data.players.find(p=>p.initials===raw.initials),...patch});
    data.players=data.players.filter(p=>p.initials!==entry.initials);data.players.push(entry);
    for(const alias of aliases??[]) {
      if(data.players.some(p=>p.initials!==entry.initials && [p.name,p.initials].some(v=>normalize(v)===normalize(alias))))throw new Error(`Alias ${alias} conflicts with another player`);
      const old=Object.entries(data.settings.playerAliases).find(([key])=>normalize(key)===normalize(alias));
      if(old && old[1]!==entry.initials)throw new Error(`Alias ${alias} already assigned`);
      data.settings.playerAliases[alias]=entry.initials;
    }
  } else if(command==='season set') {
    const raw=z.object({season:z.string(),source:z.string().url(),group:z.string(),teamAliases:z.record(z.string()).optional()}).strict().parse(input);
    data.settings=settings.parse({...data.settings,activeSeason:raw.season,seasons:{...data.settings.seasons,[raw.season]:{source:raw.source,group:raw.group}},teamAliases:{...data.settings.teamAliases,...raw.teamAliases}});
    notices.push('Season activated; refresh league standings in this batch or the next update.');
  } else if(command==='media import') {
    const raw=z.object({source:z.string(),directory:z.literal('news').default('news')}).strict().parse(input);
    const url=stageImage(raw.source,raw.directory);notices.push(`Imported image: ${url}`);
  } else if(command==='article add') {
    const raw=z.object({slug,title:z.string(),excerpt:z.string(),publishedAt:z.string(),date:z.string().optional(),image:z.string().optional(),imageSource:z.string().optional(),imageFit:z.literal('contain').optional(),gallerySlug:slug.optional(),matchId:z.number().int().optional(),content:z.string().min(1)}).strict().parse(input);
    const {content,imageSource,...meta}=raw;
    if(Boolean(raw.image)===Boolean(imageSource))throw new Error('Supply exactly one image or imageSource');
    const image=imageSource?stageImage(imageSource,'news'):raw.image;
    const existing=data.news.find(n=>n.slug===raw.slug);
    const related=data.gallery.events.find(g=>g.slug===(raw.gallerySlug??raw.slug));
    const record=article.parse({...meta,image,id:existing?.id??Math.max(0,...data.news.map(n=>n.id))+1,body:existing?.body??raw.slug+'.md',date:raw.date??displayDate(raw.publishedAt+'T12:00:00+00:00'),...(related?{gallerySlug:related.slug}:{})});
    if(/^https?:/.test(record.image))throw new Error('New articles require supplied repository media');
    data.news=data.news.filter(n=>n.slug!==record.slug);data.news.push(record);data.news.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.slug.localeCompare(b.slug));
    files.set(safePath(path.join(root,'src/data/articles'),record.body),content.trim()+'\n');
  } else if(command==='gallery import') {
    const raw=z.object({slug,title:z.string(),date:z.string(),dateLabel:z.string().optional(),source:z.string(),cover:z.string(),order:z.string().array().optional(),last:z.string().array().optional(),exclude:z.string().array().optional(),articleSlugs:slug.array().optional(),captions:z.record(z.string()).optional(),alts:z.record(z.string()).optional()}).strict().parse(input);
    const source=path.resolve(raw.source.startsWith('~/')?path.join(os.homedir(),raw.source.slice(2)):raw.source);
    const names=fs.readdirSync(source).filter(n=>/\.(jpe?g|png|webp|avif|mp4|webm)$/i.test(n) && !raw.exclude?.includes(n)).sort((a,b)=>a.localeCompare(b,'en'));
    for(const n of [...(raw.order??[]),...(raw.last??[]),raw.cover,...(raw.exclude??[])]) if(path.basename(n)!==n || !fs.existsSync(path.join(source,n)))throw new Error(`Unknown source filename ${n}`);
    if(!names.includes(raw.cover) || /\.(mp4|webm)$/i.test(raw.cover))throw new Error('Cover must be an included photo');
    if(raw.order && (new Set(raw.order).size!==names.length || names.some(n=>!raw.order!.includes(n))))throw new Error('order must include every selected filename exactly once');
    if(raw.last && new Set(raw.last).size!==raw.last.length)throw new Error('Duplicate last filenames');
    let ordered=raw.order??names;
    if(raw.last){if(raw.last.some(n=>!names.includes(n)))throw new Error('last contains excluded files');ordered=[...ordered.filter(n=>!raw.last!.includes(n)),...raw.last];}
    const existing=data.gallery.events.find(g=>g.slug===raw.slug);
    const images=ordered.map((name,i)=>{
      const file=path.join(source,name);if(!fs.lstatSync(file).isFile())throw new Error(`Expected regular source file ${name}`);
      const bytes=fs.readFileSync(file);const hash=createHash('sha256').update(bytes).digest('hex').slice(0,16);
      const stem=path.parse(name).name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,80);
      const src=`/images/gallery/${raw.slug}/${stem}-${hash}${path.extname(name).toLowerCase()}`;
      files.set(publicPath(root,src),bytes);
      const old=existing?.images.find(m=>m.src===src);
      return {id:old?.id??`${raw.slug}-${createHash('sha256').update(name).digest('hex').slice(0,8)}-${hash}`,src,alt:raw.alts?.[name]??old?.alt??`${raw.title} – fotografija ${i+1}`,...(raw.captions?.[name]!==undefined?{caption:raw.captions[name]}:old?.caption?{caption:old.caption}:{}),...(/\.(mp4|webm)$/i.test(name)?{type:'video' as const}:{})};
    });
    const record=event.parse({id:existing?.id??'event-'+raw.slug,slug:raw.slug,title:raw.title,date:raw.date,dateLabel:raw.dateLabel,coverImage:images[ordered.indexOf(raw.cover)].src,images});
    data.gallery.events=data.gallery.events.filter(g=>g.slug!==raw.slug);data.gallery.events.push(record);data.gallery.events.sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
    for(const articleSlug of raw.articleSlugs??[]) if(!data.news.some(n=>n.slug===articleSlug))throw new Error(`Unknown article ${articleSlug}`);
    for(const n of data.news) if(n.gallerySlug===raw.slug || n.slug===raw.slug || raw.articleSlugs?.includes(n.slug)) {n.gallerySlug=raw.slug;n.image=record.coverImage;delete n.imageFit;}
  } else if(command==='gallery reorder') {
    const raw=z.object({slug,order:z.string().array().optional(),last:z.string().array().optional(),cover:z.string().optional()}).strict().parse(input);
    const album=data.gallery.events.find(g=>g.slug===raw.slug);if(!album)throw new Error('Album not found');
    const resolve=(v:string)=>{const entries=album.images.filter(i=>i.id===v||i.src===v||path.basename(i.src)===v);if(entries.length!==1)throw new Error(`Unknown/ambiguous album image ${v}`);return entries[0];};
    if(raw.order){const ordered=raw.order.map(resolve);if(new Set(ordered).size!==album.images.length)throw new Error('order must include each album item exactly once');album.images=ordered;}
    if(raw.last){const last=raw.last.map(resolve);if(new Set(last).size!==last.length)throw new Error('Duplicate last items');album.images=[...album.images.filter(i=>!last.includes(i)),...last];}
    if(raw.cover){const cover=resolve(raw.cover);if(cover.type==='video')throw new Error('Video cannot be cover');album.coverImage=cover.src;for(const n of data.news)if(n.gallerySlug===album.slug)n.image=cover.src;}
  } else throw new Error(`Unknown action: ${command}`);
}
function run(cmd:string,args:string[]) {const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit'});if(r.status!==0)throw new Error(`${cmd} failed`);}
async function main() {
  if(!args.length || args[0]==='help'){console.log(help);return;}
  if(!fs.existsSync(path.join(root,'wrangler.jsonc')))throw new Error('Run from Lisjaki repository root or pass --root');
  if(args[0]==='deployment' && args[1]==='check') {
    const revision=sha??spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim();
    if(!/^[a-f0-9]{40}$/.test(revision))throw new Error('Expected full commit SHA');
    const r=await fetch('https://lisjaki-naklo.si/deployment.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw new Error(`Deployment marker unavailable (HTTP ${r.status}). Push is not proof of deployment.`);
    const deployed=await r.json() as {commit?:string};
    if(deployed.commit!==revision)throw new Error(`Expected ${revision}; production reports ${deployed.commit??'unknown'}`);
    console.log(`Production deployment confirmed: ${revision}`);return;
  }
  data=load(root);
  if(args[0]==='publish') {
    const request=z.object({message:z.string().min(1),files:z.string().array().min(1)}).strict().parse(read(args[1]));
    for(const file of request.files) {
      if(path.posix.normalize(file)!==file || file.includes('\\'))throw new Error(`Publish requires normalized repository paths: ${file}`);
      if(!/^(src\/data\/(content|articles)\/|public\/images\/(gallery|news)\/)/.test(file))throw new Error(`Publish accepts explicit content paths only: ${file}`);
      safePath(root,file);
    }
    const git=(params:string[])=>{const r=spawnSync('git',params,{cwd:root,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr);return r.stdout.trim();};
    if(git(['diff','--cached','--name-only']))throw new Error('Existing staged changes: finish or unstage them before content publishing');
    if(data.standings.season!==data.settings.activeSeason)throw new Error('Refresh standings for the active season before publishing');
    const report=audit(root,data);if(report.errors.length)throw new Error(report.errors.join('\n'));
    if(dryRun){console.log(JSON.stringify({dryRun:true,branch:git(['branch','--show-current']),files:request.files,message:request.message},null,2));return;}
    run('npm',['run','test:content']);run('npm',['run','build']);run('git',['diff','--check']);
    run('git',['add','--',...request.files]);run('git',['commit','-m',request.message]);run('git',['push','origin','HEAD']);
    console.log('Pushed. Deployment is pending; use deployment check after Cloudflare finishes.');return;
  }
  if(args[0]==='check'||args[0]==='verify') {
    const report=audit(root,data);console.log(JSON.stringify(report,null,2));if(report.errors.length)throw new Error('Content validation failed');
    if(args[0]==='verify') {run('npm',['run','test:content']);run('npm',['run','build']);run('git',['diff','--check']);}
    return;
  }
  if(args[0]==='batch') {
    const batch=z.object({actions:z.array(z.object({command:z.string(),input:z.unknown().optional()}).strict()).min(1)}).strict().parse(read(args[1]));
    for(const action of batch.actions)await apply(action.command,action.input);
  } else {
    const command=args.slice(0,2).join(' ');
    await apply(command,args[2]?read(args[2]):{});
  }
  const result=commit(root,data,files,dryRun);
  console.log(JSON.stringify({...result,notices},null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
