"""Convert straight cuts in source seconds to a continuous edit and SRT."""

import argparse
import csv
import re
from pathlib import Path


def milliseconds(value):
    value = (value or "").strip()
    if not re.fullmatch(r"[0-9]+(?:\.[0-9]{1,3})?", value):
        raise ValueError(f"invalid source time {value!r} (use seconds, up to 3 decimals)")
    seconds, _, fraction = value.partition(".")
    return int(seconds) * 1000 + int(fraction.ljust(3, "0"))


def timestamp(value):
    seconds, ms = divmod(value, 1000)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02}:{minutes:02}:{seconds:02},{ms:03}"


def timeline(path):
    shots, subtitles = [], []
    cursor = 0
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ["source", "in", "out", "caption"]:
            raise ValueError("expected CSV header: source,in,out,caption")
        for row in reader:
            try:
                if None in row or any(value is None for value in row.values()):
                    raise ValueError("expected four fields (quote captions containing commas)")
                source = row["source"].strip()
                start, end = milliseconds(row["in"]), milliseconds(row["out"])
                if not source or end <= start:
                    raise ValueError("provide a source and an out point after the in point")
                next_cursor = cursor + end - start
                interval = f"{timestamp(cursor)} --> {timestamp(next_cursor)}"
                shots.append(f"{interval}  {source} [{timestamp(start)} - {timestamp(end)}]")
                caption = "\n".join(line.strip() for line in row["caption"].splitlines() if line.strip())
                if caption:
                    subtitles.append(f"{len(subtitles) + 1}\n{interval}\n{caption}\n\n")
                cursor = next_cursor
            except ValueError as exc:
                raise ValueError(f"CSV line {reader.line_num}: {exc}") from exc
    if not shots:
        raise ValueError("no shots found")
    return shots, "".join(subtitles)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path)
    parser.add_argument("--srt", type=Path, required=True, help="new subtitle file to create")
    args = parser.parse_args()
    try:
        shots, subtitles = timeline(args.csv)
        with args.srt.open("x", encoding="utf-8", newline="\n") as output:
            output.write(subtitles)
    except (OSError, ValueError, csv.Error) as exc:
        parser.exit(1, f"{exc}\n")
    print("\n".join(shots))


if __name__ == "__main__":
    main()
