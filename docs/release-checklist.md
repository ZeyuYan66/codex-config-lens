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

## Publishing (separate step)

- [x] Owner authorized publication as `ZeyuYan66/codex-config-lens`; the connected GitHub account was verified and the MIT attribution updated.
- [x] Initialize a repository containing only this project; exclude `.work/`, `node_modules/` and personal inputs.
- [x] Review staged file names and contents; only the 59 project files are staged, with synthetic inputs and no parent workspace files.
- [ ] Push and confirm Windows CI succeeds on GitHub.
- [ ] Create tag / release `v0.1.0` using [prepared notes](releases/v0.1.0.md).
- [ ] Add a repository description, topics and demo screenshot.

Local development is verified, and a standalone Git repository is initialized. GitHub repository creation, upload, hosted CI and the release are still pending.
