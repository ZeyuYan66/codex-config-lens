import {Worker} from 'node:worker_threads';
export async function parseConfig(text, {timeoutMs = 2000, workerFactory} = {}) {
  if (typeof text !== 'string' || Buffer.byteLength(text) > 524288) return {state:'unavailable',reasonCode:'INPUT_TOO_LARGE'};
  return new Promise(resolve => {
    let worker, timer, settled = false;
    const finish = async result => {
      if (settled) return; settled = true; clearTimeout(timer);
      if (worker) { worker.removeAllListeners(); await worker.terminate().catch(() => {}); }
      resolve(result);
    };
    try {
      worker = workerFactory ? workerFactory(text) : new Worker(new URL('./parse-worker.mjs',import.meta.url), {workerData:text});
      timer = setTimeout(() => finish({state:'unavailable',reasonCode:'PARSE_TIMEOUT'}),timeoutMs);
      worker.once('message',finish);
      worker.once('error',() => finish({state:'unavailable',reasonCode:'PARSE_FAILED'}));
      worker.once('exit',() => finish({state:'unavailable',reasonCode:'PARSE_FAILED'}));
    } catch { void finish({state:'unavailable',reasonCode:'PARSE_FAILED'}); }
  });
}
