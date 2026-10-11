---
name: codex-config-lens
description: Use when comparing Codex configuration sources, investigating TOML, project trust or local MCP script configuration problems, or preparing a sanitized Codex configuration report.
---

# Codex Config Lens

Use the installed Lens checkout to inspect two configuration sources through its public CLI summary. Answer in the user's language; keep diagnostic codes and actual setting values unchanged.

Read [CLI reference](references/cli.md) for commands, demo/export flags and output meanings. Locate the checkout containing `bin/codex-config-lens.mjs` and its installed dependencies. The copied skill folder does not contain the program. Use a checkout supplied by the user or already known in the conversation; ask for its path if it cannot be found. Confirm the target project from context; ask only when ambiguous. Resolve paths and invoke Node with argument arrays or the platform's literal quoting.

Scan the selected project, or use a synthetic demo when requested. Read only the public JSON summary. Explain `issue`, `review` and `unavailable` separately, naming the source, stable code, safe evidence and next check. An invalid/unavailable source's absent values mean they were not read successfully. A static comparison cannot establish the active settings or model in a current session; unmodeled sources and unknown trust remain uncertainty.

When the user requests sharing, export Markdown or TOML in the requested language. TOML selects one source: use the source requested by the user, or explain that the project source is being chosen when no preference is stated. Preview the sanitized text before saving or sharing. A `model_provider` value is a reference and may need local provider definitions. No raw configuration, raw doctor output, `auth.json`, credentials or MCP arguments belong in the answer.

The CLI scan does not run doctor. For an explicitly requested doctor check, direct the user to the local UI button; preserve unavailable/unknown outcomes. This skill does not install services, authenticate, execute MCP commands or modify configuration. Offer local checks and explain suggested edits; let the user make those edits.

中文使用要点：先定位程序仓库和目标项目，再读取 CLI 公开摘要。按“问题 / 待核对 / 不可用”解释来源、证据和下一步检查；配置未成功读取时，“未设置”不能证明该值不存在。静态对比不能确定当前会话的模型。用户要求分享时才生成对应语言的报告或单一来源模板，先展示预览；不读取认证文件、不自动修复、不执行 MCP。
