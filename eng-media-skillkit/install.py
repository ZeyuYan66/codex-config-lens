"""Install, inspect, update or remove the offline engineering and media skill pack."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import sys
from contextlib import contextmanager


SOURCE = Path(__file__).resolve().parent / "skills"
RECEIPT = ".eng-media-skillkit.json"
TRANSACTION = ".eng-media-skillkit-transaction"
LOCK = ".eng-media-skillkit.lock"
FORMAT = "eng-media-skillkit/1"
NAME = re.compile(r"[a-z0-9][a-z0-9_-]{0,127}\Z")
HASH = re.compile(r"[a-f0-9]{64}\Z")


class PackError(Exception):
    pass


def kind(path):
    """lstat also recognizes Windows junctions on supported Python versions."""
    try:
        info = path.lstat()
    except FileNotFoundError:
        return "missing"
    if stat.S_ISLNK(info.st_mode) or getattr(info, "st_file_attributes", 0) & 1024:
        return "link"
    if stat.S_ISDIR(info.st_mode):
        return "dir"
    if stat.S_ISREG(info.st_mode):
        return "file"
    return "special"


def check(value, message):
    if not value:
        raise PackError(message)


def digest_tree(root, installed=False):
    result = hashlib.sha256()
    check(kind(root) == "dir", f"expected regular directory: {root}")

    def record_mode(path):
        if os.name != "nt":
            result.update(stat.S_IMODE(path.stat().st_mode).to_bytes(2, "big"))

    def visit(parent):
        for entry in sorted(parent.iterdir(), key=lambda p: p.name):
            if entry.parent == root and entry.name.casefold() == RECEIPT:
                check(installed and entry.name == RECEIPT, f"reserved filename: {entry}")
                continue
            entry_kind = kind(entry)
            check(entry_kind in {"dir", "file"}, f"unsupported {entry_kind}: {entry}")
            relative = entry.relative_to(root).as_posix().encode("utf-8")
            result.update(entry_kind.encode("ascii") + b"\0" + relative + b"\0")
            record_mode(entry)
            if entry_kind == "dir":
                visit(entry)
            else:
                content = hashlib.sha256()
                with entry.open("rb") as reader:
                    for chunk in iter(lambda: reader.read(1024 * 1024), b""):
                        content.update(chunk)
                result.update(content.digest())

    record_mode(root)
    visit(root)
    return result.hexdigest()


def read_json(path):
    check(kind(path) == "file", f"expected regular file: {path}")
    check(path.stat().st_size <= 8192, f"oversized metadata: {path}")
    record = json.loads(path.read_text(encoding="utf-8"))
    check(isinstance(record, dict) and record.get("format") == FORMAT,
          f"unrecognized metadata: {path}")
    return record


def write_json(path, values):
    with path.open("x", encoding="utf-8") as writer:
        json.dump(dict(format=FORMAT, **values), writer, sort_keys=True)
        writer.write("\n")


def installed_state(target, name):
    target_kind = kind(target)
    if target_kind == "missing":
        return "missing", None
    if target_kind != "dir" or kind(target / RECEIPT) == "missing":
        return "unmanaged", None
    receipt = read_json(target / RECEIPT)
    digest = receipt.get("sha256")
    check(receipt.get("name") == name and isinstance(digest, str) and HASH.fullmatch(digest),
          f"invalid receipt: {target / RECEIPT}")
    if digest_tree(target, installed=True) != digest:
        return "modified", digest
    return "managed", digest


@contextmanager
def locked(dest):
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / LOCK
    check(kind(path) in {"missing", "file"}, f"invalid lock file: {path}")
    # Open without truncating. Keep the lock file after release so two processes
    # can never lock different inodes at the same path.
    with path.open("a+b") as handle:
        handle.seek(0)
        try:
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as exc:
            raise PackError(f"cannot lock {dest} (another installation may be running)") from exc
        yield


def finish_transaction(dest):
    txn = dest / TRANSACTION
    if kind(txn) == "missing":
        return
    check(kind(txn) == "dir", f"invalid transaction directory: {txn}")
    if not any(txn.iterdir()):
        txn.rmdir()
        return
    plan = read_json(txn / "plan.json")
    name = plan.get("name")
    check(isinstance(name, str) and NAME.fullmatch(name), f"invalid transaction name in {txn}")
    before, after = plan.get("before"), plan.get("after")
    for digest in (before, after):
        check(digest is None or (isinstance(digest, str) and HASH.fullmatch(digest)),
              f"invalid transaction digest in {txn}")
    check(before or after, f"empty transaction in {txn}")
    check(all(p.name in {"plan.json", "new", "old", "discard"} for p in txn.iterdir()),
          f"unexpected transaction files; inspect {txn}")
    target, old, new, discard = dest / name, txn / "old", txn / "new", txn / "discard"
    if kind(old) != "missing":
        state, previous = installed_state(old, name)
        check(state == "managed" and previous == before,
              f"preserved previous copy for inspection: {old}")
        if after and kind(target) == "missing":
            # Interrupted between the two directory renames. Restore old data.
            old.rename(target)
        else:
            if after:
                state, current = installed_state(target, name)
                check(state == "managed" and current == after,
                      f"destination changed during update; previous copy preserved in {old}")
            check(kind(discard) == "missing", f"unexpected cleanup directory: {discard}")
            old.rename(discard)
    for path in (new, discard):
        if kind(path) != "missing":
            check(kind(path) == "dir", f"invalid transaction data: {path}")
            shutil.rmtree(path)
    (txn / "plan.json").unlink()
    txn.rmdir()


def replace(dest, name, before, after):
    txn = dest / TRANSACTION
    txn.mkdir()
    write_json(txn / "plan.json", dict(name=name, before=before, after=after))
    target, new, old = dest / name, txn / "new", txn / "old"
    try:
        if after:
            # Keep shell scripts executable on POSIX. On Windows a read-only
            # source attribute would interfere with future managed cleanups.
            copier = shutil.copyfile if os.name == "nt" else shutil.copy2
            shutil.copytree(SOURCE / name, new, symlinks=True, copy_function=copier)
            check(digest_tree(new) == after, f"source changed while copying {name}")
            write_json(new / RECEIPT, dict(name=name, sha256=after))
        if before:
            target.rename(old)
            try:
                current, actual = installed_state(old, name)
                check(current == "managed" and actual == before,
                      f"{name} changed during operation; preserved")
            except (PackError, OSError, ValueError):
                old.rename(target)
                raise
        if after:
            check(kind(target) == "missing", f"destination occupied: {target}")
            new.rename(target)
    finally:
        finish_transaction(dest)


def bundle_names():
    check(kind(SOURCE) == "dir", f"bundle has no skills directory: {SOURCE}")
    names = []
    for path in SOURCE.iterdir():
        if path.name.startswith("."):
            continue
        check(NAME.fullmatch(path.name) and kind(path) == "dir" and kind(path / "SKILL.md") == "file",
              f"invalid bundled skill: {path}")
        names.append(path.name)
    check(names, "bundle contains no skills")
    return sorted(names)


def managed_names(dest):
    if kind(dest) == "missing":
        return set()
    return {p.name for p in dest.iterdir() if NAME.fullmatch(p.name)
            and kind(p) == "dir" and kind(p / RECEIPT) != "missing"}


def process(action, dest, name, bundled):
    state, current = installed_state(dest / name, name)
    if action == "uninstall":
        if state == "missing":
            return "already absent"
        check(state == "managed", f"{state}; preserved")
        replace(dest, name, current, None)
        return "removed"
    if state in {"modified", "unmanaged"}:
        if action == "status":
            return state
        raise PackError(f"{state}; preserved")
    available = digest_tree(SOURCE / name) if bundled else None
    if action == "status":
        if state == "missing":
            return "missing"
        if not available:
            return "managed (removed from bundle)"
        return "current" if current == available else "update available"
    check(available, "no longer bundled; use uninstall to remove")
    if current == available:
        return "current"
    check(not current or action == "update", "update available; run update")
    replace(dest, name, current, available)
    return "updated" if current else "installed"


def default_dest():
    configured = os.environ.get("CODEX_HOME")
    base = Path(configured).expanduser() if configured else Path.home() / ".agents"
    return base / "skills"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", nargs="?", default="install",
                        choices=["install", "list", "status", "update", "uninstall"])
    parser.add_argument("--dest", type=Path, default=default_dest(), help="target skills directory")
    parser.add_argument("--skill", action="append", metavar="NAME", help="limit to a skill (repeatable)")
    args = parser.parse_args(argv)
    try:
        bundled = set(bundle_names())
        dest = args.dest.expanduser().absolute()
        check(kind(dest) in {"missing", "dir"}, f"invalid target directory: {dest}")
        resolved = dest.resolve()
        check(resolved != SOURCE and SOURCE not in resolved.parents, "choose a destination outside bundled skills")
        for name in args.skill or ():
            if not NAME.fullmatch(name):
                parser.error(f"invalid skill name: {name}")
        if args.action == "list":
            names = set(args.skill or bundled)
            if not names <= bundled:
                parser.error("unknown skill: " + ", ".join(sorted(names - bundled)))
            for name in sorted(names):
                print(name)
            return 0

        def run():
            managed = managed_names(dest) if args.action in {"status", "uninstall"} else set()
            known = bundled | managed
            default = managed if args.action == "uninstall" else known
            names = set(args.skill or default)
            if not names <= known:
                parser.error("unknown skill: " + ", ".join(sorted(names - known)))
            print(f"Skills directory: {dest}")
            problems = 0
            for name in sorted(names):
                try:
                    result = process(args.action, dest, name, name in bundled)
                except (PackError, OSError, ValueError) as exc:
                    problems += 1
                    print(f"{name}: {exc}", file=sys.stderr)
                    if kind(dest / TRANSACTION) != "missing":
                        print("Transaction needs attention. Interrupted remaining operations.", file=sys.stderr)
                        break
                else:
                    print(f"{name}: {result}")
            return int(problems != 0)

        if args.action == "status":
            if kind(dest / TRANSACTION) != "missing":
                raise PackError("interrupted operation; rerun install, update or uninstall for recovery")
            return run()
        with locked(dest):
            finish_transaction(dest)
            return run()
    except (PackError, OSError, ValueError, RuntimeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
