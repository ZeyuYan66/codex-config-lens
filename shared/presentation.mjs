import {t} from './i18n.mjs';
export function settingText(summary,key,source,locale) {
  if(summary.sources.find(item=>item.id===source)?.state!=='ok')return t(locale,'notRead');
  const value=summary.settings[key][source];
  return value.kind==='value'?value.value:t(locale,`kind_${value.kind}`);
}
