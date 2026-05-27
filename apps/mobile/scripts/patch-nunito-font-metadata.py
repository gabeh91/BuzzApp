#!/usr/bin/env python3
"""Assign unique PostScript/family names to bundled Nunito Sans static faces.

Variable-font instancing copies the source name table, so every cut can register as
ExtraLight on iOS. Re-run after regenerating fonts from the variable file.
"""

from __future__ import annotations

import json
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._n_a_m_e import NameRecord

FONT_DIR = Path(__file__).resolve().parents[1] / "assets" / "fonts"
MANIFEST_PATH = FONT_DIR / "nunito-font-metadata.json"

FACES: tuple[tuple[str, str, int], ...] = (
    ("NunitoSans-Regular.ttf", "Regular", 400),
    ("NunitoSans-Medium.ttf", "Medium", 500),
    ("NunitoSans-SemiBold.ttf", "SemiBold", 600),
    ("NunitoSans-Bold.ttf", "Bold", 700),
    ("NunitoSans-ExtraBold.ttf", "ExtraBold", 800),
    ("NunitoSans-Black.ttf", "Black", 900),
)

FAMILY = "Nunito Sans"


def _add_name(table, name_id: int, value: str) -> None:
    for platform_id, encoding_id, lang_id in ((3, 1, 0x409), (1, 0, 0)):
        record = NameRecord()
        record.nameID = name_id
        record.platformID = platform_id
        record.platEncID = encoding_id
        record.langID = lang_id
        record.string = value
        table.names.append(record)


def patch_font(path: Path, subfamily: str, weight: int) -> None:
    postscript = path.stem
    font = TTFont(path)
    font["name"].names = []
    _add_name(font["name"], 1, FAMILY)
    _add_name(font["name"], 2, subfamily)
    _add_name(font["name"], 4, f"{FAMILY} {subfamily}")
    _add_name(font["name"], 6, postscript)
    _add_name(font["name"], 16, FAMILY)
    _add_name(font["name"], 17, subfamily)
    font["OS/2"].usWeightClass = weight
    font.save(path)
    print(f"Patched {path.name} -> PostScript {postscript}, weight {weight}")


def verify_font(path: Path, subfamily: str, weight: int) -> list[str]:
    expected_ps = path.stem
    font = TTFont(path)
    postscript = next(
        (record.toUnicode() for record in font["name"].names if record.nameID == 6),
        "",
    )
    errors: list[str] = []
    if postscript != expected_ps:
        errors.append(f"{path.name}: PostScript {postscript!r} != {expected_ps!r}")
    if font["OS/2"].usWeightClass != weight:
        errors.append(
            f"{path.name}: usWeightClass {font['OS/2'].usWeightClass} != {weight}",
        )
    return errors


def write_manifest() -> None:
    manifest = [
        {
            "file": filename,
            "postScript": Path(filename).stem,
            "subfamily": subfamily,
            "weight": weight,
        }
        for filename, subfamily, weight in FACES
    ]
    MANIFEST_PATH.write_text(f"{json.dumps(manifest, indent=2)}\n", encoding="utf-8")


def check_manifest() -> list[str]:
    if not MANIFEST_PATH.is_file():
        return [f"Missing manifest: {MANIFEST_PATH}"]
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    errors: list[str] = []
    for entry in manifest:
        path = FONT_DIR / entry["file"]
        if not path.is_file():
            errors.append(f"Missing font file: {entry['file']}")
            continue
        if entry["postScript"] != Path(entry["file"]).stem:
            errors.append(
                f"{entry['file']}: manifest postScript {entry['postScript']!r} "
                f"!= {Path(entry['file']).stem!r}",
            )
    return errors


def main() -> None:
    import sys

    check_only = "--check" in sys.argv
    errors: list[str] = check_manifest()

    for filename, subfamily, weight in FACES:
        path = FONT_DIR / filename
        if check_only:
            try:
                errors.extend(verify_font(path, subfamily, weight))
            except ModuleNotFoundError:
                pass
        else:
            patch_font(path, subfamily, weight)

    if not check_only:
        write_manifest()
        return

    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
