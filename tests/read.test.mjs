import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile, readFile, stat, unlink, symlink} from 'node:fs/promises';
import path from 'node:path';
import {createProject} from './helpers/project.mjs';
import {resolveCodexHome, readConfig, loadInputs} from '../src/config/read.mjs';
test('CODEX_HOME and Chinese paths; sources remain unchanged', async t => {
  const p = await createProject({userToml:'model="demo"'}); t.after(p.cleanup);
  assert.equal(resolveCodexHome({CODEX_HOME:p.codexHome}, p.root), p.codexHome);
  assert.equal(resolveCodexHome({},p.root), path.join(p.root,'.codex'));
  const file = path.join(p.codexHome,'config.toml'); const before = await stat(file);
  const r = await loadInputs({codexHome:p.codexHome,projectRoot:p.root});
  assert.equal(r.user.data.model,'demo'); assert.equal(r.project.state,'ok');
  assert.equal((await stat(file)).mtimeMs,before.mtimeMs);
  assert.equal(await readFile(file,'utf8'),'model="demo"');
});
test('missing, permission, size and escaping paths are classified safely', async t => {
  const p = await createProject(); t.after(p.cleanup);
  const file = path.join(p.codexHome,'config.toml');
  const opts = {id:'user', configPath:file, allowedRoot:p.codexHome};
  await writeFile(file,Buffer.alloc(524289));
  assert.equal((await readConfig(opts)).reasonCode,'INPUT_TOO_LARGE');
  assert.equal((await readConfig(opts,{realpath:async x => x === p.codexHome ? x : path.join(p.root,'outside')})).reasonCode,'PATH_OUTSIDE_ROOT');
  assert.equal((await readConfig(opts,{realpath:async () => {throw Object.assign(new Error('fake-secret'),{code:'EACCES'});}})).reasonCode,'CONFIG_READ_FAILED');
  await unlink(file); assert.equal((await readConfig(opts)).state,'missing');
});
test('real symbolic link cannot escape root', async t => {
  const p = await createProject(); t.after(p.cleanup);
  const link = path.join(p.codexHome,'link.toml');
  try { await symlink(path.join(p.root,'.codex','config.toml'),link,'file'); }
  catch(e) { if (['EPERM','EACCES'].includes(e.code)) {t.skip('Windows link privilege unavailable');return;} throw e; }
  assert.equal((await readConfig({id:'user',configPath:link,allowedRoot:p.codexHome})).reasonCode,'PATH_OUTSIDE_ROOT');
});
