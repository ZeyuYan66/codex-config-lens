# Codex Skills for Engineering Students and Light Video Editing

[简体中文](README.md) · English

An offline skill pack for engineering coursework, hardware prototypes, lab reports, and short demo videos. Turn a dimension sheet into a model, lab readings into a figure, or a shot list into a subtitle file.

## Download and install

1. Download [eng-media-skillkit-v1.0.1.zip](downloads/eng-media-skillkit-v1.0.1.zip), extract it, and open a terminal in the `eng-media-skillkit` folder.
2. Run `python install.py` with Python 3.10 or newer. Use `py install.py` on Windows or `python3 install.py` on macOS and Linux if that is how Python is installed.
3. In a new Codex chat, type `$engineering-media-studio` or `$lab-demo-edit`. Restart Codex if the skills menu has yet to refresh.

The default destination is `~/.agents/skills`. If you set `CODEX_HOME`, the installer uses its `skills` directory. Pass `--dest "~/.codex/skills"` if your Codex installation uses that location. To install into a single project, run the installer using its absolute path from the project root with `--dest .agents/skills`.

```sh
python install.py list
python install.py status
python install.py --skill engineering-media-studio --skill lab-demo-edit
python install.py update
python install.py uninstall
```

After extracting a new version, run `update` from its folder and use the same destination as before. The installer preserves existing skills with matching names and locally edited files while processing the other entries. Uninstall removes unmodified copies installed by this pack.

## Try a workflow

| Task | Prompt to try in Codex | Skills and tools |
| --- | --- | --- |
| CAD and 3D printing | “Use `$engineering-media-studio` to model an enclosure from this dimension sheet, export STEP and STL, and check the mounting holes.” | `cadquery-llm`, `cad`, `engineering-drawing`, `print3d`. Use CadQuery or build123d for modeling and a slicer profile for your printer. |
| PCB, firmware, and robotics | “Use this I/O table to check the sensor wiring, sampling rate, and serial output.” | `embedded-systems`, `pcb`, `easyeda-format-skill`, `ros2`, `tf2-transforms`. Board verification needs the relevant software and hardware. |
| Lab figures and presentations | “Use `$academic-plotting` to turn this CSV into a report figure with units, sample counts, and a script I can rerun.” | `academic-plotting`, `literature-review`, `scientific-critical-thinking`, `presenting-conference-talks`. |
| Short demo videos | “Use `$lab-demo-edit` to pick the shots from setup through the final reading and create an SRT I can import into CapCut.” | `lab-demo-edit`, `ffmpeg`, `video-edit`, `capcut-edit`. Export with FFmpeg or a video editor. Draft editing requires a compatible editor version and the CapCut CLI. |

Run this example from the extracted folder to make a subtitle file. The three sample shots total 7.5 seconds, with a 1.25-second gap between the two subtitles.

```sh
python skills/lab-demo-edit/scripts/timeline.py skills/lab-demo-edit/assets/shots.en.csv --srt demo.srt
```

## Catalog, licenses, and maintenance

The download installs **70 skills**, including two original workflows with Chinese and English guides. The installation snapshot covers 98 personal skill entries, six system entries, 100 skills listed by plugins in the session, 53 other cached plugin entries, and 21 reference collections. The catalog describes the rest and identifies their host or source where known. System skills and plugin features come through their respective hosts. MATLAB, Simulink, and similar tools use their own licenses.

- Find a skill by purpose and see how it was available at the time of the snapshot. [Complete catalog](docs/CATALOG.en.md)
- Find pinned upstream revisions and requirements for tools such as MATLAB and Simulink. [Source index](docs/SOURCES.en.md)
- Check licenses, origins, and runtime requirements for the bundled skills. [Third-party skills](THIRD_PARTY.en.md)
- Verify a download, update a skill, or rebuild the ZIP. [Maintenance and releases](docs/MAINTAINING.en.md) · [SHA-256 checksums](downloads/SHA256SUMS.txt)

The original scripts, workflows, and package documentation use the MIT license. Third-party skills retain their upstream language and include their own licenses. [Original license](LICENSE)
