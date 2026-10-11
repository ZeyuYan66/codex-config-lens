import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProjectPath,getProjectTrust,classifyScriptReference} from '../src/config/paths.mjs';
test('Windows case, Chinese names and separators compare consistently', () => {
  assert.equal(normalizeProjectPath('C:\\项目\\APP','win32'),normalizeProjectPath('c:/项目/app/','win32'));
  const user = {state:'ok',data:{projects:{'C:\\项目\\APP':{trust_level:'untrusted'}}}};
  assert.equal(getProjectTrust(user,'c:/项目/app','win32'),'untrusted');
  assert.equal(getProjectTrust({state:'ok',data:{}},'c:/项目/app','win32'),'unknown');
});
test('drive-rooted and network/device Windows paths require verification',()=>{
  for(const script of ['\\root-relative.mjs','/root-relative.mjs','\\\\example.invalid\\share\\server.mjs','\\\\?\\C:\\server.mjs','\\\\.\\pipe\\server.mjs','C:/server.mjs:extra.mjs'])assert.equal(classifyScriptReference('node',[script],'win32').kind,'needs-verification',script);
});
test('only simple absolute script references are confirmable', () => {
  assert.equal(classifyScriptReference('node',['C:/demo/missing.mjs'],'win32').kind,'absolute-script');
  assert.equal(classifyScriptReference('python3',['C:/demo/run.py'],'win32').kind,'absolute-script');
  for(const [command,args] of [['npx',['some-package']],['python',['-m','package']],['node',['./server.mjs']],['node',['${ROOT}/server.mjs']],['node',['--inspect','C:/demo/run.mjs']],['node',['https://example.invalid/run.mjs']]]) {
    assert.equal(classifyScriptReference(command,args,'win32').kind,'needs-verification');
  }
});
