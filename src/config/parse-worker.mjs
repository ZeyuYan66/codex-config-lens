import {parentPort, workerData} from 'node:worker_threads';
import {parse} from 'smol-toml';
try {
  const data = parse(workerData, {unsafeKeyBehaviour:'throw', integersAsBigInt:'asNeeded'});
  parentPort.postMessage({state:'ok',data});
} catch (error) {
  const location = {};
  if (Number.isSafeInteger(error.line) && error.line > 0) location.line = error.line;
  if (Number.isSafeInteger(error.column) && error.column > 0) location.column = error.column;
  parentPort.postMessage({state:'invalid',reasonCode:'CONFIG_SYNTAX_ERROR',location});
}
