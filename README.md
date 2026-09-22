# Bento themes

Open source themes for [Bento](https://bento.page) slide decks. Each theme is a single `.bento.html` template: open it in a browser and it mints a fresh deck with the theme's colours, typeface, layouts and a demo deck showing every layout in use.

## Themes

### Swiss

International Typographic Style. One grotesque (Archivo), flush-left ragged-right type, a 2px rule and running head on every slide, warm-white paper and one red. A single red square recurs through the deck: a 400px block on the cover, a 16px square beside the page number, a bar on section dividers, full-bleed on the closing slide.

![Swiss cover](themes/swiss/preview/slide-01.png)
![Swiss numbers](themes/swiss/preview/slide-08.png)

### Rams

Mid-century product design after Dieter Rams and Braun. Warm grey ground, charcoal text, hairlines, a geometric sans (Jost) and one orange indicator, the only colour on the page. The indicator sits on a dial on the cover and recurs through the deck as a footer dot, a disc on the black section dividers and a large disc at the end.

![Rams cover](themes/rams/preview/slide-01.png)
![Rams process](themes/rams/preview/slide-11.png)

## Using a theme

1. Download `themes/<name>/<Name>.bento.html` and open it in a browser. The file is a template, so every open starts a new deck.
2. Set the title, company and author under File > Properties. Covers and footers fill from them.
3. Add slides from the New-slide picker; the theme's layouts are listed under "This document".
4. Save. The saved deck is an ordinary Bento file and no longer a template.

To apply a theme to an existing deck, paste the layouts from `<Name>.doc.json` into your deck's JSON (Save > Replace from JSON) or point an agent at the theme file with the bento-slides skill.

Every layout carries speaker notes on its demo slide explaining what it is for. The templates are animation-free: no transitions, entrances, loops, step reveals or count-ups. Element ids are stable across slides, so setting `transition: "morph"` on a slide is all it takes to animate the shared chrome if you want it.

## Building

Themes are generated, not hand-written. `themes/<name>/theme.mjs` returns the full document; `scripts/build.mjs` checks it and splices it into the Bento runtime.

```
make runtime      # fetch the latest Bento release into runtime/ and record its version in runtime/VERSION
make build        # write themes/*/<Name>.doc.json and <Name>.bento.html
make check        # headless render: validate() findings + preview PNGs
```

The committed runtime is the version in `runtime/VERSION`. `make check` prints the version each deck booted with, so a re-fetch that changes rendering shows up in the log and the preview diff.

`make check` needs Node 22+ and a Chromium-based browser (Brave, Chrome or Chromium). It refuses to run inside a sandbox that blocks the browser profile directory.

## Adding a theme

1. Create `themes/<name>/theme.mjs` exporting a default function that returns a `bento/slides` document. Use `scripts/lib.mjs` for the element factories, column arithmetic and font embedding.
2. Give every slide `notes` and every element an `id`. Keep ids stable across slides so users can opt into morph transitions.
3. Set `template: true`, `present: { slideNumber: false }` if the theme draws its own page numbers, and embed fonts as woff2 data URIs under `assets`.
4. Run `make check` and read every PNG. Text overflow and dropped keys are invisible in the JSON.

`assertDoc` enforces: no `fx`, `transition: "none"` on every slide and layout, the 14px type floor, unique ids, notes on every slide, valid link and state targets, placeholders for layout copy. Conventions the themes follow by hand: one accent colour, one or two typefaces, 96px side margins, body text 22px or larger.

### Gotchas

- Write every typographic field on every element. When the runtime expands a document it fills gaps with editor defaults (system font, centred, `#1E2A3A`), never with `theme` values. `factory()` in `scripts/lib.mjs` does this for you.
- `template: true` and `layouts` do not survive a round trip through `window.bento.loadDoc()` and `render_check.mjs --write`. Splice the JSON yourself (`build.mjs`) and use `render_check.mjs` only to validate and screenshot.
- Layout text the user replaces takes `html: ""` plus `placeholder`; chrome that must render (`{{title}}`, `{{page:2}}`) keeps `html`. Layouts must not carry `link`.
- A 1px `line` shape renders thicker than 1px; use a `rect` with `h: 1` for hairlines.
- Step reveals (`fx.step`) consume arrow presses. The vendored `render_check.mjs` presses through them before capturing each page; the upstream copy in the bento-slides skill does not and stops short of the last slides. Only relevant if a theme ever adds steps.
- Use a literal date on covers. `{{date}}` renders the day the deck is opened.

## Fonts

Archivo and Jost are embedded as Latin-subset variable woff2 files (35KB and 26KB) under the SIL Open Font License; see `fonts/OFL-*.txt`. Bento's two shell faces (Fraunces 900 and Instrument Sans) need no bytes at all: `"asset": "builtin:fraunces-900"` or `"builtin:instrument-sans"`.

## Licence

Theme sources (`scripts/`, `themes/*/theme.mjs`, this README) are MIT. Each generated `.bento.html` also contains the Bento runtime (MIT, (c) The Bento authors, redistributed as released at bento.page) and the embedded fonts (SIL OFL 1.1, see `fonts/`).
