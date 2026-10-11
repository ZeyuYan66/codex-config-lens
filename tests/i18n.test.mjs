import test from 'node:test';import assert from 'node:assert/strict';
import en from '../public/locales/en.mjs';import zh from '../public/locales/zh-CN.mjs';
import {t,selectLocale} from '../shared/i18n.mjs';
test('dictionaries match and language preference is explicit',()=>{
  assert.deepEqual(Object.keys(en).sort(),Object.keys(zh).sort());
  assert.equal(selectLocale('zh-TW',null),'zh-CN');assert.equal(selectLocale('en-US','zh-CN'),'zh-CN');assert.equal(selectLocale('en-US','invalid'),'en');
  for(const key of Object.keys(en)) {assert.ok(t('en',key));assert.ok(t('zh-CN',key));}
});
