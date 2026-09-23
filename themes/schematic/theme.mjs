// Schematic: an engineering drawing sheet for architecture, agent pipelines, RAG and
// data flows. Paper ground with a quiet 32px square grid, a 2px border frame with
// centring marks, and a ruled title block (drawing title, sheet number, plot date) in
// the bottom-right corner of every sheet. IBM Plex Sans for text, IBM Plex Mono for
// labels, component names, figures and the title block.
//
// Grid: the sheet frame runs x 32..1248, y 24..696, and the grid starts at its corner,
// so x values are multiples of 32 and y values are 24 + 32k. Element x/y/w/h snap to it
// wherever practical; 64px side margins, content band y 152..600.
//
// Diagram vocabulary: a component is a paper-filled rect with a 2px ink stroke and a
// mono label grouped with it (groupId), so it drags as one. Flows are line connectors
// with from/to, so arrows follow a box when it moves; the highlighted path is signal
// orange, everything else ink. Trust or run boundaries are dashed grey rects. Numbered
// callouts are 32px signal circles on the thing they describe, keyed to numbered notes.
// The callout is the recurring mark: 192px stroked on section sheets, filled on the
// closing sheet. No animation anywhere; ids are stable so a morph can be switched on.
import { join } from "node:path";
import { columns, dataUri, factory } from "../../scripts/lib.mjs";

// WCAG ratios on PAPER: INK 16.2, GREY 5.4, SIGNAL 4.8; PAPER on SIGNAL 4.8; INK on PANEL 14.5.
const PAPER = "#F7F6F2";
const PANEL = "#ECEAE4"; // letterbox behind captures, table header
const INK = "#141A22";
const GREY = "#5F6670";
const HAIR = "#C9C6BE";
const GRID = "#EAE8E2"; // 1.1:1 on paper: visible, quiet
const GRID_MAJOR = "#DEDBD4"; // every fourth line, 1.3:1
const SIGNAL = "#C24100";
const SANS = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace";

const t = { fontFamily: SANS, color: INK, accent: SIGNAL };
const f = factory(t);

// Body sits on a 32px line, one grid pitch.
const display = (o) => f.text({ fontSize: 56, fontWeight: 600, lineHeight: 1.1, ...o });
const heading = (o) => f.text({ fontSize: 36, fontWeight: 600, lineHeight: 1.2, ...o });
const lead = (o) => f.text({ fontSize: 24, fontWeight: 600, lineHeight: 1.3, ...o });
const body = (o) => f.text({ fontSize: 22, lineHeight: 32 / 22, ...o });
const mono = (o) => f.text({ fontFamily: MONO, fontSize: 16, lineHeight: 1.25, ...o });
const label = (o) => mono({ color: GREY, ...o });
const hair = (o) => f.rect({ fill: INK, h: 1, ...o });
const box = (o) => f.rect({ fill: PAPER, stroke: INK, strokeWidth: 2, ...o });

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// Title block: bottom-right corner of the frame, 576 x 64 in two 32px rows. Every cell
// holds a token, so layouts carry it as chrome. {{date}} is a plot stamp: the day the
// sheet is shown. validate() measures the raw token text, so each cell is wide enough
// for its raw token text at 9.6px a character.
const titleBlock = () => [
  box({ id: "tb-box", x: 672, y: 632, w: 576, h: 64 }),
  hair({ id: "tb-div0", x: 672, y: 664, w: 576 }),
  f.rect({ id: "tb-div1", x: 992, y: 664, w: 1, h: 32, fill: INK }),
  mono({ id: "run-title", html: "DRAWING <b>{{title}}</b>", x: 688, y: 638, w: 544, h: 20 }),
  mono({ id: "run-page", html: "SHEET <b>{{page:2}}/{{pages:2}}</b>", x: 688, y: 670, w: 296, h: 20 }),
  mono({ id: "tb-date", html: "PLOT <b>{{date:YYYY-MM-DD}}</b>", x: 1004, y: 670, w: 238, h: 20 }),
];

const grid = () => f.image({ id: "sheet-grid", src: "asset:grid", fit: "fill", x: 0, y: 0, w: 1280, h: 720 });

// A content sheet: grid, heading and rule, the content, then the title block on top.
const sheet = (demo, title, content, placeholder = "Sheet title") => [
  grid(),
  heading({ id: "slide-head", ...ph(demo, title, placeholder), x: 64, y: 56, w: 1152, h: 48 }),
  hair({ id: "head-rule", x: 64, y: 120, w: 1152 }),
  ...content,
  ...titleBlock(),
];

const slide = (id, name, notes, elements, extra = {}) => ({ id, name, background: PAPER, transition: "none", notes, elements, ...extra });

// Diagram primitives. A node is geometry plus the id connectors attach to.
const node = (id, x, y, w = 160, h = 64) => ({ id, x, y, w, h });
// The label id mirrors the box id (pr-k0 -> pr-t0). `extra` goes on both, e.g. a link.
const comp = (b, demo, html, extra = {}) => [
  box({ ...b, groupId: `${b.id}-g`, ...extra }),
  mono({ id: b.id.replace("-k", "-t"), groupId: `${b.id}-g`, ...ph(demo, html, "Component"), align: "center", valign: "middle", x: b.x, y: b.y, w: b.w, h: b.h, ...extra }),
];
const edge = (b, side) =>
  side === "top" ? [b.x + b.w / 2, b.y] : side === "bottom" ? [b.x + b.w / 2, b.y + b.h] : side === "left" ? [b.x, b.y + b.h / 2] : [b.x + b.w, b.y + b.h / 2];
// A connector ends on a node's side midpoint, or at a free point {x, y}. The geometry
// written here is what the editor derives from from/to, so nothing moves on first edit.
const flow = (id, a, sa, b, sb, hot = false) => {
  const [x1, y1] = a.id ? edge(a, sa) : [a.x, a.y];
  const [x2, y2] = b.id ? edge(b, sb) : [b.x, b.y];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const r2 = (v) => Math.round(v * 100) / 100;
  const geo = { x: r2((x1 + x2) / 2 - len / 2), y: (y1 + y2) / 2 - 6, w: r2(len), h: 12, rotation: r2((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI) };
  const ends = { ...(a.id ? { from: { el: a.id, side: sa } } : {}), ...(b.id ? { to: { el: b.id, side: sb } } : {}) };
  return f.line({ id, ...geo, fill: hot ? SIGNAL : INK, strokeWidth: 2, lineEnd: "arrow", ...ends });
};
// lx moves the label along the top edge, clear of flows that cross the boundary.
const zone = (id, lid, { x, y, w, h }, demo, text, lx = x + 16) => [
  f.rect({ id, x, y, w, h, fill: "transparent", stroke: GREY, strokeWidth: 2, strokeStyle: "dashed" }),
  label({ id: lid, ...ph(demo, text, "Boundary"), x: lx, y: y + 8, w: x + w - 16 - lx, h: 20 }),
];
// Numbered callout centred on (cx, cy). The numeral renders in layouts too, so nid must
// be an id assertDoc allows as a layout literal (pr-n, shot-cn).
const callout = (id, nid, cx, cy, n) => {
  const g = { groupId: `${id}-g`, x: cx - 16, y: cy - 16, w: 32, h: 32 };
  return [
    f.ellipse({ id, ...g, fill: SIGNAL }),
    mono({ id: nid, ...g, html: String(n), fontSize: 18, fontWeight: 600, lineHeight: 1, color: PAPER, align: "center", valign: "middle" }),
  ];
};

const cover = (demo) => {
  const m = [node("cv-k0", 480, 88, 96), node("cv-k1", 640, 88, 96), node("cv-k2", 800, 88, 96)];
  const block = { id: "cv-block", x: 448, y: 344, w: 800, h: 352 };
  return slide(
    "s-cover",
    "Cover",
    "Cover. The title block is the drawing's identity: title from File > Properties, subtitle, company, author, date and sheet count. The date is a literal: it records when the deck was written, where {{date}} would show whatever day it is presented. In the layout the date cell is a plain placeholder, so type it as DATE, a line break, then the date in bold (YYYY-MM-DD) to match the other cells. The three boxes are the diagram vocabulary in miniature, with the signal path leading into the title.",
    [
      grid(),
      flow("cv-f0", m[0], "right", m[1], "left"),
      flow("cv-f1", m[1], "right", m[2], "left"),
      flow("cv-f2", m[2], "bottom", block, "top", true),
      ...m.map((b) => box(b)),
      box(block),
      display({ id: "deck-title", html: "{{title}}", valign: "bottom", x: 480, y: 376, w: 736, h: 160 }),
      body({ id: "cover-sub", ...ph(demo, "Retrieval for the internal policy assistant: what failed, what we measured and the new query path", "Subtitle"), color: GREY, x: 480, y: 552, w: 736, h: 64 }),
      hair({ id: "cv-rule", x: 448, y: 632, w: 800 }),
      ...[736, 960, 1120].map((x, i) => f.rect({ id: `cv-div${i}`, x, y: 632, w: 1, h: 64, fill: INK })),
      mono({ id: "run-title", html: "COMPANY<br><b>{{company}}</b>", x: 464, y: 644, w: 264, h: 40 }),
      mono({ id: "cv-author", html: "AUTHOR<br><b>{{author}}</b>", x: 752, y: 644, w: 200, h: 40 }),
      mono({ id: "run-page", ...ph(demo, "DATE<br><b>2026-09-23</b>", "DATE YYYY-MM-DD"), x: 976, y: 644, w: 136, h: 40 }),
      mono({ id: "tb-sheet", html: "SHEETS<br><b>{{pages:2}}</b>", x: 1128, y: 644, w: 112, h: 40 }),
    ],
  );
};

const agenda = (demo) => {
  const items = demo
    ? ["Where the wrong answers came from", "Scoring the retriever on its own", "The new query path", "What it costs and what we need"]
    : ["Item one", "Item two", "Item three", "Item four"];
  const rows = items.flatMap((it, i) => {
    const y = 152 + i * 112;
    return [
      hair({ id: `ag-r${i}`, x: 64, y, w: 1152 }),
      mono({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), fontSize: 36, fontWeight: 600, lineHeight: 1.2, color: SIGNAL, x: 64, y: y + 34, w: 96, h: 44 }),
      f.text({ id: `ag-t${i}`, ...ph(demo, it, it), fontSize: 32, fontWeight: 500, lineHeight: 1.2, x: 192, y: y + 36, w: 1024, h: 40 }),
    ];
  });
  return slide(
    "s-agenda",
    "Agenda",
    "Agenda, set like a drawing's sheet index. Four rows on a 112px pitch fill the band from the heading rule to the title block; delete a row rather than shrinking the type. The mono numerals are the only signal colour on the sheet.",
    sheet(demo, "Agenda", [...rows, hair({ id: "ag-r4", x: 64, y: 600, w: 1152 })], "Agenda"),
  );
};

const section = (demo) =>
  slide(
    "s-section",
    "Section",
    "Section sheet. The callout balloon at 192px carries the section number, like a detail marker on a drawing. Keep the title to two lines.",
    [
      grid(),
      f.ellipse({ id: "mark", x: 64, y: 248, w: 192, h: 192, fill: PAPER, stroke: SIGNAL, strokeWidth: 4 }),
      mono({ id: "sec-num", ...ph(demo, "02", "01"), fontSize: 80, fontWeight: 600, lineHeight: 1, color: SIGNAL, align: "center", valign: "middle", x: 64, y: 248, w: 192, h: 192 }),
      display({ id: "sec-title", ...ph(demo, "The new query path", "Section title"), valign: "middle", x: 320, y: 248, w: 896, h: 192 }),
      ...titleBlock(),
    ],
  );

const statement = (demo) =>
  slide(
    "s-statement",
    "Statement",
    "Statement. One sentence, no bullets. Under about twenty words holds at 48px. The source line in mono is optional.",
    sheet(demo, "The finding", [
      f.text({ id: "stmt", ...ph(demo, "If the right passage never reaches the prompt, no model can answer the question correctly.", "One idea, one sentence"), fontSize: 48, fontWeight: 600, lineHeight: 1.2, valign: "middle", x: 64, y: 184, w: 960, h: 352 }),
      label({ id: "stmt-src", ...ph(demo, "Policy assistant rebuild, September 2026 review", "Source or context"), x: 64, y: 568, w: 672, h: 24 }),
    ]),
  );

const titleBody = (demo) =>
  slide(
    "s-body",
    "Title and body",
    "Title and body. The column is 864px so lines stay readable at 26px, larger than the 22px body because this sheet holds one block of text. Use <ul> for bullets. If it does not fit, drop to the 22px body size, cut words or split the sheet.",
    sheet(demo, "Most wrong answers started in retrieval", [
      body({
        id: "body-copy",
        ...ph(
          demo,
          "<p>The assistant answers staff questions about internal policy from about 12,000 Confluence pages. Users reported confident answers that cited the wrong version of a policy.</p><p>We split the pipeline and scored each stage against 400 questions with known gold passages:</p><ul><li>Retrieval put the gold passage in the top 8 for 71% of questions</li><li>Given the passage, the model answered correctly 96% of the time</li><li>So the fix belonged in retrieval, and the model could stay</li></ul><p>Later sheets cover the eval, the query path and its cost.</p>",
          "Body copy",
        ),
        fontSize: 26,
        lineHeight: 1.4,
        x: 64,
        y: 152,
        w: 864,
        h: 448,
      }),
    ]),
  );

const points = (demo) => {
  const items = demo
    ? [
        ["Score each stage alone", "An end-to-end eval says the answer is wrong. A retrieval eval says where it went wrong."],
        ["Budget latency per box", "Give every component a p95 budget. Reranking bought 0.18 of recall for 90 ms."],
        ["Draw it before you build it", "Components, flows and trust boundaries go on one sheet first. Review the sheet, then the code."],
      ]
    : ["Point one", "Point two", "Point three"].map((p) => [p, "Supporting sentence"]);
  const rows = items.flatMap(([h, d], i) => {
    const y = Math.round(152 + (i * 448) / 3);
    return [
      hair({ id: `pt-r${i}`, x: 64, y, w: 1152 }),
      lead({ id: `pt-h${i}`, ...ph(demo, h, h), fontSize: 28, x: 64, y: y + 28, w: 352, h: 80 }),
      body({ id: `pt-d${i}`, ...ph(demo, d, d), fontSize: 26, lineHeight: 1.4, x: 448, y: y + 28, w: 768, h: 108 }),
    ];
  });
  return slide(
    "s-points",
    "Points",
    "Points. Three rows share the band between the heading rule and a closing rule at the band's foot, each a bold lead and a sentence at 26px. For more than three, split the sheet.",
    sheet(demo, "Three habits from the rebuild", [...rows, hair({ id: "pt-r3", x: 64, y: 600, w: 1152 })]),
  );
};

// Two small topologies, before and after. Boxes 128 wide on a 192 pitch.
const topology = (demo, side, x0, labels, hot) => {
  const p = `col-${side}`;
  const n = [node(`${p}-k0`, x0, 216, 128), node(`${p}-k1`, x0 + 192, 216, 128), node(`${p}-k2`, x0 + 384, 216, 128), node(`${p}-k3`, x0 + 192, 344, 128)];
  if (labels.length > 4) n.push(node(`${p}-k4`, x0 + 384, 344, 128));
  const flows = [flow(`${p}-f0`, n[0], "right", n[1], "left"), flow(`${p}-f1`, n[1], "right", n[2], "left"), flow(`${p}-f2`, n[1], "bottom", n[3], "top", hot)];
  if (n[4]) flows.push(flow(`${p}-f3`, n[3], "right", n[4], "left", hot));
  return [...flows, ...n.flatMap((b, i) => comp(b, demo, labels[i]))];
};

const twoCol = (demo) => {
  const C = columns(2, { margin: 64, gutter: 64 });
  const col = (side, x, head, labels, copy, hot) => [
    mono({ id: `col-${side}-head`, ...ph(demo, head, side === "l" ? "VIEW A" : "VIEW B"), fontSize: 18, fontWeight: 600, x, y: 152, w: C.w, h: 24 }),
    hair({ id: `col-${side}-rule`, x, y: 184, w: C.w }),
    ...topology(demo, side, x, labels, hot),
    body({ id: `col-${side}-body`, ...ph(demo, copy, side === "l" ? "Left body" : "Right body"), x, y: 440, w: C.w, h: 160 }),
  ];
  return slide(
    "s-twocol",
    "Two columns",
    "Two columns, 544px each with a 64px gutter: a before and after topology over a short description. The changed flows are in signal orange. Boxes and their labels are grouped, and the arrows are connectors, so dragging a box keeps its arrows attached. Duplicate a box to extend the diagram, then draw a line and set its from and to.",
    sheet(demo, "One index and top 8, then hybrid search and rerank", [
      ...col("l", C.x[0], "VIEW A: BEFORE", ["<b>CLIENT</b><br>web chat", "<b>APP</b><br>FastAPI", "<b>LLM</b><br>Bedrock", "<b>VECTOR DB</b><br>dense, k=8"], "<p>The app sent the question to one dense index and pasted the top 8 chunks into the prompt. When the right passage ranked ninth, the model answered from the wrong policy.</p>", false),
      ...col("r", C.x[1], "VIEW B: AFTER", ["<b>CLIENT</b><br>web chat", "<b>APP</b><br>FastAPI", "<b>LLM</b><br>Bedrock", "<b>RETRIEVE</b><br>hybrid, 40", "<b>RERANK</b><br>top 5"], "<p>Hybrid search pulls 40 candidates and a cross-encoder keeps the best 5. The prompt is shorter, and the right passage reaches it for 89 questions in 100.</p>", true),
    ], "Before and after"),
  );
};

// Dimension-style figures: the value sits over a dimension line with extension lines.
const numbers = (demo) => {
  const C = columns(3, { margin: 64, gutter: 96 });
  const stats = demo
    ? [
        ["0.89", "context recall on the 400-question eval, up from 0.71", true],
        ["-38%", "prompt tokens per answer: 5 reranked chunks instead of 8", false],
        ["1.6 s", "p95 end to end, down from 1.9 s with reranking added", false],
      ]
    : [["00", "Label", true], ["00", "Label", false], ["00", "Label", false]];
  const els = stats.flatMap(([v, l, hot], i) => {
    const x = C.x[i];
    const c = hot ? SIGNAL : INK;
    return [
      mono({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 80, fontWeight: 600, lineHeight: 1.2, color: c, align: "center", x, y: 184, w: C.w, h: 96 }),
      f.rect({ id: `st-e${i}a`, x, y: 296, w: 1, h: 48, fill: c }),
      f.rect({ id: `st-e${i}b`, x: x + C.w - 1, y: 296, w: 1, h: 48, fill: c }),
      f.line({ id: `st-r${i}`, x, y: 314, w: C.w, h: 12, fill: c, strokeWidth: 2, lineStart: "arrow", lineEnd: "arrow" }),
      body({ id: `st-l${i}`, ...ph(demo, l, l), color: GREY, align: "center", x, y: 360, w: C.w, h: 96 }),
    ];
  });
  return slide(
    "s-numbers",
    "Numbers",
    "Headline numbers as dimensions: one plain figure over a dimension line, 80px mono (six characters fit), a one-line label under it. The signal colour marks the figure that matters, at most one. The note carries the source.",
    sheet(demo, "What changed, measured", [
      ...els,
      hair({ id: "st-foot-rule", x: 64, y: 504, w: 1152, fill: HAIR }),
      body({ id: "st-note", ...ph(demo, "Eval: 400 questions with gold passages written by the policy team. Latency at the gateway over seven days, 38,000 requests.", "Source or consequence"), color: GREY, x: 64, y: 520, w: 1152, h: 64 }),
    ], "In numbers"),
  );
};

const chart = (demo) =>
  slide(
    "s-chart",
    "Chart",
    "Chart on a paper panel with a 1px rule, so the sheet grid does not run through the plot. Before in grey, after in signal. Bar and line data are plain numbers. textStyle.fontFamily sets the mono face; charts-lite ignores splitLine.show, so split lines are painted a faint grid colour instead.",
    sheet(demo, "p95 latency by stage, before and after (ms)", [
      f.rect({ id: "chart-frame", x: 64, y: 152, w: 1152, h: 448, fill: PAPER, stroke: INK, strokeWidth: 1 }),
      f.chart({
        id: "chart-main",
        preset: "bar",
        x: 80,
        y: 168,
        w: 1120,
        h: 416,
        option: {
          color: [GREY, SIGNAL],
          textStyle: { fontFamily: MONO },
          grid: { left: 64, right: 16, top: 48, bottom: 32 },
          legend: { top: 0, textStyle: { color: INK, fontSize: 16 } },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: demo ? ["embed", "retrieve", "rerank", "prefill", "decode"] : ["A", "B", "C", "D", "E"], axisLine: { lineStyle: { color: INK } }, axisLabel: { color: INK, fontSize: 16 } },
          yAxis: { type: "value", axisLine: { lineStyle: { color: PAPER } }, splitLine: { lineStyle: { color: GRID_MAJOR } }, axisLabel: { color: GREY, fontSize: 16 } },
          series: [
            { name: demo ? "Before" : "Series 1", type: "bar", data: [40, 40, 0, 620, 1200], itemStyle: { color: GREY } },
            { name: demo ? "After" : "Series 2", type: "bar", data: [40, 60, 90, 390, 1020], itemStyle: { color: SIGNAL } },
          ],
        },
      }),
    ]),
  );

const TABLE_STYLE = { headerBg: PANEL, headerColor: INK, borderColor: INK, borderWidth: 1, cellPadX: 16, cellPadY: 12, fontSize: 20, fontFamily: MONO, color: INK, radius: 0 };

const table = (demo) => {
  const rows = demo
    ? [
        ["Retriever", "Recall", "MRR", "p95 ms", "Chunks"],
        ["bm25, top 8", "0.62", "0.48", "22", "8"],
        ["dense, top 8", "0.71", "0.55", "38", "8"],
        ["hybrid, top 8", "0.81", "0.63", "60", "8"],
        ["hybrid 40, rerank to 5", "0.89", "0.74", "150", "5"],
      ]
    : [["Column", "Column", "Column", "Column", "Column"], ["Row", "", "", "", ""], ["Row", "", "", "", ""], ["Row", "", "", "", ""]];
  return slide(
    "s-table",
    "Table",
    "Ruled table in mono figures: every edge a 1px ink rule, like a drawing's parts list, header on the panel colour, numeric columns right aligned. The paper rect behind keeps the grid out of the cells. The chosen row is in signal. Recall is the share of questions whose gold passage reached the prompt.",
    sheet(demo, "Retriever options on the 400-question eval", [
      f.rect({ id: "tbl-bg", x: 64, y: 152, w: 1152, h: 448, fill: PAPER }),
      f.table({
        id: "tbl-main",
        x: 64,
        y: 152,
        w: 1152,
        h: 448,
        columns: [{ w: 2.4 }, { w: 1 }, { w: 1 }, { w: 1 }, { w: 1 }],
        rows: rows.map((r, i) => ({ cells: r.map((html, c) => ({ html, ...(c > 0 ? { align: "right" } : {}), ...(demo && i === 4 ? { color: SIGNAL, bold: true } : {}) })) })),
        style: TABLE_STYLE,
      }),
    ]),
  );
};

// RAG pipeline: the offline column feeds the index; the query path runs along the
// bottom inside its boundary and is the highlighted path.
const P = {
  ingest: node("pr-k4", 96, 216),
  chunk: node("pr-k5", 96, 312),
  embed: node("pr-k6", 96, 408),
  index: node("pr-k7", 96, 504),
  query: node("pr-k8", 448, 312),
  retrieve: node("pr-k0", 448, 504),
  rerank: node("pr-k1", 736, 504),
  generate: node("pr-k2", 1024, 504),
  answer: node("pr-k9", 1024, 312),
};

const process = (demo) => {
  const L = demo
    ? {
        ingest: "<b>INGEST</b><br>Confluence, Git",
        chunk: "<b>CHUNK</b><br>512 tokens",
        embed: "<b>EMBED</b><br>bge-m3",
        index: "<b>INDEX</b><br>OpenSearch",
        query: "<b>QUERY</b><br>user question",
        retrieve: "<b>RETRIEVE</b><br>hybrid, k=40",
        rerank: "<b>RERANK</b><br>cross-encoder",
        generate: "<b>GENERATE</b><br>LLM, streamed",
        answer: "<b>ANSWER</b><br>with citations",
      }
    : {};
  return slide(
    "s-process",
    "Process",
    "Architecture sheet: a RAG pipeline. The offline column (grey dashed boundary) builds the index nightly; the query path along the bottom is the highlighted path in signal orange. Numbered callouts sit on the components they describe and key to the notes at the top: 1 hybrid retrieval, 2 the cross-encoder rerank, 3 generation from five chunks. Every box is grouped with its label and every arrow is a connector, so boxes can be dragged and the arrows follow. In the demo, RETRIEVE is clickable and opens a detail sheet; left arrow returns.",
    sheet(demo, "How a question is answered", [
      ...zone("pr-zone0", "pr-zl0", { x: 64, y: 152, w: 224, h: 448 }, demo, "OFFLINE, NIGHTLY"),
      ...zone("pr-zone1", "pr-zl1", { x: 416, y: 440, w: 800, h: 160 }, demo, "QUERY PATH, p95 1.6 s", 624),
      body({
        id: "pr-notes",
        ...ph(demo, "<ol><li>BM25 and dense search, 40 candidates fused by rank</li><li>A cross-encoder keeps the best 5, adding 90 ms at p95</li><li>The model answers from about 2,600 prompt tokens</li></ol>", "Numbered notes keyed to the callouts"),
        x: 448,
        y: 152,
        w: 768,
        h: 128,
      }),
      flow("pr-flow4", P.ingest, "bottom", P.chunk, "top"),
      flow("pr-flow5", P.chunk, "bottom", P.embed, "top"),
      flow("pr-flow6", P.embed, "bottom", P.index, "top"),
      flow("pr-flow7", P.index, "right", P.retrieve, "left"),
      flow("pr-flow", P.query, "bottom", P.retrieve, "top", true),
      flow("pr-flow1", P.retrieve, "right", P.rerank, "left", true),
      flow("pr-flow2", P.rerank, "right", P.generate, "left", true),
      flow("pr-flow3", P.generate, "top", P.answer, "bottom", true),
      // Links are demo-only: layouts must not carry them.
      ...Object.entries(P).flatMap(([k, b]) => comp(b, demo, L[k], demo && k === "retrieve" ? { link: "s-process-detail" } : {})),
      ...[P.retrieve, P.rerank, P.generate].flatMap((b, i) => callout(`pr-c${i}`, `pr-n${i}`, b.x + b.w, b.y, i + 1)),
      ...(demo ? [label({ id: "pr-hint", html: "Click RETRIEVE for detail", x: 416, y: 608, w: 256, h: 20 })] : []),
    ]),
  );
};

// Detail state: RETRIEVE drawn at scale, the way a drawing enlarges one part.
const processDetail = () => {
  // Both searches feed FUSE vertically (top and bottom sides) so their arrowheads never meet.
  const bm25 = node("det-k0", 384, 248);
  const embed = node("det-k1", 128, 440);
  const dense = node("det-k2", 384, 440);
  const fuse = node("det-k3", 384, 344);
  return {
    id: "s-process-detail",
    stateOf: "s-process",
    background: PAPER,
    transition: "none",
    notes: "Detail sheet for callout 1, RETRIEVE, reached by clicking the box on the process sheet and hidden from the arrow-key sequence. The box is redrawn at scale with its parts inside. Left arrow returns to the pipeline.",
    elements: sheet(true, "How a question is answered", [
      box({ id: "pr-k0", x: 64, y: 152, w: 768, h: 448 }),
      mono({ id: "pr-t0", html: "<b>RETRIEVE</b> hybrid, k=40", x: 80, y: 160, w: 480, h: 20 }),
      label({ id: "det-in", html: "query text", x: 80, y: 252, w: 160, h: 20 }),
      label({ id: "det-out", html: "40 candidates to RERANK", x: 576, y: 344, w: 240, h: 20 }),
      flow("det-f0", { x: 64, y: 280 }, null, bm25, "left"),
      flow("det-f1", { x: 64, y: 472 }, null, embed, "left"),
      flow("det-f2", embed, "right", dense, "left"),
      flow("det-f3", bm25, "bottom", fuse, "top"),
      flow("det-f4", dense, "top", fuse, "bottom"),
      flow("det-f5", fuse, "right", { x: 832, y: 376 }, null, true),
      ...comp(bm25, true, "<b>BM25</b><br>top 40"),
      ...comp(embed, true, "<b>EMBED</b><br>query, 1024-d"),
      ...comp(dense, true, "<b>DENSE</b><br>HNSW, top 40"),
      ...comp(fuse, true, "<b>FUSE</b><br>RRF, k=60"),
      ...callout("pr-c0", "pr-n0", 832, 152, 1),
      body({
        id: "det-body",
        html: "<p>BM25 catches policy names and clause numbers. Dense search catches paraphrase.</p><p>Rank fusion merges the two lists by position, so their scores never need calibrating.</p><p>p95 is 60 ms against a budget of 80.</p>",
        x: 864,
        y: 152,
        w: 352,
        h: 416,
      }),
      label({ id: "det-back", html: "Left arrow returns", x: 864, y: 576, w: 352, h: 20 }),
    ]),
  };
};

// A framed capture: PANEL-letterboxed frame with a 1px ink rule, image inset by the rule.
const frame = (p, { x, y, w, h }, src = "asset:shot") => [
  f.rect({ id: `${p}-frame`, x, y, w, h, fill: PANEL, stroke: INK, strokeWidth: 1 }),
  f.image({ id: `${p}-img`, src, fit: "contain", x: x + 1, y: y + 1, w: w - 2, h: h - 2 }),
];

const screenshot = (demo) =>
  slide(
    "s-screenshot",
    "Screenshot",
    "Screenshot. One capture across the band inside a 1px rule, letterboxed on the panel colour, with a mono caption under it. Replace the shot asset with a PNG downscaled to 2560px wide; keep captions in the text element, since text baked into an image cannot be edited or read by a screen reader.",
    sheet(demo, "Latency after the rollout", [
      ...frame("shot", { x: 64, y: 152, w: 1152, h: 448 }),
      label({ id: "shot-caption", ...ph(demo, "Grafana, p95 by stage, a week either side of the release.", "Caption"), x: 64, y: 608, w: 576, h: 20 }),
    ]),
  );

// Callout positions on the notes capture, in capture pixels (the asset maps 1:1 into the frame).
const SHOT_CALLOUTS = [
  [176, 180],
  [609, 88],
  [632, 349],
];

const screenshotNotes = (demo) =>
  slide(
    "s-screenshot-notes",
    "Screenshot with notes",
    "Screenshot with notes. Numbered callouts sit on the capture where the thing is, and the numbered list beside it says what each one means, so the eye does not travel far between the two. Drag the callouts onto your own capture; each circle is grouped with its number.",
    sheet(demo, "Tracing one wrong answer", [
      ...frame("shot", { x: 64, y: 152, w: 704, h: 448 }, "asset:shot-notes"),
      ...SHOT_CALLOUTS.flatMap(([cx, cy], i) => callout(`shot-c${i}`, `shot-cn${i}`, 65 + cx, 153 + cy, i + 1)),
      label({ id: "shot-caption", ...ph(demo, "Eval viewer, question 214 of 400.", "Caption"), x: 64, y: 608, w: 576, h: 20 }),
      lead({ id: "shot-lead", ...ph(demo, "What the trace shows", "What to look at"), x: 800, y: 152, w: 416, h: 32 }),
      hair({ id: "shot-rule", x: 800, y: 200, w: 416 }),
      body({
        id: "shot-body",
        ...ph(
          demo,
          "<ol><li>Question 214 failed: the answer quoted the 2023 travel policy.</li><li>The gold passage scored eleventh, outside the 8 chunks sent.</li><li>The model cited what it was given, so the answer read well and was wrong.</li></ol>",
          "Numbered notes keyed to the callouts",
        ),
        x: 800,
        y: 216,
        w: 416,
        h: 384,
      }),
    ]),
  );

const clippings = (demo) => {
  const C = columns(2, { margin: 64, gutter: 64 });
  const shots = demo
    ? [
        ["Dense, top 8", "Gold passage missing. Four chunks come from the superseded 2023 policy."],
        ["Hybrid and rerank, top 5", "Gold passage ranked first. The 2023 policy no longer reaches the prompt."],
      ]
    : [
        ["Left caption", "One sentence on what the clipping shows"],
        ["Right caption", "One sentence on what the clipping shows"],
      ];
  const els = shots.flatMap(([h, d], i) => {
    const x = C.x[i];
    const p = i === 0 ? "clip-l" : "clip-r";
    return [
      ...frame(p, { x, y: 152, w: C.w, h: 288 }),
      lead({ id: `${p}-head`, ...ph(demo, h, h), x, y: 456, w: C.w, h: 32 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), x, y: 496, w: C.w, h: 96 }),
    ];
  });
  return slide(
    "s-clippings",
    "Two clippings",
    "Two clippings side by side, each inside a 1px rule with a bold lead and one sentence. Suits before/after, two tools doing the same job, or a config and its effect. Crop clippings to the same aspect ratio before embedding so the frames match.",
    sheet(demo, "Retrieved context for question 214", els),
  );
};

const quote = (demo) =>
  slide(
    "s-quote",
    "Quote",
    "Pull quote. Use a real sentence someone said or wrote, with a name and source. The signal quotation mark is the only decoration.",
    sheet(demo, "Start simple", [
      f.text({ id: "q-mark", html: "“", fontSize: 160, fontWeight: 600, lineHeight: 1, color: SIGNAL, x: 56, y: 184, w: 128, h: 160 }),
      f.text({ id: "q-body", ...ph(demo, "A complex system that works is invariably found to have evolved from a simple system that worked.", "Quotation"), fontSize: 40, fontWeight: 500, lineHeight: 1.3, x: 64, y: 312, w: 960, h: 224 }),
      label({ id: "q-attrib", ...ph(demo, "John Gall, Systemantics, 1975", "Name, source"), x: 64, y: 568, w: 576, h: 20 }),
    ]),
  );

const image = (demo) =>
  slide(
    "s-image",
    "Image",
    "Full-bleed image with an ink scrim and the title at the bottom left. The title block stays on top so the sheet still reads as part of the set. Replace the placeholder with a photo downscaled to 2560px before embedding, and keep captions in the text elements.",
    [
      f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
      f.rect({ id: "hero-scrim", x: 0, y: 0, w: 1280, h: 720, fill: INK, opacity: 0.5 }),
      display({ id: "hero-title", ...ph(demo, "Every answer should trace back to a source page", "Caption or title"), color: PAPER, valign: "bottom", x: 64, y: 376, w: 896, h: 144 }),
      body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a photo downscaled to 2560px", "Subtitle"), color: PAPER, x: 64, y: 536, w: 672, h: 32 }),
      ...titleBlock(),
    ],
    { background: INK },
  );

const closing = (demo) =>
  slide(
    "s-closing",
    "Closing",
    "Closing. The callout balloon returns filled, with an arrow: the next action. End on the ask rather than the word Questions. The second line is where to send people: a URL, a name, a date. {{company}} resolves from File > Properties.",
    [
      grid(),
      f.ellipse({ id: "mark", x: 64, y: 248, w: 192, h: 192, fill: SIGNAL }),
      f.line({ id: "close-arrow", x: 104, y: 338, w: 112, h: 12, fill: PAPER, strokeWidth: 6, lineEnd: "arrow" }),
      display({ id: "close-line", ...ph(demo, "Score the retriever before you change the model.", "The ask"), valign: "middle", x: 320, y: 248, w: 896, h: 192 }),
      label({ id: "close-meta", ...ph(demo, "{{company}}, platform team", "Contact or link"), fontSize: 18, x: 320, y: 472, w: 896, h: 24 }),
      ...titleBlock(),
    ],
  );

// The sheet: paper, a 32px grid inside the frame with every fourth line darker, a 2px
// ink frame, centring marks at the middle of each side and zone ticks every 128px.
// 1px strokes sit on half-pixel coordinates so they render as one crisp pixel.
const svgUri = (w, h, inner) => "data:image/svg+xml;base64," + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`).toString("base64");
const bar = (x, y, w, h, fill, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${o}"/>`;
const gridSvg = () => {
  const [X0, Y0, X1, Y1] = [32, 24, 1248, 696];
  const minor = [];
  const major = [];
  for (let x = X0 + 32; x < X1; x += 32) ((x - X0) % 128 ? minor : major).push(`M${x + 0.5} ${Y0}V${Y1}`);
  for (let y = Y0 + 32; y < Y1; y += 32) ((y - Y0) % 128 ? minor : major).push(`M${X0} ${y + 0.5}H${X1}`);
  const ticks = [];
  for (let x = X0 + 128.5; x < X1; x += 128) ticks.push(`M${x} ${Y0}V${Y0 - 8}M${x} ${Y1}V${Y1 + 8}`);
  for (let y = Y0 + 128.5; y < Y1; y += 128) ticks.push(`M${X0} ${y}H${X0 - 8}M${X1} ${y}H${X1 + 8}`);
  const centre = `M640 0V${Y0}M640 ${Y1}V720M0 360H${X0}M${X1} 360H1280`;
  const path = (d, stroke, w = 1) => `<path d="${d}" stroke="${stroke}" stroke-width="${w}" fill="none"/>`;
  return svgUri(
    1280,
    720,
    bar(0, 0, 1280, 720, PAPER) + path(minor.join(""), GRID) + path(major.join(""), GRID_MAJOR) + path(ticks.join(""), INK) + path(centre, INK, 2) +
      `<rect x="${X0 + 1}" y="${Y0 + 1}" width="${X1 - X0 - 2}" height="${Y1 - Y0 - 2}" fill="none" stroke="${INK}" stroke-width="2"/>`,
  );
};

// Stand-in photo: ink ground with a faint grid and one component outline.
const placeholderSvg = () => {
  const lines = [];
  for (let x = 0; x <= 1280; x += 64) lines.push(`M${x} 0V720`);
  for (let y = 0; y <= 720; y += 64) lines.push(`M0 ${y}H1280`);
  return svgUri(1280, 720, `${bar(0, 0, 1280, 720, "#2A313B")}<path d="${lines.join("")}" stroke="#3A424D" stroke-width="1"/>` + `<rect x="704" y="128" width="384" height="192" fill="none" stroke="#5F6670" stroke-width="3"/>`);
};

// Stand-in for a wide capture: a latency dashboard with a step down at the release.
const shotSvg = () => {
  const W = 1150, H = 446;
  const side = [80, 120, 100, 140, 90, 110].map((w, i) => bar(24, 64 + i * 36, w, 10, HAIR)).join("");
  const pts = [];
  for (let i = 0; i <= 28; i++) pts.push(`${i ? "L" : "M"}${280 + i * 30} ${(i < 14 ? 170 : 270) + Math.sin(i * 1.7) * 14}`);
  return svgUri(
    W,
    H,
    `${bar(0, 0, W, H, PAPER)}${bar(0, 0, W, 40, PANEL)}${bar(24, 14, 180, 12, GREY)}${bar(240, 40, 1, H - 40, HAIR)}${side}` +
      `${[0, 1, 2].map((i) => bar(280 + i * 290, 64, 266, 64, PANEL)).join("")}` +
      `${[0, 1, 2, 3].map((i) => bar(280, 160 + i * 60, 846, 1, HAIR)).join("")}` +
      `<path d="${pts.join("")}" fill="none" stroke="${SIGNAL}" stroke-width="3"/>${bar(700, 150, 1, 240, INK)}` +
      `${[0.9, 0.6, 0.8].map((k, i) => bar(280, 400 + i * 14, Math.round(600 * k), 6, HAIR)).join("")}`,
  );
};

// Stand-in for the notes capture, 702 x 446, the frame's inner box. The failing row
// (callout 1), the eleventh-ranked chunk past the top-8 cut (2) and the stale citation (3).
const shotNotesSvg = () => {
  const W = 702, H = 446;
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (i === 3 ? bar(0, 64 + i * 34, 176, 28, SIGNAL, 0.15) + bar(0, 64 + i * 34, 4, 28, SIGNAL) : "") + bar(16, 73 + i * 34, [120, 90, 110, 130, 80, 100, 124, 96, 88][i], 10, i === 3 ? GREY : HAIR)).join("");
  const scores = [150, 138, 126, 118, 104, 96, 90, 84, 80, 76, 118, 60];
  const bars = scores.map((h, i) => bar(216 + i * 38, 220 - h, 26, h, i === 10 ? SIGNAL : i < 8 ? GREY : HAIR)).join("");
  const text = [0.95, 0.8, 0.9, 0.7].map((k, i) => bar(216, 300 + i * 24, Math.round(460 * k), 8, HAIR)).join("");
  return svgUri(
    W,
    H,
    `${bar(0, 0, W, H, PAPER)}${bar(0, 0, W, 40, PANEL)}${bar(16, 14, 160, 12, GREY)}${bar(176, 40, 1, H - 40, HAIR)}${rows}` +
      `${bar(216, 60, 200, 10, GREY)}${bars}${bar(216, 221, 456, 1, INK)}` +
      `<path d="M515 70V236" stroke="${INK}" stroke-width="2" stroke-dasharray="6 4"/>` +
      `${bar(216, 268, 160, 10, GREY)}${text}${bar(436, 348, 180, 3, SIGNAL)}`,
  );
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-schematic-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Schematic",
    size: { width: 1280, height: 720 },
    meta: { author: "Author", company: "Company", subject: "", event: "", keywords: "schematic, engineering drawing, architecture, diagram, rag" },
    theme: {
      background: PAPER,
      color: INK,
      accent: SIGNAL,
      fontFamily: SANS,
      headingFamily: SANS,
      palette: { bg2: PANEL, tx2: GREY, accent2: INK, accent3: GREY, accent4: HAIR, hlink: SIGNAL },
      chartPalette: [SIGNAL, INK, GREY],
      table: TABLE_STYLE,
    },
    fonts: [
      { family: "IBM Plex Sans", asset: "plex-sans", weight: "100 700" },
      { family: "IBM Plex Mono", asset: "plex-mono-400", weight: "400" },
      { family: "IBM Plex Mono", asset: "plex-mono-600", weight: "600" },
    ],
    assets: {
      "plex-sans": dataUri(join(root, "fonts", "ibm-plex-sans-latin.woff2")),
      "plex-mono-400": dataUri(join(root, "fonts", "ibm-plex-mono-400-latin.woff2")),
      "plex-mono-600": dataUri(join(root, "fonts", "ibm-plex-mono-600-latin.woff2")),
      grid: gridSvg(),
      placeholder: placeholderSvg(),
      shot: shotSvg(),
      "shot-notes": shotNotesSvg(),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
