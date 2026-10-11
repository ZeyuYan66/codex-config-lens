import {stat} from 'node:fs/promises';
import path from 'node:path';
async function isFile(file){try{return (await stat(file)).isFile();}catch{return false;}}
export async function resolveDoctorExecutable(executable,{env=process.env,cwd,platform=process.platform,isFile:checkFile=isFile}={}) {
  const paths=platform==='win32'?path.win32:path.posix;
  if(paths.isAbsolute(executable))return await checkFile(executable)?executable:undefined;
  // Bare commands are found in absolute PATH entries, never relative to the selected project.
  if(executable.includes('/') || executable.includes('\\'))return undefined;
  const envPath=Object.entries(env).find(([key])=>key.toLowerCase()==='path')?.[1] || '';
  const directories=envPath.split(platform==='win32'?';':':').filter(Boolean);
  if(platform==='win32' && executable==='codex' && env.LOCALAPPDATA)directories.push(paths.join(env.LOCALAPPDATA,'Programs','OpenAI','Codex','bin'));
  for(const directory of directories) {
    if(!paths.isAbsolute(directory) || platform==='win32' && !/^[a-zA-Z]:[\\/]/.test(directory))continue;
    if(cwd && paths.resolve(directory).toLowerCase()===paths.resolve(cwd).toLowerCase())continue;
    const candidate=paths.join(directory,platform==='win32' && !executable.endsWith('.exe')?`${executable}.exe`:executable);
    if(await checkFile(candidate))return candidate;
  }
  return undefined;
}
