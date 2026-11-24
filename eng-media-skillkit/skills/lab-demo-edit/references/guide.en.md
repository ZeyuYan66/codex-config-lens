# Edit a lab demo

[简体中文](../SKILL.md)

Confirm the target duration and orientation, which live audio to retain, and which instruments or screens need to stay readable. Record the filename, duration, and usable in and out points for existing clips. Use the user's script or the audible recording for spoken lines.

1. Match the action, measurement conditions, and result from the same trial. Leave enough screen time to read the instrument. Before cropping to a different orientation, mark rulers, plot legends, and indicators that need to remain visible.
2. Create a UTF-8 CSV in playback order using [the sample shot list](../assets/shots.en.csv). Each row represents one straight cut at normal speed. The `in` and `out` columns are times in the source clip, in seconds with up to three decimal places. Leave `caption` blank for silent sections. Split a clip into multiple rows if each spoken line needs its own cue.
3. From the skill directory, run `python scripts/timeline.py assets/shots.en.csv --srt demo.srt`. Cut clips against the printed edit times, then import the UTF-8 SRT at time zero in CapCut or another editor. For overlaps, speed changes, or detached audio, resync against the editor's final timeline.
4. If the user requests a rendered video, export to a new file with the available editor or FFmpeg. Check readings, live audio, subtitles, and duration on the export. FFprobe can report basic stream and duration information.

```sh
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type,width,height -of json demo.mp4
```

The sample creates captions without media files. With real footage, use the actual filenames and keep each out point within its source clip.
