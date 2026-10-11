import {SETTINGS,UNMODELED} from '../config/analyze.mjs';
import en from '../../public/locales/en.mjs';
import {safeVersion} from '../doctor/normalize.mjs';
export const REFERENCES=Object.freeze({config:'https://learn.chatgpt.com/docs/config-file/config-reference',trust:'https://learn.chatgpt.com/docs/config-file/config-basic',mcp:'https://learn.chatgpt.com/docs/config-file/config-reference',doctor:'https://learn.chatgpt.com/docs/cli/reference'});
const codes = new Set(Object.keys(en).filter(k=>k.startsWith('code_')).map(k=>k.slice(5)));
export function displayValue(value) {
  if(value===undefined) return {kind:'absent'};
  if(typeof value!=='string' || value.length>128) return {kind:'unsupported'};
  if(!/^[a-zA-Z0-9_.:-]+$/.test(value) || /sk[-_]|secret|token|password|bearer|api.?key|:\/\//i.test(value)) return {kind:'redacted'};
  return {kind:'value',value};
}
function publicFinding(f) {
  const code = codes.has(f?.code)?f.code:'CHECK_UNRECOGNIZED';
  const status = codes.has(f?.code) && ['pass','issue','review','unavailable'].includes(f.status)?f.status:'review';
  const sourceId = ['user','project','doctor'].includes(f?.sourceId)?f.sourceId:'doctor';
  const evidence={};
  for(const key of ['line','column','serverIndex','checkIndex']) if(Number.isSafeInteger(f?.evidence?.[key]) && f.evidence[key]>0 && f.evidence[key]<=100000) evidence[key]=f.evidence[key];
  return {code,status,sourceId,evidence,referenceKey:Object.hasOwn(REFERENCES,f?.referenceKey)?f.referenceKey:'config'};
}
export function publicDoctor(doctor = {}) {
  const state = ['ready','unavailable','not-run'].includes(doctor.state)?doctor.state:'unavailable';
  const result={state,checks:Array.isArray(doctor.checks)?doctor.checks.map(publicFinding):[]};
  const version=safeVersion(doctor.codexVersion);if(version)result.codexVersion=version;
  if(codes.has(doctor.reasonCode) && doctor.reasonCode.startsWith('DOCTOR_')) result.reasonCode=doctor.reasonCode;
  return result;
}
export function toPublicSummary(analysis,doctor = {state:'not-run',checks:[]}) {
  const settings={};
  for(const key of SETTINGS) settings[key]=Object.fromEntries(['user','project'].map(id=>[id,displayValue(analysis.inputs?.[id]?.state==='ok'?analysis.settings?.[key]?.[id]:undefined)]));
  const sources=['user','project'].map(id=>({id,state:['ok','missing','invalid','unavailable'].includes(analysis.inputs?.[id]?.state)?analysis.inputs[id].state:'unavailable',pathRef:id==='user'?'<CODEX_HOME>/config.toml':'<PROJECT>/.codex/config.toml'}));
  return {schemaVersion:1,toolVersion:'0.1.0',sources,settings,findings:(analysis.findings||[]).map(publicFinding),doctor:publicDoctor(doctor),unmodeledSources:[...UNMODELED]};
}
