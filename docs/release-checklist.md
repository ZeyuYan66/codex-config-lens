# Release checklist — v0.1.0

## Local acceptance

- [x] Static source comparison and three before/after demos.
- [x] English / Simplified Chinese dictionaries, UI and exports.
- [x] Shared public-summary boundary and synthetic secret corpus.
- [x] Loopback Host/Origin/token guards, body/path/parse/process limits.
- [x] Browser: 1280px and 390px, 24 scenario variants, eight downloads, language result retention, keyboard focus and a real static scan; zero page errors.
- [x] Four screenshots use only synthetic demo inputs.
- [x] English and Chinese README, MIT license, Windows CI and release notes prepared.
- [x] Clean-copy `npm ci`, all demos/exports, `npm run check` and `npm test`.
- [x] Companion skill validation and independent application check.
- [x] Independent review and important fixes verified by regression tests.

Final local evidence: [verification record](verification.md), 26 tests passed / 1 Windows privilege skip; 32 modules / 106 bilingual keys checked. Screenshot/browser and clean-copy checks repeated after fixes.

## Publication — 2026-10-11

- [x] Owner authorized publication as `ZeyuYan66/codex-config-lens`; the connected GitHub account was verified and the MIT attribution updated.
- [x] Initialize a repository containing only this project; exclude `.work/`, `node_modules/` and personal inputs.
- [x] Review staged file names and contents; only the 59 project files are staged, with synthetic inputs and no parent workspace files.
- [x] Push and confirm [Windows CI succeeds on GitHub](https://github.com/ZeyuYan66/codex-config-lens/actions/runs/38135440750).
- [x] Publish [tag / release `v0.1.0`](https://github.com/ZeyuYan66/codex-config-lens/releases/tag/v0.1.0) using [bilingual notes](releases/v0.1.0.md).
- [x] Add a repository description, six relevant topics and bilingual demo screenshots.

Public repository: [ZeyuYan66/codex-config-lens](https://github.com/ZeyuYan66/codex-config-lens). All 59 uploaded files match the verified local source. The release tag points to `eb5c73a0d7e229de4f3067a94dd460617edc335a`, the commit that passed Windows CI. Later changes to this checklist and the verification record document publication without changing the released application.
