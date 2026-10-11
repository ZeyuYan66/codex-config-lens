import {spawn as spawnChild} from 'node:child_process';
import {normalizeDoctor} from './normalize.mjs';
import {resolveDoctorExecutable} from './executable.mjs';
export async function runDoctor({executable='codex',cwd,codexHome,timeoutMs=30000,maxOutputBytes=2097152} = {},{spawn=spawnChild,resolveExecutable=resolveDoctorExecutable} = {}) {
  const failure=()=>({state:'unavailable',checks:[],reasonCode:'DOCTOR_PROCESS_FAILED'});
  let resolvedExecutable;
  try{resolvedExecutable=await resolveExecutable(executable,{cwd});}catch{return failure();}
  if(!resolvedExecutable)return failure();
  return new Promise(resolve=>{
    let child,timer,bytes=0,timedOut=false,outputExceeded=false,failed=false;
    const chunks=[];
    try {
      child=spawn(resolvedExecutable,['doctor','--json'],{cwd,shell:false,windowsHide:true,stdio:['ignore','pipe','pipe'],env:codexHome?{...process.env,CODEX_HOME:codexHome}:process.env});
      const accept=(chunk,isStdout)=>{
        bytes+=chunk.length;
        if(bytes>maxOutputBytes) {outputExceeded=true;child.kill();return;}
        if(isStdout) chunks.push(chunk);
      };
      child.stdout.on('data',chunk=>accept(chunk,true));
      child.stderr.on('data',chunk=>accept(chunk,false));
      child.once('error',()=>{failed=true;});
      timer=setTimeout(()=>{timedOut=true;child.kill();},timeoutMs);
      child.once('close',exitCode=>{
        clearTimeout(timer);
        resolve(failed?failure():normalizeDoctor({stdout:Buffer.concat(chunks).toString('utf8'),exitCode,timedOut,outputExceeded}));
      });
    } catch {clearTimeout(timer);if(child)child.kill();resolve(failure());}
  });
}
