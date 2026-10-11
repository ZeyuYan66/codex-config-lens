import {finding} from '../config/analyze.mjs';
export const safeVersion = value => typeof value==='string' && /^\d{1,4}\.\d{1,4}\.\d{1,4}(?:-[a-zA-Z0-9.]{1,30})?$/.test(value) ? value : undefined;
export function normalizeDoctor({stdout,exitCode,timedOut=false,outputExceeded=false}) {
  const unavailable=reasonCode=>({state:'unavailable',checks:[],reasonCode});
  if(timedOut) return unavailable('DOCTOR_TIMEOUT');
  if(outputExceeded) return unavailable('DOCTOR_OUTPUT_LIMIT');
  let json;try {json=JSON.parse(stdout);}catch{return unavailable('DOCTOR_INVALID_JSON');}
  if(!json || json.schemaVersion!==1 || !json.checks || typeof json.checks!=='object' || Array.isArray(json.checks)) return unavailable('DOCTOR_UNSUPPORTED_SCHEMA');
  if(exitCode===null || !Number.isInteger(exitCode)) return unavailable('DOCTOR_PROCESS_FAILED');
  if(Object.keys(json.checks).length===0)return unavailable('DOCTOR_EMPTY_REPORT');
  const checks=[];
  for(const [key,check] of Object.entries(json.checks)) {
    const evidence={checkIndex:checks.length+1};
    if(key!=='installation' || check?.id!=='installation') checks.push(finding('DOCTOR_CHECK_UNRECOGNIZED','review','doctor',evidence,'doctor'));
    else {
      const status=['pass','passed','ok'].includes(check.status)?'pass':['fail','failed','error'].includes(check.status)?'issue':'review';
      checks.push(finding('DOCTOR_INSTALLATION',status,'doctor',evidence,'doctor'));
    }
  }
  const codexVersion=safeVersion(json.codexVersion);
  return {state:'ready',...(codexVersion?{codexVersion}:{}),checks};
}
