import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';
import {createLensServer} from '../src/server.mjs';import {createProject} from './helpers/project.mjs';
test('loopback API guards origin, host, token, body, routes and public output',async t=>{
  const p=await createProject({userToml:'model="sk-fake-secret"'});t.after(p.cleanup);
  let doctors=0;
  const s=await createLensServer({port:0,codexHome:p.codexHome},{runDoctor:async options=>{doctors++;assert.equal(options.codexHome,p.codexHome);return {state:'unavailable',checks:[],reasonCode:'DOCTOR_PROCESS_FAILED'};}});t.after(s.close);
  const html=await (await fetch(s.url)).text();const token=html.match(/name="lens-token" content="([a-f0-9]+)"/)[1];
  const post=(route,body,headers={})=>fetch(s.url+route,{method:'POST',headers:{'content-type':'application/json','x-lens-token':token,...headers},body:JSON.stringify(body)});
  const badHost=await new Promise(resolve=>{const req=http.request(s.url+'/api/scan',{method:'POST',headers:{host:'evil.invalid','x-lens-token':token}},res=>{res.resume();resolve(res.statusCode);});req.end('{}');});assert.equal(badHost,403);
  for(const headers of [{origin:'https://evil.invalid'},{origin:'null'},{'x-lens-token':''}]) assert.equal((await post('/api/scan',{projectRoot:p.root},headers)).status,403,JSON.stringify(headers));
  assert.equal((await post('/api/export',{scanId:'unknown',locale:'en',format:'markdown',source:'user'})).status,404);
  const traversal=await new Promise(resolve=>{http.get(s.url+'/%2e%2e/package.json',res=>{res.resume();resolve(res.statusCode);});});assert.equal(traversal,404);
  assert.equal((await post('/api/scan',{projectRoot:'x'.repeat(33000)})).status,413);
  const res=await post('/api/scan',{projectRoot:p.root});assert.equal(res.status,200);const text=await res.text();assert.ok(!text.includes('sk-fake-secret'));assert.ok(!text.includes(p.root));assert.equal(doctors,0);
  const {scanId}=JSON.parse(text);assert.equal((await post('/api/doctor',{scanId})).status,200);assert.equal(doctors,1);
  const out=await post('/api/export',{scanId,locale:'zh-CN',format:'markdown',source:'user'});assert.match((await out.json()).text,/配置来源对比/);
});
