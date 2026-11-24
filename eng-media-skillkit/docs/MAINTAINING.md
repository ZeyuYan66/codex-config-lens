# 维护与版本

## v1.0.0 · 2026-11-24

首次发布。整理 98 个个人技能入口及其插件和参考库目录，提供离线安装、检查、更新与卸载。新增中文工程演示入口和可复用的镜头时间线与 SRT 生成脚本。

## 更新一个技能

1. 找到当前固定提交以及相应许可证。比较新版的技能入口、脚本和资源，检查文件来源、运行依赖和作者声明。保留相对路径、许可证、NOTICE 和更新说明。
2. 更新 `catalog/bundled.json` 或 `catalog/additional.json` 及其说明。更新本机盘点时也修改 `catalog/inventory.json` 和 `catalog/sources.json`，然后重新生成中文目录。
3. 跑安装测试和发布校验。涉及专业软件时，根据本次改动运行对应示例或项目测试。安装通过只能验证分发与装卸。
4. 修改 README 下载链接和本页版本记录。构建新的带版本 ZIP 及 SHA-256，提交已核对的公开文件，保持此前版本的下载地址可用。

```sh
python tools/render_catalog.py
python tools/render_sources.py
python -m unittest discover -s tests -v
python tools/build_release.py 1.0.0 --output downloads
```

发布 ZIP 包含完整技能源码、资源、脚本和许可证。要核对 SHA-256，在 Windows 可运行 `Get-FileHash eng-media-skillkit-v1.0.0.zip -Algorithm SHA256`，在 macOS 或 Linux 可运行 `shasum -a 256 eng-media-skillkit-v1.0.0.zip`，将结果对照下载页旁的校验文件。

## 处理安装冲突

- `unmanaged` 表示目标目录已有同名技能。可以用 `--skill` 选择其他条目，或用 `--dest` 选一个适合当前项目的新目录。
- `modified` 表示安装后的文件有本地改动。把自己修改的部分备份到工作区后，再决定如何合并新版。
- `update available` 表示本包提供了新版。用同一目标目录运行 `update` 即可更新由本包管理的未改动副本。
- 安装程序报告存在中断事务时，使用相同目标目录重跑安装、更新或卸载。若仍出现错误，保留原目录和事务数据，附命令、发行版本和报错反馈。

安装、更新、卸载退出码 `0` 表示成功，`1` 表示至少一项冲突或失败，`2` 表示参数错误。反馈具体技能时附上操作系统、Codex 版本和相关工具版本，并去除个人路径和账户信息。
