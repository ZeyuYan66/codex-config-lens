import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeInputs} from '../src/config/analyze.mjs';
const input = data => ({id:'user',state:'ok',data});
const inputs = user => ({user,project:{id:'project',state:'ok',data:{}},projectRoot:'C:/demo'});
test('trust uncertainty and explicit untrusted stay review', async () => {
  for(const [data,code] of [[{},'PROJECT_TRUST_UNKNOWN'],[{projects:{'C:/demo':{trust_level:'untrusted'}}},'PROJECT_NOT_TRUSTED']]){
    const r = await analyzeInputs(inputs(input(data)),{});
    assert.ok(r.findings.some(f=>f.code===code && f.status==='review'));
    assert.deepEqual(r.unmodeledSources,['cli','profile','ancestor-project','organization','client-state']);
  }
});
test('unresolved Windows paths never cause filesystem existence probes',async()=>{
  let calls=0;
  const user=input({mcp_servers:{a:{command:'node',args:['\\root-relative.mjs']},b:{command:'node',args:['\\\\example.invalid\\share\\server.mjs']}}});
  const r=await analyzeInputs(inputs(user),{platform:'win32',fileExists:async()=>{calls++;return false;}});
  assert.equal(calls,0);assert.equal(r.findings.filter(f=>f.code==='MCP_REFERENCE_REVIEW').length,2);
});
test('syntax errors, missing scripts and IO failures have distinct outcomes',async () => {
  const broken = await analyzeInputs(inputs({id:'user',state:'invalid',location:{line:2,column:3}}));
  assert.ok(broken.findings.some(f=>f.code==='CONFIG_SYNTAX_ERROR' && f.status==='issue'));
  const user=input({mcp_servers:{'fake-secret':{command:'node',args:['C:/demo/missing.mjs']}}});
  const absent=await analyzeInputs(inputs(user),{fileExists:async()=>false,platform:'win32'});
  assert.ok(absent.findings.some(f=>f.code==='MCP_SCRIPT_NOT_FOUND' && f.evidence.serverIndex===1));
  assert.ok(!JSON.stringify(absent.findings).includes('fake-secret'));
  const failed=await analyzeInputs(inputs(user),{fileExists:async()=>{throw Error('fake-secret');},platform:'win32'});
  assert.ok(failed.findings.some(f=>f.code==='MCP_SCRIPT_UNAVAILABLE' && f.status==='unavailable'));
});
