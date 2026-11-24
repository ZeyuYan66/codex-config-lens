"""Verify skill provenance and package a deterministic, offline-installable ZIP."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import stat
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = {"engineering-media-studio", "lab-demo-edit"}
INCLUDE_DIRS = ("catalog", "docs", "skills", "tests", "tools")
INCLUDE_FILES = (
    "install.py", "LICENSE", "README.md", "README.en.md",
    "THIRD_PARTY.md", "THIRD_PARTY.en.md",
)
IGNORED = {".git", ".DS_Store", "node_modules", "__pycache__"}


def check_skills():
    folders = {path.name: path for path in (ROOT / "skills").iterdir() if path.is_dir()}
    entries = []
    for name in ("bundled", "additional"):
        path = ROOT / "catalog" / f"{name}.json"
        entries.extend(json.loads(path.read_text(encoding="utf-8"))["skills"])
    upstream = {entry["name"] for entry in entries}
    if len(upstream) != len(entries) or set(folders) != ORIGINAL | upstream or ORIGINAL & upstream:
        raise ValueError("skills and provenance inventories disagree")
    for name, folder in folders.items():
        headline = (folder / "SKILL.md").read_text(encoding="utf-8-sig").split("---", 2)[1]
        if not re.search(rf"^name:\s*['\"]?{re.escape(name)}['\"]?\s*$", headline, re.M):
            raise ValueError(f"skill name differs from folder: {name}")
        if not re.search(r"^description:", headline, re.M):
            raise ValueError(f"missing skill description: {name}")
        if not any(file.is_file() for file in folder.glob("LICENSE*")):
            raise ValueError(f"missing license: {name}")
    return len(folders)


def paths():
    yield from (ROOT / name for name in INCLUDE_FILES)
    for name in INCLUDE_DIRS:
        for path in (ROOT / name).rglob("*"):
            if set(path.parts) & IGNORED or path.suffix in {".pyc", ".pyo"}:
                continue
            info = path.lstat()
            if path.is_symlink() or getattr(info, "st_file_attributes", 0) & 1024:
                raise ValueError(f"links are unsupported: {path.relative_to(ROOT)}")
            if path.is_file():
                yield path
            elif not path.is_dir():
                raise ValueError(f"unsupported file type: {path.relative_to(ROOT)}")


def build(version, output):
    count = check_skills()
    files = sorted(paths(), key=lambda path: path.relative_to(ROOT).as_posix())
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f"eng-media-skillkit-v{version}.zip"
    seen = set()
    with zipfile.ZipFile(archive, "w") as bundle:
        for path in files:
            name = "eng-media-skillkit/" + path.relative_to(ROOT).as_posix()
            if name.casefold() in seen:
                raise ValueError(f"duplicate filename on case-insensitive filesystems: {name}")
            seen.add(name.casefold())
            entry = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0))
            mode = 0o755 if path.suffix == ".sh" else 0o644
            entry.create_system = 3
            entry.external_attr = (stat.S_IFREG | mode) << 16
            bundle.writestr(entry, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    digest_file = output / "SHA256SUMS.txt"
    previous = digest_file.read_text(encoding="utf-8").splitlines() if digest_file.exists() else []
    checksums = [line for line in previous if not line.endswith(f"  {archive.name}")]
    checksums.append(f"{digest}  {archive.name}")
    digest_file.write_text("\n".join(checksums) + "\n", encoding="utf-8", newline="\n")
    print(f"{archive.name}: {count} skills, {len(files)} files, {archive.stat().st_size} bytes")
    print(digest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("version")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", args.version):
        parser.error("use a numeric version (for example, 1.0.0)")
    build(args.version, args.output)


if __name__ == "__main__":
    main()
