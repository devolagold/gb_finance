#!/usr/bin/env bash
# Downloads every static asset used by index.html into ./assets/.
# The Figma asset URLs are temporary (they expire ~7 days after generation).
# If any 404, re-run get_design_context for that node in Figma to refresh them.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets
B="https://www.figma.com/api/mcp/asset"

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

get() { # prefix file localname
  echo "→ $3"
  curl -fsSL "$B/$1/$2" -o "assets/$3"
}

# Navbar
get $NAV f46ea.png logo.png
get $NAV 98b94.svg chevron-down.svg
get $NAV 99b9a.svg arrow-right-white.svg
# Hero
get $HERO 7ccef.png cbn-badge.png
get $HERO e6c4f.png hero-person-a.png
get $HERO 63157.png hero-person-b.png
get $HERO 9452d.svg hero-swirl-a.svg
get $HERO 12bd3.svg hero-swirl-b.svg
get $HERO f3ee9.png coin.png
get $HERO c987c.svg arrow-right-dark.svg
get $HERO b5a0f.svg icon-working-capital.svg
get $HERO 2ca05.svg icon-asset-finance.svg
get $HERO 07094.svg icon-project-finance.svg
get $HERO 976e8.svg carousel-prev.svg
get $HERO c8b97.svg carousel-next.svg
get $HERO da1eb.svg laurel.svg
get $HERO e58ff.svg laurel-mask.svg
get $HERO 6574b.svg partner-renmoney.svg
get $HERO 27c49.png partner-nccc.png
get $HERO a2cb5.png partner-cdcare.png
get $HERO 8ae4e.png partner-interswitch.png
get $HERO f0e5e.png partner-nibss.png
get $HERO 9c8ce.png partner-crc.png
get $HERO 92b59.png partner-creditregistry.png
get $HERO abb6d.png pattern.png
# Loan offer
get $LOAN 8fa0f.png loan-shape.png
get $LOAN 29527.png loan-photo.png
# More loan offers (cards)
get $MLOAN 2ef4f.png card-bg.png
get $MLOAN 39aaf.png card-layer-32.png
get $MLOAN f0452.png card-layer-33.png
get $MLOAN 399f9.png card-layer-34.png
get $MLOAN 5d01f.svg rule-light.svg
# Investments
get $INV 7e0e7.png invest-photo.png
get $INV 87450.svg invest-shape.svg
get $INV c5d67.svg invest-swirl.svg
# More investments (cards)
get $MINV 8d063.png inv-card1-layer37.png
get $MINV 72b90.png inv-card2-layer38.png
get $MINV f6a14.png inv-card2-layer39.png
get $MINV 28b90.png inv-card3-layer36.png
get $MINV 8bed4.svg rule-light-2.svg
# Why choose us
get $WHY 8c1c8.png why-photo.png
get $WHY 28f7e.svg icon-trust.svg
get $WHY 535f6.svg icon-timer.svg
get $WHY 93384.svg icon-accessibility.svg
get $WHY f530f.svg icon-growth.svg
get $WHY 2a3b3.svg icon-security.svg
# Testimonials
get $TEST 2b82f.png testimonial-gilbert.png
get $TEST 679f9.svg gb-mark-light.svg
get $TEST b49e6.svg gb-mark-small.svg
get $TEST ce3b8.svg vrule.svg
get $TEST b57d0.svg quote-mark.svg
# FAQ
get $FAQ e3392.svg icon-mail.svg
get $FAQ 2207c.svg icon-plus.svg
get $FAQ 02a72.svg icon-minus.svg
# CTA
get $CTA 34d0d.png cta-photo.png
get $CTA 42a81.svg cta-lineart.svg
get $CTA 9436d.svg icon-loans.svg
get $CTA af4b3.svg icon-invest.svg
# Footer
get $FOOT dc750.png footer-logo.png
get $FOOT b068f.svg social-linkedin.svg
get $FOOT ea853.svg social-twitter.svg
get $FOOT f2075.svg social-facebook.svg
get $FOOT fd9c4.svg social-github.svg
get $FOOT 37976.svg social-youtube.svg
get $FOOT e279f.svg rule-dashed.svg
get $FOOT 6c70a.svg icon-phone.svg
get $FOOT bac7f.svg vrule-dashed.svg
get $FOOT 84c7e.svg rule-dashed-2.svg
echo "Done."
