import en from '../public/locales/en.mjs';
import zhCN from '../public/locales/zh-CN.mjs';
export const dictionaries = {en,'zh-CN':zhCN};
export function selectLocale(browserLanguage,storedPreference) {
  return ['en','zh-CN'].includes(storedPreference) ? storedPreference : /^zh(?:-|$)/i.test(browserLanguage || '') ? 'zh-CN' : 'en';
}
export function t(locale,key,params = {}) {
  const value = (dictionaries[locale] || en)[key];
  if(typeof value!=='string') throw new Error('TRANSLATION_MISSING');
  return value.replace(/\{(\w+)\}/g,(_,name)=>String(params[name] ?? ''));
}
