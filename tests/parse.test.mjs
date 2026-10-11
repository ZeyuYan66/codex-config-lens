import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {parseConfig} from '../src/config/parse.mjs';
test('real TOML parses strings and preserves large integers', async () => {
  const r = await parseConfig('model = "demo"\nn = 9007199254740993');
  assert.equal(r.state, 'ok'); assert.equal(r.data.model, 'demo');
  assert.equal(r.data.n, 9007199254740993n);
});
test('malformed and dangerous keys return bounded metadata only', async () => {
  for (const text of ['model = "fake-secret', '__proto__.x = 1', 'constructor.prototype.x = 1']) {
    const r = await parseConfig(text); assert.equal(r.state, 'invalid');
    assert.ok(!JSON.stringify(r).includes('fake-secret'));
  }
});
test('timeout terminates an actual hanging worker', async () => {
  let worker;
  const r = await parseConfig('x = 1', {timeoutMs:20, workerFactory: () => {
    worker = new Worker('setInterval(() => {}, 1000)', {eval:true}); return worker;
  }});
  assert.equal(r.reasonCode, 'PARSE_TIMEOUT'); assert.equal(worker.threadId, -1);
});
