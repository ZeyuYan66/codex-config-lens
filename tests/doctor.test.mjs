import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {normalizeDoctor} from '../src/doctor/normalize.mjs';
import {runDoctor} from '../src/doctor/run.mjs';
import {resolveDoctorExecutable} from '../src/doctor/executable.mjs';
const fixture=JSON.parse(await readFile(new URL('./fixtures/doctor-v1.json',import.meta.url),'utf8'));
test('valid nonzero JSON remains usable; unknown checks cannot pass',()=>{
  const r=normalizeDoctor({stdout:JSON.stringify(fixture),exitCode:1});
  assert.equal(r.state,'ready');assert.equal(r.checks[0].status,'pass');assert.equal(r.checks[1].status,'review');
  assert.ok(!JSON.stringify(r).includes('fake-secret'));assert.ok(!JSON.stringify(r).includes('dynamic-secret-id'));
});
test('unsupported or interrupted doctor yields fixed reasons',()=>{
  for(const [args,code] of [[{stdout:'{'},'DOCTOR_INVALID_JSON'],[{stdout:JSON.stringify({...fixture,schemaVersion:2})},'DOCTOR_UNSUPPORTED_SCHEMA'],[{timedOut:true},'DOCTOR_TIMEOUT'],[{outputExceeded:true},'DOCTOR_OUTPUT_LIMIT']]) assert.equal(normalizeDoctor({...args,exitCode:0}).reasonCode,code);
});
test('actual child: fixed invocation, nonzero output, timeout and overflow cleanup',async()=>{
  for(const [mode,expected] of [['normal','ready'],['hang','DOCTOR_TIMEOUT'],['overflow','DOCTOR_OUTPUT_LIMIT']]) {
    let child;
    const r=await runDoctor({executable:'codex',cwd:process.cwd(),timeoutMs:mode==='normal'?2000:200,maxOutputBytes:1024},{resolveExecutable:async()=> 'codex',spawn:(executable,args,options)=>{
      assert.equal(executable,'codex');assert.deepEqual(args,['doctor','--json']);assert.equal(options.shell,false);assert.equal(options.cwd,process.cwd());
      child=spawn(process.execPath,[fileURLToPath(new URL('./helpers/fake-doctor.mjs',import.meta.url)),mode],options);return child;
    }});
    assert.equal(r.reasonCode || r.state,expected);assert.ok(child.exitCode!==null || child.signalCode!==null);
  }
});
test('missing executable returns unavailable without stderr',async()=>{
  const r=await runDoctor({executable:'not-a-real-executable-lens'});assert.equal(r.reasonCode,'DOCTOR_PROCESS_FAILED');
});
test('empty doctor reports are unavailable even with a recognized schema',()=>{
  for(const exitCode of [0,1])assert.equal(normalizeDoctor({stdout:JSON.stringify({schemaVersion:1,overallStatus:'error',checks:{}}),exitCode}).reasonCode,'DOCTOR_EMPTY_REPORT');
});
test('selected Codex home reaches the actual child environment',async()=>{
  const selected='C:/lens-synthetic-user';let received;
  const r=await runDoctor({codexHome:selected,timeoutMs:2000},{resolveExecutable:async()=> 'codex',spawn:(executable,args,options)=>{
    received=options.env?.CODEX_HOME;
    return spawn(process.execPath,[fileURLToPath(new URL('./helpers/fake-doctor.mjs',import.meta.url)),'normal'],options);
  }});
  assert.equal(r.state,'ready');assert.equal(received,selected);
});
test('Windows CLI resolution excludes project shadowing and command shims',async()=>{
  const seen=[];
  const result=await resolveDoctorExecutable('codex',{platform:'win32',cwd:'C:/project',env:{Path:'C:/project;C:/trusted-bin'},isFile:async file=>{seen.push(file);return file==='C:\\trusted-bin\\codex.exe';}});
  assert.equal(result,'C:\\trusted-bin\\codex.exe');assert.ok(!seen.some(file=>file.startsWith('C:\\project\\')));assert.ok(seen.every(file=>file.endsWith('.exe')));
  assert.equal(await resolveDoctorExecutable('codex',{platform:'win32',cwd:'C:/project',env:{Path:'C:/project'},isFile:async()=>true}),undefined);
});
