# Skill catalog

[简体中文](CATALOG.md) · English

Snapshot from 2026-11-24. Browse personal skills by task and extensions by plugin. See the [installation guide](../README.en.md) for the contents of the downloadable pack.

| Source | Count | Scope |
| --- | --- | --- |
| Personal skill directory | 98 entries | 74 individually enabled and 24 routed through 7 workbenches. 72 appeared in the session. |
| System | 6 entries | 4 appeared in the session. |
| Plugin skills in session | 100 | Provided by 21 plugins. |
| Other plugin cache entries | 53 | May include another version of a skill listed elsewhere. |
| Local reference library | 21 collections | 2,020 SKILL.md files including snapshots and copies. |

Personal entries count once at the top level. Plugin entries are counted by provider, plugin, version, and skill directory. Reference counts exclude Git objects and directory links. Some entries overlap across rows.

## Personal skills

### Mechanical design, electronics, and robotics

| Skill | Purpose | Availability |
| --- | --- | --- |
| `3d-printing` | Check meshes, fit dimensions, and settings before slicing. | Via `cad-printing-workbench` |
| `betaflight` | Review civilian FPV flight-controller settings and logs. | Listed in session |
| `building-simulink-models` | Build Simulink, Stateflow, or Simscape models and connect their components. | Listed in session |
| `cad` | Model parametric parts, assemblies, and 2D profiles with build123d. | Listed in session |
| `cad-printing-workbench` | Select CadQuery modeling or mesh preparation for 3D printing. | Listed in session |
| `cadquery-llm` | Write CadQuery solid models and check workplanes, fillets, and exports. | Via `cad-printing-workbench` |
| `easyeda-eprj3` | Generate EasyEDA Pro schematic and PCB projects from structured design data. | Listed in session |
| `easyeda-format-skill` | Read and generate EasyEDA Pro symbols, footprints, and design data. | Listed in session |
| `embedded-systems` | Write microcontroller firmware and analyze RTOS scheduling, power, and peripherals. | Listed in session |
| `engineering-domain-workbench` | Find workflows for simulation, engineering drawings, FEA, and PCB design. | Listed in session |
| `matlab-analyze-spectrum` | Estimate a signal's spectrum and power spectral density in MATLAB. | Listed in session |
| `matlab-identify-linear-system` | Estimate a linear system model from measured input and output. | Listed in session |
| `robot-perception` | Plan robotics perception for cameras, depth sensors, lidar, and IMUs. | Listed in session |
| `ros2` | Organize ROS 2 nodes, communication interfaces, and runtime configuration. | Listed in session |
| `simulating-simulink-models` | Set up and batch-run Simulink simulations with SimulationInput. | Listed in session |
| `tf2-transforms` | Check ROS 2 coordinate frames and TF2 transforms. | Listed in session |

### Video, images, and design

| Skill | Purpose | Availability |
| --- | --- | --- |
| `anatomy` | Explain a device's structure and operation with an interactive isometric diagram. | Listed in session |
| `baoyu-cover-image` | Choose a layout, palette, and illustration style for an article cover. | Listed in session |
| `baoyu-infographic` | Turn data or an article into an infographic with an appropriate visual structure. | Listed in session |
| `canvas-design` | Design posters and flat artwork for PNG or PDF export. | Listed in session |
| `capcut-edit` | Adjust clips, captions, playback speed, and volume in CapCut or Jianying drafts. | Listed in session |
| `diagram-design` | Draw architecture, flow, sequence, state, or data diagrams. | Listed in session |
| `directing-stickman-videos` | Plan narration, storyboards, and animation cues for stick-figure explainers. | Listed in session |
| `elaya-design` | Design landing pages or Figma interfaces using the Elaya workflow. | Listed in session |
| `emil-design-eng` | Review interface feedback, transitions, spacing, and component details. | Listed in session |
| `frontend-design` | Choose layout, typography, colors, and visual direction for a new interface. | Via `frontend-workbench` |
| `frontend-workbench` | Select design or implementation workflows for web, mobile, or desktop interfaces. | Listed in session |
| `game-studio-workbench` | Write game design documents, plan milestones, and define quality checks. | Listed in session |
| `hallmark` | Design websites and pages with a consistent visual style. | Listed in session |
| `impeccable` | Improve frontend layout, interactions, accessibility, and visual details. | Listed in session |
| `lemo-opuscar` | Use code to plan a short film's style, shots, and timeline. | Listed in session |
| `mod-any-game` | Plan, build, and verify mods for a PC game the user owns. | Listed in session |
| `mono-color` | Design one-color or two-color posters, covers, and illustrations. | Listed in session |
| `pixelfx` | Create pixel effects, inspect sprite animation, and export sprite sheets. | Listed in session |
| `sprite-gen` | Create 2D game sprites, animation sheets, recolors, and transparent assets. | Listed in session |
| `taste-skill` | Improve a web page's visual hierarchy with type, composition, and spacing. | Via `frontend-workbench` |
| `ui-ux-pro-max` | Define responsive UI colors, components, typography, and accessibility. | Via `frontend-workbench` |
| `unslop` | Adapt a page's style, structure, and components to the product's content. | Listed in session |
| `video-production-workbench` | Plan shots, organize recordings, add captions, and select editing and export tools. | Listed in session |

### Software engineering and automation

| Skill | Purpose | Availability |
| --- | --- | --- |
| `agent-browser` | Run browser actions and interaction tests from the command line. | Via `browser-workbench` |
| `browser-skill` | Operate and test websites in an existing Chromium session. | Listed in session |
| `browser-workbench` | Choose a workflow for browser tasks, local web tests, or screenshots. | Listed in session |
| `code-simplification` | Simplify code while preserving its behavior. | Listed in session |
| `codebase-design` | Clarify module interfaces, dependencies, and domain vocabulary. | Via `codebase-workbench` |
| `codebase-workbench` | Choose a workflow for codebase explanations, diagrams, domain models, or interfaces. | Listed in session |
| `cpp-pro` | Write, debug, and optimize modern C++ applications. | Listed in session |
| `cybersecurity-skills` | Index defensive security analysis, monitoring, and incident-response material. | Listed in session |
| `domain-modeling` | Document domain concepts in a glossary and decision records. | Via `codebase-workbench` |
| `egm-workbench` | Draft, independently review, and revise design specifications using EGM. | On disk |
| `engineering-workflow` | Choose workflows for debugging, testing, specifications, and code review. | Listed in session |
| `graphify` | Map code and file relationships to understand project architecture. | Listed in session |
| `improve-codebase-architecture` | Identify module boundaries that could benefit from a redesign. | Via `codebase-workbench` |
| `karpathy-guidelines` | Check the assumptions, scope, and verification of code changes. | Listed in session |
| `mattpocock-skills` | Find Matt Pocock's workflows for specs, debugging, testing, and review. | Via `engineering-workflow` |
| `ponytail` | Solve a development task with a small, verifiable change. | Listed in session |
| `python-pro` | Write Python applications with typing, asynchronous work, and error handling. | Listed in session |
| `security-audit` | Review defensive measures in code and APIs and identify fixes. | Listed in session |
| `setup-matt-pocock-skills` | Set up issue tracking, labels, and documentation for Matt Pocock's workflows. | Via `engineering-workflow` |
| `tdd` | Reproduce a failure with a test, implement the change, and refactor. | Via `engineering-workflow` |
| `thinkrail-workbench` | Organize new projects and specifications using Thinkrail. | Listed in session |
| `triage` | Sort repository issues and contributions for follow-up. | Via `engineering-workflow` |
| `ui-automation-workbench` | Choose an automation approach for browser, Windows, and cross-app tasks. | Listed in session |
| `understand-anything` | Use a code graph to explore architecture, changes, and existing projects. | Via `codebase-workbench` |
| `vercel-composition-patterns` | Organize reusable React components through composition. | Via `frontend-workbench` |
| `vercel-react-best-practices` | Review performance in React and Next.js projects. | Via `frontend-workbench` |
| `webapp-testing` | Use Playwright to check local web behavior and record feedback. | Via `browser-workbench` |

### Study, research, and office work

| Skill | Purpose | Availability |
| --- | --- | --- |
| `agent-reach` | Find public material across social, video, and developer platforms. | Via `research-workbench` |
| `baoyu-markdown-to-html` | Render Markdown as HTML for channels such as WeChat Official Accounts. | Listed in session |
| `career-ops` | Review job requirements, tailor a résumé, and organize applications. | Listed in session |
| `caveman` | Use a terse technical answer style when requested. | Listed in session |
| `claude-seo` | Review site structure, indexing, content, and search visibility. | Listed in session |
| `context-compression` | Summarize constraints, progress, and open tasks for handoff. | Listed in session |
| `context-optimization` | Control reading scope and context use to reduce duplication. | Listed in session |
| `find-skills` | Find available skills for a task. | Listed in session |
| `github-top-skills` | Find indexed GitHub workflows by name or category. | Listed in session |
| `grill-me` | Test a plan's assumptions through successive questions. | Via `planning-coach` |
| `grill-with-docs` | Discuss design choices and record decisions and vocabulary as they emerge. | Via `planning-coach` |
| `grilling` | Ask detailed follow-up questions about a plan, idea, or decision. | Via `planning-coach` |
| `handoff` | Summarize a task so a collaborator can pick it up. | Via `engineering-workflow` |
| `humanizer` | Make prose read naturally while preserving the author's meaning and voice. | Listed in session |
| `i-have-adhd` | Break instructions into manageable actions when the reader asks. | On disk |
| `image-to-editable-ppt` | Reconstruct editable slides from screenshots or a PDF. | Listed in session |
| `last30days` | Summarize public discussion and trends from the past month. | Via `research-workbench` |
| `literature-review` | Find, screen, and synthesize research papers for a question. | Listed in session |
| `office-workflow-workbench` | Select a workflow for minutes, spreadsheets, slides, or shared documents. | Listed in session |
| `planning-coach` | Clarify a complex task with questions or a written plan. | Listed in session |
| `planning-with-files` | Track a multi-step task with persistent plan, findings, and progress files. | Via `planning-coach` |
| `quotation-generator` | Turn itemized pricing into a PDF quotation. | Listed in session |
| `research-workbench` | Choose a workflow for recent trends or research across platforms. | Listed in session |
| `scientific-brainstorming` | Form and compare research hypotheses using existing evidence. | Listed in session |
| `scientific-critical-thinking` | Evaluate study design, bias, statistical interpretation, and evidence quality. | Listed in session |
| `skill-manager` | Inventory personal skills and check their original entries and consolidation. | Listed in session |
| `socratic-tutor` | Teach through diagnostic questions, exercises, and feedback. | Listed in session |
| `study-research-workbench` | Plan study, organize notes, and work with research papers. | Listed in session |
| `trading-research-workbench` | Organize historical backtests, strategy hypotheses, and research reviews. | Listed in session |
| `vibe-research` | Research a product idea and its technical feasibility before implementation. | Listed in session |
| `write` | Polish Chinese or English articles, technical materials, and product copy. | Listed in session |
| `writing-clearly-and-concisely` | Tighten wording, sentences, and paragraphs in technical documents. | Listed in session |

## System skills

| Skill | Purpose | Availability |
| --- | --- | --- |
| `create-statusline` | Choose what appears in the Codex CLI status line. | On disk |
| `imagegen` | Generate or edit raster artwork, covers, and other visual assets. | Listed in session |
| `openai-docs` | Find official OpenAI product and API documentation. | Listed in session |
| `review-agent` | Review a code change and report actionable findings. | On disk |
| `skill-creator` | Create or update reusable, discoverable skills. | Listed in session |
| `skill-installer` | Add skills from supported sources. | Listed in session |

## Plugin skills in the session

Expand a plugin to browse its skills. The host manages versions, availability, and account requirements.

<details>
<summary>airtable · 7.0.0 (3 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `airtable-cli` | Manage Airtable tables, fields, and records. |
| `airtable-filters` | Combine conditions to filter records. |
| `airtable-overview` | Understand workspaces, bases, tables, and records. |

</details>

<details>
<summary>canva · 17.0.3 (1 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `canva-instagram-post` | Create editable social media layouts. |

</details>

<details>
<summary>codex-security · 0.1.33 (20 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `assess-patch-risk` | Assess security risks introduced by a patch. |
| `attack-path-analysis` | Document the scope of known risks and prioritize defenses. |
| `check-skills` | Review a skill's permissions and behavior before installation. |
| `cloud-findings` | Read existing cloud security findings. |
| `deep-security-scan` | Review repository defenses and security weaknesses in depth. |
| `define-security-policy` | Write or revise a project's security policy. |
| `finding-discovery` | Identify potential security problems in code. |
| `fix-finding` | Implement a fix for a reported security finding. |
| `propose-security-hardening` | Propose structural security improvements. |
| `publish-findings` | Organize and submit reviewed security findings. |
| `resolve-dependency-alert` | Evaluate and address a dependency alert. |
| `security-diff-scan` | Review security risks in a code diff. |
| `security-scan` | Find and document weaknesses in repository defenses. |
| `threat-model` | Identify assets, trust boundaries, and protection needs. |
| `threat-model-visualize` | Diagram a threat model. |
| `track-findings` | Track remediation in a project management tool. |
| `triage-finding` | Confirm a finding's scope and remediation priority. |
| `validation` | Review evidence for existing findings. |
| `verify-fix` | Check whether a fix resolves a recorded issue. |
| `vulnerability-writeup` | Write a remediation or disclosure report. |

</details>

<details>
<summary>computer-use · 26.1120.41243 (1 entries)</summary>

Provider `openai-bundled`.

| Skill | Purpose |
| --- | --- |
| `computer-use` | Operate Windows applications. |

</details>

<details>
<summary>documents · 26.1123.11515 (1 entries)</summary>

Provider `openai-primary-runtime`.

| Skill | Purpose |
| --- | --- |
| `documents` | Create and edit Word documents, comments, and tracked changes. |

</details>

<details>
<summary>figma · 20.0.0 (17 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `figma-3d-transforms` | Adjust 3D transforms on Figma layers. |
| `figma-code-connect` | Map design components to their code counterparts. |
| `figma-code-workflows` | Import local pages or code artifacts into a design file. |
| `figma-create-new-file` | Create a design file and organize its initial structure. |
| `figma-design-to-code` | Implement pages or components from a design. |
| `figma-generate-design` | Create and refine interfaces in Figma. |
| `figma-generate-diagram` | Diagram structures, relationships, and processes. |
| `figma-generate-library` | Build a design system or reusable component library. |
| `figma-generative-plugins` | Use Figma's generative plugin tools. |
| `figma-implement-motion` | Turn a motion design into an implementable animation. |
| `figma-shaders` | Apply shader effects to design elements. |
| `figma-spec` | Write and review design specifications. |
| `figma-swiftui` | Translate between SwiftUI and Figma. |
| `figma-use` | Edit Figma design files. |
| `figma-use-figjam` | Edit FigJam boards. |
| `figma-use-motion` | Work with animated and dynamic Figma designs. |
| `figma-use-slides` | Edit Figma Slides decks. |

</details>

<details>
<summary>google-drive · 0.1.28 (5 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `google-docs` | Write and edit Google Docs. |
| `google-drive` | Find and organize Google Drive files. |
| `google-drive-comments` | Manage file comments, discussions, and replies. |
| `google-sheets` | Read, write, and analyze Google Sheets ranges. |
| `google-slides` | Edit Google Slides decks. |

</details>

<details>
<summary>jianying-mcp · 0.2.0 (1 entries)</summary>

Provider `jianying-local-plugins`.

| Skill | Purpose |
| --- | --- |
| `jianying-sound-design` | Add sound effects and organize audio tracks in an existing Windows Jianying draft. |

</details>

<details>
<summary>openai-developers · 1.3.16 (7 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `agents` | Build apps with the Agents SDK or related APIs. |
| `devday-guide` | Organize DevDay materials and schedules. |
| `openai-api-migration` | Migrate existing OpenAI API integrations. |
| `openai-api-troubleshooting` | Diagnose failed API requests. |
| `openai-computer-use` | Build or debug computer-use applications. |
| `openai-platform-api-key` | Set up and connect an API key. |
| `setup` | Configure the OpenAI Developers plugin. |

</details>

<details>
<summary>pages · 0.1.26 (4 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `maintain-space` | Update an existing Pages space with new material. |
| `manage-schedules` | Manage scheduled work associated with a page. |
| `organize-space` | Organize a space's pages and navigation. |
| `write-page` | Write and update Pages content. |

</details>

<details>
<summary>pdf · 26.1123.11515 (1 entries)</summary>

Provider `openai-primary-runtime`.

| Skill | Purpose |
| --- | --- |
| `pdf` | Read, create, render, and verify PDFs. |

</details>

<details>
<summary>plugin-management · 0.1.0 (1 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `plugin-management` | Find plugins and manage their connections. |

</details>

<details>
<summary>presentations · 26.1123.11515 (1 entries)</summary>

Provider `openai-primary-runtime`.

| Skill | Purpose |
| --- | --- |
| `Presentations` | Create, read, and edit slide decks. |

</details>

<details>
<summary>remotion · 4.0.534 (12 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `remotion-best-practices` | Select a Remotion workflow for a video production step. |
| `remotion-captions` | Display transcriptions as synchronized captions. |
| `remotion-create` | Create a React-based Remotion video. |
| `remotion-docs` | Find Remotion documentation. |
| `remotion-interactivity` | Add interactions to a video-related page. |
| `remotion-maps` | Build and animate map elements. |
| `remotion-markup` | Compose visuals, animation, and transitions. |
| `remotion-multimedia` | Read and process media using Mediabunny. |
| `remotion-render` | Render a video project. |
| `remotion-saas` | Build a service that can generate video. |
| `remotion-studio` | Preview work in Remotion Studio. |
| `remotion-upgrade` | Upgrade Remotion dependencies. |

</details>

<details>
<summary>sites · 1.2.1-followup (2 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `sites` | Build sites, portfolios, and dashboards. |
| `sites-remix` | Create a new version of an existing site. |

</details>

<details>
<summary>spreadsheets · 26.1123.11515 (2 entries)</summary>

Provider `openai-primary-runtime`.

| Skill | Purpose |
| --- | --- |
| `excel-live-control` | Work with an open Microsoft Excel workbook. |
| `Spreadsheets` | Create, analyze, or edit spreadsheets. |

</details>

<details>
<summary>superpowers · 7.0.1 (15 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `brainstorming` | Explore requirements and options before implementation. |
| `diagnosing-superpowers` | Troubleshoot a Superpowers workflow. |
| `dispatching-parallel-agents` | Assign independent tasks to parallel agents. |
| `executing-plans` | Follow an implementation plan and verify its stages. |
| `finishing-a-development-branch` | Check that a branch is ready and decide how to integrate it. |
| `receiving-code-review` | Assess review feedback and the changes it calls for. |
| `requesting-code-review` | Arrange a review of completed implementation work. |
| `subagent-driven-development` | Assign implementation tasks to subagents. |
| `systematic-debugging` | Identify the root cause of a bug and verify the fix. |
| `test-driven-development` | Drive implementation and bug fixes through tests. |
| `using-git-worktrees` | Use a Git worktree to isolate work. |
| `using-superpowers` | Select an appropriate Superpowers workflow. |
| `verification-before-completion` | Verify the result before reporting completion. |
| `writing-plans` | Turn requirements into actionable implementation steps. |
| `writing-skills` | Write, revise, and validate reusable skills. |

</details>

<details>
<summary>template-creator · 26.1123.11515 (1 entries)</summary>

Provider `openai-primary-runtime`.

| Skill | Purpose |
| --- | --- |
| `template-creator` | Create a reusable office template from existing styles and content. |

</details>

<details>
<summary>visualize · 1.0.109 (1 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `visualize` | Create interactive charts and explanations. |

</details>

<details>
<summary>wallet · 0.1.77 (1 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `checkout-with-wallet` | Complete an authorized checkout through Wallet. |

</details>

<details>
<summary>work-pets · 0.1.6 (3 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `create-pet` | Create and preview an animated workspace pet. |
| `pets` | Find, select, and manage installed pets. |
| `update-pet` | Edit a pet's design and animation assets. |

</details>

## Other cached plugin entries

These versions had files in the local cache at the time of the snapshot.

<details>
<summary>claude-mem · 13.35.0 (22 entries)</summary>

Provider `thedotmack`.

| Skill | Purpose |
| --- | --- |
| `Agent Cost Report` | Summarize agent usage costs. |
| `babysit` | Follow code review or CI progress. |
| `ccs-align` | Check consistency among memory services, rules, and observations. |
| `cloud-sync` | Synchronize memory service data. |
| `design-is` | Review a design against industrial design principles. |
| `do` | Carry out a plan already broken into tasks. |
| `handoff` | Prepare a context summary for handoff. |
| `how-it-works` | Explain a feature or its internal behavior. |
| `knowledge-agent` | Build and query a knowledge base from observations. |
| `learn-codebase` | Explore the structure of a codebase. |
| `make-plan` | Organize implementation work into phases. |
| `mem-search` | Find past decisions and work across sessions. |
| `mode-creator` | Create and validate custom memory modes. |
| `oh-my-issues` | Group related repository issues and plan their resolution. |
| `pathfinder` | Map code structure and identify functionality that could be consolidated. |
| `smart-explore` | Search code using syntax structure. |
| `standup` | Summarize progress across branches and worktrees. |
| `timeline-report` | Write a development history from a project timeline. |
| `version-bump` | Organize a plugin version bump and release checklist. |
| `weekly-digests` | Summarize weekly progress from a timeline. |
| `what-the` | Explain a technical topic in plain language. |
| `wowerpoint` | Turn documents into NotebookLM-style presentation material. |

</details>

<details>
<summary>openai-templates · 0.1.1 (20 entries)</summary>

Provider `openai-curated-remote`.

| Skill | Purpose |
| --- | --- |
| `artifact-template-analytics-dashboard` | Organize metrics and charts in a dashboard. |
| `artifact-template-business-review` | Prepare a business review. |
| `artifact-template-design-report` | Document a design process, rationale, and outcome. |
| `artifact-template-experiment-analysis` | Summarize experimental data and findings. |
| `artifact-template-financial-budget` | Prepare a budget from a template. |
| `artifact-template-investment-committee-memo` | Format an investment committee memo. |
| `artifact-template-legal-memorandum` | Format a legal memorandum. |
| `artifact-template-market-trends-report` | Lay out a market trends report. |
| `artifact-template-minimal-letterhead` | Create a simple letterhead. |
| `artifact-template-operating-calendar` | Set up an operating calendar. |
| `artifact-template-operating-review` | Prepare an operating review. |
| `artifact-template-project-kickoff` | Prepare project kickoff material. |
| `artifact-template-project-tracker` | Create a project progress tracker. |
| `artifact-template-sales-pipeline` | Organize sales pipeline data. |
| `artifact-template-simple-dark-mode` | Use a simple dark slide template. |
| `artifact-template-simple-light-mode` | Use a simple light slide template. |
| `artifact-template-strategy-memorandum` | Organize a strategy memo. |
| `artifact-template-system-design` | Lay out a system design document. |
| `artifact-template-team-alignment` | Record team goals and responsibilities. |
| `artifact-template-three-statement-forecast` | Build a three-statement forecast. |

</details>

<details>
<summary>robotics-lab · 0.1.0 (10 entries)</summary>

Provider `personal`.

| Skill | Purpose |
| --- | --- |
| `gazebo-simulation` | Build and check a Gazebo simulation. |
| `isaac-sim-robotics` | Organize simulation work in Isaac Sim and Isaac Lab. |
| `micro-ros-embedded` | Integrate micro-ROS on a microcontroller. |
| `moveit2-manipulation` | Configure arm models and motion planning in MoveIt 2. |
| `nav2-navigation` | Configure localization and navigation with Nav2. |
| `robot-control` | Work with robot kinematics, feedback control, and ros2_control. |
| `robot-vision` | Process robotics vision data with OpenCV, calibration, and point clouds. |
| `robotics-testing` | Set up simulation, replay, and reproducible robotics tests. |
| `ros2-development` | Create or troubleshoot ROS 2 packages and nodes. |
| `slam-mapping` | Work on robot localization and 2D or 3D maps. |

</details>

<details>
<summary>visualize · 1.0.114 (1 entries)</summary>

Provider `openai-bundled`.

| Skill | Purpose |
| --- | --- |
| `visualize` | Create interactive charts and explanations. |

</details>

## Reference libraries and historical snapshots

| Collection | SKILL.md files | Contents |
| --- | --- | --- |
| `agent-reach` | 1 | Research across platforms. |
| `career-ops` | 11 | Job search and applications. |
| `claude-seo` | 40 | Technical website reviews and search visibility. |
| `cybersecurity-skills` | 818 | Defensive security reference collection. The inventory records its size. |
| `domain-skills-10k-20261118` | 89 | Selected engineering, research, and office workflows. |
| `egm-workbench` | 8 | EGM design specifications and reviews. |
| `elaya-design` | 2 | Visual and interface design. |
| `game-studio-workbench` | 78 | Game design, production, and project management. |
| `github-top200-20261118` | 136 | Selected GitHub workflows. The local file count and ranking count use different scopes. |
| `humanizer` | 1 | Writing and natural-language editing. |
| `imagegen-skills` | 4 | Image generation and design. |
| `last30days` | 1 | Recent research across platforms. |
| `lemo-opuscar` | 3 | Code-based short-film production and visual references. |
| `mattpocock-skills` | 39 | Software engineering, testing, and review. |
| `pixelfx` | 1 | Pixel animation and effects. |
| `skill-management` | 745 | Historical snapshots and backups, including duplicates. |
| `taste-skill` | 1 | Visual design for websites. |
| `taste-skill-classics` | 7 | Additional visual design workflows. |
| `thinkrail-workbench` | 13 | Requirements, specifications, and engineering collaboration. |
| `ui-ux-pro-max` | 13 | UI design systems and cross-platform references. |
| `understand-anything` | 9 | Code structure analysis and diagrams. |

To update this page, update the inventory and English descriptions, then run `python tools/render_english.py`.
