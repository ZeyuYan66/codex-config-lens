import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("skill_installer", ROOT / "install.py")
installer = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(installer)


class InstallerTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.script = self.root / "install.py"
        shutil.copyfile(ROOT / "install.py", self.script)
        self.skills = self.root / "skills"
        self.dest = self.root / "target with spaces" / "skills"
        for name in ("render-demo", "robot-demo"):
            src = self.skills / name
            src.mkdir(parents=True)
            (src / "SKILL.md").write_text(f"# {name}\n", encoding="utf-8")
            (src / "references").mkdir()
            (src / "references" / "notes.txt").write_bytes(b"baseline\n")

    def cli(self, *args, code=0):
        result = subprocess.run([sys.executable, str(self.script), "--dest", str(self.dest), *args],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, code, result.stdout + result.stderr)
        return result.stdout + result.stderr

    def test_install_status_update_and_uninstall(self):
        self.assertEqual(self.cli("list").splitlines(), ["render-demo", "robot-demo"])
        self.assertFalse(self.dest.exists())
        self.assertIn("robot-demo: missing", self.cli("status"))
        self.assertFalse(self.dest.exists())
        self.assertIn("robot-demo: installed", self.cli())
        self.assertIn("robot-demo: current", self.cli())
        doc = self.skills / "robot-demo" / "references" / "notes.txt"
        doc.write_bytes(b"updated\n")
        self.assertIn("update available", self.cli("status"))
        self.assertIn("run update", self.cli("install", code=1))
        self.assertIn("updated", self.cli("update"))
        self.assertEqual((self.dest / "robot-demo" / "references" / "notes.txt").read_bytes(), b"updated\n")
        self.assertIn("current", self.cli("status"))
        self.assertIn("removed", self.cli("uninstall", "--skill", "render-demo"))
        self.assertTrue((self.dest / "robot-demo").is_dir())
        shutil.rmtree(self.skills / "robot-demo")
        self.assertIn("removed from bundle", self.cli("status"))
        self.cli("uninstall")
        self.assertFalse((self.dest / "robot-demo").exists())
        self.assertFalse((self.dest / installer.TRANSACTION).exists())

    def test_existing_and_modified_content_survive(self):
        occupied = self.dest / "render-demo"
        occupied.mkdir(parents=True)
        (occupied / "SKILL.md").write_bytes(b"my existing skill\n")
        output = self.cli(code=1)
        self.assertIn("unmanaged", output)
        self.assertIn("robot-demo: installed", output)
        edited = self.dest / "robot-demo" / "user-notes"
        edited.write_bytes(b"personal")
        self.assertIn("modified", self.cli("status"))
        self.cli("update", code=1)
        self.cli("uninstall", code=1)
        self.assertEqual(edited.read_bytes(), b"personal")
        self.assertEqual((occupied / "SKILL.md").read_bytes(), b"my existing skill\n")

    def test_damaged_receipt_and_invalid_name(self):
        self.cli("--skill", "render-demo")
        receipt = self.dest / "render-demo" / installer.RECEIPT
        receipt.write_text("{}", encoding="utf-8")
        self.assertIn("unrecognized", self.cli("uninstall", code=1))
        self.assertTrue(receipt.is_file())
        self.cli("update", "--skill", "../render-demo", code=2)
        self.cli("list", "--skill", "absent", code=2)

    def test_source_symlink_rejected(self):
        ref = self.skills / "render-demo" / "linked"
        try:
            ref.symlink_to(self.script)
        except OSError:
            if os.name != "nt":
                self.skipTest("symlinks unavailable to this runner")
            # Directory junctions require no developer-mode privileges.
            import _winapi
            try:
                _winapi.CreateJunction(str(self.skills / "robot-demo"), str(ref))
            except OSError:
                self.skipTest("runner disallows creating links and junctions")
        self.assertIn("unsupported link", self.cli(code=1))
        self.assertFalse((self.dest / "render-demo").exists())
        self.assertTrue((self.dest / "robot-demo" / "SKILL.md").is_file())

    def test_copy_failure_cleans_staging_and_preserves_existing_skill(self):
        self.cli("--skill", "robot-demo")
        target = self.dest / "robot-demo"
        _, before = installer.installed_state(target, "robot-demo")
        (self.skills / "robot-demo" / "SKILL.md").write_bytes(b"v2\n")
        after = installer.digest_tree(self.skills / "robot-demo")
        with mock.patch.object(installer, "SOURCE", self.skills), \
                mock.patch.object(shutil, "copytree", side_effect=OSError("copy failed")):
            with self.assertRaisesRegex(OSError, "copy failed"):
                installer.replace(self.dest, "robot-demo", before, after)
        self.assertFalse((self.dest / installer.TRANSACTION).exists())
        self.assertEqual(installer.installed_state(target, "robot-demo"), ("managed", before))

    def test_update_recovery(self):
        self.cli("--skill", "robot-demo")
        skill = self.dest / "robot-demo"
        _, before = installer.installed_state(skill, "robot-demo")
        (self.skills / "robot-demo" / "SKILL.md").write_bytes(b"v2\n")
        after = installer.digest_tree(self.skills / "robot-demo")
        txn = self.dest / installer.TRANSACTION
        txn.mkdir()
        installer.write_json(txn / "plan.json", dict(name="robot-demo", before=before, after=after))
        skill.rename(txn / "old")
        (txn / "new").mkdir()
        self.assertIn("interrupted", self.cli("status", code=1))
        self.assertIn("updated", self.cli("update", "--skill", "robot-demo"))
        self.assertEqual((skill / "SKILL.md").read_bytes(), b"v2\n")
        self.assertFalse(txn.exists())

    def test_competing_install_cannot_acquire_lock(self):
        with installer.locked(self.dest):
            self.assertIn("cannot lock", self.cli(code=1))
        self.cli()

    def test_default_destination(self):
        with mock.patch.dict(os.environ, {"CODEX_HOME": str(self.root / "codex")}):
            self.assertEqual(installer.default_dest(), self.root / "codex" / "skills")
        with mock.patch.dict(os.environ):
            os.environ.pop("CODEX_HOME", None)
            with mock.patch.object(Path, "home", return_value=self.root):
                self.assertEqual(installer.default_dest(), self.root / ".agents" / "skills")


class ShippedBundleTests(unittest.TestCase):
    def test_all_shipped_skills_roundtrip_offline(self):
        with tempfile.TemporaryDirectory() as temp:
            dest = Path(temp) / "skills"
            for args in (["list"], ["install"], ["update"], ["status"], ["uninstall"]):
                command = [sys.executable, str(ROOT / "install.py"), *args, "--dest", str(dest)]
                result = subprocess.run(command, capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                if args == ["status"]:
                    for name in installer.bundle_names():
                        self.assertIn(f"{name}: current", result.stdout)
            self.assertFalse(any(p.is_dir() for p in dest.iterdir()))


if __name__ == "__main__":
    unittest.main()
