import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir=await mkdtemp(join(tmpdir(),'lisjaki-content-tests-'));
try {
  await build({entryPoints:['scripts/content/cli.ts'],outfile:join(dir,'cli.mjs'),bundle:true,platform:'node',format:'esm'});
  await build({entryPoints:['scripts/content/tests.ts'],outfile:join(dir,'tests.mjs'),bundle:true,platform:'node',format:'esm',define:{'import.meta.env.PROD':'false'}});
  process.exitCode=spawnSync(process.execPath,[join(dir,'tests.mjs'),join(dir,'cli.mjs')],{stdio:'inherit'}).status??1;
}finally{await rm(dir,{recursive:true,force:true});}
