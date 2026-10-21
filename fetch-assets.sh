#!/usr/bin/env bash
# Refresh the static assets from the Figma MCP asset API into src/assets/.
#
# The Figma asset URLs are temporary — they expire roughly 7 days after the
# Figma context is generated. If a download 404s, re-run get_design_context
# for that node in Figma and update the hash in the manifest below.
#
# Usage:
#   ./fetch-assets.sh          download every asset into src/assets/
#   ./fetch-assets.sh --check  verify every file the site references exists
#
# Raster downloads are re-encoded to WebP by optimize-assets.py, which also
# rewrites the references in index.html and styles.css.
set -euo pipefail
cd "$(dirname "$0")"

DEST="src/assets"
BASE="https://www.figma.com/api/mcp/asset"

# --- Figma nodes ------------------------------------------------------------
NAV=23e6039a-f1d7-4e84-b55a-8557bca025d8
HERO=bf6ec7ee-ca2a-4188-b158-7027c491f25e
LOAN=dd842154-bac8-4e84-a1de-ff2b06c1ec4b
MLOAN=2102446f-4615-4767-942a-172a784ff3d3
INV=01264d4c-9d1c-4a9a-aa56-b1015cd01255
MINV=131b4fb7-32fa-4ccd-b393-1667a54e02d2
WHY=ab27b458-e697-404c-88b6-4beb9f68748d
TEST=b8584450-105c-449a-8924-f05260027460
FAQ=8a63137f-ab39-4186-bddf-bb5be220f90f
CTA=e62a3905-e60a-42f6-879e-ee8a84bf909a
FOOT=ed8456f7-4aed-45a5-9c4f-95f1c4f830dc

# --- Manifest ---------------------------------------------------------------
# <node>  <asset hash>  <file name used by the site>
#
# Only layers that the site actually renders are listed. Decorative Figma
# layers that are recreated in CSS (swirls, card backdrops, the laurel) are
# intentionally left out.
#
# loan-offer-image and investment-image are frame-level exports on the site;
# the closest available layer (the photo) is listed for each.
MANIFEST=$(cat <<EOF
$NAV   f46ea.png   gb-logo.png
$NAV   98b94.svg   arrow-down-s-line.svg
$NAV   99b9a.svg   right-icon.svg
$HERO  7ccef.png   cbn.png
$HERO  f3ee9.png   3d-naira.png
$HERO  c987c.svg   right-icon-black.svg
$HERO  b5a0f.svg   chip-1.svg
$HERO  2ca05.svg   chip-2.svg
$HERO  07094.svg   chip-3.svg
$HERO  976e8.svg   left-arrow-grey.svg
$HERO  6574b.svg   partner-renmoney.svg
$HERO  27c49.png   partner-nccc.png
$HERO  a2cb5.png   partner-cdcare.png
$HERO  8ae4e.png   partner-interswitch.png
$HERO  f0e5e.png   partner-nibss.png
$HERO  9c8ce.png   partner-crc.png
$HERO  92b59.png   partner-creditregistry.png
$HERO  abb6d.png   pattern.png
$LOAN  29527.png   loan-offer-image.png
$MLOAN 39aaf.png   personal-loans.png
$MLOAN f0452.png   business-loans.png
$MLOAN 399f9.png   flexible-solutions.png
$MLOAN 5d01f.svg   liner.svg
$INV   7e0e7.png   investment-image.png
$MINV  8d063.png   diverse.png
$MINV  f6a14.png   clear.png
$MINV  28b90.png   goal.png
$WHY   8c1c8.png   why-photo.png
$WHY   28f7e.svg   trust.svg
$WHY   535f6.svg   flexibility.svg
$WHY   93384.svg   accessibility.svg
$WHY   f530f.svg   growth.svg
$WHY   2a3b3.svg   Security.svg
$TEST  2b82f.png   gilbert.png
$TEST  b49e6.svg   renmoney-test.svg
$TEST  ce3b8.svg   vrule.svg
$TEST  b57d0.svg   quote.svg
$FAQ   e3392.svg   mail.svg
$FAQ   2207c.svg   icon-plus.svg
$FAQ   02a72.svg   icon-minus.svg
$CTA   34d0d.png   cta-photo.png
$CTA   42a81.svg   cta-lineart.svg
$CTA   9436d.svg   icon-loans.svg
$CTA   af4b3.svg   icon-investment.svg
$FOOT  dc750.png   footer-logo.png
$FOOT  b068f.svg   linkedin.svg
$FOOT  ea853.svg   twitter.svg
$FOOT  f2075.svg   facebook.svg
$FOOT  e279f.svg   rule-dashed.svg
$FOOT  6c70a.svg   icon-phone.svg
$FOOT  bac7f.svg   vrule-dashed.svg
EOF
)

# --- Modes ------------------------------------------------------------------

if [[ "${1:-}" == "--check" ]]; then
  missing=0
  for page in index.html styles.css; do
    [[ -f "$page" ]] || continue
    while IFS= read -r ref; do
      [[ -n "$ref" ]] || continue
      if [[ ! -f "$ref" ]]; then
        echo "missing: $ref  (referenced by $page)"
        missing=1
      fi
    done < <(grep -oE '(src|href)="[^"]+"|url\("?[^")]+"?\)' "$page" \
      | sed -E 's/^(src|href)="//; s/"$//; s/^url\("//; s/"\)$//' \
      | grep -E '^(src/assets|assets)/' | sort -u)
  done
  if [[ $missing -eq 0 ]]; then
    echo "All referenced assets are present."
  fi
  exit $missing
fi

# --- Download ---------------------------------------------------------------

mkdir -p "$DEST"
failures=0

echo "Fetching assets into $DEST/ ..."

while read -r node hash name; do
  [[ -n "$node" ]] || continue
  printf '  → %-28s' "$name"
  if curl -fsSL --max-time 120 --retry 3 --retry-delay 2 \
    "$BASE/$node/$hash" -o "$DEST/$name"; then
    echo "ok"
  else
    echo "FAILED (expired URL? re-run get_design_context for $node)"
    failures=$((failures + 1))
  fi
done <<<"$MANIFEST"

if [[ $failures -gt 0 ]]; then
  echo
  echo "$failures asset(s) failed to download."
  exit 1
fi

# --- Post-process -----------------------------------------------------------

echo
echo "Optimising (PNG -> WebP, resizing to 2x) ..."
python3 optimize-assets.py

echo "Done."
