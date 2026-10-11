#!/usr/bin/env node
import {parseArgs} from 'node:util';
import {scanProject} from '../src/scan.mjs';
import {exportMarkdown,exportToml} from '../src/report/export.mjs';
import {t} from '../shared/i18n.mjs';
async function main() {
  const command=process.argv[2];
  const {values,positionals}=parseArgs({args:process.argv.slice(3),options:{project:{type:'string'},'codex-home':{type:'string'},format:{type:'string'},lang:{type:'string'},source:{type:'string'},help:{type:'boolean'},port:{type:'string'},demo:{type:'string'},variant:{type:'string'}}});
  if(values.help || !command || command==='--help') {console.log(t(values.lang || 'en','cliHelp'));return;}
  if(positionals.length || !['scan','export','serve'].includes(command) || values.lang && !['en','zh-CN'].includes(values.lang) || values.source && !['user','project'].includes(values.source))throw Error('CLI_INVALID_ARGUMENTS');
  if(command==='serve') {
    const port=values.port===undefined?4178:Number(values.port);
    if(!Number.isInteger(port) || port<0 || port>65535) throw Error('CLI_INVALID_ARGUMENTS');
    const {createLensServer}=await import('../src/server.mjs');
    const service=await createLensServer({port,projectRoot:values.project,codexHome:values['codex-home']});
    console.log(`Codex Config Lens: ${service.url}`);
    for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await service.close();process.exit(0);});return;
  }
  if(!values.project && !values.demo || values.variant && !['before','after'].includes(values.variant))throw Error('CLI_INVALID_ARGUMENTS');
  const summary=values.demo?await (await import('../src/demo.mjs')).loadDemo(values.demo,values.variant):await scanProject({projectRoot:values.project,codexHome:values['codex-home']});
  const format=values.format || (command==='scan'?'json':'markdown');
  if(command==='scan' && format==='json')console.log(JSON.stringify(summary,null,2));
  else if(command==='export' && format==='markdown')process.stdout.write(exportMarkdown(summary,values.lang || 'en'));
  else if(command==='export' && format==='toml')process.stdout.write(exportToml(summary,{locale:values.lang || 'en',source:values.source || 'project'}));
  else throw Error('CLI_INVALID_ARGUMENTS');
}
main().catch(()=>{console.error('CLI_INVALID_ARGUMENTS');process.exitCode=1;});
