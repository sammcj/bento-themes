# Adding a theme

1. Create `themes/<name>/theme.mjs` exporting a default function that returns a `bento/slides` document. Use `scripts/lib.mjs` for the element factories, column arithmetic and font embedding.
2. Give every slide `notes` and every element an `id`. Keep ids stable across slides so users can opt into morph transitions.
3. Set `collab: { on: false }`, `present: { slideNumber: false }` if the theme draws its own page numbers, and embed fonts as woff2 data URIs under `assets`.
4. Run `make check` and read every PNG. Text overflow and dropped keys are invisible in the JSON.

For a colour variant, export a named builder that takes a palette and import it from a second directory (`themes/mono-light/theme.mjs` is 20 lines). Layout ids carry the variant slug so both sets can live in one deck. `make` treats any directory with a `theme.mjs` as a theme.

`assertDoc` enforces: sharing off (`collab: { on: false }`, no `template`, no `docId`), no `fx`, `transition: "none"` on every slide and layout, the 14px type floor, unique ids, notes on every slide, valid link and state targets, placeholders for layout copy. Conventions the themes follow by hand: one accent colour, one or two typefaces, 96px side margins unless the theme sets its own (use `columns()` for the arithmetic), body text 22px or larger.

## Gotchas

- Write every typographic field on every element. When the runtime expands a document it fills gaps with editor defaults (system font, centred, `#1E2A3A`), never with `theme` values. `factory()` in `scripts/lib.mjs` does this for you.
- `layouts` do not survive a round trip through `window.bento.loadDoc()` and `render_check.mjs --write`. Splice the JSON yourself (`build.mjs`) and use `render_check.mjs` only to validate and screenshot.
- Do not set `template: true`. The runtime deletes `collab` when it mints from a template, then mints its own live-session keys with `on: true`, and the first save writes `ownerPriv` into the deck. Omitting `docId` already gives every open a fresh deck, so the flag costs the sharing default and buys nothing.
- Layout text the user replaces takes `html: ""` plus `placeholder`; chrome that must render (`{{title}}`, `{{page:2}}`) keeps `html`. Layouts must not carry `link`.
- A 1px `line` shape renders thicker than 1px; use a `rect` with `h: 1` for hairlines.
- Step reveals (`fx.step`) consume arrow presses. The vendored `render_check.mjs` presses through them before capturing each page; the upstream copy in the bento-slides skill does not and stops short of the last slides. Only relevant if a theme ever adds steps.
- Use a literal date on covers. `{{date}}` renders the day the deck is opened.
- Charts: `splitLine.show` and `axisLine.show` are ignored without a warning and the lines still draw. Paint them in the ground colour instead (`splitLine.lineStyle.color`). `legend` can only sit top or bottom centred; `legend.right` is reported as ignored.
- Tables have no per-edge borders. For rules on some row boundaries only, set `borderWidth: 0` and lay hairline rects over the boundaries (rows are uniform height, so `h / rows` gives the pitch). Header text is always bold.
- `code` elements take their colours from `theme.codePalette`; `themeName` is in the schema but the 1.2.3 renderer ignores it.
- `render_check` does not capture `stateOf` slides. To see a detail state, render a throwaway one-slide copy of the deck.
- `validate()` measures the raw `{{page:2}}` token, not the rendered number, so a tight page-number box gets a false `text-overflow`.
- Connectors (`line` shapes with `from`/`to`) attach to edge midpoints only, and the runtime re-derives their geometry only when the slide is edited, never at load or in present mode. Compute x, y, w and rotation from the midpoints yourself. A path connector turns into bezier curves when rerouted, so orthogonal routes do not survive a drag.
- Give a box and its label the same `groupId` so they drag as one. Dashed strokes work on rects with `strokeStyle: "dashed"`.
- Image `radius` rounds the element box, not the letterboxed picture, so the corners only show when the capture matches the box's aspect ratio. Inside a tile, use the tile radius minus the inset.
- `render_check`'s `low-coverage` check treats a shape or image covering 60% or more of the canvas as a backdrop, and a short text box near an edge as footer chrome, so tile and display layouts can trip it falsely.
- Line shapes draw with round caps unless dashed, so a thick connector overshoots each end by half its width. Draw discs after the line to hide it, or cover a free end with a rect. A heavy `line` with `lineEnd: "arrow"` sizes the head from the stroke and swallows a short shaft; draw heavy arrows as a `path`.
- Text `html` collapses runs of spaces. Write `&nbsp; ` where a second space matters ("3.2.&nbsp; Retrieval").
- `<p>` margins are 1em and `validate()` counts a trailing `<p>` margin in the height. On a strict line grid use `<br><br>` between paragraphs.
- `code` tokens take `codePalette` colours over the element colour. `grammarName: "md"` leaves plain ASCII art untokenised, apart from lines starting `>`, `#` or `- ` and pairs of `*` or `_`. Code elements have no padding, so a second code element in the same box can recolour one span with exact alignment.
- charts-lite estimates legend label widths for a proportional face, so mono labels collide. Widen `legend.itemGap`, which is honoured.
- Table cells wrap if the width is even a fraction of a pixel short of characters times advance plus padding. Leave a few pixels spare.
- Two unescaped `$` on one line render as maths. Write `\$` for a literal dollar.
- Bento's builtin faces (`builtin:instrument-sans`, `builtin:fraunces-900`) embed no bytes and pass `validate()` with no `font-not-embedded` finding.
