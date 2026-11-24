# Maintenance and releases

[简体中文](MAINTAINING.md) · English

## v1.0.1 · 2026-11-24

Added English installation, catalog, source, licensing, and maintenance pages, plus English guides and a subtitle sample for the original workflows. Both languages use the same offline package. [v1.0.0 ZIP](../downloads/eng-media-skillkit-v1.0.0.zip)

## v1.0.0 · 2026-11-24

Initial release. Inventoried 98 personal skill entries along with system skills, plugins, and reference collections. Added offline installation and a shot-list tool for generating SRT subtitles.

## Update a skill

1. Find the currently pinned revision and license. Review changes to the entry point, scripts, and resources. Keep relative paths, license files, notices, and descriptions of local adaptations.
2. Update `catalog/bundled.json` or `catalog/additional.json` along with the English descriptions in `catalog/english.json`. If the installation snapshot has changed, update `catalog/inventory.json` and `catalog/sources.json` as well.
3. Regenerate the catalog and source pages, run the installer tests, and build the release ZIP. Run the relevant task example after making changes that affect an external application or runtime.
4. Update both README download links and this version history. Commit the reviewed files, the new versioned ZIP, and its checksum. Keep previous archives available at their original paths.

```sh
python tools/render_catalog.py
python tools/render_sources.py
python tools/render_english.py
python -m unittest discover -s tests -v
python tools/build_release.py 1.0.1 --output downloads
```

To verify a download, run `Get-FileHash eng-media-skillkit-v1.0.1.zip -Algorithm SHA256` on Windows or `shasum -a 256 eng-media-skillkit-v1.0.1.zip` on macOS or Linux. Compare the result with the published [SHA-256 checksums](../downloads/SHA256SUMS.txt).

## Resolve installation conflicts

- `unmanaged` means the destination already has a skill with the same name. Use `--skill` to select other entries or `--dest` to choose a separate location.
- `modified` means an installed skill has local edits. Back up the changes before merging the new version.
- `update available` means the pack contains a newer version. Run `update` with the same destination to upgrade managed, unmodified copies.
- If an operation was interrupted, rerun install, update, or uninstall with the same destination. If the error persists, keep the destination and transaction files for troubleshooting.

For install, update, and uninstall, exit code `0` indicates success, `1` indicates a conflict or error, and `2` indicates invalid arguments. When reporting an issue, include the pack, Codex, OS, and relevant runtime versions plus a copy of the error with account details and personal paths removed.
