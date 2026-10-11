import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
export async function createProject({userToml = '', projectToml = ''} = {}) {
  const base = await mkdtemp(path.join(tmpdir(), 'lens-'));
  const root = path.join(base, '中文项目');
  const codexHome = path.join(base, 'user');
  await mkdir(path.join(root, '.codex'), {recursive:true});
  await mkdir(codexHome);
  await writeFile(path.join(root, '.codex', 'config.toml'), projectToml);
  await writeFile(path.join(codexHome, 'config.toml'), userToml);
  return {root, codexHome, cleanup: () => rm(base, {recursive:true, force:true})};
}
