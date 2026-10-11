import {readdir,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import en from '../public/locales/en.mjs';import zh from '../public/locales/zh-CN.mjs';
import assert from 'node:assert/strict';
assert.deepEqual(Object.keys(en).sort(),Object.keys(zh).sort());
for(const values of [en,zh])for(const value of Object.values(values))assert.ok(typeof value==='string' && value.trim());
let count=0;
for(const root of ['src','bin','shared','public','scripts','tests']) {
  for(const entry of await readdir(root,{recursive:true})) {
    if(!entry.endsWith('.mjs'))continue; const file=`${root}/${entry}`;
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    if(result.status!==0)throw Error(`Syntax check failed: ${file}`);
    const text=await readFile(file,'utf8');
    for(const match of text.matchAll(/\bt\([^,]+,\s*['"]([\w]+)['"]/g))assert.ok(Object.hasOwn(en,match[1]),`Missing key: ${match[1]}`);
    count++;
  }
}
console.log(`Checked ${count} modules and ${Object.keys(en).length} bilingual keys.`);
