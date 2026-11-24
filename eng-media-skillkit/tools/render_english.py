"""Render the English catalog, source index, and third-party credits."""

import argparse
from collections import defaultdict
import json
from pathlib import Path

from render_catalog import group_by
from render_sources import upstream


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {
    "机械、电子与机器人": "Mechanical design, electronics, and robotics",
    "视频、图像与设计": "Video, images, and design",
    "软件工程与自动化": "Software engineering and automation",
    "学习、研究与办公": "Study, research, and office work",
}
STATUS = {
    "pinned": "Pinned upstream revision",
    "local_only": "Local entry",
    "local_router": "Local workbench",
    "local_collection": "Local reference collection",
    "host_managed": "Host-managed",
    "catalog_only": "Catalog entry",
}
SOURCE_NOTES = {
    "CLI 与剪映桌面端需按上游说明安装。": "Follow the upstream instructions to install the CLI and desktop editor.",
    "个人安装管理与合并关系由本地目录维护。": "The local inventory tracks installations and consolidated entry points.",
    "安装记录标为宿主捆绑版本；未记录独立上游的固定提交。": "The installation record identifies it as host-bundled and supplies no independent upstream revision.",
    "本地入口引用 browser-workbench、Windows 应用工具及宿主的 Computer Use。": "The local entry references browser-workbench, Windows app tools, and the host's Computer Use.",
    "本地写作技能缺少可核实的上游版本记录。": "The local writing skill has no verified upstream revision on record.",
    "本地写作指南缺少可核实的上游版本记录。": "The local writing guide has no verified upstream revision on record.",
    "本地报价单技能缺少可核实的上游版本记录。": "The local quotation skill has no verified upstream revision on record.",
    "本地排行索引混合了大量不同来源；各专用入口可按本表索引定位。": "The local ranking index combines a number of sources. Find individual entries in this table.",
    "本地研究指南缺少可核实的上游版本记录。": "The local research guide has no verified upstream revision on record.",
    "本机整合入口；具体上游与固定版本见领域模块表。": "See the module tables for upstream projects and pinned revisions.",
    "本机整合入口；模块版本见对应个人条目。": "See each related personal entry for its module revision.",
    "用途见技能目录；此处只保留入口名称。": "See the catalog for its purpose.",
}
MATHWORKS = {
    "matlab-analyze-spectrum": "MATLAB R2024b or newer and Signal Processing Toolbox.",
    "matlab-identify-linear-system": "MATLAB R2021a or newer and System Identification Toolbox.",
    "building-simulink-models": "MATLAB R2023a or newer and Simulink. Some models also use Stateflow, System Composer, or Simscape.",
    "simulating-simulink-models": "MATLAB R2023a or newer and Simulink.",
}


def read(name):
    return json.loads((ROOT / "catalog" / f"{name}.json").read_text(encoding="utf-8"))


def heading(title, chinese_path):
    return [f"# {title}", "", f"[简体中文]({chinese_path}) · English", ""]


def table(lines, headers, rows):
    lines.extend([
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ])
    lines.extend("| " + " | ".join(str(cell) for cell in row) + " |" for row in rows)
    lines.append("")


def plugin_key(row):
    return f"{row['plugin']}/{row['id']}"


def plugin_tables(lines, rows, descriptions):
    groups = group_by(rows, lambda row: (row["plugin"], row["provider"], row["version"]))
    for (name, provider, version), group in sorted(groups.items()):
        lines.extend(["<details>", f"<summary>{name} · {version} ({len(group)} entries)</summary>",
                      "", f"Provider `{provider}`.", ""])
        table(lines, ["Skill", "Purpose"],
              ((f"`{row['name']}`", descriptions[plugin_key(row)]) for row in group))
        lines.extend(["</details>", ""])


def availability(row):
    if row.get("via"):
        return f"Via `{row['via']}`"
    if not row.get("individually_enabled", True):
        return "Disabled"
    return "Listed in session" if row["listed_in_session"] else "On disk"


def render_catalog(data, tr):
    people, system = data["personal"], data["system"]
    plugins, libraries = data["plugin_skills"], data["reference_collections"]
    current_plugins = [row for row in plugins if row["listed_in_session"]]
    cached_plugins = [row for row in plugins if not row["listed_in_session"]]
    enabled = sum(row["individually_enabled"] for row in people)
    workbenches = {row["via"] for row in people if row.get("via")}
    host_plugins = {(row["provider"], row["plugin"]) for row in current_plugins}
    files = sum(row["skill_files"] for row in libraries)

    lines = heading("Skill catalog", "CATALOG.md")
    lines.extend([
        f"Snapshot from {data['snapshot_date']}. Browse personal skills by task and extensions by plugin. "
        "See the [installation guide](../README.en.md) for the contents of the downloadable pack.",
        "",
    ])
    table(lines, ["Source", "Count", "Scope"], [
        ("Personal skill directory", f"{len(people)} entries",
         f"{enabled} individually enabled and {len(people) - enabled} routed through {len(workbenches)} workbenches. "
         f"{sum(row['listed_in_session'] for row in people)} appeared in the session."),
        ("System", f"{len(system)} entries", f"{sum(row['listed_in_session'] for row in system)} appeared in the session."),
        ("Plugin skills in session", len(current_plugins), f"Provided by {len(host_plugins)} plugins."),
        ("Other plugin cache entries", len(cached_plugins), "May include another version of a skill listed elsewhere."),
        ("Local reference library", f"{len(libraries)} collections", f"{files:,} SKILL.md files including snapshots and copies."),
    ])
    lines.extend([
        "Personal entries count once at the top level. Plugin entries are counted by provider, plugin, version, "
        "and skill directory. Reference counts exclude Git objects and directory links. Some entries overlap across rows.",
        "", "## Personal skills", "",
    ])
    categories = group_by(people, lambda row: row["category"])
    for category, group in CATEGORIES.items():
        lines.extend([f"### {group}", ""])
        table(lines, ["Skill", "Purpose", "Availability"],
              ((f"`{row['name']}`", tr["personal"][row["id"]], availability(row))
               for row in categories[category]))
    lines.extend(["## System skills", ""])
    table(lines, ["Skill", "Purpose", "Availability"],
          ((f"`{row['name']}`", tr["system"][row["id"]], availability(row)) for row in system))
    lines.extend(["## Plugin skills in the session", "",
                  "Expand a plugin to browse its skills. The host manages versions, availability, and account requirements.", ""])
    plugin_tables(lines, current_plugins, tr["plugin_skills"])
    lines.extend(["## Other cached plugin entries", "",
                  "These versions had files in the local cache at the time of the snapshot.", ""])
    plugin_tables(lines, cached_plugins, tr["plugin_skills"])
    lines.extend(["## Reference libraries and historical snapshots", ""])
    table(lines, ["Collection", "SKILL.md files", "Contents"],
          ((f"`{row['id']}`", row["skill_files"], tr["reference_collections"][row["id"]]) for row in libraries))
    lines.extend(["To update this page, update the inventory and English descriptions, then run `python tools/render_english.py`.", ""])
    return "\n".join(lines)


def render_sources(data):
    lines = heading("Upstream source index", "SOURCES.md")
    lines.extend([
        f"Source snapshot from {data['snapshot_date']}. Links point to the upstream revisions on record. "
        "Follow upstream license and setup instructions when using their workflows. "
        "See [Third-party skills](../THIRD_PARTY.en.md) for the copies distributed in the ZIP.",
        "", "## Personal skill entries", "",
    ])
    rows = []
    for row in sorted(data["personal"], key=lambda row: row["id"]):
        label = f"`{row['name']}`"
        if row["name"] != row["id"]:
            label += f" (directory `{row['id']}`)"
        detail = [upstream(row["source"])] if "source" in row else []
        if row.get("routes"):
            detail.append(", ".join(f"`{name}`" for name in row["routes"]))
        if row.get("note"):
            detail.append(SOURCE_NOTES[row["note"]])
        rows.append((label, STATUS[row["status"]], " · ".join(detail)))
    table(lines, ["Local entry", "Source status", "Upstream or related workflow"], rows)
    lines.extend(["## Domain modules used by local workbenches", ""])
    groups = defaultdict(list)
    for row in data["domain_modules"]:
        groups[row["workbench"]].append(row)
    for name, group in sorted(groups.items()):
        lines.extend([f"### {name}", ""])
        table(lines, ["Module", "Pinned revision"],
              ((f"`{row['name']}`", upstream(row["source"])) for row in sorted(group, key=lambda row: row["name"])))
    lines.extend(["## MATLAB and Simulink", "",
                  "These requirements correspond to the pinned MathWorks workflows listed above.", ""])
    lines.extend(f"- `{name}` — {MATHWORKS[name]}" for name in data["mathworks_requirements"])
    lines.append("")
    return "\n".join(lines)


def credit(row):
    license_path = row.get("license_file", row["path"] + "/LICENSE")
    return f"[Upstream {row['revision'][:8]}]({row['source']}) · [{row['license']}]({license_path})"


def render_credits(main, supplemental, tr):
    lines = heading("Third-party skills", "THIRD_PARTY.md")
    lines.extend([
        f"The offline pack includes {len(main) + len(supplemental)} third-party skills. "
        "The pinned revisions and applicable licenses are listed below. The manifests record the local adaptations. "
        "[Core manifest](catalog/bundled.json) · [Supplemental manifest](catalog/additional.json)",
        "",
        "The FFmpeg guides retain their AGPL-3.0 license and source text. The OpenMotion and GSAP guides "
        "require their respective runtime tools for the relevant tasks. The PCB guide's license includes its KiStack attribution.",
        "", "## Core skills", "",
    ])
    table(lines, ["Skill", "Purpose", "Requirements", "Source and license"],
          ((f"[{row['name']}]({row['path']}/SKILL.md)", *tr["bundled"][row["name"]], credit(row)) for row in main))
    lines.extend(["## Supplemental skills", "",
                  "This group covers software engineering, CAD, visual design, and writing. "
                  "Each skill directory includes its license. Some upstream workflows require explicit invocation.", ""])
    table(lines, ["Skill", "Purpose", "Source and license"],
          ((f"[{row['name']}]({row['path']}/SKILL.md)", tr["additional"][row["name"]], credit(row)) for row in supplemental))
    return "\n".join(lines)


def check_keys(label, expected, translations):
    required, present = set(expected), set(translations)
    if required != present:
        raise ValueError(f"{label}: missing {sorted(required - present)}, extra {sorted(present - required)}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    inventory, sources, tr = read("inventory"), read("sources"), read("english")
    bundled, supplemental = read("bundled")["skills"], read("additional")["skills"]
    for name in ("personal", "system", "reference_collections"):
        check_keys(name, (row["id"] for row in inventory[name]), tr[name])
    check_keys("plugins", map(plugin_key, inventory["plugin_skills"]), tr["plugin_skills"])
    check_keys("categories", (row["category"] for row in inventory["personal"]), CATEGORIES)
    check_keys("core bundle", (row["name"] for row in bundled), tr["bundled"])
    check_keys("supplemental bundle", (row["name"] for row in supplemental), tr["additional"])
    check_keys("MathWorks", sources["mathworks_requirements"], MATHWORKS)
    pages = {
        "docs/CATALOG.en.md": render_catalog(inventory, tr),
        "docs/SOURCES.en.md": render_sources(sources),
        "THIRD_PARTY.en.md": render_credits(bundled, supplemental, tr),
    }
    for filename, page in pages.items():
        path = ROOT / filename
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != page:
                parser.exit(1, f"{filename} is stale. Run tools/render_english.py.\n")
        else:
            path.write_text(page, encoding="utf-8", newline="\n")
    print("English pages match the catalog data.")


if __name__ == "__main__":
    main()
