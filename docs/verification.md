# Local verification — 2026-10-11

Node.js 24.19.0, Windows. No GitHub release or hosted CI run yet.

- Automated suite: 27 tests, 26 passed, 0 failed, 1 skipped because Windows symbolic-link privilege was unavailable. Injected real-path containment tests passed.
- Syntax and bilingual dictionary checks: 32 modules, 106 matching translation keys.
- Clean project copy without node_modules: offline `npm ci`, `npm run check`, `npm test`, `npm start`, all three demo scans and six bilingual Markdown exports passed.
- Actual isolated Chromium: English/简体中文, 1280px/390px, 24 demo variants, eight preview/downloads, result retention on language changes, keyboard focus, no page errors or document overflow, and a physical static scan. Screenshots contain synthetic inputs only.
- Official skill-creator `quick_validate.py`: passed using Python UTF-8 mode. A fresh agent used the skill/reference to scan a demo and export English TOML without reading implementation code; it preserved uncertainty about the session model.
- Independent whole-project review: four Important diagnostic issues found and fixed with failing regression tests followed by passing tests. Provider-template warning was promoted for correctness of the shared artifact and fixed. A separate synthetic Windows probe confirmed executable shadowing; native absolute-path resolution now excludes the selected project directory.

Regression checks cover unread source presentation in reports/templates/UI, Codex home propagation to the child environment, no filesystem probes for Windows root-relative/UNC/device paths, unavailable empty doctor reports, provider-template warning, and executable resolution.

Real doctor compatibility remains limited to the previously observed Codex CLI 0.144.5 schema. Automated subprocess tests use synthetic children and messages, and never run real MCP commands or require an account. Native executable resolution is tested; `.cmd`/`.bat` shims remain unsupported. Arbitrary-secret detection, hostile active local processes, full active-session resolution and non-Windows process-tree behavior are outside the documented scope.

The parent workspace has unrelated projects and no commits. Publication is authorized for `ZeyuYan66/codex-config-lens`; a separate Git repository is initialized inside the project directory. GitHub upload, hosted CI and the release are still pending. The ignored local execution ledger is retained until publication supplies durable history.
