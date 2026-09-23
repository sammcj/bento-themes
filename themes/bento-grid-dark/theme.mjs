// Bento Grid: modular tiles in the manner of keynote feature grids and product
// pages. Rounded tiles one step off the ground with a 1px hairline, Geist for
// text and Geist Mono for figures, code and page numbers. Dark: near-black ground,
// lilac hero with dark text. Light (themes/bento-grid-light): pale grey ground,
// white tiles, deep violet hero with white text.
//
// Grid: 12 columns inside 40px margins with 16px gutters (column pitch 101.33px),
// and 6 rows. Content slides put the title in a 46px header and tile y 102..680
// (row pitch 99); display slides (cover, section, statement, quote, image,
// closing) tile the whole canvas, y 40..680. Tile edges are rounded to whole
// pixels from the fractional grid, which keeps every gutter at exactly 16px.
//
// Guard rails enforced in code:
// - box() places tiles by span, never by free-hand coordinates. Column spans
//   come from 3, 4, 6, 8, 12 and row spans from 2, 3, 4, 6.
// - checkSlide() allows at most 5 tiles and one accent-filled tile per slide.
// By convention: a slide with no filled hero keeps one piece of accent content
// (a table row, a link hint), and each tile holds one idea under a 16px muted
// label at its top-left.
//
// The mark is the hero tile itself, repeated at every scale: a 12px accent chip
// beside the page number, at most one hero tile per slide, the whole grid on a
// section divider. No animation: ids stay stable so a morph can be switched on.
import { join } from "node:path";
import { W, dataUri, factory } from "../../scripts/lib.mjs";

// Two palettes share every builder: DARK (this theme) and LIGHT (themes/bento-grid-light).
// WCAG ratios: TEXT 16.8 on GROUND, 15.4 on TILE; MUTED 7.1 on TILE; ACCENT 7.1 on TILE;
// HERO_INK on ACCENT 7.8 (white on it would be 2.5); HERO_LABEL 5.3 on ACCENT; DIM 3.0 on TILE;
// CODE_STRING 10.4 on TILE.
export const DARK = {
  GROUND: "#0B0B0D",
  TILE: "#161619",
  HAIR: "#26262B", // 1px tile outline and table rules
  TEXT: "#EDEDEF",
  MUTED: "#A1A1AA",
  DIM: "#63636E", // second chart series; graphics only, never text
  ACCENT: "#A594FF",
  HERO_INK: "#0B0B0D", // text on the accent
  HERO_LABEL: "#2E2560", // labels on the accent
  CODE_KEY: "#FFFFFF",
  CODE_STRING: "#C4C4CC",
  // Placeholder screenshot: ground, sidebar, cards, faint and strong bars, panel. Darker than the tile.
  SHOT: { bg: "#0F0F12", side: "#131316", card: "#1C1C21", faint: "#2C2C33", mid: "#3A3A42", strong: "#4A4A52", panel: "#16161A" },
  keywords: "bento, grid, tiles, dark, product",
};

const FONT = "Geist, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Geist Mono', 'SF Mono', Menlo, monospace";

// Grid.
const M = 40;
const GUT = 16;
const R = 18; // tile radius
const P = 24; // tile padding
const PITCH_X = (W - 2 * M + GUT) / 12;
const CONTENT = { top: 102, h: 578 };
const FULL = { top: 40, h: 640 };
const SPANS = [3, 4, 6, 8, 12];
const ROW_SPANS = [2, 3, 4, 6];

// Tile box from column c (0-11), column span, row r (0-5) and row span.
const box = (c, span, r, rspan, frame = CONTENT) => {
  if (!SPANS.includes(span) || c < 0 || c + span > 12) throw new Error(`bad column span ${c}+${span}`);
  if (!ROW_SPANS.includes(rspan) || r < 0 || r + rspan > 6) throw new Error(`bad row span ${r}+${rspan}`);
  const py = (frame.h + GUT) / 6;
  const x = Math.round(M + c * PITCH_X);
  const y = Math.round(frame.top + r * py);
  return { x, y, w: Math.round(M + (c + span) * PITCH_X - GUT) - x, h: Math.round(frame.top + (r + rspan) * py - GUT) - y };
};
// Where text starts inside a tile: under the label, or from a column line (for 4/8 splits inside a 12 tile).
const colX = (c) => Math.round(M + c * PITCH_X);
const bottomOf = (b) => b.y + b.h - P;
const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });
// A screenshot tile: the image inset 8px with a concentric radius (R - 8), the
// caption on a 48px strip under it, like the clippings.
const INSET = 8;
const CAP = 48;
const CLIP_H = 400;
// The image scrim is the ground colour at an alpha.
const rgba = (hex, a) => `rgba(${hex.match(/\w\w/g).map((h) => parseInt(h, 16)).join(",")},${a})`;

export function makeBentoGrid(pal, { root, title, slug }) {
  const { GROUND, TILE, HAIR, TEXT, MUTED, DIM, ACCENT, HERO_INK, HERO_LABEL, CODE_KEY, CODE_STRING, SHOT, keywords } = pal;
  const f = factory({ fontFamily: FONT, color: TEXT, accent: ACCENT });

  // Type scale (px): hero figure 176, display and large figures 96, section 72,
  // statement and figures 56, slide title 32, lead 28, body 22, caption 20, label 16.
  // Outside the text scale: code 18, chart axes 14 and 16.
  const text = (o) => f.text(o);
  const display = (o) => f.text({ fontSize: 96, fontWeight: 600, lineHeight: 1.0, letterSpacing: -2, ...o });
  const heading = (o) => f.text({ fontSize: 32, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5, ...o });
  const lead = (o) => f.text({ fontSize: 28, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.3, ...o });
  const body = (o) => f.text({ fontSize: 22, lineHeight: 1.45, ...o });
  const caption = (o) => f.text({ fontSize: 20, lineHeight: 1.35, color: MUTED, ...o });
  const figure = (o) => f.text({ fontFamily: MONO, fontSize: 56, fontWeight: 500, lineHeight: 1.0, letterSpacing: -1, ...o });
  const mono16 = (o) => f.text({ fontFamily: MONO, fontSize: 16, fontWeight: 400, lineHeight: 1.3, color: MUTED, ...o });

  const tile = (id, b, { hero = false } = {}) =>
    f.rect({ id, ...b, radius: R, fill: hero ? ACCENT : TILE, stroke: hero ? "none" : HAIR, strokeWidth: hero ? 0 : 1 });
  // The 16px label at a tile's top-left.
  const label = (id, b, content, { hero = false, mono = false, w } = {}) =>
    f.text({ id, ...content, fontFamily: mono ? MONO : FONT, fontSize: 16, fontWeight: 500, lineHeight: 1.3, color: hero ? HERO_LABEL : MUTED, x: b.x + P, y: b.y + 20, w: w ?? b.w - 2 * P, h: 22 });
  const mark = (x, y, s = 12, fill = ACCENT) => f.rect({ id: "mark", x, y, w: s, h: s, radius: Math.max(3, Math.round(s / 4)), fill });

  // Content slides: title left in the header, deck title, page number and chip right.
  const chrome = () => [
    text({ id: "run-title", html: "{{title}}", fontSize: 16, fontWeight: 500, color: MUTED, align: "right", x: 872, y: 53, w: 300, h: 22 }),
    // validate() measures the raw {{page:2}} token, so the box is wide enough for it.
    mono16({ id: "run-page", html: "{{page:2}}", color: TEXT, align: "right", x: 1116, y: 53, w: 100, h: 22 }),
    mark(1228, 57),
  ];
  const slideHead = (demo, html, placeholder = "Slide title") => heading({ id: "slide-head", ...ph(demo, html, placeholder), valign: "middle", x: 40, y: 40, w: 795, h: 46 });
  // Display slides: page number and chip on the label line of the full tile.
  const tileChrome = (b, hero = false) => [
    mono16({ id: "run-page", html: "{{page:2}}", color: hero ? HERO_INK : TEXT, align: "right", x: b.x + b.w - P - 124, y: b.y + 20, w: 100, h: 22 }),
    mark(b.x + b.w - P - 12, b.y + 25, 12, hero ? HERO_INK : ACCENT),
  ];

  const slide = (id, name, notes, elements) => ({ id, name, background: GROUND, transition: "none", notes, elements });

  const cover = (demo) => {
    const main = box(0, 8, 0, 6, FULL);
    const hero = box(8, 4, 0, 4, FULL);
    const date = box(8, 4, 4, 2, FULL);
    return slide("s-cover", "Cover", "Cover. Three tiles: the title, the company on the accent hero tile, and the date. Title and company fill from File > Properties. The date is a literal so it records when the deck was written; {{date}} would show the day it is presented.", [
      tile("cover-tile", main),
      label("cover-kicker", main, ph(demo, "Platform engineering review", "Event or team")),
      display({ id: "deck-title", html: "{{title}}", valign: "bottom", x: main.x + P, y: main.y + 180, w: main.w - 2 * P, h: 340 }),
      caption({ id: "cover-sub", ...ph(demo, "Evaluating and serving a retrieval agent for customer support", "Subtitle"), fontSize: 22, x: main.x + P, y: bottomOf(main) - 64, w: main.w - 2 * P, h: 64 }),
      tile("cover-hero-tile", hero, { hero: true }),
      label("cover-co-label", hero, ph(demo, "Presented by", "Label"), { hero: true }),
      f.text({ id: "run-title", html: "{{company}}", fontSize: 32, fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.5, color: HERO_INK, valign: "bottom", x: hero.x + P, y: hero.y + 100, w: hero.w - 2 * P, h: hero.h - 100 - P }),
      tile("cover-date-tile", date),
      label("cover-date-label", date, ph(demo, "Date", "Label")),
      figure({ id: "run-page", ...ph(demo, "2026-09-23", "Date"), fontSize: 32, letterSpacing: 0, valign: "bottom", x: date.x + P, y: bottomOf(date) - 40, w: date.w - 2 * P, h: 40 }),
    ]);
  };

  const agenda = (demo) => {
    const items = demo
      ? [
          ["Where the agent fails", "Failure modes from 400 graded cases"],
          ["Retrieval", "Chunking, reranking and recall at eight"],
          ["Latency", "Where the 2.1 seconds at p95 goes"],
          ["What ships next", "The rollout plan and the decisions we need"],
        ]
      : ["Item one", "Item two", "Item three", "Item four"].map((i) => [i, "One line on what it covers"]);
    const els = items.flatMap(([h, d], i) => {
      const b = box((i % 2) * 6, 6, Math.floor(i / 2) * 3, 3);
      return [
        tile(`ag-tile${i}`, b),
        label(`ag-n${i}`, b, { html: String(i + 1).padStart(2, "0") }, { mono: true }),
        heading({ id: `ag-t${i}`, ...ph(demo, h, h), valign: "bottom", x: b.x + P, y: b.y + 60, w: b.w - 2 * P, h: b.h - 60 - P - 36 }),
        caption({ id: `ag-d${i}`, ...ph(demo, d, d), x: b.x + P, y: bottomOf(b) - 28, w: b.w - 2 * P, h: 28 }),
      ];
    });
    return slide("s-agenda", "Agenda", "Agenda. Four tiles on a 2x2 grid, a mono numeral as the label, the item in 32px and one line under it. Delete a tile and widen its neighbour to 12 columns for three items.", [...chrome(), slideHead(demo, "Agenda", "Agenda"), ...els]);
  };

  const section = (demo) => {
    const b = box(0, 12, 0, 6, FULL);
    return slide("s-section", "Section", "Section divider. The hero tile at full size: the accent fills the grid, type in the ground colour. Number sections only when the order matters; otherwise delete the numeral.", [
      tile("sec-tile", b, { hero: true }),
      ...tileChrome(b, true),
      figure({ id: "sec-num", ...ph(demo, "02", "01"), fontSize: 96, color: HERO_INK, x: b.x + P, y: b.y + 20, w: 300, h: 100 }),
      f.text({ id: "sec-title", ...ph(demo, "Retrieval quality", "Section title"), fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5, color: HERO_INK, valign: "bottom", x: b.x + P, y: b.y + 200, w: 1000, h: b.h - 200 - P }),
    ]);
  };

  const statement = (demo) => {
    const b = box(0, 12, 0, 6, FULL);
    return slide("s-statement", "Statement", "Statement. One full tile, one sentence at 56px anchored to the bottom, the source as the tile label. About 110 characters holds on three lines.", [
      tile("stmt-tile", b),
      ...tileChrome(b),
      label("stmt-src", b, ph(demo, "Finding, September evaluation run", "Source or context"), { w: 900 }),
      f.text({ id: "stmt", ...ph(demo, "Seven in ten wrong answers traced back to retrieval: the model was reading the wrong documents.", "One idea, one sentence"), fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1, valign: "bottom", x: b.x + P, y: b.y + 120, w: 1060, h: b.h - 120 - P }),
    ]);
  };

  const titleBody = (demo) => {
    const main = box(0, 8, 0, 6);
    const kpi = box(8, 4, 0, 3);
    const code = box(8, 4, 3, 3);
    return slide("s-body", "Title and body", "Title and body. The body tile takes 8 columns; the right column holds a hero figure and a code tile. Delete either and stretch the other to 6 rows, or widen the body tile to 12 columns. Code lines stay under 30 characters at 18px.", [
      ...chrome(),
      slideHead(demo, "How we grade answers"),
      tile("body-tile", main),
      label("body-label", main, ph(demo, "Method", "Label")),
      body({
        id: "body-copy",
        ...ph(
          demo,
          "<p>Each of the 400 cases pairs a real customer question with a reference answer written by a support lead. The agent answers from what it retrieves, and a grader model checks every claim in the answer against the retrieved text.</p><ul><li>Faithful: every claim is supported by a cited chunk</li><li>Correct: the answer matches the reference</li><li>Refused: the agent handed over to a person</li></ul><p>Two reviewers re-grade a random 10 percent each week. They agree with the grader on 94 percent of cases, which is close to how often they agree with each other.</p><p>The suite runs on every prompt or retrieval change and blocks the merge if faithfulness drops by more than two points.</p>",
          "Body copy",
        ),
        x: main.x + P, y: main.y + 60, w: main.w - 2 * P, h: main.h - 60 - P,
      }),
      tile("body-kpi-tile", kpi, { hero: true }),
      label("body-kpi-label", kpi, ph(demo, "Faithfulness", "Label"), { hero: true }),
      figure({ id: "body-kpi-v", ...ph(demo, "0.87", "00"), fontSize: 96, color: HERO_INK, x: kpi.x + P, y: kpi.y + 60, w: kpi.w - 2 * P, h: 100 }),
      caption({ id: "body-kpi-d", ...ph(demo, "Up from 0.71 in June, on the same 400 cases", "What the number means"), color: HERO_INK, valign: "bottom", x: kpi.x + P, y: bottomOf(kpi) - 56, w: kpi.w - 2 * P, h: 56 }),
      tile("body-code-tile", code),
      label("body-code-label", code, ph(demo, "Grading loop", "Label")),
      {
        id: "body-code", type: "code", rotation: 0, opacity: 1,
        x: code.x + P, y: code.y + 60, w: code.w - 2 * P, h: code.h - 60 - P,
        content: demo ? "for case in suite:\n    ctx = retrieve(case.q, k=8)\n    out = agent(case.q, ctx)\n    grade(out, case.ref, ctx)\n\nreport(suite, by=\"failure\")" : "# code",
        grammarName: "py", fontFamily: MONO, fontSize: 18, lineHeight: 1.5, color: TEXT, align: "left", valign: "top",
      },
    ]);
  };

  const points = (demo) => {
    const items = demo
      ? [
          ["Smaller chunks", "Help articles are split at headings, around 300 tokens each. Answers stopped mixing steps from two products."],
          ["A reranker", "A cross-encoder reorders the top 50 search hits and keeps eight. Recall at eight rose from 0.81 to 0.93."],
          ["Refuse on low recall", "When no chunk scores above 0.4, the agent hands the ticket to a person instead of guessing."],
        ]
      : ["Point one", "Point two", "Point three"].map((p) => [p, "Supporting sentence"]);
    const els = items.flatMap(([h, d], i) => {
      const b = box(0, 12, i * 2, 2);
      const n = String(i + 1).padStart(2, "0");
      return [
        tile(`pt-tile${i}`, b),
        label(`pt-n${i}`, b, ph(demo, n, n), { mono: true, w: 300 }),
        // Lead and sentence share a top line, set so the slack above and below them is even.
        lead({ id: `pt-h${i}`, ...ph(demo, h, h), fontSize: 32, x: b.x + P, y: b.y + 72, w: colX(4) - b.x - 2 * P, h: b.h - 72 - P }),
        body({ id: `pt-d${i}`, ...ph(demo, d, d), x: colX(4), y: b.y + 76, w: b.x + b.w - P - colX(4), h: b.h - 76 - P }),
      ];
    });
    return slide("s-points", "Points", "Points. Three full-width tiles, 2 rows each: numeral label, a 32px lead on the left third and the sentence from the 4-column line. Three fill the grid; for more, split the slide.", [...chrome(), slideHead(demo, "Three changes that moved the score"), ...els]);
  };

  const col = (demo, side, c, [lab, head, copy]) => {
    const b = box(c, 6, 0, 6);
    const L = side === "l" ? "Left" : "Right";
    return [
      tile(`col-${side}-tile`, b),
      label(`col-${side}-label`, b, ph(demo, lab, `${L} label`)),
      lead({ id: `col-${side}-head`, ...ph(demo, head, `${L} heading`), x: b.x + P, y: b.y + 60, w: b.w - 2 * P, h: 72 }),
      body({ id: `col-${side}-body`, ...ph(demo, copy, `${L} body`), x: b.x + P, y: b.y + 152, w: b.w - 2 * P, h: b.h - 152 - P }),
    ];
  };

  const twoCol = (demo) =>
    slide("s-twocol", "Two columns", "Two columns: two 6x6 tiles, each a label, a 28px lead of up to two lines and 22px body. Suits before/after or problem/response.", [
      ...chrome(),
      slideHead(demo, "Retrieval, June and September"),
      ...col(demo, "l", 0, ["June", "Fixed 1,000 token chunks, one search pass", "<p>Articles were cut every 1,000 tokens regardless of structure, so a chunk often held the end of one procedure and the start of another.</p><p>The agent quoted both. Graders marked 29 percent of answers unfaithful, and most of those cited a chunk that mentioned the right product in the wrong context.</p><p>A second search pass tried to fix recall and added 900 ms at p95.</p><p>Nobody could say which chunk an answer came from.</p>"]),
      ...col(demo, "r", 6, ["September", "Heading-aware chunks and a reranker", "<p>Articles are split at headings, so each chunk is one procedure or one policy. The title path is prepended to every chunk before embedding.</p><p>A cross-encoder rescores the top 50 hits in about 180 ms and keeps eight. The second search pass is gone.</p><p>Unfaithful answers fell to 13 percent and p95 latency to 2.1 seconds.</p><p>Every answer carries its chunk ids, so a failed case can be traced in the dashboard.</p>"]),
    ]);

  const numbers = (demo) => {
    const stats = demo
      ? [
          ["Faithfulness", "0.87", "Share of answers fully supported by the retrieved text, up from 0.71 in June"],
          ["Recall at 8", "0.93", "Cases where the reference article is in the top eight"],
          ["p95 latency", "2.1 s", "Question to checked answer, down from 3.4 s"],
          ["Cost per answer", "A$0.012", "Model, reranker and search, at September volume"],
        ]
      : [["Label", "00", "What the number means"], ["Label", "00", "What the number means"], ["Label", "00", "What the number means"], ["Label", "00", "What the number means"]];
    const [h0, v0, l0] = stats[0];
    const hb = box(0, 6, 0, 6);
    const hero = [
      tile("st-tile0", hb, { hero: true }),
      label("st-h0", hb, ph(demo, h0, h0), { hero: true }),
      figure({ id: "st-v0", ...ph(demo, v0, v0), fontSize: 176, letterSpacing: -6, color: HERO_INK, valign: "bottom", x: hb.x + P, y: hb.y + 200, w: hb.w - 2 * P, h: 180 }),
      body({ id: "st-l0", ...ph(demo, l0, l0), color: HERO_INK, valign: "bottom", x: hb.x + P, y: bottomOf(hb) - 60 - 96, w: hb.w - 2 * P, h: 96 }),
      // Source line on a strip at the foot of the hero tile, in the label colour.
      f.text({ id: "st-note", ...ph(demo, "400 cases, September run, 10 percent re-graded by hand", "Source or consequence"), fontSize: 16, fontWeight: 500, lineHeight: 1.3, color: HERO_LABEL, valign: "bottom", x: hb.x + P, y: bottomOf(hb) - 44, w: hb.w - 2 * P, h: 44 }),
    ];
    const rest = stats.slice(1).flatMap(([h, v, l], j) => {
      const i = j + 1;
      const b = box(6, 6, j * 2, 2);
      return [
        tile(`st-tile${i}`, b),
        label(`st-h${i}`, b, ph(demo, h, h), { w: 260 }),
        figure({ id: `st-v${i}`, ...ph(demo, v, v), valign: "bottom", x: b.x + P, y: bottomOf(b) - 60, w: 280, h: 60 }),
        caption({ id: `st-l${i}`, ...ph(demo, l, l), valign: "bottom", x: b.x + 316, y: b.y + 56, w: b.w - 316 - P, h: b.h - 56 - P }),
      ];
    });
    return slide("s-numbers", "Numbers", "Headline numbers. One hero figure at 176px on the accent tile and three at 56px beside it, each a label, a plain number and one line of meaning. The hero is the number the talk turns on; the rest are its context. The strip at the foot of the hero tile carries the source or the consequence.", [...chrome(), slideHead(demo, "The September run"), ...hero, ...rest]);
  };

  const chart = (demo) => {
    const cb = box(0, 8, 0, 6);
    const ib = box(8, 4, 0, 6);
    return slide("s-chart", "Chart", "Chart plus insight. The chart tile stays neutral (text and grey series, hairline axes) and the hero tile beside it says what the chart means. Bar and line data are plain numbers; the legend must be an object to render; textStyle.fontFamily sets Geist.", [
      ...chrome(),
      slideHead(demo, "p95 latency by week"),
      tile("chart-tile", cb),
      label("chart-label", cb, ph(demo, "Seconds, question to checked answer", "Label")),
      f.chart({
        id: "chart-main", preset: "bar", x: cb.x + P, y: cb.y + 60, w: cb.w - 2 * P, h: cb.h - 60 - P,
        option: {
          color: [TEXT, DIM, MUTED],
          textStyle: { fontFamily: FONT },
          grid: { left: 56, right: 8, top: 44, bottom: 32 },
          legend: { top: 0, textStyle: { color: TEXT, fontSize: 16 } },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: demo ? ["Wk 32", "Wk 33", "Wk 34", "Wk 35", "Wk 36", "Wk 37"] : ["A", "B", "C", "D", "E", "F"], axisLine: { lineStyle: { color: HAIR } }, axisLabel: { color: MUTED, fontSize: 16 } },
          yAxis: { type: "value", axisLine: { lineStyle: { color: TILE } }, splitLine: { lineStyle: { color: HAIR } }, axisLabel: { color: MUTED, fontSize: 14, formatter: "{value} s" } },
          series: [
            { name: demo ? "p95" : "Series 1", type: "bar", data: [3.4, 3.3, 2.6, 2.4, 2.2, 2.1], itemStyle: { color: TEXT, borderRadius: 4 } },
            { name: demo ? "p50" : "Series 2", type: "bar", data: [1.6, 1.5, 1.2, 1.1, 1.1, 1.0], itemStyle: { color: DIM, borderRadius: 4 } },
            { name: demo ? "Target p95" : "Series 3", type: "line", data: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5], symbol: "none", lineStyle: { color: MUTED, width: 2 } },
          ],
        },
      }),
      tile("chart-ins-tile", ib, { hero: true }),
      label("chart-ins-label", ib, ph(demo, "What changed", "Label"), { hero: true }),
      figure({ id: "chart-ins-v", ...ph(demo, "-38%", "00"), fontSize: 96, color: HERO_INK, x: ib.x + P, y: ib.y + 60, w: ib.w - 2 * P, h: 100 }),
      lead({ id: "chart-ins-head", ...ph(demo, "p95 from 3.4 s to 2.1 s in six weeks", "The takeaway"), color: HERO_INK, valign: "bottom", x: ib.x + P, y: ib.y + 180, w: ib.w - 2 * P, h: 120 }),
      body({ id: "chart-ins-body", ...ph(demo, "Most of the drop came in week 34, when the reranker replaced the second search pass. The rest is prompt caching.", "Why it matters"), color: HERO_INK, valign: "bottom", x: ib.x + P, y: bottomOf(ib) - 200, w: ib.w - 2 * P, h: 200 }),
    ]);
  };

  const TABLE_STYLE = { headerBg: TILE, headerColor: MUTED, borderColor: HAIR, borderWidth: 0, cellPadX: 0, cellPadY: 12, fontSize: 22, color: TEXT, radius: 0 };

  const table = (demo) => {
    const b = box(0, 12, 0, 6);
    const rows = demo
      ? [
          ["Configuration", "Faithfulness", "p95 latency", "Cost per 1,000 answers"],
          ["Large hosted model", "0.89", "3.8 s", "A$41"],
          ["Mid hosted model, reranker", "0.87", "2.1 s", "A$12"],
          ["Mid hosted model, no reranker", "0.76", "1.8 s", "A$11"],
          ["Open weights, self-hosted", "0.82", "1.9 s", "A$9"],
          ["Small hosted model", "0.79", "1.4 s", "A$3"],
        ]
      : [["Column", "Column", "Column", "Column"], ["Row", "", "", ""], ["Row", "", "", ""], ["Row", "", "", ""], ["Row", "", "", ""], ["Row", "", "", ""]];
    const tb = { x: b.x + P, y: b.y + 60, w: b.w - 2 * P, h: b.h - 60 - P };
    const pitch = tb.h / rows.length;
    return slide("s-table", "Table", "Comparison table in one tile. Horizontal hairlines only (the table has borderWidth 0; the rules are 1px rects at the row pitch), header in muted grey at body size (the runtime always bolds it). The recommended row is the slide's one accent. A numeric trend belongs in the chart layout.", [
      ...chrome(),
      slideHead(demo, "Configurations we evaluated"),
      tile("tbl-tile", b),
      label("tbl-label", b, ph(demo, "400 cases, September run, same grader for every row", "Label")),
      f.table({
        id: "tbl-main", ...tb,
        columns: [{ w: 2 }, { w: 1 }, { w: 1 }, { w: 1.2 }],
        rows: rows.map((r, i) => ({ cells: r.map((html) => (demo && i === 2 ? { html, bold: true, color: ACCENT } : { html })) })),
        style: TABLE_STYLE,
      }),
      ...rows.slice(1).map((_, i) => f.rect({ id: `tbl-rule${i}`, x: tb.x, y: Math.round(tb.y + (i + 1) * pitch), w: tb.w, h: 1, fill: HAIR })),
    ]);
  };

  const process = (demo) => {
    const steps = demo
      ? [
          ["Retrieve", "Hybrid search over 18,000 help articles returns the top 50 chunks."],
          ["Rerank", "A cross-encoder scores all 50 and keeps the best eight."],
          ["Generate", "The model answers from those eight chunks and cites each one."],
          ["Check", "A guardrail blocks answers that cite nothing or quote a refund amount."],
        ]
      : ["Step one", "Step two", "Step three", "Step four"].map((p) => [p, "What happens"]);
    const stepBox = (i) => box(i * 3, 3, 0, 3);
    const els = steps.flatMap(([h, d], i) => {
      const b = stepBox(i);
      return [
        tile(`pr-tile${i}`, b),
        label(`pr-n${i}`, b, { html: String(i + 1).padStart(2, "0") }, { mono: true, w: 60 }),
        lead({ id: `pr-t${i}`, ...ph(demo, h, h), x: b.x + P, y: b.y + 60, w: b.w - 2 * P, h: 36 }),
        body({ id: `pr-d${i}`, ...ph(demo, d, d), x: b.x + P, y: b.y + 106, w: b.w - 2 * P, h: b.h - 106 - P }),
      ];
    });
    const sb = box(0, 12, 3, 3);
    const hit = stepBox(1);
    return slide("s-process", "Process", "Process. Four step tiles on 3-column spans and a full-width summary tile under them, laid out like the small Numbers tiles. In the demo, step 2 is clickable: a transparent rect over its tile links to a state slide, and the left arrow returns. The link hint is the slide's one accent.", [
      ...chrome(),
      slideHead(demo, "How a question is answered"),
      ...els,
      tile("pr-sum-tile", sb),
      label("pr-sum-label", sb, ph(demo, "End to end", "Label"), { w: 300 }),
      figure({ id: "pr-sum-v", ...ph(demo, "2.1 s", "00"), fontSize: 96, valign: "bottom", x: sb.x + P, y: bottomOf(sb) - 100, w: colX(4) - sb.x - 2 * P, h: 100 }),
      body({ id: "pr-sum-d", ...ph(demo, "p95 from question to checked answer. Rerank takes 180 ms of it and generation 1.5 s; the rest is search and the guardrail.", "Summary"), valign: "bottom", x: colX(4), y: sb.y + 60, w: sb.x + sb.w - P - colX(4), h: sb.h - 60 - P - 6 }),
      ...(demo
        ? [
            f.text({ id: "pr-hint", html: "Detail →", fontSize: 16, fontWeight: 500, lineHeight: 1.3, color: ACCENT, align: "right", x: hit.x + 120, y: hit.y + 20, w: hit.w - 120 - P, h: 22 }),
            f.rect({ id: "pr-hit1", ...hit, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          ]
        : []),
    ]);
  };

  const processDetail = () => {
    const sb = box(0, 4, 0, 6);
    const db = box(4, 8, 0, 6);
    return {
      id: "s-process-detail",
      stateOf: "s-process",
      background: GROUND,
      transition: "none",
      notes: "State slide for step 2, reached by clicking the step and hidden from the arrow-key sequence. The step becomes the hero tile; the detail tile beside it carries the explanation. Left arrow returns to the process slide.",
      elements: [
        ...chrome(),
        slideHead(true, "How a question is answered"),
        tile("pr-tile1", sb, { hero: true }),
        label("pr-n1", sb, { html: "02" }, { hero: true, mono: true }),
        figure({ id: "det-v", html: "180 ms", color: HERO_INK, x: sb.x + P, y: sb.y + 60, w: sb.w - 2 * P, h: 60 }),
        f.text({ id: "pr-t1", html: "Rerank", fontSize: 56, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1, color: HERO_INK, valign: "bottom", x: sb.x + P, y: bottomOf(sb) - 70, w: sb.w - 2 * P, h: 70 }),
        tile("det-tile", db),
        label("det-label", db, { html: "How the reranker works" }),
        body({
          id: "det-body",
          html: "<p>Search compares embeddings, which is fast and loose: the right article is usually in the top 50, rarely at the top. The cross-encoder reads the question and each chunk together and scores how well the chunk answers it.</p><p>Scoring 50 chunks takes about 180 ms on one L4 GPU. It replaced a second search pass that cost 900 ms and found less.</p><p>The model is a small cross-encoder fine-tuned on 12,000 question and chunk pairs graded by the support team, so it learns our products' names and the difference between plans.</p><p>The top score also drives refusal: under 0.4, the agent hands the ticket to a person.</p>",
          x: db.x + P, y: db.y + 60, w: db.w - 2 * P, h: db.h - 60 - P - 40,
        }),
        caption({ id: "det-back", html: "Left arrow returns to the process", fontSize: 16, x: db.x + P, y: bottomOf(db) - 22, w: 400, h: 22 }),
      ],
    };
  };

  const shotImg = (id, b, asset) => f.image({ id, src: `asset:${asset}`, fit: "contain", radius: R - INSET, x: b.x + INSET, y: b.y + INSET, w: b.w - 2 * INSET, h: b.h - INSET - CAP });
  // 36px tall and bottom-aligned: render_check treats text boxes under 36px near the
  // canvas edge as footer chrome, and the full-width tile and image as backdrops.
  const shotCaption = (b, content) => ({ ...label("shot-caption", b, content), valign: "bottom", y: b.y + b.h - 20 - 36, h: 36 });

  const screenshot = (demo) => {
    const b = box(0, 12, 0, 6);
    return slide("s-screenshot", "Screenshot", "Screenshot. One tile across the grid, the capture inset 8px with a 10px radius so its corners run parallel to the tile's, and the caption on a strip beneath it. Replace the shot asset with a PNG downscaled to 2560px wide, cropped to about 2.3:1 to fill the frame. Keep the caption in the text element, since text baked into an image cannot be edited or read by a screen reader.", [
      ...chrome(),
      slideHead(demo, "The evaluation dashboard"),
      tile("shot-tile", b),
      shotImg("shot-img", b, "shot"),
      shotCaption(b, ph(demo, "Eval dashboard, September run: 400 cases, grader and two reviewers", "Caption")),
    ]);
  };

  const screenshotNotes = (demo) => {
    const b = box(0, 8, 0, 6);
    const nb = box(8, 4, 0, 6);
    return slide("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. The capture takes 8 columns and a notes tile takes 4: what to look at, and what it means. Crop the capture to about 1.5:1 to fill its frame.", [
      ...chrome(),
      slideHead(demo, "Reading a failed case"),
      tile("shot-tile", b),
      shotImg("shot-img", b, "shot-md"),
      shotCaption(b, ph(demo, "Case 212: refund window for annual plans", "Caption")),
      tile("shot-notes-tile", nb),
      label("shot-notes-label", nb, ph(demo, "What to look at", "Label")),
      lead({ id: "shot-lead", ...ph(demo, "The cited chunk is from the wrong plan", "The point"), x: nb.x + P, y: nb.y + 60, w: nb.w - 2 * P, h: 72 }),
      body({
        id: "shot-body",
        ...ph(demo, "<p>Search ranked the monthly plan's refund policy first; both articles share most of their wording.</p><p>The answer is fluent and cites its source, so only the reference answer shows it is wrong.</p><p>The reranker puts the annual policy first for this case.</p>", "Commentary"),
        x: nb.x + P, y: nb.y + 152, w: nb.w - 2 * P, h: nb.h - 152 - P,
      }),
    ]);
  };

  const clippings = (demo) => {
    const shots = demo
      ? [
          ["Before", "Two search passes and no reranker. p95 at 3.4 seconds."],
          ["After", "One search pass and a reranker. p95 at 2.1 seconds."],
        ]
      : [["Left caption", "One sentence on what the clipping shows"], ["Right caption", "One sentence on what the clipping shows"]];
    const els = shots.flatMap(([h, d], i) => {
      const b = box(i * 6, 6, 0, 6);
      const p = i === 0 ? "clip-l" : "clip-r";
      return [
        tile(`${p}-tile`, b),
        f.image({ id: `${p}-img`, src: "asset:clip", fit: "contain", radius: R - INSET, x: b.x + INSET, y: b.y + INSET, w: b.w - 2 * INSET, h: CLIP_H }),
        lead({ id: `${p}-head`, ...ph(demo, h, h), x: b.x + P, y: b.y + INSET + CLIP_H + 20, w: b.w - 2 * P, h: 36 }),
        caption({ id: `${p}-body`, ...ph(demo, d, d), fontSize: 22, x: b.x + P, y: b.y + INSET + CLIP_H + 64, w: b.w - 2 * P, h: b.h - INSET - CLIP_H - 64 - P }),
      ];
    });
    return slide("s-clippings", "Two clippings", "Two clippings in 6x6 tiles, the capture inset at the top with a concentric radius, a lead and one sentence under it. Suits before/after or two tools doing the same job. Crop both clippings to about 1.4:1 so the frames match.", [...chrome(), slideHead(demo, "Traces before and after the reranker"), ...els]);
  };

  const quote = (demo) => {
    const b = box(0, 12, 0, 6, FULL);
    return slide("s-quote", "Quote", "Pull quote on one full tile. The accent quotation mark is the slide's one accent. Use a real sentence someone said, with a name or a role.", [
      tile("q-tile", b),
      ...tileChrome(b),
      f.text({ id: "q-mark", html: "“", fontSize: 176, fontWeight: 600, lineHeight: 0.8, color: ACCENT, x: b.x + P - 6, y: b.y + 40, w: 150, h: 150 }),
      f.text({ id: "q-body", ...ph(demo, "If you can't say which documents the agent read, you can't say why it was wrong. Every answer now shows its sources to the person who reviews it.", "Quotation"), fontSize: 56, fontWeight: 500, lineHeight: 1.25, letterSpacing: -0.5, valign: "bottom", x: b.x + P, y: b.y + 200, w: 1080, h: b.h - 200 - P - 56 }),
      caption({ id: "q-attrib", ...ph(demo, "Head of support operations, at the June review", "Name, source"), x: b.x + P, y: bottomOf(b) - 28, w: 900, h: 28 }),
    ]);
  };

  const image = (demo) => {
    const b = box(0, 12, 0, 6, FULL);
    return slide("s-image", "Image", "Image on one full tile: the photo fills the tile at the tile radius, a gradient scrim in the ground colour darkens the lower half, and the caption sits bottom left. Replace the placeholder with a photo or diagram downscaled to 2560px.", [
      f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", radius: R, ...b }),
      // The hairline keeps the tile edge visible where the scrim fades into a light ground.
      f.rect({ id: "hero-scrim", ...b, radius: R, fill: "transparent", stroke: HAIR, strokeWidth: 1, fillGradient: { angle: 180, stops: [{ at: 0.35, color: rgba(GROUND, 0) }, { at: 1, color: rgba(GROUND, 0.9) }] } }),
      f.text({ id: "hero-title", ...ph(demo, "The on-call view, week 37", "Caption or title"), fontSize: 56, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1, valign: "bottom", x: b.x + P + 8, y: b.y + 300, w: 900, h: 230 }),
      mark(b.x + P + 8, bottomOf(b) - 36, 16),
      body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a photo or diagram", "Subtitle"), x: b.x + P + 40, y: bottomOf(b) - 44, w: 900, h: 34 }),
    ]);
  };

  const closing = (demo) => {
    const hb = box(0, 8, 0, 6, FULL);
    const cb = box(8, 4, 0, 3, FULL);
    const nb = box(8, 4, 3, 3, FULL);
    return slide("s-closing", "Closing", "Closing. The ask on the hero tile, where to reach you and the next date beside it. End on the ask rather than the word Questions. {{company}} and {{author}} resolve from File > Properties.", [
      tile("close-tile", hb, { hero: true }),
      label("close-label", hb, ph(demo, "The ask", "Label"), { hero: true }),
      f.text({ id: "close-line", ...ph(demo, "Approve a staged rollout to 20 percent of support traffic in October.", "The ask"), fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5, color: HERO_INK, valign: "bottom", x: hb.x + P, y: hb.y + 120, w: hb.w - 2 * P, h: hb.h - 120 - P }),
      tile("close-co-tile", cb),
      label("close-co-label", cb, ph(demo, "Contact", "Label")),
      lead({ id: "close-meta", ...ph(demo, "{{company}}", "Contact or link"), fontSize: 32, valign: "bottom", x: cb.x + P, y: cb.y + 60, w: cb.w - 2 * P, h: cb.h - 60 - P }),
      tile("close-next-tile", nb),
      label("close-next-label", nb, ph(demo, "Next review", "Label")),
      figure({ id: "close-next", ...ph(demo, "2026-10-21", "Date"), fontSize: 32, letterSpacing: 0, valign: "bottom", x: nb.x + P, y: bottomOf(nb) - 40, w: nb.w - 2 * P, h: 40 }),
    ]);
  };

  // Placeholder photo: a dot grid under a soft accent glow, same aspect as the full tile.
  const placeholderSvg = () => {
    const dots = [];
    for (let y = 20; y < 640; y += 40) for (let x = 20; x < 1200; x += 40) dots.push(`<circle cx="${x}" cy="${y}" r="1.5"/>`);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640"><defs><radialGradient id="g" cx="0.72" cy="0.3" r="0.6">` +
      `<stop offset="0" stop-color="${ACCENT}" stop-opacity="0.55"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient></defs>` +
      `<rect width="1200" height="640" fill="${SHOT.bg}"/><rect width="1200" height="640" fill="url(#g)"/><g fill="${SHOT.mid}">${dots.join("")}</g></svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  };

  // Stand-in for a screenshot at a given size: sidebar, four stat cards and a bar chart, all grey.
  const shotSvg = (W, H) => {
    const r = (x, y, w, h, fill, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
    const side = Math.round(W * 0.18);
    const main = W - side - 48;
    const cardW = (main - 36) / 4;
    const cards = [0, 1, 2, 3].map((i) => r(side + 24 + i * (cardW + 12), 64, cardW, 72, SHOT.card, 8) + r(side + 40 + i * (cardW + 12), 80, cardW * 0.4, 8, SHOT.faint) + r(side + 40 + i * (cardW + 12), 104, cardW * 0.6, 16, SHOT.strong)).join("");
    const chartTop = 160;
    const chartH = H - chartTop - 24;
    const n = 16;
    const bw = (main - 32) / n;
    const bars = Array.from({ length: n }, (_, i) => {
      const k = 0.35 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.4));
      const h = Math.round((chartH - 40) * k);
      return r(Math.round(side + 40 + i * bw), chartTop + chartH - 16 - h, Math.round(bw * 0.6), h, SHOT.mid, 3);
    }).join("");
    const nav = [0.7, 0.5, 0.8, 0.6, 0.55].map((k, i) => r(20, 64 + i * 32, Math.round((side - 40) * k), 10, SHOT.faint, 3)).join("");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${r(0, 0, W, H, SHOT.bg)}` +
      `${r(0, 0, side, H, SHOT.side)}${r(20, 24, side * 0.5, 12, SHOT.strong, 3)}${nav}${r(side + 24, 24, 280, 16, SHOT.strong, 3)}` +
      `${cards}${r(side + 24, chartTop, main, chartH, SHOT.panel, 8)}${bars}</svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  };

  // Guard rails the runtime cannot enforce: at most 5 tiles and one accent-filled tile per slide.
  const checkSlide = (s) => {
    const tiles = s.elements.filter((e) => e.type === "shape" && /-tile\d*$/.test(e.id));
    if (tiles.length > 5) throw new Error(`${s.id}: ${tiles.length} tiles, the limit is 5`);
    if (tiles.filter((e) => e.fill === ACCENT).length > 1) throw new Error(`${s.id}: more than one hero tile`);
  };

  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-${slug}-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;
  [...slides, ...layouts].forEach(checkSlide);

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title,
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords },
    theme: {
      background: GROUND,
      color: TEXT,
      accent: ACCENT,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: TILE, tx2: MUTED, accent2: TEXT, accent3: MUTED, accent4: HAIR, hlink: ACCENT },
      chartPalette: [TEXT, DIM, MUTED],
      // Monochrome code: the accent belongs to the slide's hero tile.
      codePalette: { k: CODE_KEY, f: TEXT, s: CODE_STRING, n: TEXT, c: MUTED, p: MUTED, a: TEXT, d: MUTED },
      table: TABLE_STYLE,
    },
    fonts: [
      { family: "Geist", asset: "geist", weight: "100 900" },
      { family: "Geist Mono", asset: "geist-mono", weight: "100 900" },
    ],
    assets: {
      geist: dataUri(join(root, "fonts", "geist-latin.woff2")),
      "geist-mono": dataUri(join(root, "fonts", "geist-mono-latin.woff2")),
      placeholder: placeholderSvg(),
      shot: shotSvg(1184, 522),
      "shot-md": shotSvg(779, 522),
      clip: shotSvg(576, CLIP_H),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}

export default ({ root }) => makeBentoGrid(DARK, { root, title: "Bento Grid Dark", slug: "bento-grid-dark" });
