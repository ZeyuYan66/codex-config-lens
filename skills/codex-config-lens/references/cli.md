# CLI reference

Requires a Lens checkout with `npm ci` already completed and Node.js 24+. Run from that checkout, or use the absolute path to its `bin/codex-config-lens.mjs`. The skill directory alone is not executable.

```powershell
node bin/codex-config-lens.mjs scan --project "C:\my-project" --format json
node bin/codex-config-lens.mjs export --project "C:\my-project" --format markdown --lang en --source user
node bin/codex-config-lens.mjs export --project "C:\my-project" --format toml --lang zh-CN --source project
```

`--codex-home <path>` selects a user config directory instead of `CODEX_HOME` or the default home `.codex`. Output is stdout; no configuration is written. Exit 0 indicates report production, not that every check passed. Invalid arguments exit 1 with a fixed code. Inspect the output before saving it.

Both **scan and export** support offline demos. No real configuration or Codex account is read:

```powershell
node bin/codex-config-lens.mjs scan --demo untrusted-project --variant before --format json
node bin/codex-config-lens.mjs export --demo untrusted-project --variant after --format toml --lang en --source project
```

Demo IDs: `syntax-error`, `untrusted-project`, `missing-script`. Variants: `before` (default), `after`. “After” uses synthetic corrected input or simulated script existence, not a repair to the user's environment.

The summary has `schemaVersion: 1`, source states, six settings' user/project values, findings, doctor state and unmodeled sources. Finding statuses: `pass`, `issue`, `review`, `unavailable`. Display value kinds: `value`, `absent`, `redacted`, `unsupported`. `absent` means unset only for a successfully parsed source. Paths are placeholders; evidence includes safe line/column and numbered MCP/doctor checks.

Static scans omit CLI flags, profile, ancestor-project, organization and client-state inputs. Templates do not merge sources. Doctor is not run by scan or export; launch `node bin/codex-config-lens.mjs serve` and use the button for a requested diagnostic run.
