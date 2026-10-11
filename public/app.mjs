import {t,selectLocale} from '/shared/i18n.mjs';
import {settingText} from '/shared/presentation.mjs';
const $=id=>document.getElementById(id),token=document.querySelector('meta[name="lens-token"]').content;
let preference;try{preference=localStorage.getItem('lens-language');}catch{}
let locale=selectLocale(navigator.language,preference),current,caseId,variant='before',busy=false,exportText='';
const references={config:'https://learn.chatgpt.com/docs/config-file/config-reference',trust:'https://learn.chatgpt.com/docs/config-file/config-basic',mcp:'https://learn.chatgpt.com/docs/config-file/config-reference',doctor:'https://learn.chatgpt.com/docs/cli/reference'};
const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
async function api(route,data) {
  const response=await fetch(route,{method:data?'POST':'GET',headers:{'x-lens-token':token,...(data?{'content-type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
  if(!response.ok)throw Error('REQUEST_FAILED');return response.json();
}
function translate(){
  document.documentElement.lang=locale;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(locale,el.dataset.i18n));
  document.querySelectorAll('[data-placeholder]').forEach(el=>el.placeholder=t(locale,el.dataset.placeholder));
  document.querySelectorAll('[data-aria]').forEach(el=>el.setAttribute('aria-label',t(locale,el.dataset.aria)));
  $('lang-zh').setAttribute('aria-pressed',String(locale==='zh-CN'));$('lang-en').setAttribute('aria-pressed',String(locale==='en'));
  $('source').disabled=$('format').value!=='toml';
  if(current)render();
}
function render(){
  const s=current.summary;$('empty').hidden=true;$('results').hidden=false;$('variant').hidden=!caseId;
  $('mode').textContent=t(locale,caseId?'demoMode':'projectMode');
  document.querySelectorAll('[data-case]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.case===caseId)));
  document.querySelectorAll('[data-variant]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.variant===variant)));
  const findings=[...s.findings,...s.doctor.checks];
  $('counts').replaceChildren(...['issue','review','pass','unavailable'].map(status=>{const card=node('div',undefined,`count ${status}`);card.append(node('span',t(locale,{issue:'countIssue',review:'countReview',pass:'countPass',unavailable:'countUnavailable'}[status])),node('strong',String(findings.filter(f=>f.status===status).length)));return card;}));
  $('sources').replaceChildren(...s.sources.map(source=>{const box=node('div',undefined,'source-file');box.append(node('span',t(locale,`source_${source.id}`)),node('code',source.pathRef),node('span',t(locale,`state_${source.state}`),'file-state'));return box;}));
  $('settings').replaceChildren(...Object.entries(s.settings).map(([key,values])=>{const row=node('tr');row.append(node('th',key));for(const id of ['user','project']) {const cell=node('td',settingText(s,key,id,locale),values[id].kind);if(values[id].kind==='value' && values.user.kind==='value' && values.project.kind==='value' && values.user.value!==values.project.value)cell.classList.add('different');row.append(cell);}return row;}));
  $('checks-total').textContent=String(findings.length);
  $('findings').replaceChildren(...findings.map(f=>{const card=node('article',undefined,`finding ${f.status}`);const top=node('div',undefined,'finding-top');top.append(node('span',t(locale,`status_${f.status}`),'badge'),node('span',t(locale,`source_${f.sourceId}`),'finding-source'));card.append(top,node('p',t(locale,`code_${f.code}`)));const bottom=node('div',undefined,'finding-bottom');bottom.append(node('code',f.code));for(const [key,val] of Object.entries(f.evidence))bottom.append(node('span',`${t(locale,{line:'line',column:'column',serverIndex:'server',checkIndex:'check'}[key])} ${val}`));const link=node('a',`${t(locale,'reference')} ↗`);link.href=references[f.referenceKey];link.target='_blank';link.rel='noreferrer';bottom.append(link);card.append(bottom);return card;}));
  $('doctor-status').textContent=`Doctor · ${t(locale,`state_${s.doctor.state.replace('-','_')}`)}${s.doctor.codexVersion?` · ${s.doctor.codexVersion}`:''}${s.doctor.reasonCode?` — ${t(locale,`code_${s.doctor.reasonCode}`)}`:''}`;
  $('doctor').disabled=Boolean(caseId) || busy;
}
async function work(fn){if(busy)return;busy=true;$('notice').hidden=false;$('notice').textContent=t(locale,'busy');document.querySelectorAll('button').forEach(el=>el.disabled=true);try{await fn();$('notice').hidden=true;}catch{$('notice').textContent=t(locale,'error');}finally{busy=false;document.querySelectorAll('button').forEach(el=>el.disabled=false);if(current)render();}}
async function demo(id,v='before'){await work(async()=>{const result=await api(`/api/demo?caseId=${encodeURIComponent(id)}&variant=${v}`);caseId=id;variant=v;current=result;render();});}
for(const language of ['en','zh-CN'])$(language==='en'?'lang-en':'lang-zh').addEventListener('click',()=>{locale=language;try{localStorage.setItem('lens-language',locale);}catch{}translate();if($('export-dialog').open)void refreshExport();});
document.querySelectorAll('[data-case]').forEach(el=>el.addEventListener('click',()=>demo(el.dataset.case)));
document.querySelectorAll('[data-variant]').forEach(el=>el.addEventListener('click',()=>demo(caseId,el.dataset.variant)));
$('scan-form').addEventListener('submit',event=>{event.preventDefault();void work(async()=>{const result=await api('/api/scan',{projectRoot:$('project').value.trim()});caseId=null;current=result;render();});});
$('doctor').addEventListener('click',()=>work(async()=>{current=await api('/api/doctor',{scanId:current.scanId});render();}));
$('format').addEventListener('change',()=>{$('source').disabled=$('format').value!=='toml';});
async function refreshExport(){const result=await api('/api/export',{scanId:current.scanId,locale,format:$('format').value,source:$('source').value});exportText=result.text;$('export-text').textContent=exportText;}
$('preview').addEventListener('click',()=>work(async()=>{await refreshExport();$('export-dialog').showModal();}));
$('close').addEventListener('click',()=>$('export-dialog').close());
$('download').addEventListener('click',()=>{const format=$('format').value;const url=URL.createObjectURL(new Blob([exportText],{type:'text/plain;charset=utf-8'}));const a=node('a');a.href=url;a.download=`codex-config-lens-${locale}.${format==='toml'?'toml':'md'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
translate();
