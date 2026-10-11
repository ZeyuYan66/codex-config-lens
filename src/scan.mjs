import {loadInputs} from './config/read.mjs';
import {analyzeInputs} from './config/analyze.mjs';
import {toPublicSummary} from './report/public-summary.mjs';
export async function scanProject(options,dependencies={}) {
  return toPublicSummary(await analyzeInputs(await loadInputs(options,dependencies),dependencies));
}
