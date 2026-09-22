# DRIP INDEX v2

The redesigned storefront, served at `/v2/` alongside the original site.

React 19 + Vite + Tailwind v4 + Framer Motion. Dark editorial direction generated
with the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
skill (see `design-system/drip-index-v2/MASTER.md`), with the DRIP orange kept as
the only CTA accent so it never loses its meaning.

## Build

```bash
cd v2-src
npm install
npm run build     # writes ../v2/
npm run dev       # http://localhost:5173
```

`npm run build` writes straight into `../v2/`, which is what the site serves.
Commit both `v2-src/` and `v2/` — there is no build step on deploy.

## How it shares the existing site

v2 does **not** bundle any product data or imagery. It reads `data.json` and
`images/` from the site root at runtime, so `dist` stays around half a megabyte
instead of 455MB, and re-running the v1 scrapers updates both versions at once.

- `src/lib/data.ts` derives the site root from `document.baseURI`, because the
  site is served from two roots (`drip-index.pages.dev/` and
  `kalin-kali.github.io/drip-index/`). Every asset path is relative — never absolute.
- In dev, `vite.config.ts` proxies `/images`, `/product` and `/data.json` to the
  checkout one level up. Point `DRIP_SITE_ROOT` elsewhere to override.
- Routing is hash-based (`#/product/<id>`). Both hosts serve plain static files
  with no rewrite rules available, so a hash keeps deep links working without
  server config. The v1 `product/<id>.html` pages are untouched and still carry
  the SEO; each v2 product page links back to one.

## Layout notes

- `src/lib/motion.ts` holds the shared easing and durations. Use them rather than
  new per-component values, so transitions read as one system.
- The `.bleed` utility (`src/index.css`) is what makes a horizontal scroller run
  edge to edge while its first card still lines up with the page gutter. It sets
  `scroll-padding-inline` too — without that, `snap-mandatory` snaps the first
  card flush to the viewport edge and the gutter appears to vanish.
- Product names are free text from the supplier, so brands and silhouettes are
  matched by regex in `src/lib/data.ts`, not by a field.
