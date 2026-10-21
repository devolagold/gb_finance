# gb_finance

Marketing site for **Greenbond Finance Company Limited** — a CBN-licensed
lending and investment company in Nigeria. Single page, no build step, no
dependencies.

```
index.html        the whole page
styles.css        all styling; design tokens live in :root
main.js           accordion, hero carousel, nav dropdown, mobile nav, newsletter
src/assets/       images exported from Figma
fetch-assets.sh   pulls the assets back out of Figma
optimize-assets.py  re-encodes those downloads to WebP at 2x their rendered size
```

## Running it

Any static server works; the page uses relative paths only.

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Page structure

| Section | Notes |
| --- | --- |
| Navbar | Products dropdown (disclosure pattern), collapses to a hamburger below 1080px |
| Hero | 3-slide carousel; dots are a tablist, each tab owns a tabpanel |
| Partners & metrics | Investor logos, then four stats |
| Loans | Feature split + three product cards |
| Investments | Feature split + three product cards |
| Why choose us | Copy, photo and six values |
| Testimonials | One featured quote plus three cards |
| FAQ | Eight-question accordion, second question open by default |
| CTA | Photo banner with two actions |
| Footer | Contact details, newsletter, offices, legal copy |

## Design tokens

Defined once in `:root` at the top of `styles.css`:

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#131313` | Body text, footer background |
| `--grey` | `#565658` | Secondary copy |
| `--paper` | `#fffefa` | Page background |
| `--green` | `#167347` | Primary action |
| `--brown` | `#58482e` | Loan actions |
| `--teal` | `#176e74` | Investment actions |
| `--pad-x` | `120px` | Page gutter (scales down in media queries) |
| `--font-display` | Boldonse | Headings, uppercase |
| `--font-body` | Zalando Sans | Body copy |
| `--font-mono` | JetBrains Mono | Eyebrow labels |

Fonts load from Google Fonts. If the display face fails to load the
headings fall back to Impact.

## Assets

Raster images are stored as WebP, sized to twice the box they are rendered
in (for HiDPI). `gb-favicon.png` and `og-image.png` stay PNG because
browsers and social crawlers need them in a format they all understand.

To refresh the artwork from Figma:

```sh
./fetch-assets.sh          # download into src/assets/ then optimise
./fetch-assets.sh --check  # verify every file the site references exists
```

The Figma asset URLs expire about a week after the design context is
generated. A 404 means the hash in the manifest at the top of
`fetch-assets.sh` has gone stale — re-run `get_design_context` for that
node in Figma and update it.

`optimize-assets.py` is also safe to run on its own after dropping new
PNGs into `src/assets/`; it converts them, resizes them and updates the
references in `index.html` and `styles.css`.

```sh
python3 optimize-assets.py           # optimise in place
python3 optimize-assets.py --check   # report the savings only
```

## Accessibility

- Skip-free, semantic landmarks (`header`, `main`, `footer`, `section`)
- Carousel is a tablist with roving tabindex and arrow-key navigation
- Accordion buttons own `aria-expanded`; panels are hidden when collapsed
- Dropdown closes on `Escape`, returns focus to its trigger
- Visible focus rings on every interactive element
- `prefers-reduced-motion` disables transitions
- Colour pairs meet WCAG AA against their backgrounds
