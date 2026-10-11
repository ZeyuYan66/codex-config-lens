import {t} from '../../shared/i18n.mjs';
import {SETTINGS} from '../config/analyze.mjs';
import {REFERENCES} from './public-summary.mjs';
import {settingText} from '../../shared/presentation.mjs';
export function exportMarkdown(summary,locale='en') {
  const lines=[`# ${t(locale,'reportTitle')}`,'',`${t(locale,'toolVersion')}: ${summary.toolVersion}`,'',`## ${t(locale,'sources')}`,'',t(locale,'scope'),'',`| ${t(locale,'settings')} | ${t(locale,'source_user')} | ${t(locale,'source_project')} |`,'| --- | --- | --- |'];
  for(const key of SETTINGS) lines.push(`| ${key} | ${settingText(summary,key,'user',locale)} | ${settingText(summary,key,'project',locale)} |`);
  lines.push('',t(locale,'providerNote'),'');
  for(const source of summary.sources) lines.push(`- ${t(locale,`source_${source.id}`)}: \`${source.pathRef}\` — ${t(locale,`state_${source.state}`)}`);
  lines.push('',`## ${t(locale,'findings')}`,'');
  for(const f of [...summary.findings,...summary.doctor.checks]) {
    const position=Object.entries(f.evidence).map(([key,value])=>`${t(locale,{line:'line',column:'column',serverIndex:'server',checkIndex:'check'}[key])} ${value}`).join(', ');
    lines.push(`- **${t(locale,`status_${f.status}`)}** · ${t(locale,`source_${f.sourceId}`)}${position?` · ${position}`:''}: ${t(locale,`code_${f.code}`)} (${f.code}) [${t(locale,'reference')}](${REFERENCES[f.referenceKey]})`);
  }
  lines.push('',`Doctor: ${t(locale,`state_${summary.doctor.state.replace('-','_')}`)}`);
  if(summary.doctor.codexVersion)lines.push(`${t(locale,'doctorVersion')}: ${summary.doctor.codexVersion}`);
  if(summary.doctor.reasonCode)lines.push(t(locale,`code_${summary.doctor.reasonCode}`));
  lines.push('',`${t(locale,'unmodeled')}: ${summary.unmodeledSources.join(', ')}`,'');return lines.join('\n');
}
export function exportToml(summary,{locale='en',source='project'}={}) {
  if(!['user','project'].includes(source))throw Error('EXPORT_INVALID_SOURCE');
  const state=summary.sources.find(item=>item.id===source)?.state || 'unavailable';
  const lines=[`# ${t(locale,'template')} — ${t(locale,`source_${source}`)}`,`# ${t(locale,'templateSourceState')}: ${t(locale,`state_${state}`)}`,`# ${t(locale,'exportComment')}`,`# ${t(locale,'providerNote')}`];
  for(const key of SETTINGS) {
    const value=summary.settings[key][source];
    lines.push(state==='ok' && value.kind==='value'?`${key} = ${JSON.stringify(value.value)}`:`# ${key}: ${settingText(summary,key,source,locale)}`);
  }
  return lines.join('\n')+'\n';
}
