import test from 'node:test';import assert from 'node:assert/strict';
import {parse} from 'smol-toml';
import {toPublicSummary} from '../src/report/public-summary.mjs';
import {exportMarkdown,exportToml} from '../src/report/export.mjs';
const corpus=['sk-fake-secret','fake-token-123','C:/Users/private-person','https://private.invalid','fake-error-message','fake-mcp-args'];
const analysis={inputs:{user:{id:'user',state:'ok',path:corpus[2]},project:{id:'project',state:'invalid',path:corpus[2]}},settings:{model:{user:corpus[0],project:'demo'},model_provider:{user:corpus[3]},approval_policy:{user:corpus[1]},sandbox_mode:{user:9007199254740993n},web_search:{user:'x'.repeat(129)},model_reasoning_effort:{user:{secret:corpus[0]}},unknown:{user:corpus[4]}},findings:[{code:'CONFIG_SYNTAX_ERROR',status:'issue',sourceId:'project',evidence:{line:2,column:4,raw:corpus[4]},message:corpus[4]},{code:corpus[5],status:'pass',sourceId:corpus[2],evidence:{}}]};
test('one boundary removes secret/path/unknown strings from all outputs',()=>{
  const s=toPublicSummary(analysis,{state:'ready',codexVersion:corpus[0],checks:[{code:'DOCTOR_INSTALLATION',status:'issue',sourceId:'doctor',evidence:{},message:corpus[4]}]});
  for(const output of [JSON.stringify(s),exportMarkdown(s,'en'),exportMarkdown(s,'zh-CN'),exportToml(s,{locale:'en',source:'user'})]) for(const value of corpus) assert.ok(!output.includes(value),value);
  assert.equal(s.settings.model.user.kind,'redacted');assert.equal(s.settings.sandbox_mode.user.kind,'unsupported');
  assert.equal(s.settings.web_search.user.kind,'unsupported');assert.equal(s.doctor.codexVersion,undefined);
});
test('template is valid TOML and only contains six allowed keys',()=>{
  const s=toPublicSummary({...analysis,inputs:{...analysis.inputs,project:{...analysis.inputs.project,state:'ok'}}});const result=parse(exportToml(s,{locale:'zh-CN',source:'project'}));
  assert.deepEqual(Object.entries(result),[['model','demo']]);assert.match(exportMarkdown(s,'en'),/Configuration sources/);assert.match(exportMarkdown(s,'zh-CN'),/配置来源对比/);
});
test('invalid, missing and unavailable source values are not described as unset',()=>{
  for(const state of ['invalid','unavailable','missing']) {
    const s=toPublicSummary({...analysis,inputs:{...analysis.inputs,project:{state}},settings:{model:{project:'demo'}}});
    assert.equal(s.settings.model.project.kind,'absent');
    for(const locale of ['en','zh-CN']){
      const template=exportToml(s,{locale,source:'project'});
      assert.ok(template.includes(locale==='en'?'Not read':'未读取'));
      assert.ok(!template.includes('model ='));
      assert.ok(!template.includes(locale==='en'?'Not set':'未设置'));
      assert.match(exportMarkdown(s,locale),locale==='en'?/Not read/:/未读取/);
    }
  }
});
test('shareable TOML carries the provider reference warning',()=>{
  const s=toPublicSummary({...analysis,settings:{model_provider:{user:'demo-provider'}}});
  assert.match(exportToml(s,{locale:'en',source:'user'}),/provider definitions/);
  assert.match(exportToml(s,{locale:'zh-CN',source:'user'}),/provider 定义/);
});
