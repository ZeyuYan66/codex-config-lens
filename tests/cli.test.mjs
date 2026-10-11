import test from 'node:test';import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';import {promisify} from 'node:util';
import {createProject} from './helpers/project.mjs';import {fileURLToPath} from 'node:url';
const run=promisify(execFile);const cli=fileURLToPath(new URL('../bin/codex-config-lens.mjs',import.meta.url));
test('CLI scans synthetic configs and exports selected source without leaking',async t=>{
  const p=await createProject({userToml:'model="sk-fake-secret"',projectToml:'model="demo"'});t.after(p.cleanup);
  const base=['--project',p.root,'--codex-home',p.codexHome];
  const r=await run(process.execPath,[cli,'scan',...base,'--format','json']);
  assert.equal(JSON.parse(r.stdout).schemaVersion,1);assert.ok(!r.stdout.includes('sk-fake-secret'));assert.equal(r.stderr,'');
  const e=await run(process.execPath,[cli,'export',...base,'--format','toml','--source','project','--lang','en']);assert.match(e.stdout,/model = "demo"/);
  await assert.rejects(run(process.execPath,[cli,'scan','--bad','fake-secret']),e=>e.stderr.trim()==='CLI_INVALID_ARGUMENTS');
});
