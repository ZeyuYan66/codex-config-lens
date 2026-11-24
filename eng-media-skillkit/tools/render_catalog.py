"""Render the public inventory as a Chinese Markdown catalog (Python 3.8+)."""
import argparse
from collections import defaultdict
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "catalog" / "inventory.json"
DOC = ROOT / "docs" / "CATALOG.md"


def summary_table(rows):
    lines = ["| 技能名 | 适用任务 |", "| --- | --- |"]
    for row in rows:
        lines.append(f"| `{row['name']}` | {row['summary_zh']} |")
    return lines


def group_by(rows, key):
    groups = defaultdict(list)
    for row in rows:
        groups[key(row)].append(row)
    return groups


def plugin_tables(rows):
    lines = []
    packages = group_by(rows, lambda r: (r["plugin"], r["provider"], r["version"]))
    for (name, provider, version), group in sorted(packages.items()):
        lines.extend([
            "<details>",
            f"<summary>{name} · {version}（{len(group)} 项）</summary>",
            "",
            f"插件来源 `{provider}`。",
            "",
            *summary_table(group),
            "",
            "</details>",
            "",
        ])
    return lines


def render(data):
    personal = data["personal"]
    system = data["system"]
    plugins = data["plugin_skills"]
    visible_plugins = [row for row in plugins if row["listed_in_session"]]
    other_plugins = [row for row in plugins if not row["listed_in_session"]]
    libs = data["reference_collections"]
    active = sum(row["individually_enabled"] for row in personal)
    visible_personal = sum(row["listed_in_session"] for row in personal)
    visible_system = sum(row["listed_in_session"] for row in system)
    parents = {row["via"] for row in personal if row.get("via")}
    package_count = len({(row["provider"], row["plugin"]) for row in visible_plugins})
    lines = [
        "# 技能目录",
        "",
        "简体中文 · [English](CATALOG.en.md)",
        "",
        f"本目录整理自 {data['snapshot_date']} 的一次 Codex 安装盘点。按任务查个人技能，按插件查扩展能力。"
        "安装包实际提供的内容、命令和外部软件要求见[安装说明](../README.md)。",
        "",
        "| 来源 | 盘点结果 | 如何理解 |",
        "| --- | --- | --- |",
        f"| 个人技能目录 | {len(personal)} 个顶层条目 | {active} 个未关闭独立入口，"
        f"{len(personal)-active} 个由 {len(parents)} 个工作台调用。发布时会话列出了其中 {visible_personal} 个入口。 |",
        f"| 系统技能 | {len(system)} 个磁盘条目 | 当次会话列出 {visible_system} 个，随 Codex 提供。 |",
        f"| 会话中的插件技能 | {len(visible_plugins)} 个 | 来自 {package_count} 个插件；启用状态、版本及账号条件由宿主管理。 |",
        f"| 其他插件缓存 | {len(other_plugins)} 条 | 当前会话未列出该来源与版本，其中可含同名技能。 |",
        f"| 本地参考库 | {len(libs)} 个集合 | 共 {sum(r['skill_files'] for r in libs):,} 份 SKILL.md 文件，含源码副本和历史快照。 |",
        "",
        "个人目录按每个顶层入口计一次，目录链接与它的目标只计一个入口。插件按来源、包、版本和技能目录计数。"
        "参考库统计排除了 Git 对象和目录链接，保留实际存在的副本。上述行各有用途，直接相加会重复计算。",
        "",
        "## 个人技能",
        "",
        "“会话入口”可在盘点当次通过技能名选择；“仅磁盘”表示存在入口文件且配置未关闭，但会话列表未列出；"
        "“经 … 调用”表示原模块已并入指定工作台。表中的名称取自技能声明。",
        "",
    ]
    categories = group_by(personal, lambda r: r["category"])
    order = ["机械、电子与机器人", "视频、图像与设计", "软件工程与自动化", "学习、研究与办公"]
    for category in dict.fromkeys(order + sorted(categories)):
        if category not in categories:
            continue
        lines.extend([f"### {category}", "", "| 技能名 | 适用任务 | 调用方式 |", "| --- | --- | --- |"])
        for row in categories[category]:
            state = "会话入口" if row["listed_in_session"] else "仅磁盘"
            if row.get("via"):
                state = f"经 `{row['via']}` 调用"
            elif not row["individually_enabled"]:
                state = "已关闭"
            lines.append(f"| `{row['name']}` | {row['summary_zh']} | {state} |")
        lines.append("")
    lines.extend(["## 系统技能", "", "| 技能名 | 适用任务 | 盘点状态 |", "| --- | --- | --- |"])
    for row in system:
        state = "会话入口" if row["listed_in_session"] else "仅磁盘"
        lines.append(f"| `{row['name']}` | {row['summary_zh']} | {state} |")
    lines.extend([
        "",
        "## 会话中的插件技能",
        "",
        "展开包名查看逐项说明。调用时可使用“插件名:技能名”；英文大小写以表中声明为准。",
        "",
        *plugin_tables(visible_plugins),
        "## 其他插件缓存",
        "",
        "以下文件在盘点时位于缓存目录。某插件出现在此处仅证明该版本的文件存在。",
        "",
        *plugin_tables(other_plugins),
        "## 参考库与历史快照",
        "",
        "部分工作台会从这些集合加载已选模块。表中数字按实际文件数统计，可能包含示例、重复版本与备份。",
        "",
        "| 集合 | SKILL.md 文件数 | 内容 |",
        "| --- | ---: | --- |",
    ])
    for row in libs:
        lines.append(f"| `{row['id']}` | {row['skill_files']} | {row['summary_zh']} |")
    lines.extend([
        "",
        "## 更新目录",
        "",
        "核对本次发现的入口与宿主会话列表后，更新[清单数据](../catalog/inventory.json)中的日期、状态和中文用途。"
        "新增第三方来源时，应同时核对安装包内可分发的文件和署名要求。"
        "在仓库根目录运行以下命令生成本页并校验结果。",
        "",
        "```sh",
        "python tools/render_catalog.py",
        "python tools/render_catalog.py --check",
        "```",
        "",
    ])
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="check that the committed page is current")
    args = parser.parse_args()
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    page = render(data)
    if args.check:
        if not DOC.is_file() or DOC.read_text(encoding="utf-8") != page:
            parser.exit(1, "Catalog page is stale. Run tools/render_catalog.py.\n")
        print("Catalog page matches inventory.json.")
        return
    DOC.parent.mkdir(parents=True, exist_ok=True)
    with DOC.open("w", encoding="utf-8", newline="\n") as output:
        output.write(page)


if __name__ == "__main__":
    main()
