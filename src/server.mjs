import http from 'node:http';import {randomBytes,timingSafeEqual} from 'node:crypto';
import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {scanProject} from './scan.mjs';import {runDoctor} from './doctor/run.mjs';import {publicDoctor} from './report/public-summary.mjs';
import {resolveCodexHome} from './config/read.mjs';
import {exportMarkdown,exportToml} from './report/export.mjs';import {loadDemo} from './demo.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const STATIC=new Map([['/',['public/index.html','text/html']],['/app.mjs',['public/app.mjs','text/javascript']],['/styles.css',['public/styles.css','text/css']],['/shared/i18n.mjs',['shared/i18n.mjs','text/javascript']],['/shared/presentation.mjs',['shared/presentation.mjs','text/javascript']],['/public/locales/en.mjs',['public/locales/en.mjs','text/javascript']],['/public/locales/zh-CN.mjs',['public/locales/zh-CN.mjs','text/javascript']]]);
class RequestError extends Error {constructor(status){super('REQUEST_FAILED');this.status=status;}}
async function body(req) {
  let size=0;const chunks=[];
  for await(const chunk of req) {size+=chunk.length;if(size>32768)throw new RequestError(413);chunks.push(chunk);}
  try {const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!data || Array.isArray(data) || typeof data!=='object')throw Error();return data;}catch{throw new RequestError(400);}
}
export async function createLensServer({port=4178,projectRoot,codexHome,doctorExecutable='codex'}={},dependencies={}) {
  codexHome=path.resolve(codexHome || resolveCodexHome());
  const token=randomBytes(32).toString('hex');const scans=new Map();let url,doctorBusy=false,scanBusy=false;
  function remember(summary,root){const scanId=randomBytes(16).toString('hex');if(scans.size>=20)scans.delete(scans.keys().next().value);scans.set(scanId,{summary,root});return {scanId,summary};}
  const server=http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    const send=(status,data,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8'});res.end(type==='application/json'?JSON.stringify(data):data);};
    try {
      if(req.headers.host!==new URL(url).host || req.headers.origin!==undefined && req.headers.origin!==url)throw new RequestError(403);
      const parsed=new URL(req.url,url),route=parsed.pathname;
      if(route.startsWith('/api/')) {
        const supplied=req.headers['x-lens-token'];
        if(typeof supplied!=='string' || supplied.length!==token.length || !timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))throw new RequestError(403);
        if(route==='/api/demo' && req.method==='GET') {
          const summary=await loadDemo(parsed.searchParams.get('caseId'),parsed.searchParams.get('variant') || 'before');send(200,remember(summary));return;
        }
        if(req.method!=='POST')throw new RequestError(404);
        const data=await body(req);
        if(route==='/api/scan') {
          const root=data.projectRoot || projectRoot;
          if(typeof root!=='string' || root.length>4096 || !path.isAbsolute(root) || root.includes('\0'))throw new RequestError(400);
          if(scanBusy)throw new RequestError(409);scanBusy=true;
          try {send(200,remember(await (dependencies.scanProject || scanProject)({projectRoot:root,codexHome}),root));}finally{scanBusy=false;}return;
        }
        const record=scans.get(data.scanId);if(!record)throw new RequestError(404);
        if(route==='/api/doctor') {
          if(!record.root)throw new RequestError(400);if(doctorBusy)throw new RequestError(409);doctorBusy=true;
          try {record.summary={...record.summary,doctor:publicDoctor(await (dependencies.runDoctor || runDoctor)({executable:doctorExecutable,cwd:record.root,codexHome}))};send(200,{scanId:data.scanId,summary:record.summary});}finally{doctorBusy=false;}return;
        }
        if(route==='/api/export') {
          if(!['en','zh-CN'].includes(data.locale) || !['markdown','toml'].includes(data.format) || !['user','project'].includes(data.source))throw new RequestError(400);
          const text=data.format==='markdown'?exportMarkdown(record.summary,data.locale):exportToml(record.summary,{locale:data.locale,source:data.source});send(200,{text});return;
        }
        throw new RequestError(404);
      }
      if(req.method!=='GET' || !STATIC.has(route))throw new RequestError(404);
      const [file,type]=STATIC.get(route);let content=await readFile(path.join(ROOT,file),'utf8');
      if(route==='/')content=content.replace('__LENS_TOKEN__',token);
      send(200,content,type);
    }catch(error){if(!res.headersSent)send(error instanceof RequestError?error.status:400,{error:'REQUEST_FAILED'});else res.end();}
  });
  server.requestTimeout=10000;server.headersTimeout=10000;
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  url=`http://127.0.0.1:${server.address().port}`;
  return {server,url,close:()=>new Promise((resolve,reject)=>{server.close(error=>error?reject(error):resolve());server.closeIdleConnections();})};
}
