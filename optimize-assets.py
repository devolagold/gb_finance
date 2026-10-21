#!/usr/bin/env python3
"""Optimise the Figma-exported PNGs in src/assets.

Each image is resized to 2x its rendered CSS box and re-encoded as WebP
(alpha preserved). Run from the repo root:

    python3 optimize-assets.py            # optimise in place
    python3 optimize-assets.py --check    # report savings, write nothing
"""

import argparse
import os
import sys
from PIL import Image

ASSETS = "src/assets"

# source stem -> (max_width, max_height) at 2x the rendered CSS size.
# None means "keep the source dimensions".
TARGETS = {
    "hero-image": (1092, 1166),
    "loan-offer-image": (1252, 1290),
    "investment-image": (1252, 1290),
    "why-photo": (1736, 1156),
    "cta-photo": (1742, 1168),
    "personal-loans": (978, 652),
    "business-loans": (840, 560),
    "flexible-solutions": (840, 560),
    "diverse": (764, 764),
    "clear": (768, 520),
    "goal": (768, 520),
    "gilbert": (902, 1172),
    "3d-naira": (824, 654),
    "pattern": (2160, 36),
    "og-image": (1200, 827),
    "gb-logo": (306, 56),
    "footer-logo": (416, 76),
    "gb-favicon": (192, 192),
    "cbn": (72, 96),
    "partner-renmoney": (550, 176),
    "partner-nccc": (339, 176),
    "partner-cdcare": (623, 176),
    "partner-interswitch": (644, 176),
    "partner-nibss": (247, 176),
    "partner-crc": (741, 176),
    "partner-creditregistry": (716, 176),
}

# Files dropped from the site; safe to remove.
REMOVE = [
    "Business Loans.png",
    "Flexible Solutions.png",
    "hero-person-a.png",
    "hero-person-b.png",
    "laurel.svg",
    "laurel-right.svg",
]

# Kept as PNG because crawlers and browsers need it in a raster format they
# all understand (favicon + Open Graph card).
KEEP_PNG = {"gb-favicon.png", "og-image.png"}

QUALITY = 82
METHOD = 6


def human(n):
    return f"{n / 1024 / 1024:.2f} MB"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    if not os.path.isdir(ASSETS):
        sys.exit(f"{ASSETS}/ not found — run from the repo root")

    before = after = 0
    wrote = []
    converted = []

    # Drop retired assets before converting, so their .webp twins never exist.
    for name in REMOVE:
        stem = os.path.splitext(name)[0]
        for path in (
            os.path.join(ASSETS, name),
            os.path.join(ASSETS, f"{stem}.webp"),
        ):
            if os.path.exists(path):
                os.remove(path)
                print(f"  removed {os.path.basename(path)}")

    for name in sorted(os.listdir(ASSETS)):
        path = os.path.join(ASSETS, name)
        if not os.path.isfile(path) or not name.lower().endswith(".png"):
            continue

        size = os.path.getsize(path)
        before += size
        stem = os.path.splitext(name)[0]

        if name in KEEP_PNG:
            with Image.open(path) as im:
                target = TARGETS.get(stem)
                if target and (im.width > target[0] or im.height > target[1]):
                    im = im.convert("RGBA").resize(target, Image.LANCZOS)
                    if not args.check:
                        im.save(path, optimize=True)
                        after += os.path.getsize(path)
                    else:
                        after += size
                else:
                    after += size
            continue

        target = TARGETS.get(stem)
        with Image.open(path) as im:
            im = im.convert("RGBA")
            if target:
                im = im.resize(target, Image.LANCZOS)
            out = os.path.join(ASSETS, f"{stem}.webp")
            if not args.check:
                im.save(out, "WEBP", quality=QUALITY, method=METHOD)
                os.remove(path)
        newsize = os.path.getsize(out)
        after += newsize
        converted.append((name, name, f"{stem}.webp"))
        wrote.append((name, size, newsize))
        print(f"  {name:28} {human(size):>9} -> {stem}.webp {human(newsize):>9}")

    if not args.check:
        for name in REMOVE:
            path = os.path.join(ASSETS, name)
            if os.path.exists(path):
                os.remove(path)
                print(f"  removed {name}")

    # Point the markup at the converted files.
    for page in ("index.html", "styles.css"):
        path = page
        if not os.path.exists(path):
            continue
        src = open(path).read()
        out = src
        for _, old_name, new_name in converted:
            out = out.replace(f"src/assets/{old_name}", f"src/assets/{new_name}")
        if out != src:
            open(path, "w").write(out)
            print(f"  updated {page}")

    print(f"\nbefore {human(before)}  ->  after {human(after)}")
    if args.check:
        print("(check mode — nothing written)")


if __name__ == "__main__":
    main()
