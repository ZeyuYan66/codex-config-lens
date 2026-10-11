import * as fs from 'node:fs/promises';
import path from 'node:path';
import {homedir} from 'node:os';
import {parseConfig} from './parse.mjs';
export function resolveCodexHome(env = process.env, homeDir = homedir()) {
  return path.resolve(env.CODEX_HOME || path.join(homeDir,'.codex'));
}
export async function readConfig({id,configPath,allowedRoot}, dependencies = {}) {
  const {realpath = fs.realpath, stat = fs.stat, readFile = fs.readFile} = dependencies;
  const base = {id,path:configPath};
  try {
    const [root, file] = await Promise.all([realpath(allowedRoot),realpath(configPath)]);
    const relative = path.relative(root,file);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return {...base,state:'unavailable',reasonCode:'PATH_OUTSIDE_ROOT'};
    const metadata = await stat(file);
    if (!metadata.isFile()) return {...base,state:'unavailable',reasonCode:'CONFIG_READ_FAILED'};
    if (metadata.size > 524288) return {...base,state:'unavailable',reasonCode:'INPUT_TOO_LARGE'};
    // Read the resolved file; never follow the original link a second time.
    const bytes = await readFile(file);
    if (Buffer.byteLength(bytes) > 524288) return {...base,state:'unavailable',reasonCode:'INPUT_TOO_LARGE'};
    return {...base,...await parseConfig(bytes.toString('utf8'))};
  } catch (error) {
    return {...base,state:error.code === 'ENOENT' ? 'missing' : 'unavailable',reasonCode:error.code === 'ENOENT' ? 'CONFIG_MISSING' : 'CONFIG_READ_FAILED'};
  }
}
export async function loadInputs({codexHome = resolveCodexHome(), projectRoot}, dependencies) {
  codexHome = path.resolve(codexHome); projectRoot = path.resolve(projectRoot);
  const [user,project] = await Promise.all([
    readConfig({id:'user',configPath:path.join(codexHome,'config.toml'),allowedRoot:codexHome},dependencies),
    readConfig({id:'project',configPath:path.join(projectRoot,'.codex','config.toml'),allowedRoot:projectRoot},dependencies)
  ]);
  return {user,project,codexHome,projectRoot};
}
