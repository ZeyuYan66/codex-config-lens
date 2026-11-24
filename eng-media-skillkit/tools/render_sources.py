"""Render pinned upstream references without exporting local paths."""

import argparse
from collections import defaultdict
import json
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
STATUS = {
    "pinned": "固定版本",
    "local_only": "本机入口",
    "local_router": "本机整合入口",
    "local_collection": "本机参考集合",
    "host_managed": "宿主管理",
    "catalog_only": "目录记录",
}


def upstream(source):
    ref = source["commit"]
    path = source["path"]
    target = "blob" if source["kind"] == "file" else "tree"
    link = f"https://github.com/{source['repository']}/{target}/{ref}"
    if path != ".":
        link += "/" + quote(path)
    return f"[{source['repository']} · {ref[:8]}]({link})"


def render(data):
    lines = [
        "# 技能来源索引",
        "",
        "简体中文 · [English](SOURCES.en.md)",
        "",
        f"来源盘点于 {data['snapshot_date']}。链接指向已记录的上游固定提交。"
        "复现工作流时，按相应来源的许可证和安装说明获取依赖。"
        "安装包里的技能和适配说明见[第三方技能](../THIRD_PARTY.md)。",
        "",
        "## 个人目录",
        "",
        "| 本地入口 | 来源状态 | 上游或对应工作流 |",
        "| --- | --- | --- |",
    ]
    for row in sorted(data["personal"], key=lambda row: row["id"]):
        notes = []
        if "source" in row:
            notes.append(upstream(row["source"]))
        if row.get("routes"):
            notes.append("、".join(f"`{name}`" for name in row["routes"]))
        if row.get("note"):
            notes.append(row["note"])
        name = row["name"]
        if row["id"] != name:
            name += f"`（目录 `{row['id']}`）"
            label = "`" + name
        else:
            label = f"`{name}`"
        lines.append(f"| {label} | {STATUS[row['status']]} | {' · '.join(notes)} |")

    lines += ["", "## 本机工作台的领域模块", ""]
    workbenches = defaultdict(list)
    for row in data["domain_modules"]:
        workbenches[row["workbench"]].append(row)
    for name, rows in sorted(workbenches.items()):
        lines += [f"### {name}", "", "| 模块 | 固定版本 |", "| --- | --- |"]
        for row in sorted(rows, key=lambda row: row["name"]):
            lines.append(f"| `{row['name']}` | {upstream(row['source'])} |")
        lines.append("")

    lines += [
        "## MATLAB 与 Simulink",
        "",
        "打开上面的固定版本链接并查看 MathWorks 上游安装说明。以下要求对应盘点记录中的工作流版本。",
        "",
    ]
    for name, requirement in data["mathworks_requirements"].items():
        lines.append(f"- `{name}`。{requirement}")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = json.loads((ROOT / "catalog/sources.json").read_text(encoding="utf-8"))
    doc = ROOT / "docs/SOURCES.md"
    page = render(data)
    if args.check:
        if doc.read_text(encoding="utf-8") != page:
            parser.exit(1, "Run tools/render_sources.py to refresh the source index.\n")
    else:
        doc.write_text(page, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    main()
