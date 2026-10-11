import {parseConfig} from './config/parse.mjs';
import {analyzeInputs} from './config/analyze.mjs';
import {toPublicSummary} from './report/public-summary.mjs';
export const DEMO_IDS=Object.freeze(['syntax-error','untrusted-project','missing-script']);
export async function loadDemo(caseId,variant='before') {
  if(!DEMO_IDS.includes(caseId) || !['before','after'].includes(variant))throw Error('DEMO_INVALID_ARGUMENTS');
  const projectRoot='C:/lens-demo/project';
  let userToml='model = "demo-model"\nmodel_reasoning_effort = "medium"\napproval_policy = "on-request"\nsandbox_mode = "workspace-write"\nweb_search = "cached"\n[projects."C:/lens-demo/project"]\ntrust_level = "trusted"';
  let projectToml='model = "demo-model"\nmodel_reasoning_effort = "high"';
  if(caseId==='syntax-error' && variant==='before') projectToml='model = "demo-model\n';
  if(caseId==='untrusted-project' && variant==='before') userToml=userToml.replace('trust_level = "trusted"','trust_level = "untrusted"');
  if(caseId==='missing-script') projectToml+='\n[mcp_servers.demo]\ncommand = "node"\nargs = ["C:/lens-demo/server.mjs"]';
  const [user,project]=await Promise.all([parseConfig(userToml),parseConfig(projectToml)]);
  return toPublicSummary(await analyzeInputs({user:{id:'user',...user},project:{id:'project',...project},projectRoot},{platform:'win32',fileExists:async()=>variant==='after'}));
}
