import test from 'node:test';import assert from 'node:assert/strict';
import {loadDemo} from '../src/demo.mjs';
test('three synthetic scenarios exercise real rules before and after',async()=>{
  for(const [id,code] of [['syntax-error','CONFIG_SYNTAX_ERROR'],['untrusted-project','PROJECT_NOT_TRUSTED'],['missing-script','MCP_SCRIPT_NOT_FOUND']]){
    const before=await loadDemo(id,'before');const after=await loadDemo(id,'after');
    assert.ok(before.findings.some(f=>f.code===code));assert.ok(!after.findings.some(f=>f.code===code));
    assert.equal(before.doctor.state,'not-run');assert.ok(!JSON.stringify(before).includes('C:/lens-demo'));
  }
  await assert.rejects(loadDemo('../config','before'));await assert.rejects(loadDemo('syntax-error','bad'));
});
