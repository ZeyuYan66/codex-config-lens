import path from 'node:path';
export function normalizeProjectPath(value,platform = process.platform) {
  const implementation = platform === 'win32' ? path.win32 : path.posix;
  const normalized = implementation.resolve(value).replace(/[\\/]+$/,'');
  return platform === 'win32' ? normalized.toLowerCase() : normalized;
}
export function getProjectTrust(userInput,projectRoot,platform = process.platform) {
  if (userInput.state !== 'ok') return 'unknown';
  const projects = userInput.data?.projects;
  if (!projects || typeof projects !== 'object' || Array.isArray(projects)) return 'unknown';
  const matches = Object.entries(projects).filter(([key]) => normalizeProjectPath(key,platform) === normalizeProjectPath(projectRoot,platform));
  if (matches.length !== 1) return 'unknown';
  const trust = matches[0][1]?.trust_level;
  return ['trusted','untrusted'].includes(trust) ? trust : 'unknown';
}
export function classifyScriptReference(command,args,platform = process.platform) {
  const pending = {kind:'needs-verification'};
  if (typeof command !== 'string' || !Array.isArray(args) || args.length !== 1 || typeof args[0] !== 'string') return pending;
  const script = args[0];
  if (/[$%{}\r\n]|:\/\//.test(script)) return pending;
  const implementation = platform === 'win32' ? path.win32 : path.posix;
  if(platform==='win32' && (!/^[a-zA-Z]:[\\/]/.test(script) || script.slice(2).includes(':')))return pending;
  if (!implementation.isAbsolute(script)) return pending;
  const name = implementation.basename(command).toLowerCase();
  if (['node','node.exe'].includes(name) && /\.(?:js|mjs|cjs)$/i.test(script) || ['python','python.exe','python3','python3.exe'].includes(name) && /\.py$/i.test(script)) return {kind:'absolute-script',path:script};
  return pending;
}
