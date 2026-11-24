# 技能目录

简体中文 · [English](CATALOG.en.md)

本目录整理自 2026-11-24 的一次 Codex 安装盘点。按任务查个人技能，按插件查扩展能力。安装包实际提供的内容、命令和外部软件要求见[安装说明](../README.md)。

| 来源 | 盘点结果 | 如何理解 |
| --- | --- | --- |
| 个人技能目录 | 98 个顶层条目 | 74 个未关闭独立入口，24 个由 7 个工作台调用。发布时会话列出了其中 72 个入口。 |
| 系统技能 | 6 个磁盘条目 | 当次会话列出 4 个，随 Codex 提供。 |
| 会话中的插件技能 | 100 个 | 来自 21 个插件；启用状态、版本及账号条件由宿主管理。 |
| 其他插件缓存 | 53 条 | 当前会话未列出该来源与版本，其中可含同名技能。 |
| 本地参考库 | 21 个集合 | 共 2,020 份 SKILL.md 文件，含源码副本和历史快照。 |

个人目录按每个顶层入口计一次，目录链接与它的目标只计一个入口。插件按来源、包、版本和技能目录计数。参考库统计排除了 Git 对象和目录链接，保留实际存在的副本。上述行各有用途，直接相加会重复计算。

## 个人技能

“会话入口”可在盘点当次通过技能名选择；“仅磁盘”表示存在入口文件且配置未关闭，但会话列表未列出；“经 … 调用”表示原模块已并入指定工作台。表中的名称取自技能声明。

### 机械、电子与机器人

| 技能名 | 适用任务 | 调用方式 |
| --- | --- | --- |
| `3d-printing` | 检查模型网格、装配尺寸和切片前的打印条件。 | 经 `cad-printing-workbench` 调用 |
| `betaflight` | 阅读民用 FPV 飞控配置与飞行日志。 | 会话入口 |
| `building-simulink-models` | 构建 Simulink、Stateflow 或 Simscape 模型并连接模块。 | 会话入口 |
| `cad` | 用 build123d 描述参数化零件、装配体与二维轮廓。 | 会话入口 |
| `cad-printing-workbench` | 按任务选取 CadQuery 建模或网格打印准备工具。 | 会话入口 |
| `cadquery-llm` | 用 CadQuery 编写实体模型，检查工作平面、倒角和导出结果。 | 经 `cad-printing-workbench` 调用 |
| `easyeda-eprj3` | 从结构化设计数据生成嘉立创 EDA 专业版原理图与 PCB 工程。 | 会话入口 |
| `easyeda-format-skill` | 解析或生成嘉立创 EDA 专业版的符号、封装与设计数据。 | 会话入口 |
| `embedded-systems` | 编写微控制器固件，分析 RTOS 调度、功耗与外设交互。 | 会话入口 |
| `engineering-domain-workbench` | 查找机器人仿真、工程图、结构分析与电路设计工作流。 | 会话入口 |
| `matlab-analyze-spectrum` | 用 MATLAB 估计信号频谱和功率谱密度。 | 会话入口 |
| `matlab-identify-linear-system` | 根据输入输出测量数据估计线性系统模型。 | 会话入口 |
| `robot-perception` | 规划相机、深度传感器、激光雷达和 IMU 的机器人感知处理。 | 会话入口 |
| `ros2` | 组织 ROS 2 节点、通信接口及运行配置。 | 会话入口 |
| `simulating-simulink-models` | 使用 SimulationInput 为 Simulink 设置仿真条件并运行批次。 | 会话入口 |
| `tf2-transforms` | 检查 ROS 2 机器人坐标系关系与 TF2 变换。 | 会话入口 |

### 视频、图像与设计

| 技能名 | 适用任务 | 调用方式 |
| --- | --- | --- |
| `anatomy` | 用交互式等距图展示装置结构和工作原理。 | 会话入口 |
| `baoyu-cover-image` | 为文章封面选择版式、配色和绘制风格。 | 会话入口 |
| `baoyu-infographic` | 把数据或文章组织成信息图，结合内容挑选结构与视觉风格。 | 会话入口 |
| `canvas-design` | 制作可以导出 PNG 或 PDF 的海报与平面作品。 | 会话入口 |
| `capcut-edit` | 调整剪映或 CapCut 草稿中的时间段、字幕、变速和音量。 | 会话入口 |
| `diagram-design` | 为架构、流程、时序、状态或数据关系绘图。 | 会话入口 |
| `directing-stickman-videos` | 为火柴人解说短片编写旁白、分镜和动画提示。 | 会话入口 |
| `elaya-design` | 运用 Elaya 设计流程制作落地页或 Figma 界面。 | 会话入口 |
| `emil-design-eng` | 检查界面的反馈、过渡动画、间距和组件细节。 | 会话入口 |
| `frontend-design` | 为新界面确定布局、字体、颜色和视觉方向。 | 经 `frontend-workbench` 调用 |
| `frontend-workbench` | 为网页、移动端和桌面界面选择设计或前端实现模块。 | 会话入口 |
| `game-studio-workbench` | 起草游戏设计文档，拆分制作里程碑和质量检查。 | 会话入口 |
| `hallmark` | 设计具有一致视觉风格的网站和页面。 | 会话入口 |
| `impeccable` | 评审并改进前端布局、交互、可访问性和视觉细节。 | 会话入口 |
| `lemo-opuscar` | 用代码安排短片风格、镜头和时间线。 | 会话入口 |
| `mod-any-game` | 为自有 PC 游戏规划、制作并验证模组。 | 会话入口 |
| `mono-color` | 设计单墨色或双色印刷风格的海报、封面和插画。 | 会话入口 |
| `pixelfx` | 制作像素特效，检查精灵动画并导出精灵图集。 | 会话入口 |
| `sprite-gen` | 制作二维游戏精灵帧、动作图集、换色与透明素材。 | 会话入口 |
| `taste-skill` | 用字体、构图和间距改善网页视觉层级。 | 经 `frontend-workbench` 调用 |
| `ui-ux-pro-max` | 为响应式页面建立颜色、组件、排版和可访问性规范。 | 经 `frontend-workbench` 调用 |
| `unslop` | 根据产品内容调整页面的风格、结构和组件表现。 | 会话入口 |
| `video-production-workbench` | 规划镜头、整理录屏、添加字幕，选择合适的剪辑与导出工具。 | 会话入口 |

### 软件工程与自动化

| 技能名 | 适用任务 | 调用方式 |
| --- | --- | --- |
| `agent-browser` | 用浏览器自动化命令执行网页操作和交互检查。 | 经 `browser-workbench` 调用 |
| `browser-skill` | 通过已有 Chromium 会话进行网页操作与测试。 | 会话入口 |
| `browser-workbench` | 为网页操作、本地 Web 测试和截图选择相应模块。 | 会话入口 |
| `code-simplification` | 在保持既有行为的前提下简化代码。 | 会话入口 |
| `codebase-design` | 梳理模块接口、依赖关系和领域术语。 | 经 `codebase-workbench` 调用 |
| `codebase-workbench` | 为项目讲解、架构图、领域建模或接口设计选择模块。 | 会话入口 |
| `cpp-pro` | 编写、调试和优化现代 C++ 应用。 | 会话入口 |
| `cybersecurity-skills` | 防御性安全分析、监测和事件响应资料索引。 | 会话入口 |
| `domain-modeling` | 在术语表与决策记录中定义一致的领域概念。 | 经 `codebase-workbench` 调用 |
| `egm-workbench` | 按 EGM 流程起草、独立评审和修订设计规范。 | 仅磁盘 |
| `engineering-workflow` | 选择适合的调试、测试、规格设计和代码审查流程。 | 会话入口 |
| `graphify` | 绘制代码与文件关系图，用于了解项目架构。 | 会话入口 |
| `improve-codebase-architecture` | 查找适合改进的模块边界并讨论设计方案。 | 经 `codebase-workbench` 调用 |
| `karpathy-guidelines` | 在代码变更中核对假设、范围和验证方法。 | 会话入口 |
| `mattpocock-skills` | 汇集 Matt Pocock 的规格编写、调试、测试和审查流程。 | 经 `engineering-workflow` 调用 |
| `ponytail` | 以尽量小且可验证的改动解决开发任务。 | 会话入口 |
| `python-pro` | 编写带类型标注、异步处理与错误管理的 Python 应用。 | 会话入口 |
| `security-audit` | 审查代码和 API 的安全防护与修复建议。 | 会话入口 |
| `setup-matt-pocock-skills` | 为该工程工作流配置仓库议题、标签和文档结构。 | 经 `engineering-workflow` 调用 |
| `tdd` | 从失败测试开始实现功能，再进行重构。 | 经 `engineering-workflow` 调用 |
| `thinkrail-workbench` | 根据 Thinkrail 工作流组织新项目和规格文档。 | 会话入口 |
| `triage` | 对仓库议题和外部贡献分类，整理后续处理所需信息。 | 经 `engineering-workflow` 调用 |
| `ui-automation-workbench` | 为浏览器、Windows 应用或跨软件操作选择自动化方式。 | 会话入口 |
| `understand-anything` | 用代码关系图探索架构、跟踪改动和了解现有项目。 | 经 `codebase-workbench` 调用 |
| `vercel-composition-patterns` | 用组合方式组织可复用的 React 组件。 | 经 `frontend-workbench` 调用 |
| `vercel-react-best-practices` | 根据 React 与 Next.js 项目特点检查性能。 | 经 `frontend-workbench` 调用 |
| `webapp-testing` | 使用 Playwright 检查本地网页行为并保存页面反馈。 | 经 `browser-workbench` 调用 |

### 学习、研究与办公

| 技能名 | 适用任务 | 调用方式 |
| --- | --- | --- |
| `agent-reach` | 跨社交、视频和开发者平台查找公开资料。 | 经 `research-workbench` 调用 |
| `baoyu-markdown-to-html` | 将 Markdown 渲染为适合公众号等渠道的 HTML。 | 会话入口 |
| `career-ops` | 提取岗位要求、调整简历并安排求职准备。 | 会话入口 |
| `caveman` | 按要求使用极简的技术答复格式。 | 会话入口 |
| `claude-seo` | 检查网站结构、索引、内容和搜索可见性。 | 会话入口 |
| `context-compression` | 提炼长对话中的约束、进度和待办以便交接。 | 会话入口 |
| `context-optimization` | 控制读取范围和上下文预算，减少重复材料。 | 会话入口 |
| `find-skills` | 根据任务需求查找可用的技能。 | 会话入口 |
| `github-top-skills` | 按名称或类别查找已收录的 GitHub 工作流。 | 会话入口 |
| `grill-me` | 通过连续提问检验计划中的假设。 | 经 `planning-coach` 调用 |
| `grill-with-docs` | 一边讨论设计决策，一边整理术语表和决策记录。 | 经 `planning-coach` 调用 |
| `grilling` | 围绕方案、想法或决策组织深入追问。 | 经 `planning-coach` 调用 |
| `handoff` | 把当前任务压缩为可由后续协作者接手的说明。 | 经 `engineering-workflow` 调用 |
| `humanizer` | 保留作者语气与含义，改善文章的自然程度。 | 会话入口 |
| `i-have-adhd` | 按读者要求，将说明拆成容易跟进的行动步骤。 | 仅磁盘 |
| `image-to-editable-ppt` | 根据页面截图或 PDF 重建可编辑幻灯片。 | 会话入口 |
| `last30days` | 汇总最近一个月各平台的公开讨论和趋势。 | 经 `research-workbench` 调用 |
| `literature-review` | 为研究问题搜集、筛选并综合学术文献。 | 会话入口 |
| `office-workflow-workbench` | 为纪要、表格、演示和协作文档选择制作流程。 | 会话入口 |
| `planning-coach` | 通过方案问答或计划文件梳理复杂任务。 | 会话入口 |
| `planning-with-files` | 用持久化的计划、发现和进度文件跟踪多步工作。 | 经 `planning-coach` 调用 |
| `quotation-generator` | 整理报价明细并生成可交付的 PDF 报价单。 | 会话入口 |
| `research-workbench` | 为近期趋势或跨平台资料检索选择工作流。 | 会话入口 |
| `scientific-brainstorming` | 基于现有证据提出和比较研究假设。 | 会话入口 |
| `scientific-critical-thinking` | 检查实验设计、偏差、统计解释和证据强度。 | 会话入口 |
| `skill-manager` | 盘点个人技能，核对合并关系和原始入口。 | 会话入口 |
| `socratic-tutor` | 通过诊断提问、练习和反馈带领学习。 | 会话入口 |
| `study-research-workbench` | 安排课程学习、整理笔记，处理论文阅读与写作。 | 会话入口 |
| `trading-research-workbench` | 组织历史数据回测、策略假设和研究复盘。 | 会话入口 |
| `vibe-research` | 在实现前调查产品想法及技术可行性。 | 会话入口 |
| `write` | 润色中英文文章、技术说明和产品文案。 | 会话入口 |
| `writing-clearly-and-concisely` | 精简技术文档与报告中的句子、段落和措辞。 | 会话入口 |

## 系统技能

| 技能名 | 适用任务 | 盘点状态 |
| --- | --- | --- |
| `create-statusline` | 定制 Codex CLI 底部状态栏显示的信息。 | 仅磁盘 |
| `imagegen` | 生成或编辑位图、封面与视觉素材。 | 会话入口 |
| `openai-docs` | 查找 OpenAI 官方产品或 API 文档。 | 会话入口 |
| `review-agent` | 对给定代码变更进行只读审查并列出可执行意见。 | 仅磁盘 |
| `skill-creator` | 创建或更新可被发现和复用的技能。 | 会话入口 |
| `skill-installer` | 从支持的来源添加技能。 | 会话入口 |

## 会话中的插件技能

展开包名查看逐项说明。调用时可使用“插件名:技能名”；英文大小写以表中声明为准。

<details>
<summary>airtable · 7.0.0（3 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `airtable-cli` | 管理 Airtable 数据表、字段与记录。 |
| `airtable-filters` | 组合条件以筛选记录。 |
| `airtable-overview` | 理解工作区、数据库、表和记录的结构。 |

</details>

<details>
<summary>canva · 17.0.3（1 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `canva-instagram-post` | 生成可编辑的社交媒体图文版式。 |

</details>

<details>
<summary>codex-security · 0.1.33（20 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `assess-patch-risk` | 评估变更引入的安全风险。 |
| `attack-path-analysis` | 针对已知风险记录影响范围及防御优先级。 |
| `check-skills` | 审查拟安装技能的权限与行为。 |
| `cloud-findings` | 读取云端已有的安全发现。 |
| `deep-security-scan` | 深入审查仓库的防御措施与缺陷。 |
| `define-security-policy` | 编写或改进项目安全政策。 |
| `finding-discovery` | 识别代码中的潜在安全问题。 |
| `fix-finding` | 按已有发现实施修复。 |
| `propose-security-hardening` | 提出结构性的安全加固措施。 |
| `publish-findings` | 整理并提交已审查的安全记录。 |
| `resolve-dependency-alert` | 评估和处理依赖安全告警。 |
| `security-diff-scan` | 审查代码变更涉及的安全风险。 |
| `security-scan` | 查找并记录仓库中的防御薄弱点。 |
| `threat-model` | 梳理系统资产、信任边界和防护需求。 |
| `threat-model-visualize` | 将威胁模型绘制为图表。 |
| `track-findings` | 在项目管理工具中跟踪整改进展。 |
| `triage-finding` | 为现有发现核对范围和处理优先级。 |
| `validation` | 对已有发现的证据进行复核。 |
| `verify-fix` | 核对修复是否解决已记录问题。 |
| `vulnerability-writeup` | 将安全发现整理为修复或披露报告。 |

</details>

<details>
<summary>computer-use · 26.1120.41243（1 项）</summary>

插件来源 `openai-bundled`。

| 技能名 | 适用任务 |
| --- | --- |
| `computer-use` | 操作 Windows 应用完成界面任务。 |

</details>

<details>
<summary>documents · 26.1123.11515（1 项）</summary>

插件来源 `openai-primary-runtime`。

| 技能名 | 适用任务 |
| --- | --- |
| `documents` | 创建和修改 Word 文档、批注和修订。 |

</details>

<details>
<summary>figma · 20.0.0（17 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `figma-3d-transforms` | 在 Figma 中调整图层的三维变换效果。 |
| `figma-code-connect` | 对齐设计组件与代码组件的映射。 |
| `figma-code-workflows` | 将本地页面或代码产物导入设计文件。 |
| `figma-create-new-file` | 新建设计文件并整理起始结构。 |
| `figma-design-to-code` | 根据设计文件实现页面或组件。 |
| `figma-generate-design` | 在 Figma 中生成和调整界面设计。 |
| `figma-generate-diagram` | 用图表说明结构、关系和流程。 |
| `figma-generate-library` | 构建设计系统与可复用组件库。 |
| `figma-generative-plugins` | 使用 Figma 的生成式插件能力。 |
| `figma-implement-motion` | 将设计动效转化为可实现的动画。 |
| `figma-shaders` | 为设计元素处理着色器效果。 |
| `figma-spec` | 编写和审阅设计规格。 |
| `figma-swiftui` | 处理 SwiftUI 与 Figma 设计之间的转换。 |
| `figma-use` | 在 Figma 设计文件中执行编辑。 |
| `figma-use-figjam` | 编辑 FigJam 白板。 |
| `figma-use-motion` | 操作 Figma 动画和动态设计。 |
| `figma-use-slides` | 编辑 Figma Slides 演示。 |

</details>

<details>
<summary>google-drive · 0.1.28（5 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `google-docs` | 编写和编辑 Google 文档。 |
| `google-drive` | 查找、整理 Google 云端硬盘文件。 |
| `google-drive-comments` | 处理文件评论、讨论和回复。 |
| `google-sheets` | 在 Google 表格中读写区域并分析数据。 |
| `google-slides` | 编辑 Google 演示文稿。 |

</details>

<details>
<summary>jianying-mcp · 0.2.0（1 项）</summary>

插件来源 `jianying-local-plugins`。

| 技能名 | 适用任务 |
| --- | --- |
| `jianying-sound-design` | 为已有 Windows 剪映草稿补充音效并整理音轨。 |

</details>

<details>
<summary>openai-developers · 1.3.16（7 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `agents` | 构建使用 Agents SDK 或相关 API 的应用。 |
| `devday-guide` | 整理 DevDay 参会资料和活动安排。 |
| `openai-api-migration` | 迁移已有 OpenAI API 集成。 |
| `openai-api-troubleshooting` | 排查 API 集成中的请求错误。 |
| `openai-computer-use` | 构建或调试计算机操作类应用。 |
| `openai-platform-api-key` | 管理 API 密钥的设置与接入。 |
| `setup` | 配置 OpenAI 开发者插件。 |

</details>

<details>
<summary>pages · 0.1.26（4 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `maintain-space` | 根据新资料更新已有 Pages 空间。 |
| `manage-schedules` | 管理页面相关的计划任务。 |
| `organize-space` | 整理空间的页面结构和导航。 |
| `write-page` | 撰写和更新 Pages 内容。 |

</details>

<details>
<summary>pdf · 26.1123.11515（1 项）</summary>

插件来源 `openai-primary-runtime`。

| 技能名 | 适用任务 |
| --- | --- |
| `pdf` | 生成、读取、渲染并核对 PDF 文件。 |

</details>

<details>
<summary>plugin-management · 0.1.0（1 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `plugin-management` | 查找插件并管理连接设置。 |

</details>

<details>
<summary>presentations · 26.1123.11515（1 项）</summary>

插件来源 `openai-primary-runtime`。

| 技能名 | 适用任务 |
| --- | --- |
| `Presentations` | 创建、阅读和编辑演示文稿。 |

</details>

<details>
<summary>remotion · 4.0.534（12 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `remotion-best-practices` | 按短片制作环节选择 Remotion 工作流。 |
| `remotion-captions` | 将转录结果显示为时间同步字幕。 |
| `remotion-create` | 创建基于 React 的 Remotion 视频。 |
| `remotion-docs` | 查询 Remotion 的开发文档。 |
| `remotion-interactivity` | 为视频相关页面安排交互。 |
| `remotion-maps` | 制作地图元素及其动画。 |
| `remotion-markup` | 编排画面、动效与转场。 |
| `remotion-multimedia` | 通过 Mediabunny 读取或处理媒体。 |
| `remotion-render` | 将视频工程渲染为成品。 |
| `remotion-saas` | 构建带视频生成能力的服务。 |
| `remotion-studio` | 在 Remotion Studio 预览作品。 |
| `remotion-upgrade` | 升级 Remotion 相关依赖。 |

</details>

<details>
<summary>sites · 1.2.1-followup（2 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `sites` | 制作站点、作品集和仪表盘。 |
| `sites-remix` | 基于已有站点制作新版本。 |

</details>

<details>
<summary>spreadsheets · 26.1123.11515（2 项）</summary>

插件来源 `openai-primary-runtime`。

| 技能名 | 适用任务 |
| --- | --- |
| `excel-live-control` | 操作已打开的 Microsoft Excel 工作簿。 |
| `Spreadsheets` | 创建、分析或修改电子表格。 |

</details>

<details>
<summary>superpowers · 7.0.1（15 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `brainstorming` | 在实现之前讨论需求和设计选项。 |
| `diagnosing-superpowers` | 排查 Superpowers 工作流运行问题。 |
| `dispatching-parallel-agents` | 将可独立完成的任务分派给多个代理。 |
| `executing-plans` | 执行已有实施计划并检查阶段结果。 |
| `finishing-a-development-branch` | 检查开发分支的交付条件并整理集成方式。 |
| `receiving-code-review` | 分析代码评审反馈并判断后续修改。 |
| `requesting-code-review` | 为已完成的实现组织代码审查。 |
| `subagent-driven-development` | 用子代理分别执行计划中的开发任务。 |
| `systematic-debugging` | 定位问题根因并验证修复。 |
| `test-driven-development` | 用测试驱动功能实现或缺陷修复。 |
| `using-git-worktrees` | 为隔离工作配置 Git 工作树。 |
| `using-superpowers` | 查找并选用 Superpowers 工作流。 |
| `verification-before-completion` | 在提交完成结论前验证结果。 |
| `writing-plans` | 将需求拆解为可执行的实施步骤。 |
| `writing-skills` | 编写、修改和验证可复用技能。 |

</details>

<details>
<summary>template-creator · 26.1123.11515（1 项）</summary>

插件来源 `openai-primary-runtime`。

| 技能名 | 适用任务 |
| --- | --- |
| `template-creator` | 从现有样式和内容创建可复用的办公文档模板。 |

</details>

<details>
<summary>visualize · 1.0.109（1 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `visualize` | 创建支持交互的可视化图表与讲解工具。 |

</details>

<details>
<summary>wallet · 0.1.77（1 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `checkout-with-wallet` | 在获得授权时通过 Wallet 处理结算。 |

</details>

<details>
<summary>work-pets · 0.1.6（3 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `create-pet` | 创建和预览工作区动画宠物。 |
| `pets` | 查找、选择和管理已安装宠物。 |
| `update-pet` | 修改宠物设计与动画资源。 |

</details>

## 其他插件缓存

以下文件在盘点时位于缓存目录。某插件出现在此处仅证明该版本的文件存在。

<details>
<summary>claude-mem · 13.35.0（22 项）</summary>

插件来源 `thedotmack`。

| 技能名 | 适用任务 |
| --- | --- |
| `Agent Cost Report` | 汇总代理运行成本。 |
| `babysit` | 跟踪代码审查或持续集成状态。 |
| `ccs-align` | 检查本地记忆服务、规则和观察记录的一致性。 |
| `cloud-sync` | 同步记忆服务数据。 |
| `design-is` | 根据工业设计原则审查设计。 |
| `do` | 执行已经拆分的实施计划。 |
| `handoff` | 生成便于任务交接的上下文摘要。 |
| `how-it-works` | 解释项目功能或内部运行方式。 |
| `knowledge-agent` | 根据已有观察记录构建和查询知识库。 |
| `learn-codebase` | 学习并梳理代码库结构。 |
| `make-plan` | 将实现需求整理为阶段计划。 |
| `mem-search` | 在跨会话记忆中查找历史决策与工作记录。 |
| `mode-creator` | 创建和验证自定义记忆模式。 |
| `oh-my-issues` | 对仓库议题按相关性归组并整理处理方案。 |
| `pathfinder` | 映射代码结构并分析可合并的功能。 |
| `smart-explore` | 根据语法结构搜索代码。 |
| `standup` | 汇总不同分支与工作树的变更进展。 |
| `timeline-report` | 基于项目时间线编写开发历史报告。 |
| `version-bump` | 整理插件版本与发布清单。 |
| `weekly-digests` | 根据时间线整理每周进展。 |
| `what-the` | 用通俗语言解释技术主题。 |
| `wowerpoint` | 将文档整理为 NotebookLM 风格的演示材料。 |

</details>

<details>
<summary>openai-templates · 0.1.1（20 项）</summary>

插件来源 `openai-curated-remote`。

| 技能名 | 适用任务 |
| --- | --- |
| `artifact-template-analytics-dashboard` | 以分析仪表盘模板组织指标与图表。 |
| `artifact-template-business-review` | 制作业务复盘材料。 |
| `artifact-template-design-report` | 组织设计过程、依据与结果。 |
| `artifact-template-experiment-analysis` | 整理实验数据与分析结论。 |
| `artifact-template-financial-budget` | 按模板编制财务预算。 |
| `artifact-template-investment-committee-memo` | 整理投资委员会备忘录。 |
| `artifact-template-legal-memorandum` | 排版法律备忘录。 |
| `artifact-template-market-trends-report` | 编排市场趋势报告。 |
| `artifact-template-minimal-letterhead` | 生成简洁的信笺版式。 |
| `artifact-template-operating-calendar` | 安排运营日历。 |
| `artifact-template-operating-review` | 整理运营复盘材料。 |
| `artifact-template-project-kickoff` | 编排项目启动材料。 |
| `artifact-template-project-tracker` | 建立项目进度跟踪表。 |
| `artifact-template-sales-pipeline` | 整理销售管线数据。 |
| `artifact-template-simple-dark-mode` | 使用简洁的深色演示模板。 |
| `artifact-template-simple-light-mode` | 使用简洁的浅色演示模板。 |
| `artifact-template-strategy-memorandum` | 组织策略备忘录。 |
| `artifact-template-system-design` | 编排系统设计文档。 |
| `artifact-template-team-alignment` | 整理团队目标和分工。 |
| `artifact-template-three-statement-forecast` | 编制三张财务报表的预测模型。 |

</details>

<details>
<summary>robotics-lab · 0.1.0（10 项）</summary>

插件来源 `personal`。

| 技能名 | 适用任务 |
| --- | --- |
| `gazebo-simulation` | 制作与检查 Gazebo 机器人仿真。 |
| `isaac-sim-robotics` | 组织 Isaac Sim 与 Isaac Lab 的仿真工作。 |
| `micro-ros-embedded` | 在微控制器上集成 micro-ROS。 |
| `moveit2-manipulation` | 配置 MoveIt 2 机械臂建模和运动规划。 |
| `nav2-navigation` | 配置 ROS 2 Navigation2 的定位和导航。 |
| `robot-control` | 处理机器人运动学、反馈控制与 ros2_control 集成。 |
| `robot-vision` | 用 OpenCV、标定和点云处理机器人视觉数据。 |
| `robotics-testing` | 编排仿真、回放和可复现的机器人软件测试。 |
| `ros2-development` | 创建或排查 ROS 2 软件包和节点。 |
| `slam-mapping` | 处理机器人定位与二维或三维地图构建。 |

</details>

<details>
<summary>visualize · 1.0.114（1 项）</summary>

插件来源 `openai-bundled`。

| 技能名 | 适用任务 |
| --- | --- |
| `visualize` | 创建支持交互的可视化图表与讲解工具。 |

</details>

## 参考库与历史快照

部分工作台会从这些集合加载已选模块。表中数字按实际文件数统计，可能包含示例、重复版本与备份。

| 集合 | SKILL.md 文件数 | 内容 |
| --- | ---: | --- |
| `agent-reach` | 1 | 跨平台检索和阅读资料。 |
| `career-ops` | 11 | 求职准备与申请管理。 |
| `claude-seo` | 40 | 网站技术审查与内容可发现性。 |
| `cybersecurity-skills` | 818 | 防御性安全资料集合；此处只记录集合规模。 |
| `domain-skills-10k-20261118` | 89 | 工程、研究、办公等领域的精选工作流。 |
| `egm-workbench` | 8 | EGM 设计规格和评审工作流。 |
| `elaya-design` | 2 | 视觉与界面设计工作流。 |
| `game-studio-workbench` | 78 | 游戏设计、制作与项目管理。 |
| `github-top200-20261118` | 136 | GitHub 工作流选集；本地文件数与排名条目数口径不同。 |
| `humanizer` | 1 | 自然语言润色与写作。 |
| `imagegen-skills` | 4 | 图像生成与设计工作流。 |
| `last30days` | 1 | 近期跨平台研究。 |
| `lemo-opuscar` | 3 | 代码短片制作与视觉风格素材。 |
| `mattpocock-skills` | 39 | 软件工程、测试与代码审查。 |
| `pixelfx` | 1 | 像素动画与特效。 |
| `skill-management` | 745 | 历史管理快照和备份，含重复文件。 |
| `taste-skill` | 1 | 网页视觉设计。 |
| `taste-skill-classics` | 7 | 视觉设计的扩展工作流。 |
| `thinkrail-workbench` | 13 | 需求、规格及工程协作。 |
| `ui-ux-pro-max` | 13 | 界面设计系统及多平台参考资料。 |
| `understand-anything` | 9 | 代码结构分析与可视化。 |

## 更新目录

核对本次发现的入口与宿主会话列表后，更新[清单数据](../catalog/inventory.json)中的日期、状态和中文用途。新增第三方来源时，应同时核对安装包内可分发的文件和署名要求。在仓库根目录运行以下命令生成本页并校验结果。

```sh
python tools/render_catalog.py
python tools/render_catalog.py --check
```
