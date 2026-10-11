# Codex Config Lens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

执行状态：六个任务及独立审查修复已完成，本地验证见 [verification.md](../../verification.md)。GitHub 发布另行处理。

**Goal:** 实现 Windows 上的 Codex 配置来源对比、双语诊断与脱敏导出，提供可独立使用的程序、skill 和故障演示。

**Architecture:** Node.js 本地服务负责有边界的读取、分析和诊断调用，浏览器只接收经过白名单处理的摘要。规则输出稳定代码，界面和导出共享中英文词典。CLI 与网页共用分析和导出模块，doctor 适配可独立降级。

**Tech Stack:** Node.js 24+、JavaScript ES modules、原生 HTTP/HTML/CSS、smol-toml 1.9.0、node:test。

**Spec:** [已确认的设计](../specs/2026-10-11-codex-config-lens-design.md)。所有文件路径相对于 `codex-config-lens/`，操作目录固定为本项目目录。

## Global Constraints

- 运行时：Node.js 24+，JavaScript ES modules。
- TOML：使用 `smol-toml` 1.9.0，并使用 lockfile 固定依赖；解析选项拒绝危险键，保留大整数信息。配置视图只输出受支持类型。
- 界面支持 `zh-CN` 与 `en`，顶部提供“中文 / English”切换。
- 文案存放在两份语言字典中。两个字典必须具有相同键集合；诊断代码和机器可读字段使用稳定的英文标识。
- `README.md` 使用英文，并链接 `README.zh-CN.md`；两份文档提供一致的启动方法、功能边界和示例。
- 每份配置最多 512 KiB；TOML 解析在可终止的工作线程执行，最多 2 秒。doctor 子进程最多运行 30 秒，输出最多 2 MiB，不拼接 shell 命令，也不执行配置里声明的 MCP 命令。
- 本地服务只绑定 `127.0.0.1`，校验 Host 和来源，扫描与诊断请求使用每次启动生成的请求凭证。
- 报告不包含配置原文、doctor 原始 JSON 或原始错误消息。
- 扫描和导出不修改现有 Codex 配置。第一版不提供自动修复、安装 MCP、账号登录、云端保存或跨工具迁移。
- 第一版的视图名称为“配置来源对比 / Configuration sources”；不把静态对比称为当前会话生效配置。
- 模板仅导出：`model`、`model_provider`、`model_reasoning_effort`、`approval_policy`、`sandbox_mode`、`web_search`。

## Review Focus

1. 秘密出现在任意值、解析错误和 doctor 消息中：原始数据只能留在后端，浏览器、CLI、报告和模板都必须走同一公开摘要边界。归属 Task 4/5。
2. Windows 中文目录、大小写差异、符号链接或 junction：路径比较需要统一，配置的解析后真实路径不得逃出指定根目录。归属 Task 1/2。
3. 超大、恶意或包含大整数的 TOML：不阻塞主线程，不泄漏错误原文，不发生危险键合并。归属 Task 1。
4. 缺失 trust、profile 或 CLI 覆盖信息：保留不确定性，静态差异不意味着当前会话已经生效。归属 Task 2。
5. doctor 的非零退出码、报告版本变化、截断与超时：诊断结果和命令故障分开，未知情况不能变成通过。归属 Task 3。

## 文件与共享数据约定

| 文件 | 职责 |
| --- | --- |
| `src/config/read.mjs`, `parse.mjs`, `parse-worker.mjs` | 有边界的读取与解析 |
| `src/config/analyze.mjs`, `src/config/paths.mjs` | 来源对比、trust 与 MCP 规则 |
| `src/doctor/run.mjs`, `src/doctor/normalize.mjs` | doctor 执行与结构适配 |
| `src/report/public-summary.mjs`, `export.mjs` | 公开摘要、Markdown 与 TOML 导出 |
| `src/scan.mjs`, `bin/codex-config-lens.mjs` | 共用工作流与 CLI |
| `src/server.mjs`, `src/demo.mjs` | 本地接口与离线示例 |
| `shared/i18n.mjs`, `public/locales/en.mjs`, `zh-CN.mjs` | 服务端和浏览器共享翻译 |
| `public/index.html`, `app.mjs`, `styles.css` | 双语界面 |
| `examples/`, `tests/`, `skills/`, `docs/` | 示例、验证、配套 skill 和说明 |

私有 `ConfigInput`：`{id: 'user'|'project', state: 'ok'|'missing'|'invalid'|'unavailable', path, data?, location?, reasonCode?}`。`data` 为解析后的对象，不可序列化到公开接口。`location` 仅包含正整数 `line`、`column`。

私有 `ScanAnalysis`：`{inputs, settings, findings, trust, mcpCount, unmodeledSources}`；仅由 Task 4 转为公开数据。

公开 `Finding`：`{code, status: 'pass'|'issue'|'review'|'unavailable', sourceId, evidence: {line?, column?, serverIndex?}, referenceKey}`。不包含原始消息、文件名、服务名、URL 或命令参数。

公开 `ScanSummary`：`{schemaVersion: 1, toolVersion: '0.1.0', sources, settings, findings, doctor, unmodeledSources}`。`sources` 只有固定 ID、状态和占位路径；`settings` 只有六个允许键及用户/项目来源的展示值；`doctor` 只含经过验证的版本、状态和公开检查。显示值采用 `{kind: 'value'|'redacted'|'unsupported'|'absent', value?}`。

所有未知错误通过固定原因代码表示；公开错误不使用 `error.message` 或任意输入的字符串。

## Task 1: 配置读取与限时 TOML 解析

**Files:** 创建 `package.json`, `package-lock.json`, `.gitignore`, `src/config/read.mjs`, `parse.mjs`, `parse-worker.mjs`, `tests/read.test.mjs`, `tests/parse.test.mjs`, `tests/helpers/project.mjs`。

**Interfaces:**
- `resolveCodexHome(env, homeDir): string`：遵循 `CODEX_HOME`，否则使用 `homeDir/.codex`。
- `parseConfig(text, {timeoutMs = 2000, workerFactory?}): Promise<{state, data?, location?, reasonCode?}>`。
- `readConfig({id, configPath, allowedRoot}, {readFile?, realpath?, stat?} = {}): Promise<ConfigInput>`。
- `loadInputs({codexHome, projectRoot}, dependencies?): Promise<{user, project, codexHome, projectRoot}>`：仅读取两个约定文件。
- 测试辅助 `createProject({userToml = '', projectToml = ''}): Promise<{root, codexHome, cleanup}>`，只在系统临时目录创建模拟输入。

- [x] **1. 写失败测试。** 除下列断言，还覆盖 `CODEX_HOME`、缺失文件、注入的 EACCES、中文目录与外部符号链接。无法创建链接的平台明确 skip 该环境用例，不跳过路径约束的注入测试。

```js
assert.equal((await parseConfig('model = "demo"')).data.model, 'demo');
assert.equal((await parseConfig('model = "fake-secret')).state, 'invalid');
assert.equal((await parseConfig('__proto__.x = 1')).state, 'invalid');
assert.equal((await parseConfig('n = 9007199254740993')).data.n, 9007199254740993n);
assert.equal((await readConfig({id: 'user', configPath: oversizedPath, allowedRoot})).reasonCode, 'INPUT_TOO_LARGE');
assert.equal((await readConfig({id: 'project', configPath: escapingLink, allowedRoot})).reasonCode, 'PATH_OUTSIDE_ROOT');
assert.equal((await parseConfig('x = 1', {timeoutMs: 20, workerFactory: hangingWorker})).reasonCode, 'PARSE_TIMEOUT');
```

`oversizedPath` 是临时目录中 524289 字节的文件；`escapingLink` 指向根目录之外的模拟文件；`hangingWorker` 返回同测试中新建的可终止 Worker，从不发送结果。断言超时后 Worker 已结束、计时器已清理。使用 `t.after(cleanup)` 释放临时数据。

- [x] **2. 运行 `node --test tests/read.test.mjs tests/parse.test.mjs`，确认失败来自模块或接口未实现。**
- [x] **3. 实现上述接口。** 固定 smol-toml 1.9.0；使用 `unsafeKeyBehaviour: 'throw'`、`integersAsBigInt: 'asNeeded'`。读取前校验真实路径和文件大小，解析后只保存安全的错误位置，不保存原始异常消息。
- [x] **4. 重跑测试并核对输入文件内容和修改时间未变化。** 要求全部通过、进程能正常退出、没有存活 Worker。

## Task 2: 来源比较与三个故障规则

**Files:** 创建 `src/config/paths.mjs`, `src/config/analyze.mjs`, `tests/analyze.test.mjs`, `tests/paths.test.mjs`。

**Interfaces:**
- 消费 Task 1 的 `loadInputs` 和 `ConfigInput`。
- `normalizeProjectPath(path, platform = process.platform): string`：Windows 使用规范化分隔符和大小写比较。
- `getProjectTrust(userInput, projectRoot, platform?): 'trusted'|'untrusted'|'unknown'`。
- `analyzeInputs(inputs, {fileExists, platform = process.platform}): Promise<ScanAnalysis>`。
- `classifyScriptReference(command, args, platform?): {kind: 'absolute-script'|'needs-verification', path?}`。

- [x] **1. 写失败测试。** 包含以下断言；比较结果只报告两个文件的关系，保留全部未建模来源标记。

```js
assert.equal(getProjectTrust(userWithoutTrust, projectRoot, 'win32'), 'unknown');
assert.equal(getProjectTrust(userExplicitlyUntrusted, projectRoot, 'win32'), 'untrusted');
assert.equal(normalizeProjectPath('C:\\项目\\APP', 'win32'), normalizeProjectPath('c:/项目/app', 'win32'));
assert.equal(classifyScriptReference('node', ['C:/demo/missing.mjs'], 'win32').kind, 'absolute-script');
for (const [command, args] of [['npx', ['some-package']], ['python', ['-m', 'package']], ['node', ['./server.mjs']], ['node', ['${ROOT}/server.mjs']]]) {
  assert.equal(classifyScriptReference(command, args, 'win32').kind, 'needs-verification');
}
assert.ok((await analyzeInputs(invalidInputs, {fileExists: async () => false})).findings.some(f => f.code === 'CONFIG_SYNTAX_ERROR'));
assert.ok((await analyzeInputs(missingScriptInputs, {fileExists: async () => false, platform: 'win32'})).findings.some(f => f.code === 'MCP_SCRIPT_NOT_FOUND'));
```

输入对象均按 Task 1 的私有结构在测试内构造；显式 untrusted 的用户数据使用 `projects[projectRoot].trust_level = 'untrusted'`。另断言未知 trust 产生 `PROJECT_TRUST_UNKNOWN/review`，明确未信任产生 `PROJECT_NOT_TRUSTED/review`，不会声称当前会话配置未生效。

- [x] **2. 运行 `node --test tests/analyze.test.mjs tests/paths.test.mjs` 并确认预期失败。**
- [x] **3. 实现规则和比较。** 只为无额外启动标志的 `node <absolute .js/.mjs/.cjs>` 与 `python|python3 <absolute .py>` 确认脚本引用；其他形式待核对。可确认不存在时产生 `MCP_SCRIPT_NOT_FOUND/issue`。路径访问错误产生检查不可用。将解析失败映射为 `CONFIG_SYNTAX_ERROR/issue`，缺失文件为 review，读取/大小/超时问题为 unavailable。
- [x] **4. 重跑 Task 1/2 测试。** 确认绝不启动 MCP 命令；`unmodeledSources` 固定包含 `cli`, `profile`, `ancestor-project`, `organization`, `client-state`。

## Task 3: doctor 的安全执行与降级

**Files:** 创建 `src/doctor/run.mjs`, `normalize.mjs`, `tests/doctor.test.mjs`, `tests/helpers/fake-doctor.mjs`, `tests/fixtures/doctor-v1.json`。

**Interfaces:**
- `normalizeDoctor({stdout, exitCode, timedOut = false, outputExceeded = false}): DoctorSummary`。
- `runDoctor({executable = 'codex', cwd, timeoutMs = 30000, maxOutputBytes = 2097152}, dependencies?): Promise<DoctorSummary>`。
- `DoctorSummary` 为 `{state: 'not-run'|'ready'|'unavailable', codexVersion?, checks: Finding[], reasonCode?}`，只含公开数据。

已核对 schemaVersion 为 1；`checks` 对象的条目包含 `id`, `category`, `status`, `summary`, `details`, `remediation`, `durationMs`，部分带 `issues`。只读取结构、受支持状态和已识别 ID；丢弃原始消息与动态 ID。第一版为 `installation` 提供具体双语解释；其他 ID 用 `DOCTOR_CHECK_UNRECOGNIZED/review` 和稳定检查序号表示。

- [x] **1. 写失败测试。** fixture 完全使用合成数据；不得复制本机诊断内容。

```js
assert.equal(normalizeDoctor({stdout: JSON.stringify(v1Fixture), exitCode: 1}).state, 'ready');
assert.equal(normalizeDoctor({stdout: '{', exitCode: 0}).reasonCode, 'DOCTOR_INVALID_JSON');
assert.equal(normalizeDoctor({stdout: JSON.stringify({...v1Fixture, schemaVersion: 2}), exitCode: 0}).reasonCode, 'DOCTOR_UNSUPPORTED_SCHEMA');
assert.equal(normalizeDoctor({stdout: '', exitCode: 0, timedOut: true}).reasonCode, 'DOCTOR_TIMEOUT');
assert.equal(normalizeDoctor({stdout: '', exitCode: 0, outputExceeded: true}).reasonCode, 'DOCTOR_OUTPUT_LIMIT');
assert.equal(normalizeDoctor({stdout: JSON.stringify(unknownCheckFixture), exitCode: 0}).checks[0].status, 'review');
assert.ok(!JSON.stringify(normalizeDoctor({stdout: JSON.stringify(secretMessageFixture), exitCode: 1})).includes('fake-secret'));
```

- [x] **2. 运行 `node --test tests/doctor.test.mjs` 并确认失败。**
- [x] **3. 实现适配器与 runner。** `spawn` 固定参数 `['doctor', '--json']`、`shell: false`；stdout 与 stderr 合计按字节限量。用自建 Node 假子进程测试挂起与超量情况，确认进程回收。识别安装检查状态：`pass|passed|ok → pass`、`fail|failed|error → issue`、`warn|warning|skip|skipped → review`；其他值为 review。不支持命令、进程故障和未知结构返回 unavailable，不中断静态扫描。
- [x] **4. 重跑测试，确认命令参数、cwd 与超时/输出限制生效，任何异常都不回显 stderr。**

## Task 4: 统一公开摘要、双语导出与 CLI

**Files:** 创建 `src/report/public-summary.mjs`, `export.mjs`, `src/scan.mjs`, `bin/codex-config-lens.mjs`, `shared/i18n.mjs`, `public/locales/en.mjs`, `zh-CN.mjs`, `scripts/check.mjs`, `tests/report.test.mjs`, `tests/i18n.test.mjs`, `tests/cli.test.mjs`。

**Interfaces:**
- 消费 Task 2 的 `ScanAnalysis` 和 Task 3 的 `DoctorSummary`。
- `toPublicSummary(analysis, doctor = {state: 'not-run', checks: []}): ScanSummary`，是唯一外部序列化入口。
- `scanProject({projectRoot, codexHome}, dependencies?): Promise<ScanSummary>`；默认不调用 doctor。
- `t(locale, key, params = {}): string`、`selectLocale(browserLanguage, storedPreference): 'en'|'zh-CN'`。
- `exportMarkdown(summary, locale): string`。
- `exportToml(summary, {locale, source: 'user'|'project'}): string`；显式选择来源，不合并出所谓会话生效配置。
- CLI：`scan --project <path> --format json`，以及 `export --project <path> --format markdown|toml --lang en|zh-CN --source user|project`。默认只写 stdout，不读取认证文件或自动写配置；语法/参数错误输出固定原因代码。

- [x] **1. 写失败测试。** 用含 `sk-fake-secret`, `fake-token-123`, `C:/Users/private-person`, `https://private.invalid`, MCP 参数和假错误消息的输入构造泄漏语料。

```js
const summary = toPublicSummary(secretAnalysis, secretDoctorSummary);
for (const output of [JSON.stringify(summary), exportMarkdown(summary, 'en'), exportMarkdown(summary, 'zh-CN'), exportToml(summary, {locale: 'en', source: 'user'})]) {
  for (const secret of secretCorpus) assert.ok(!output.includes(secret));
}
assert.deepEqual(Object.keys(en).sort(), Object.keys(zhCN).sort());
assert.equal(selectLocale('zh-TW', null), 'zh-CN');
assert.equal(selectLocale('en-US', 'zh-CN'), 'zh-CN');
assert.equal(selectLocale('en-US', 'invalid'), 'en');
assert.match(exportMarkdown(summary, 'en'), /Configuration sources/);
assert.match(exportMarkdown(summary, 'zh-CN'), /配置来源对比/);
```

还需断言：导出模板解析后的键是六项白名单的子集；异常类型、大整数和超长值不会被隐式转换；所有原始路径、doctor ID、错误文本和未知键被丢弃。CLI 集成测试通过子进程运行，stdout 是可解析公开 JSON，stderr 没有输入内容。

- [x] **2. 运行 `node --test tests/report.test.mjs tests/i18n.test.mjs tests/cli.test.mjs` 并确认预期失败。**
- [x] **3. 实现接口与词典。** 六项设置仅接受不超过 128 字符的字符串；疑似密钥、URL 或绝对路径替换为 redacted 占位值。模板只保留可用的 value；其他种类使用注释提示，避免把 `<REDACTED>` 作为可运行设置写入。使用固定来源 ID、MCP 序号和官方链接表；结果只保存语言无关数据，语言切换不重新扫描。
- [x] **4. 运行全部现有测试。** 模板须能再次被 smol-toml 解析，报告包含未建模来源、工具版本和 provider 引用说明。设置 npm `test`、`start` 与 `check` 脚本；`check` 检查源文件语法、词典键集合和缺失翻译。

## Task 5: 本地服务、离线演示与双语页面

**Files:** 创建 `src/server.mjs`, `src/demo.mjs`, `public/index.html`, `app.mjs`, `styles.css`, `examples/syntax-error/`, `examples/untrusted-project/`, `examples/missing-script/`, `tests/server.test.mjs`, `tests/demo.test.mjs`。扩充两份词典和 CLI 的 `serve`、`--demo` 支持。

**Interfaces:**
- `createLensServer({port = 4178, projectRoot?, codexHome?, doctorExecutable?}, dependencies?): Promise<{server, url, close}>`。
- `loadDemo(caseId, variant: 'before'|'after' = 'before'): Promise<ScanSummary>`；固定三个 ID：`syntax-error`, `untrusted-project`, `missing-script`。
- 页面起始只加载 demo 选项；真实扫描和 doctor 均由点击触发。
- API：`POST /api/scan {projectRoot}`；`POST /api/doctor {scanId}`；`POST /api/export {scanId, locale, format, source}`；`GET /api/demo?caseId=...&variant=...`。
- 所有 API 返回的数据经过 Task 4 边界。服务端仅在内存保存 scanId 与私有项目上下文，用于 doctor 的 cwd；API 不接受可执行文件路径或任意读文件名。

- [x] **1. 写失败测试。** 服务监听测试端口 `0`，每次测试使用关闭钩子；恶意 Host、Origin、缺失凭证、路径穿越和跨界请求必须被拒绝。

```js
assert.equal((await request({host: 'evil.invalid', token})).status, 403);
assert.equal((await request({origin: 'https://evil.invalid', token})).status, 403);
assert.equal((await request({origin: 'null', token})).status, 403);
assert.equal((await request({token: ''})).status, 403);
assert.equal((await getStatic('/../package.json')).status, 404);
assert.equal((await postExport({scanId: 'unknown', locale: 'en', format: 'markdown', source: 'user'})).status, 404);
assert.ok(!(await scanSecretFixture()).body.includes('fake-secret'));
for (const [id, code] of [['syntax-error', 'CONFIG_SYNTAX_ERROR'], ['untrusted-project', 'PROJECT_NOT_TRUSTED'], ['missing-script', 'MCP_SCRIPT_NOT_FOUND']]) {
  assert.ok((await loadDemo(id, 'before')).findings.some(f => f.code === code));
  assert.ok(!(await loadDemo(id, 'after')).findings.some(f => f.code === code));
}
```

HTTP 测试的 request/getStatic/postExport/scanSecretFixture 为该测试文件的 fetch 封装，不是产品接口。demo 在内存中模拟文件存在性，复用 Task 1/2 的解析和规则；不读取用户文件、不运行 doctor。CI 无需 Codex。

- [x] **2. 运行 `node --test tests/server.test.mjs tests/demo.test.mjs` 并确认失败。**
- [x] **3. 实现服务和页面。** Host 只接受监听端口上的 `127.0.0.1`；Origin 只接受本服务地址或非浏览器请求中缺失的 Origin。每次启动生成 32 字节请求凭证，以同源页面传给 UI，API 用请求头校验；不启用跨域。请求体最多 32 KiB。静态文件只从固定路由表发送。
- [x] **4. 做界面与交互。** 使用 `textContent` 显示值；按来源对比、问题卡片、报告预览顺序布局。支持语言切换、before/after demo、加载状态、失败提示、预览与下载；localStorage 只保存语言。项目输入标签说明仅查看指定根目录的配置文件。
- [x] **5. 用实际浏览器验证。** 运行 `npm start`，在 1280px 和 390px 宽度验证两种语言、三个 before/after 示例、键盘操作、导出和一次真实静态扫描。语言切换不丢结果，英文不遮挡按钮；捕获截图写入 `docs/screenshots/`。所有自动化测试和 `npm run check` 通过。

## Task 6: skill、双语说明与发布材料

**Files:** 创建 `skills/codex-config-lens/SKILL.md`, `skills/codex-config-lens/references/cli.md`, `README.md`, `README.zh-CN.md`, `LICENSE`, `.github/workflows/ci.yml`, `docs/release-checklist.md`；使用 Task 5 的演示截图。

**Interfaces:** 消费既有 CLI、JSON 摘要和导出命令，不再增加另一套扫描逻辑。

- [x] **1. 验证干净目录中的交付。** 将项目复制到不含 node_modules 的临时目录，运行 `npm ci`，再对三个 ID 分别运行 `node bin/codex-config-lens.mjs scan --demo <caseId> --format json`。预期退出码为 0、公开 JSON schemaVersion 为 1、三个示例出现对应代码；分别使用 `export --demo <caseId> --format markdown --lang en|zh-CN --source user` 验证双语导出。临时目录中的模拟配置内容在运行前后相同。这是发布验证，不为文档制造失败测试。
- [x] **2. 创建 skill。** 先读取适用的 skill-creator 与 writing-skills 指引。英文 name/description 明确用于 Codex 配置对比、配置报错解释和分享报告；提供简洁的中英文步骤。使用 Task 4 的 CLI 命令，不安装其他服务、不读取 auth.json、不自动修改配置。检查摘要先区分 issue/review/unavailable，再解释；用户要求分享时才生成报告。按创建指引校验结构和引用。
- [x] **3. 写中英文 README。** 两份都包括 Node.js 24+、`npm ci`、`npm start`、CLI 用法、三个 demo、截图、支持边界、导出预览和 skill 安装方法；英文为首页。明确第三方项目、原始配置不上传及核心程序不调用模型 API。许可证采用 MIT，版权年份 2026；署名在发布时根据仓库拥有者核对。
- [x] **4. 创建 Windows CI。** `windows-latest`、Node.js 24、`npm ci`、`npm run check`、`npm test`，全程使用合成配置和离线 demo，不需要账号、密钥或已安装 Codex。
- [x] **5. 运行 `npm run check`、`npm test` 与干净目录启动验证。** 修复实际失败后只重跑受影响检查；最终核对功能、双语文档和截图一致。完成发布清单，准备 `v0.1.0` 英文发行说明及中文摘要。

GitHub 创建与公开发布在开发验收后处理，先核对目标账号、仓库名与署名。本轮计划不创建仓库、不推送或发布。提交只限本项目，不包含当前工作区的其他未跟踪文件和个人配置。

## 检查点与执行方式

每个任务通过验证后记录结果和完成状态；若使用独立仓库，在该仓库中按任务提交。当前父目录没有历史提交且混有其他项目，不能对父目录执行 `git add .`；独立仓库整理时也不要移动或删除其他项目。

推荐由当前助手在本聊天按 Task 1–6 顺序直接实现：模块有依赖关系，第一版范围适合保持一份连续上下文。若用户选择子代理方式，再按相应 skill 分派实现与审查；本轮没有启动子代理。

下一步请用户审阅计划并选择执行方式。计划确认后开始 Task 1；任何接口或设计范围的实质变化先记录原因。

## 自审结果（计划编写时快照）

- 功能覆盖：读取/来源与三规则（Task 1/2）、doctor（Task 3）、分享与双语词典（Task 4）、双语界面与演示（Task 5）、skill/文档/CI/许可证/发布材料（Task 6）。
- 五项 Review Focus 均已对应到明确测试和边界。
- 共享接口的名称、状态与字段在后续任务中保持一致；所有公开输出经过同一摘要边界。
- 没有产品依赖安装或产品实现；测试命令是实施阶段的检查要求，尚未运行或宣称通过。
