import {stat} from 'node:fs/promises';
import {getProjectTrust,classifyScriptReference} from './paths.mjs';
export const SETTINGS = Object.freeze(['model','model_provider','model_reasoning_effort','approval_policy','sandbox_mode','web_search']);
export const UNMODELED = Object.freeze(['cli','profile','ancestor-project','organization','client-state']);
export function finding(code,status,sourceId,evidence = {},referenceKey = 'config') { return {code,status,sourceId,evidence,referenceKey}; }
async function exists(file) { try { return (await stat(file)).isFile(); } catch(e) { if(e.code==='ENOENT') return false; throw e; } }
export async function analyzeInputs(inputs,{fileExists = exists,platform = process.platform} = {}) {
  const findings = [], settings = {}, trust = getProjectTrust(inputs.user,inputs.projectRoot,platform);
  let mcpCount = 0;
  for(const key of SETTINGS) settings[key] = {user:inputs.user.data?.[key],project:inputs.project.data?.[key]};
  for(const source of [inputs.user,inputs.project]) {
    if(source.state==='invalid') findings.push(finding('CONFIG_SYNTAX_ERROR','issue',source.id,source.location));
    else if(source.state==='missing') findings.push(finding('CONFIG_MISSING','review',source.id));
    else if(source.state==='unavailable') findings.push(finding(source.reasonCode || 'CONFIG_READ_FAILED','unavailable',source.id));
    else {
      findings.push(finding('CONFIG_PARSED','pass',source.id));
      const servers = source.data?.mcp_servers;
      if(servers && typeof servers==='object' && !Array.isArray(servers)) {
        for(const server of Object.values(servers)) {
          const evidence = {serverIndex:++mcpCount};
          const reference = classifyScriptReference(server?.command,server?.args,platform);
          if(reference.kind==='needs-verification') findings.push(finding('MCP_REFERENCE_REVIEW','review',source.id,evidence,'mcp'));
          else try {
            const found = await fileExists(reference.path);
            findings.push(finding(found ? 'MCP_SCRIPT_FOUND' : 'MCP_SCRIPT_NOT_FOUND',found ? 'pass' : 'issue',source.id,evidence,'mcp'));
          }
          catch { findings.push(finding('MCP_SCRIPT_UNAVAILABLE','unavailable',source.id,evidence,'mcp')); }
        }
      }
    }
  }
  // The project trust record is static evidence, not a statement about this session.
  findings.push(finding(trust==='trusted'?'PROJECT_TRUSTED':trust==='untrusted'?'PROJECT_NOT_TRUSTED':'PROJECT_TRUST_UNKNOWN',trust==='trusted'?'pass':'review','project',{},'trust'));
  return {inputs,settings,findings,trust,mcpCount,unmodeledSources:[...UNMODELED]};
}
