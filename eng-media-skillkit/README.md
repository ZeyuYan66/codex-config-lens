# 工科生与轻量剪辑 · Codex 一站式技能包

简体中文 · [English](README.en.md)

面向课程设计、实验报告、工程建模和短视频答辩。解压后运行一条命令，即可离线安装技能、配套资料与脚本。本包按用途组织，涵盖从模型和实验数据到图表、字幕和成片的工作。

## 下载与安装

1. 下载 [eng-media-skillkit-v1.0.1.zip](downloads/eng-media-skillkit-v1.0.1.zip)，解压后在 `eng-media-skillkit` 目录打开终端。
2. 使用 Python 3.10 或更新版本运行 `python install.py`。Windows 也可用 `py install.py`，macOS 和 Linux 也可用 `python3 install.py`。
3. 在 Codex 新会话中输入 `$engineering-media-studio` 或 `$lab-demo-edit`。如果技能菜单还没刷新，重启 Codex。

默认安装到用户目录下的 `.agents/skills`。如果设置了 `CODEX_HOME`，则使用该变量指向的目录下的 `skills`。已有安装位于 `~/.codex/skills` 时，可以通过 `--dest "~/.codex/skills"` 指定原目录。团队可以在项目根目录设置 `--dest .agents/skills` 并使用安装脚本的绝对路径。

```sh
python install.py list
python install.py status
python install.py --skill engineering-media-studio --skill lab-demo-edit
python install.py update
python install.py uninstall
```

下载新版本后，在新目录运行 `update`，使用与原安装相同的目标目录。安装程序会保留同名的已有技能和你修改过的文件，同时处理其他待安装项。`uninstall` 只移除由本包安装且文件仍完整匹配的技能。

## 从任务开始

| 任务 | 在 Codex 中可以这样说 | 常用技能和工具 |
| --- | --- | --- |
| 建模和 3D 打印 | 「用 `$engineering-media-studio` 按这份尺寸表建外壳，导出 STEP 和 STL，并核对孔位。」 | `cadquery-llm`、`cad`、`engineering-drawing`、`print3d`。建模需 CadQuery 或 build123d，切片需适合打印机的切片器和配置。 |
| PCB、固件和机器人 | 「按这份 I/O 表核对传感器接线、采样频率和串口输出。」 | `embedded-systems`、`pcb`、`easyeda-format-skill`、`ros2`、`tf2-transforms`。实际验板需要相应软件和硬件。 |
| 实验图表与答辩报告 | 「用 `$academic-plotting` 把实测 CSV 画成论文图，给出单位、样本数和复现脚本。」 | `academic-plotting`、`literature-review`、`scientific-critical-thinking`、`presenting-conference-talks`。 |
| 演示短视频 | 「用 `$lab-demo-edit` 选出从操作到稳定读数的镜头，生成剪映可导入的 SRT。」 | `lab-demo-edit`、`ffmpeg`、`video-edit`、`capcut-edit`。本地导出需 FFmpeg 或视频编辑器，编辑剪映草稿需兼容版本和另装的 CLI。 |

试跑字幕示例时，在解压目录执行下方命令。三条示例镜头合计 7.5 秒，其中保留 1.25 秒无字幕画面。

```sh
python skills/lab-demo-edit/scripts/timeline.py skills/lab-demo-edit/assets/shots.csv --srt demo.srt
```

## 清单、授权与维护

本机盘点包含 98 个个人入口、6 个系统入口和 100 个会话已列出的插件技能，另记录 53 个其他插件缓存条目和 21 个参考集合。下载包提供 70 个可安装技能，两个原创工作流都附有中英文说明。其余条目的用途、调用关系和已知来源可从目录查阅。系统或插件功能通过相应宿主获取，MATLAB、Simulink 等工具依各自许可证安装。

- 查看每个技能的中文用途、工作台入口及插件状态。[完整目录](docs/CATALOG.md)
- 查找本机条目对应的上游固定版本或宿主。[来源索引](docs/SOURCES.md)
- 查看随包技能的许可证、固定版本与工具依赖。[第三方技能](THIRD_PARTY.md) · [补充来源](docs/ADDITIONAL-SOURCES.md)
- 校验下载、更新技能、重建 ZIP 并运行测试。[维护与版本](docs/MAINTAINING.md) · [SHA-256](downloads/SHA256SUMS.txt)

原创脚本、工作流和包文档采用 MIT 许可。各上游技能的许可证附在相应技能目录中。第三方技能正文保留上游语言。[原创许可](LICENSE)
