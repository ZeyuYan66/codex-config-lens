# Codex Config Lens — v0.1 设计

日期：2026-10-11（Asia/Shanghai）

状态：用户于 2026-10-11 确认设计；已实现并完成本地和 GitHub Windows CI 验证，已公开发布 [v0.1.0](https://github.com/ZeyuYan66/codex-config-lens/releases/tag/v0.1.0)。详见 [验证记录](../../verification.md)。
独立项目目录：`codex-config-lens/`

## 1. 目标与用户

用户是一名主要使用 Codex 的学生，希望解决自己配置 AI 工具时反复遇到的问题，并把作品发布到 GitHub，用实际用途、代码质量和演示展示能力。

产品定位：看懂 Codex 配置的来源和差异，解释可确认的问题，生成便于分享的报告。第一版面向 Windows 用户，产品界面、诊断说明、导出报告和公开使用文档均提供简体中文和英文。

English summary: Codex Config Lens is a local tool for understanding Codex configuration sources, explaining confirmed configuration problems, and exporting shareable reports. Version 0.1 targets Windows and provides Simplified Chinese and English interfaces, explanations, reports, and documentation.

成功标准：新用户可以用提供的示例看到一个问题、理解证据、执行建议的检查，并导出报告；作者自己可以用它比较用户配置与项目配置。

## 2. 已核对的能力

- 本机 Codex CLI 为 `0.144.5`，支持 `doctor --json`。
- 实际诊断输出的顶层字段包括 `schemaVersion`、`generatedAt`、`overallStatus`、`codexVersion` 和 `checks`；本机观察到 `checks` 是对象。
- 一次诊断在退出码为 1 时仍输出了可解析 JSON。因此适配器应分别处理“诊断发现问题”和“命令执行或报告解析失败”。本次核对只展示了字段结构，没有保存或展示诊断的个人内容。
- 本机可用 Node.js 为 `v24.19.0`；第一版运行环境要求 Node.js 24 或更新版本。
- 官方配置文档确认存在用户配置、项目配置、profile、命令行等来源，项目配置加载还受项目信任状态影响。

这不是对所有 Codex 版本、所有客户端配置行为或 JSON 子字段的兼容承诺。后续适配需要使用脱敏样例验证。

## 3. 第一版功能与边界

### 配置来源对比

读取用户配置和用户明确选择的项目根目录内的 `.codex/config.toml`。用户配置目录遵循 `CODEX_HOME`；未设置时使用当前用户的 `.codex` 目录。

展示允许显示的字段在两个来源中的值和差异，并解释文档规定的覆盖条件。模型、推理设置、审批设置、沙箱设置和 MCP 配置概览是首批展示内容。

第一版的视图名称为“配置来源对比 / Configuration sources”。它描述已读取的文件，不把静态对比称为“当前会话生效配置”。页面说明命令行覆盖、profile、上级目录配置、组织策略和客户端状态等来源没有完整建模；项目信任状态无法确认时标为待核对。

### 中文与英文诊断卡片

每项诊断有状态、问题标题、证据、下一步检查和参考链接。状态包括已通过、发现问题、待核对和检查不可用。仅发现确定错误才标为错误；未知状态不等于通过。

第一版自有规则覆盖三个演示案例：

1. TOML 语法错误：展示配置来源和解析器能够提供的行列位置，说明如何检查和修正。
2. 项目信任问题：只有读取到明确的未信任状态时才报告该条件；没有足够信息时提示核对，不能直接断定项目配置未加载。
3. MCP 脚本路径不存在：只确认受支持的本地启动形式中、可明确解释的绝对脚本路径。包名、模块名、远程 URL、变量占位符及工作目录未知的相对路径均不作为“文件不存在”的确定错误。

另有用户主动触发的“运行 Codex 诊断 / Run Codex diagnostics”按钮，调用已安装的 CLI。页面加载时不自动运行诊断。doctor 检查的标题和状态可以适配为卡片，但第一版只为已识别的检查提供双语解释；未知检查显示通用的待核对说明，不杜撰翻译和原因。

### 分享报告与配置模板

提供所选语言的 Markdown 报告和最小 TOML 配置模板下载，下载前显示预览。报告包含工具版本、输入范围、已建模与未建模来源、问题代码、解释和参考链接。

模板仅导出这六个配置键：`model`、`model_provider`、`model_reasoning_effort`、`approval_policy`、`sandbox_mode`、`web_search`。只接受预期类型，字符串还需经过长度和疑似敏感值检查；无法安全保留的值改为占位符。模板说明 provider 名称仅是引用，可能需要用户另行配置。

`env`、认证值、请求头、服务地址、MCP 命令参数、自定义 provider 表和不认识的字段不导出。报告不包含配置原文、doctor 原始 JSON 或原始错误消息。路径以 `<CODEX_HOME>`、`<PROJECT>` 等占位符表示；项目名和 MCP 名称在导出中以稳定编号代替。

导出基于白名单的内部摘要生成；敏感值匹配是额外检查，不宣称能识别任意秘密。用户仍能在预览中核对分享内容。

## 4. 中英文要求

- 界面支持 `zh-CN` 与 `en`，顶部提供“中文 / English”切换。
- 首次按浏览器语言选择：中文使用 `zh-CN`，其他语言使用 `en`。用户选择仅在本地保存语言偏好。
- 切换语言不丢失当前扫描结果；报告与模板说明随选择的语言变化。
- 文案存放在两份语言字典中。两个字典必须具有相同键集合；诊断代码和机器可读字段使用稳定的英文标识。
- 配置键、版本号、命令和实际值不随语言切换而改变。
- `README.md` 使用英文，并链接 `README.zh-CN.md`；两份文档提供一致的启动方法、功能边界和示例。
- 配套 skill 提供英文元数据和简洁的双语使用说明，根据用户语言解释结果。

核心文案示例：

| 简体中文 | English |
| --- | --- |
| 配置来源对比 | Configuration sources |
| 开始检查 | Scan configuration |
| 发现问题 | Issue found |
| 待核对 | Needs verification |
| 检查不可用 | Check unavailable |
| 证据 | Evidence |
| 下一步检查 | Next check |
| 导出分享报告 | Export shareable report |
| 此视图展示读取到的配置，可能不完整代表当前会话设置。 | This view shows the configuration files read and may not fully represent the current session settings. |

## 5. 使用流程

1. 用户在项目目录安装依赖并启动程序，打开本地页面。
2. 默认可以选择演示数据；扫描真实配置需要用户点击“开始检查”。
3. 用户输入项目根目录，页面展示读取来源、字段差异和诊断卡片。
4. 用户查看证据和下一步检查，必要时主动运行 Codex 诊断。
5. 用户手动修改自己的配置后重新扫描，核对问题变化。
6. 用户选择报告语言，预览并下载报告或模板。

扫描和导出不修改现有 Codex 配置。第一版不提供自动修复、安装 MCP、账号登录、云端保存或跨工具迁移。

## 6. 技术设计

- 运行时：Node.js 24+，JavaScript ES modules。
- 服务端：Node.js 原生 HTTP、文件系统和子进程 API。
- 界面：原生 HTML、CSS、JavaScript，无前端构建步骤。
- TOML：使用 `smol-toml` 1.9.0，并使用 lockfile 固定依赖；解析选项拒绝危险键，保留大整数信息。配置视图只输出受支持类型。
- 测试：Node.js 原生测试运行器；浏览器交互使用实际页面验证。
- 分工：文件读取、来源对比、规则、doctor 适配、脱敏导出和双语界面各有独立模块。
- 核心扫描与导出不依赖模型 API；配套 skill 使用用户已有的 Codex 环境解释摘要。

本地服务只绑定 `127.0.0.1`，校验 Host 和来源，扫描与诊断请求使用每次启动生成的请求凭证。文件读取接口只读取约定的配置文件，不能作为任意文件读取接口；原始配置和诊断输出不发送到浏览器。

每份配置最多 512 KiB；TOML 解析在可终止的工作线程执行，最多 2 秒。doctor 子进程最多运行 30 秒，输出最多 2 MiB，不拼接 shell 命令，也不执行配置里声明的 MCP 命令。超限或超时产生可解释的不可用状态。

在 Codex 版本不支持 doctor、JSON 无法解析或报告结构不支持时，保留静态扫描功能，明确显示 doctor 检查不可用。不会从一个缺失结果推断环境健康。

## 7. 配套 skill

拟定名称：`codex-config-lens`。

触发场景：用户要求比较 Codex 配置、理解配置相关报错或生成分享报告。

流程：确认目标项目，调用本项目的扫描命令，读取已脱敏摘要，用用户语言解释确定问题和待核对项，按用户要求生成报告。说明修改建议后由用户自行修改；这份 skill 不把建议升级为自动配置写入。

安装和使用文档必须能让用户先单独运行程序，再使用 skill。程序、skill 和示例共同放在一个 GitHub 项目中。

## 8. 验收

- 三个演示案例在中文与英文界面都能运行，问题代码、状态、证据引用和建议含义一致。
- 语言切换保留扫描结果，语言字典无缺失键，长英文和窄窗口下按钮与卡片可正常使用。
- TOML 错误、配置缺失、权限拒绝、未知 trust 状态、相对路径、doctor 不可用和超时都有确定的输出状态。
- 有效 doctor JSON 即使伴随非零退出码也可展示；未知结构不会被标为通过。
- 配置来源对比不把未建模来源或未知信任状态错误表述为当前会话已生效值。
- 使用含假密钥、假 token、用户目录、私有 URL、MCP 参数和原始错误文本的测试输入，确认浏览器响应和导出均不包含这些内容。
- 所有检查不修改测试输入文件；在临时目录中验证完整扫描和导出流程。
- 英文和中文 README 的启动方法在干净目录中可复现；演示模式不要求安装 Codex 或连接真实账号。

## 9. 展示与发布

第一版交付包括程序、配套 skill、三个脱敏故障示例、中英文 README、截图或短动图、MIT 许可证和自动化检查。

展示主线：选择示例 → 查看配置来源 → 打开问题卡片 → 查看正确示例 → 切换英文 → 导出报告。仓库介绍明确这是第三方项目，与 OpenAI 无隶属关系。

完成验证后再创建独立 GitHub 仓库和发布 v0.1.0。发布仓库只包含本项目，不把当前工作区中的成本程序、硬件资料或个人配置一并提交。

## 10. 后续顺序

用户已确认这份设计。下一步编写并审阅具体实现计划，然后依次完成扫描与诊断、双语页面、导出与 skill、验证和发布材料。

设计阶段记录：当时只创建了设计文档，未安装依赖、编写产品代码或发布。当前工作区 Git 仓库没有历史提交，存在多个无关项目；开发已在独立目录完成，仓库初始化与发布仍安排在单独的发布阶段。

## 11. 参考

- [OpenAI：Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)
- [OpenAI：Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [OpenAI：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [smol-toml：官方仓库与使用说明](https://github.com/squirrelchat/smol-toml)
- [smol-toml：已修复版本的官方安全公告](https://github.com/advisories/GHSA-7w5x-hrqm-74c2)
- 本机 `codex --version`、`codex doctor --help` 与 `doctor --json` 的字段结构核对（2026-10-11）。
