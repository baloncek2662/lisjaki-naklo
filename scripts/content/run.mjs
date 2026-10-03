import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'lisjaki-content-'));
try {
  const file = join(dir, 'cli.mjs');
  await build({entryPoints:['scripts/content/cli.ts'],outfile:file,bundle:true,platform:'node',format:'esm'});
  const result = spawnSync(process.execPath,[file,...process.argv.slice(2)],{stdio:'inherit'});
  process.exitCode = result.status ?? 1;
} finally { await rm(dir,{recursive:true,force:true}); }
