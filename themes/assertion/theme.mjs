// Assertion: the assertion-evidence method (Michael Alley), set like a newspaper
// data desk. Every content slide's headline is a full-sentence claim in 46px
// Schibsted Grotesk bold with tight tracking, under a mono kicker and a rule
// system: a full-band ink hairline with a short heavy bar ("mark") at its left
// end. The space under the claim, from y 200 to 652, holds the evidence: a chart,
// table, diagram or screenshot rather than bullets. 64px side margins, a 1152px band.
// Colour follows "grey plus one": everything is ink or warm grey except the one
// mark the claim is about (the chart series, the key figure, the highlighted row
// or stage), which takes the raspberry accent. Sources, kickers and small figure
// labels are set in JetBrains Mono. The closing slide is ink with warm-white type.
// No animation anywhere: the ids stay stable so a morph can be switched on later.
import { join } from "node:path";
import { columns, dataUri, factory } from "../../scripts/lib.mjs";

// WCAG ratios on PAPER: INK 16.7, GREY 5.8 (5.2 on PANEL), ACCENT 6.1 (5.3 on TINT, 5.5 on PANEL),
// MARK 3.05 (non-text only). White on ACCENT 6.5. On the ink closing slide: PAPER 16.7, FADE 6.9.
// The accent is a raspberry at hue 333, clear of Swiss's red (3) and Tufte's crimson (351).
const PAPER = "#FAF8F5";
const INK = "#1A1817";
const GREY = "#67615B";
const MARK = "#958E86"; // de-emphasised chart marks
const LIGHT = "#D6D0C8"; // the "before" bar, a step lighter than MARK
const HAIR = "#DDD8D1";
const SPLIT = "#ECE8E2"; // chart gridlines: a hairline tone, barely there
const PANEL = "#F0EDE8"; // letterbox ground behind screenshots
const TINT = "#F6E4EB"; // highlighted table row and process stage
const ACCENT = "#B5175E";
const WHITE = "#FFFFFF";
const FADE = "#A8A097"; // secondary text on the ink closing slide
const DARK_RULE = "#3A3633"; // hairline on the ink closing slide
const FONT = "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";

const M = 64; // side margin
const BAND = 1152;
const RIGHT = M + BAND; // 1216
const TOP = 200; // evidence area starts under a two-line claim
const BOTTOM = 652; // and ends here; the footer sits below
const C2 = columns(2, { margin: M, gutter: 32 }); // 560 at 64, 656
const C3 = columns(3, { margin: M, gutter: 32 }); // 362 at 64, 458, 852
const C4 = columns(4, { margin: M, gutter: 64 }); // 240 at 64, 368, 672, 976; 64px gutters carry the arrows

const f = factory({ fontFamily: FONT, color: INK, accent: ACCENT });

// Type scale (px). Grotesk: cover 96, section numeral 220, display 56, claim 46, figures 128/96/56/32,
// subtitle 28/24, lead 26, body 22, callout notes 20, chart labels 18.
// Mono: kickers, sources and figure labels 15, footer 14.
const claimText = (o) => f.text({ fontSize: 46, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.2, ...o });
const display = (o) => f.text({ fontSize: 56, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, ...o });
const lead = (o) => f.text({ fontSize: 26, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.3, ...o });
const body = (o) => f.text({ fontSize: 22, lineHeight: 1.4, ...o });
const note = (o) => f.text({ fontSize: 18, fontWeight: 600, lineHeight: 1.2, color: GREY, ...o });
const figure = (o) => f.text({ fontSize: 56, fontWeight: 700, lineHeight: 1.0, letterSpacing: -1.5, ...o });
const label = (o) => f.text({ fontFamily: MONO, fontSize: 15, lineHeight: 1.4, color: GREY, ...o });
const kickerText = (o) => label({ fontWeight: 600, letterSpacing: 1.2, lineHeight: 1.2, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
const rule = (o) => f.rect({ fill: INK, h: 1, ...o });

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// Masthead on every slide but the image: an ink hairline across the band with a
// short heavy bar at its left end, then the kicker.
const masthead = (demo, kick, { ink = INK, bar = INK, color = GREY } = {}) => [
  rule({ id: "head-rule", x: M, y: 30, w: BAND, fill: ink }),
  f.rect({ id: "mark", x: M, y: 24, w: 56, h: 6, fill: bar }),
  kickerText({ id: "kicker", ...ph(demo, kick, "KICKER"), color, x: M, y: 42, w: BAND, h: 20 }),
];

// Footer on every content slide: hairline, deck title, page number, in mono.
const chrome = () => [
  hair({ id: "foot-rule", x: M, y: 668, w: BAND }),
  label({ id: "run-title", html: "{{title}}", fontSize: 14, x: M, y: 678, w: 700, h: 20 }),
  label({ id: "run-page", html: "{{page:2}}", fontSize: 14, color: INK, align: "right", x: RIGHT - 200, y: 678, w: 200, h: 20 }),
];

const CLAIM_PH = "Claim: one full sentence stating what the evidence shows";
const claim = (demo, kick, html) => [...masthead(demo, kick), claimText({ id: "slide-head", ...ph(demo, html, CLAIM_PH), x: M, y: 68, w: BAND, h: 100 })];

const slide = (id, name, notes, elements, background = PAPER) => ({ id, name, background, transition: "none", notes, elements });
const content = (id, name, notes, demo, [kick, head], els) => slide(id, name, notes, [...chrome(), ...claim(demo, kick, head), ...els]);

// A numbered disc centred on (cx, cy): accent fill, white numeral, white ring so it reads on any screenshot.
// The numeral box is the disc; at line height 1 Schibsted Grotesk figures sit within 0.3px of its centre.
const badge = (p, n, cx, cy, d = 34) => {
  const box = { x: cx - d / 2, y: cy - d / 2, w: d, h: d };
  return [
    f.ellipse({ id: `${p}${n}`, ...box, fill: ACCENT, stroke: WHITE, strokeWidth: 2 }),
    f.text({ id: `${p}n${n}`, html: String(n), fontSize: 18, fontWeight: 700, lineHeight: 1, color: WHITE, align: "center", valign: "middle", ...box }),
  ];
};

const cover = (demo) =>
  slide("s-cover", "Cover", "Cover. Title and company fill from File > Properties, so set them once. The kicker names the series or event; the subtitle is the talk's thesis as one sentence, which the audience should be able to repeat on the way out. The date is a literal: {{date}} would show the day the deck is presented.", [
    ...masthead(demo, "EVALUATION REVIEW / SEPTEMBER 2026"),
    hair({ id: "foot-rule", x: M, y: 668, w: BAND }),
    label({ id: "run-title", html: "{{company}}", fontSize: 14, x: M, y: 678, w: 700, h: 20 }),
    label({ id: "run-page", ...ph(demo, "2026-09-23", "Date"), fontSize: 14, color: INK, align: "right", x: RIGHT - 200, y: 678, w: 200, h: 20 }),
    f.text({ id: "deck-title", html: "{{title}}", fontSize: 96, fontWeight: 700, lineHeight: 0.98, letterSpacing: -3, valign: "bottom", x: M, y: 200, w: BAND, h: 212 }),
    rule({ id: "cover-rule", x: M, y: 440, w: BAND }),
    f.text({ id: "cover-sub", ...ph(demo, "Batching halved p95 latency in the support assistant. Retrieval is now the slowest stage, and a smaller reranker fixes it.", "The talk's thesis in one sentence"), fontSize: 28, lineHeight: 1.3, color: GREY, x: M, y: 464, w: 960, h: 110 }),
  ]);

const agenda = (demo) => {
  const items = demo
    ? [
        ["Batching halved p95 latency", "1.92 s to 1.00 s over six weeks of production traffic"],
        ["Answer quality held on the regression set", "86.1% to 86.3% pass rate across 1,200 prompts"],
        ["Retrieval is now the slowest stage", "540 ms of a 1.0 s request, most of it in the reranker"],
        ["A smaller reranker saves another 250 ms", "98% of retrieval quality at a third of the latency"],
      ]
    : ["one", "two", "three", "four"].map((n) => [`Claim ${n}`, "The figure that supports it"]);
  const pitch = (BOTTOM - TOP) / items.length;
  const rows = items.flatMap(([h, d], i) => {
    const y = Math.round(TOP + i * pitch);
    return [
      hair({ id: `ag-r${i}`, x: M, y, w: BAND }),
      kickerText({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), fontSize: 16, x: M, y: y + 26, w: 64, h: 20 }),
      lead({ id: `ag-t${i}`, ...ph(demo, h, h), x: 144, y: y + 20, w: RIGHT - 144, h: 34 }),
      label({ id: `ag-d${i}`, ...ph(demo, d, d), x: 144, y: y + 62, w: RIGHT - 144, h: 22 }),
    ];
  });
  return content("s-agenda", "Agenda", "Agenda. Each item is a claim the section will prove, with the figure that proves it underneath in mono. Four rows fill the band; delete a row rather than shrinking the type.", demo, ["AGENDA", "Four findings from the September evaluation, and one request"], rows);
};

const section = (demo) =>
  slide("s-section", "Section", "Section divider, display tier. A large ink numeral over a rule, then the section's claim, so the audience knows what the next slides will prove. Number sections only if the order matters to the audience.", [
    ...chrome(),
    ...masthead(demo, "SECTION"),
    f.text({ id: "sec-num", ...ph(demo, "03", "01"), fontSize: 220, fontWeight: 700, lineHeight: 0.9, letterSpacing: -10, x: M - 8, y: 96, w: 600, h: 200 }),
    rule({ id: "sec-rule", x: M, y: 320, w: BAND }),
    display({ id: "sec-title", ...ph(demo, "Retrieval is now the slowest stage of a request", "Section claim"), x: M, y: 344, w: BAND, h: 124 }),
    body({ id: "sec-lead", ...ph(demo, "Where the remaining second goes, and what the reranker costs.", "What this section shows"), fontSize: 24, color: GREY, x: M, y: 500, w: BAND, h: 36 }),
  ]);

const statement = (demo) =>
  slide("s-statement", "Statement", "Statement, display tier. One sentence the audience should remember, under about 20 words so it holds at 56px in three lines. The mono source line is optional.", [
    ...chrome(),
    ...masthead(demo, "THE RELEASE GATE"),
    display({ id: "stmt", ...ph(demo, "Nothing ships if the eval pass rate drops by more than one point, however much faster it gets.", "One claim, one sentence"), x: M, y: 168, w: 1100, h: 190 }),
    hair({ id: "stmt-rule", x: M, y: 420, w: BAND }),
    label({ id: "stmt-src", ...ph(demo, "Agreed with the support team, August 2026. 1,200-prompt regression set, three runs per build.", "Source or context"), x: M, y: 436, w: BAND, h: 44 }),
  ]);

const titleBody = (demo) => {
  const figs = demo
    ? [["5 ms", "longest a request waits in the queue for company"], ["8", "requests per forward pass at peak, up from one"]]
    : [["00", "What the figure measures"], ["00", "What the figure measures"]];
  return content("s-body", "Title and body", "Title and body. For a claim whose evidence is an explanation: text on the left, up to two supporting figures on the right, the first in the accent. Body stays at 22px; if it does not fit, cut words or move the evidence to a chart.", demo, ["MECHANISM", "Batching trades five milliseconds of queueing for a large drop in the cost of each token"], [
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>A decode step runs the whole model once and emits one token for every sequence in the batch. Reading the weights from memory dominates the cost, so a step that serves eight sequences costs little more than one.</p><p>The gateway holds each request for up to 5 ms and sends whatever has arrived as one batch. At peak that is eight requests per pass; overnight it is usually one, and the wait costs nothing.</p><p>The trade only pays while the queue stays short. If the window grows past the gap between arrivals, the wait shows up in p95 and the gain is gone, so the window is tuned against p95 and never against the mean.</p>",
        "Explanation that supports the claim",
      ),
      x: M,
      y: TOP,
      w: 704,
      h: BOTTOM - TOP,
    }),
    f.rect({ id: "body-rule", x: 800, y: TOP, w: 1, h: BOTTOM - TOP, fill: HAIR }),
    ...figs.flatMap(([v, l], i) => {
      const y = TOP + i * 236;
      return [
        figure({ id: `body-v${i}`, ...ph(demo, v, v), fontSize: 96, letterSpacing: -3, color: i === 0 ? ACCENT : INK, x: 832, y, w: 384, h: 100 }),
        body({ id: `body-l${i}`, ...ph(demo, l, l), color: GREY, x: 832, y: y + 112, w: 384, h: 64 }),
      ];
    }),
  ]);
};

const points = (demo) => {
  const items = demo
    ? [
        ["−48%", "p95 latency fell from 1.92 s to 1.00 s", "Gateway timing, 200-token replies, six weeks of production traffic"],
        ["86.3%", "The eval pass rate held (86.1% before)", "1,200 prompts, fixed judge model, mean of three runs per build"],
        ["2.4×", "Tokens per second per GPU at peak", "310 to 750 on the same four-node pool; two nodes were released"],
        ["0.21%", "Error rate, unchanged", "Timeouts and 5xx at the gateway, before and after the switch"],
      ]
    : ["one", "two", "three", "four"].map((n) => ["00", `Short claim ${n}`, "Where the figure comes from"]);
  const pitch = (BOTTOM - TOP) / items.length;
  const rows = items.flatMap(([v, h, d], i) => {
    const y = Math.round(TOP + i * pitch);
    return [
      hair({ id: `pt-r${i}`, x: M, y, w: BAND }),
      figure({ id: `pt-v${i}`, ...ph(demo, v, v), color: i === 0 ? ACCENT : INK, x: M, y: y + 24, w: 240, h: 60 }),
      lead({ id: `pt-h${i}`, ...ph(demo, h, h), x: 336, y: y + 20, w: RIGHT - 336, h: 34 }),
      label({ id: `pt-d${i}`, ...ph(demo, d, d), x: 336, y: y + 62, w: RIGHT - 336, h: 22 }),
    ];
  });
  return content("s-points", "Points", "Points. Short claims, each led by the figure that supports it and followed by its source in mono; the figure the headline is about takes the accent, the rest stay ink. Four rows fill the band. Keep each claim and each source to one line.", demo, ["EVIDENCE", "Four measurements support turning batching on in every region"], rows);
};

const twoCol = (demo) => {
  const cols = demo
    ? [
        ["l", "Before: one request per pass", "1.92 s", "P95 LATENCY, 200-TOKEN REPLY", "<p>Every request ran alone. The GPU spent most of each decode step waiting on memory, and utilisation sat under 30% at peak.</p><p>Latency tracked traffic: quiet hours were fast and the 9 am peak was not. Six nodes served the load, and each new node raised cost in step with traffic.</p>"],
        ["r", "After: up to eight per pass", "1.00 s", "P95 LATENCY, SAME REPLY LENGTH", "<p>Requests wait up to 5 ms and leave in batches. Utilisation at peak is above 70% on the same hardware.</p><p>The 9 am peak now looks like the quiet hours. Four nodes serve the same traffic, and a slower build fails in CI before it ships.</p>"],
      ]
    : [
        ["l", "Left heading", "00", "WHAT THE FIGURE MEASURES", "Left body"],
        ["r", "Right heading", "00", "WHAT THE FIGURE MEASURES", "Right body"],
      ];
  const els = cols.flatMap(([s, head, v, l, copy], i) => {
    const x = C2.x[i];
    const w = C2.w;
    return [
      lead({ id: `col-${s}-head`, ...ph(demo, head, head), x, y: TOP, w, h: 34 }),
      rule({ id: `col-${s}-rule`, x, y: TOP + 46, w, h: 2, fill: i === 1 ? ACCENT : INK }),
      figure({ id: `col-${s}-fig`, ...ph(demo, v, v), fontSize: 96, letterSpacing: -3, color: i === 1 ? ACCENT : INK, x, y: TOP + 68, w, h: 100 }),
      label({ id: `col-${s}-figl`, ...ph(demo, l, l), x, y: TOP + 176, w, h: 22 }),
      body({ id: `col-${s}-body`, ...ph(demo, copy, copy), x, y: TOP + 220, w, h: BOTTOM - TOP - 220 }),
    ];
  });
  return content("s-twocol", "Two columns", "Two columns, 560px each. A comparison where one side wins: each column has a lead, a figure with a mono label and a short body, and the side the claim favours takes the accent on its rule and figure.", demo, ["CAPACITY", "Batching serves the same traffic on four nodes instead of six, at half the p95 latency"], els);
};

// Before/after bar pair under each figure: bars scale to the larger value in the column.
const pairBars = (demo, i, x, w, [a, b], key) => {
  const max = Math.max(a[0], b[0]);
  const bw = w - 150;
  return [
    ["b", "BEFORE", a, LIGHT],
    ["a", "AFTER", b, key ? ACCENT : MARK],
  ].flatMap(([k, lab, [n, txt], fill], j) => {
    const y = TOP + 256 + j * 60;
    return [
      label({ id: `st-${k}l${i}`, ...ph(demo, lab, lab), fontSize: 14, x, y: y + 8, w: 64, h: 20 }),
      f.rect({ id: `st-${k}b${i}`, x: x + 64, y, w: Math.round((bw * n) / max), h: 36, fill }),
      label({ id: `st-${k}v${i}`, ...ph(demo, txt, "Value"), fontWeight: 600, color: j && key ? ACCENT : INK, x: x + 72 + Math.round((bw * n) / max), y: y + 7, w: 80, h: 22 }),
    ];
  });
};

const numbers = (demo) => {
  const stats = demo
    ? [
        ["−48%", "p95 latency for a 200-token reply", [[1.92, "1.92 s"], [1.0, "1.00 s"]]],
        ["+0.2", "points on the eval pass rate, 1,200 prompts", [[86.1, "86.1%"], [86.3, "86.3%"]]],
        ["−2", "GPU nodes needed at peak for the same traffic", [[6, "6"], [4, "4"]]],
      ]
    : [0, 1, 2].map(() => ["00", "What the figure measures", [[10, "Value"], [6, "Value"]]]);
  const els = stats.flatMap(([v, l, pair], i) => {
    const x = C3.x[i];
    return [
      rule({ id: `st-r${i}`, x, y: TOP, w: C3.w, h: 2, fill: i === 0 ? ACCENT : INK }),
      figure({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 128, letterSpacing: -5, color: i === 0 ? ACCENT : INK, x, y: TOP + 20, w: C3.w, h: 128 }),
      body({ id: `st-l${i}`, ...ph(demo, l, l), x, y: TOP + 164, w: C3.w, h: 64 }),
      ...pairBars(demo, i, x, C3.w, pair, i === 0),
    ];
  });
  return content("s-numbers", "Numbers", "Numbers. The claim plus three figures, each with a before and after bar so the size of the change is visible as well as stated. The figure the claim is about takes the accent. Bar widths are set by hand: scale each pair to its larger value. The mono source line closes the band.", demo, ["FINDING 01", "Batching cut p95 latency by 48% with no loss in answer quality"], [
    ...els,
    hair({ id: "st-foot-rule", x: M, y: 596, w: BAND }),
    label({ id: "st-note", ...ph(demo, "Six weeks either side of the switch on 11 August. Latency at the gateway, including queueing. Pass rate is the mean of three runs per build.", "Source"), x: M, y: 608, w: BAND, h: 44 }),
  ]);
};

// Chart geometry: the plot box inside the chart element, so direct labels can sit
// beside the last point of each series. The y axis is pinned with min and max.
const CH = { x: M, y: TOP, w: BAND, h: 420, left: 60, right: 212, top: 28, bottom: 34, max: 2.0 };
const plotY = (v) => CH.y + CH.h - CH.bottom - (v / CH.max) * (CH.h - CH.top - CH.bottom);
const plotX = (i, n) => CH.x + CH.left + ((i + 0.5) * (CH.w - CH.left - CH.right)) / n;

const chart = (demo) => {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"];
  const series = [
    [demo ? "Support assistant" : "Highlighted series", [1.94, 1.9, 1.93, 1.92, 1.31, 1.08, 1.02, 1.0, 0.99, 1.0], ACCENT],
    [demo ? "Search summaries" : "Comparison series", [1.46, 1.5, 1.44, 1.48, 1.47, 1.52, 1.45, 1.49, 1.47, 1.46], MARK],
    [demo ? "Ticket triage" : "Comparison series", [0.6, 0.63, 0.61, 0.64, 0.62, 0.6, 0.63, 0.61, 0.62, 0.62], MARK],
  ];
  const labels = series.map(([name, data], i) => {
    const last = data[data.length - 1];
    // Two lines, name over value, centred on the series' last point.
    return note({ id: `chart-lab${i}`, ...ph(demo, `${name}<br>${last.toFixed(2)} s`, i ? "Comparison label" : "Highlighted label"), color: i ? GREY : ACCENT, x: CH.x + CH.w - CH.right + 16, y: Math.round(plotY(last) - 22), w: CH.right - 16, h: 44 });
  });
  const x5 = Math.round(plotX(4, weeks.length));
  const axisText = { color: GREY, fontSize: 14 };
  return content("s-chart", "Chart", "Chart. Grey plus one: every series is grey except the one the claim is about. Each series is labelled at its last point instead of a legend; the label boxes sit in the chart's right margin at the height of the final value, so move them if the data changes. Axis labels are mono. Gridlines are a hairline tone because charts-lite ignores splitLine.show. The vertical hairline marks when the change landed.", demo, ["LATENCY", "Only the batched endpoint's p95 fell; the two unbatched endpoints stayed flat"], [
    f.chart({
      id: "chart-main",
      preset: "line",
      x: CH.x,
      y: CH.y,
      w: CH.w,
      h: CH.h,
      option: {
        textStyle: { fontFamily: MONO },
        grid: { left: CH.left, right: CH.right, top: CH.top, bottom: CH.bottom },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: demo ? weeks : weeks.map((_, i) => String(i + 1)), axisLine: { lineStyle: { color: INK, width: 1 } }, axisLabel: axisText },
        yAxis: { type: "value", min: 0, max: CH.max, axisLine: { lineStyle: { color: PAPER } }, splitLine: { lineStyle: { color: SPLIT, width: 1 } }, axisLabel: { ...axisText, formatter: "{value} s" } },
        series: series
          .map(([name, data, color]) => ({ name, type: "line", data, symbol: "none", smooth: false, lineStyle: { color, width: color === ACCENT ? 4 : 2 } }))
          .reverse(), // draw the highlighted series last so it sits on top
      },
    }),
    ...labels,
    f.rect({ id: "chart-event", x: x5, y: CH.y + CH.top, w: 1, h: CH.h - CH.top - CH.bottom, fill: MARK }),
    kickerText({ id: "chart-event-lab", ...ph(demo, "BATCHING ON", "EVENT"), color: INK, x: x5 + 8, y: CH.y + 2, w: 160, h: 20 }),
    label({ id: "chart-src", ...ph(demo, "Weekly p95 at the gateway, production traffic. Batching enabled on the support assistant only, at the start of W5.", "Source"), x: M, y: 630, w: BAND, h: 22 }),
  ]);
};

// Cell helpers: numeric columns sit flush right so the digits align.
const cell = (html, extra = {}) => ({ html, ...extra });
const num = (html, extra = {}) => cell(html, { align: "right", ...extra });
const TABLE_ROW = 64;
const KEY_ROW = 3;

const table = (demo) => {
  const data = demo
    ? [
        ["Reranker", "nDCG@10", "Pass rate", "p95 rerank", "Hosting"],
        ["None", "0.612", "81.4%", "0 ms", "n/a"],
        ["Cross-encoder L (current)", "0.741", "86.3%", "380 ms", "Self-hosted GPU"],
        ["Cross-encoder B", "0.728", "86.0%", "130 ms", "Self-hosted GPU"],
        ["Hosted rerank API", "0.752", "86.7%", "210 ms", "API, data leaves AU"],
        ["MiniLM cross-encoder", "0.689", "83.9%", "45 ms", "Self-hosted CPU"],
      ]
    : [["Column", "Column", "Column", "Column", "Column"], ...[1, 2, 3, 4, 5].map(() => ["Row", "", "", "", ""])];
  const rows = data.map((r, i) => ({
    cells: r.map((html, c) => {
      const hl = i === KEY_ROW ? { bg: TINT, ...(c === 0 || c === 3 ? { color: ACCENT, bold: true } : {}) } : {};
      return c === 0 || c === 4 ? cell(html, hl) : num(html, hl);
    }),
  }));
  const y = (i) => TOP + i * TABLE_ROW;
  return content("s-table", "Table", "Table. Ink rules at the top, under the header and at the foot, with hairlines between rows, drawn as rects over a borderless table (rows are uniform, so the pitch is height / rows). The row the claim is about has a raspberry tint and its key cells take the accent. Numeric columns sit flush right; the reading of the table goes in the mono source line.", demo, ["RERANKERS", "The smaller reranker keeps 98% of retrieval quality at a third of the latency"], [
    f.table({
      id: "tbl-main",
      x: M,
      y: TOP,
      w: BAND,
      h: TABLE_ROW * data.length,
      columns: [{ w: 2.3 }, { w: 1 }, { w: 1.1 }, { w: 1.2 }, { w: 2 }],
      rows,
      style: { headerBg: PAPER, headerColor: INK, borderColor: PAPER, borderWidth: 0, cellPadX: 16, cellPadY: 16, fontSize: 22, color: INK, radius: 0 },
    }),
    rule({ id: "tbl-rule-top", x: M, y: y(0), w: BAND, h: 2 }),
    rule({ id: "tbl-rule-head", x: M, y: y(1), w: BAND }),
    ...[2, 3, 4, 5].map((i) => hair({ id: `tbl-rule${i}`, x: M, y: y(i), w: BAND })),
    rule({ id: "tbl-rule-foot", x: M, y: y(6), w: BAND }),
    label({ id: "tbl-note", ...ph(demo, "Retrieval quality is nDCG@10 on 400 labelled support queries; pass rate is the full pipeline on the 1,200-prompt regression set. Cross-encoder B scores 0.728 against 0.741, 98% of the current model.", "Source or reading of the table"), x: M, y: 600, w: BAND, h: 44 }),
  ]);
};

// Process: four stage boxes joined by arrow connectors, then the same stages as a
// proportional timing bar, so the claim's share is visible at a glance.
const STAGES_DEMO = [
  ["Embed", 40, "Query to vector, cached for repeat questions."],
  ["Retrieve", 540, "Vector search, then a reranker scores the top 50."],
  ["Generate", 380, "The model answers from the top eight chunks."],
  ["Check", 40, "Citation and policy checks, then stream."],
];
const KEY_STAGE = 1;
const BOX_H = 136;
const box = (i, x, y, key) => f.rect({ id: `pr-k${i}`, x, y, w: C4.w, h: BOX_H, fill: key ? TINT : PAPER, stroke: key ? ACCENT : INK, strokeWidth: key ? 2 : 1 });
const boxText = (demo, i, x, y, name, ms, key) => [
  kickerText({ id: `pr-n${i}`, html: String(i + 1).padStart(2, "0"), color: key ? ACCENT : GREY, x: x + 20, y: y + 18, w: 60, h: 20 }),
  lead({ id: `pr-t${i}`, ...ph(demo, name, `Stage ${i + 1}`), x: x + 20, y: y + 42, w: C4.w - 40, h: 34 }),
  figure({ id: `pr-v${i}`, ...ph(demo, `${ms} ms`, "Figure"), fontSize: 32, letterSpacing: -0.8, color: key ? ACCENT : INK, x: x + 20, y: y + 86, w: C4.w - 40, h: 32 }),
];

const process = (demo) => {
  const stages = demo ? STAGES_DEMO : [0, 1, 2, 3].map((i) => [`Stage ${i + 1}`, [10, 50, 30, 10][i], "What happens at this stage"]);
  const total = stages.reduce((s, [, ms]) => s + ms, 0);
  const els = stages.flatMap(([name, ms, d], i) => {
    const x = C4.x[i];
    const key = i === KEY_STAGE;
    return [
      box(i, x, TOP, key),
      ...boxText(demo, i, x, TOP, name, ms, key),
      body({ id: `pr-d${i}`, ...ph(demo, d, d), x, y: TOP + BOX_H + 16, w: C4.w, h: 96 }),
      ...(i < 3 ? [f.line({ id: `pr-a${i}`, x: x + C4.w, y: TOP + BOX_H / 2 - 1, w: C4.gutter, h: 2, fill: INK, lineEnd: "arrow", from: { el: `pr-k${i}`, side: "right" }, to: { el: `pr-k${i + 1}`, side: "left" } })] : []),
    ];
  });
  // Timing bar: segment widths in proportion to each stage's share, 2px gaps between.
  let x = M;
  const seg = stages.flatMap(([name, ms], i) => {
    const w = Math.round(((BAND - 6) * ms) / total);
    const key = i === KEY_STAGE;
    const last = i === stages.length - 1;
    // The claim's segment is wide enough to carry its label inside, in white.
    const lab = key ? { color: WHITE, x: x + 14, y: 512, w: w - 28 } : { color: GREY, align: last ? "right" : "left", x: last ? RIGHT - 120 : x, y: 552, w: 120 };
    const out = [
      f.rect({ id: `pr-s${i}`, x, y: 500, w, h: 44, fill: key ? ACCENT : MARK }),
      label({ id: `pr-sl${i}`, ...ph(demo, key ? `${name.toUpperCase()} ${ms} MS, ${Math.round((100 * ms) / total)}%` : `${ms} ms`, "Share"), fontWeight: 600, h: 22, ...lab }),
    ];
    x += w + 2;
    return out;
  });
  return content("s-process", "Process", "Process. Stage boxes joined by arrow connectors (the arrows follow the boxes if you move them), then the same stages as a proportional timing bar. The stage the claim is about takes the accent in both. In the demo, the Retrieve stage is clickable: a transparent rect over it links to a state slide with its breakdown, and the left arrow returns.", demo, ["FINDING 03", "Retrieval takes 540 ms of a 1.0 s request, more than the model itself"], [
    ...els,
    kickerText({ id: "pr-bar-lab", ...ph(demo, "SHARE OF A P95 REQUEST, 1.0 S END TO END", "WHAT THE BAR MEASURES"), x: M, y: 472, w: 700, h: 20 }),
    ...seg,
    ...(demo
      ? [
          f.rect({ id: "pr-hit1", x: C4.x[KEY_STAGE] - 12, y: TOP - 12, w: C4.w + 24, h: BOX_H + 136, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          label({ id: "pr-hint", html: "Click Retrieve for its breakdown", x: M, y: 630, w: 400, h: 22 }),
        ]
      : []),
  ]);
};

const processDetail = () => {
  const parts = [
    ["Vector search", 90, "90 ms"],
    ["Rerank top 50", 380, "380 ms"],
    ["Fetch chunks", 70, "70 ms"],
  ];
  const [name, ms] = STAGES_DEMO[KEY_STAGE];
  const scale = 440 / 380;
  return {
    id: "s-process-detail",
    stateOf: "s-process",
    background: PAPER,
    transition: "none",
    notes: "State slide for the Retrieve stage (hidden from the arrow-key sequence, reached by clicking the stage). It keeps the stage box and breaks the stage into its parts, with the reranker in the accent. Left arrow returns to the process slide.",
    elements: [
      ...chrome(),
      ...claim(true, "FINDING 03, RETRIEVE", "A smaller reranker cuts retrieval from 540 to 290 ms"),
      box(KEY_STAGE, M, TOP, true),
      ...boxText(true, KEY_STAGE, M, TOP, name, ms, true),
      ...parts.flatMap(([lab, v, txt], i) => {
        const y = TOP + 6 + i * 44;
        const key = i === 1;
        return [
          body({ id: `det-l${i}`, html: lab, color: key ? INK : GREY, fontWeight: key ? 600 : 400, x: 368, y: y + 2, w: 200, h: 30 }),
          f.rect({ id: `det-b${i}`, x: 576, y, w: Math.round(v * scale), h: 34, fill: key ? ACCENT : MARK }),
          label({ id: `det-v${i}`, html: txt, fontWeight: 600, color: key ? ACCENT : GREY, x: 584 + Math.round(v * scale), y: y + 6, w: 100, h: 22 }),
        ];
      }),
      hair({ id: "det-rule", x: M, y: TOP + 160, w: BAND }),
      body({
        id: "det-body",
        html: "<p>The current cross-encoder scores all 50 candidates on the GPU the model also uses, so it queues behind generation at peak. Vector search and fetching chunk text have little left to give.</p><p>Cross-encoder B scores the same 50 in 130 ms and keeps 98% of the ranking quality: retrieval drops to about 290 ms and a p95 request to about 0.75 s.</p><p>No new hardware: B runs on the same GPU behind one configuration flag.</p>",
        x: M,
        y: TOP + 180,
        w: BAND,
        h: 240,
      }),
      label({ id: "det-back", html: "Left arrow returns to the process", x: M, y: 630, w: 400, h: 22 }),
    ],
  };
};

// A framed screenshot: a hairline around the image, letterboxed on the panel
// colour. Ids are prefixed so two frames can share a slide.
const frame = (p, asset, { x, y, w, h }, stroke = HAIR) => [
  f.rect({ id: `${p}-frame`, x, y, w, h, fill: PANEL, stroke, strokeWidth: 1 }),
  f.image({ id: `${p}-img`, src: `asset:${asset}`, fit: "contain", x: x + 1, y: y + 1, w: w - 2, h: h - 2 }),
];

// Frame boxes; each placeholder asset is drawn at its frame's inner size so the
// callouts land on the wireframe's features.
const SHOT = { x: M, y: TOP, w: BAND, h: 420 };
const NOTES_SHOT = { x: M, y: TOP, w: 736, h: BOTTOM - TOP };
const CLIP = { w: C2.w, h: 316 };

const screenshot = (demo) =>
  content("s-screenshot", "Screenshot", "Screenshot. One large capture across the band, letterboxed on a pale panel, with a mono caption. In the demo an accent outline marks the part of the capture the claim is about; move it to match your screenshot. Replace the shot asset with a PNG downscaled to 2560px wide and keep captions in text, since text baked into an image cannot be edited.", demo, ["DASHBOARD", "The eval dashboard shows the latency step in the week batching shipped"], [
    ...frame("shot", "shot", SHOT),
    ...(demo ? [f.rect({ id: "shot-hl", ...spotBox(SHOT, WIRE.chart), fill: "transparent", stroke: ACCENT, strokeWidth: 3, radius: 2 })] : []),
    label({ id: "shot-caption", ...ph(demo, "Eval dashboard, latency panel, weeks 1 to 10. The drop at W5 is the batching release.", "Caption"), x: M, y: 630, w: BAND, h: 22 }),
  ]);

const screenshotNotes = (demo) => {
  const items = demo
    ? [
        ["Pass rate against the gate", "86.3% on the latest build, above the 85% line. Red if a build drops a point.", WIRE.kpi],
        ["Latency by week", "p95 at the gateway. The step at W5 is batching; nothing else changed.", WIRE.chart],
        ["Regressions by category", "Prompts that passed last build and fail now. Two, both billing, both fixed.", WIRE.rows],
      ]
    : [1, 2, 3].map((n) => [`What to look at ${n}`, "What it shows and why it matters", [WIRE.kpi, WIRE.chart, WIRE.rows][n - 1]]);
  const callouts = items.flatMap(([, , spot], i) => {
    const b = spotBox(NOTES_SHOT, spot);
    return badge("shot-c", i + 1, b.x + 6, b.y + 6);
  });
  const notesEls = items.flatMap(([h, d], i) => {
    const y = TOP + i * 144;
    return [
      ...badge("shot-k", i + 1, 849, y + 16),
      // The first note keeps the ids every theme shares; the rest count from 2 like the badges.
      lead({ id: i ? `shot-t${i + 1}` : "shot-lead", ...ph(demo, h, h), fontSize: 22, x: 884, y, w: RIGHT - 884, h: 30 }),
      body({ id: i ? `shot-d${i + 1}` : "shot-body", ...ph(demo, d, d), fontSize: 20, lineHeight: 1.35, color: GREY, x: 884, y: y + 36, w: RIGHT - 884, h: 84 }),
    ];
  });
  return content("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. Numbered accent discs sit on the capture and the same numbers key the notes on the right, so the audience can find each point without a pointer. Move the discs onto the features of your screenshot. Three notes fill the column; the mono caption sits under them.", demo, ["RELEASE GATE", "Three panels on the eval dashboard decide whether a build can ship"], [
    ...frame("shot", "shot-notes", NOTES_SHOT),
    ...callouts,
    ...notesEls,
    label({ id: "shot-caption", ...ph(demo, "Eval dashboard, build 412, 22 September.", "Caption"), x: 832, y: 630, w: RIGHT - 832, h: 22 }),
  ]);
};

const clippings = (demo) => {
  const shots = demo
    ? [
        ["Before: vector search alone", "The refunds question finds the 2023 policy first. The current page is fifth and never reaches the model."],
        ["After: reranked top 50", "The current refunds policy is first, and the 2023 page drops out of the eight chunks the model reads."],
      ]
    : [
        ["Left caption", "One sentence on what the clipping shows"],
        ["Right caption", "One sentence on what the clipping shows"],
      ];
  const els = shots.flatMap(([h, d], i) => {
    const x = C2.x[i];
    const p = i === 0 ? "clip-l" : "clip-r";
    return [
      ...frame(p, "clip", { x, y: TOP, ...CLIP }, i === 1 ? ACCENT : HAIR),
      lead({ id: `${p}-head`, ...ph(demo, h, h), color: i === 1 ? ACCENT : INK, x, y: TOP + CLIP.h + 16, w: C2.w, h: 34 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), x, y: TOP + CLIP.h + 56, w: C2.w, h: BOTTOM - TOP - CLIP.h - 56 }),
    ];
  });
  return content("s-clippings", "Two clippings", "Two clippings side by side, each with a lead and one or two sentences. The side the claim favours has an accent frame and lead. Crop both clippings to the same aspect ratio before embedding so the frames match.", demo, ["RETRIEVAL QUALITY", "The same question finds the current refunds policy only after reranking"], els);
};

const quote = (demo) =>
  slide("s-quote", "Quote", "Pull quote, display tier. A real sentence someone said, with a name, role and date in mono. Keep the quote under about 35 words so it holds at 42px in four lines.", [
    ...chrome(),
    ...masthead(demo, "IN THEIR WORDS"),
    f.text({ id: "q-mark", html: "“", fontSize: 200, fontWeight: 700, lineHeight: 0.6, color: INK, x: M - 6, y: 100, w: 120, h: 120 }),
    f.text({ id: "q-body", ...ph(demo, "Faster answers mattered less than answers that cite the right policy. Once they did, the team stopped checking every reply by hand.", "Quotation"), fontSize: 42, fontWeight: 500, lineHeight: 1.22, letterSpacing: -0.6, x: M, y: 232, w: 1080, h: 208 }),
    rule({ id: "q-rule", x: M, y: 472, w: 56, h: 4 }),
    label({ id: "q-attrib", ...ph(demo, "SUPPORT TEAM LEAD, PILOT REVIEW, SEPTEMBER 2026", "NAME, ROLE, DATE"), fontWeight: 600, letterSpacing: 1.2, x: M, y: 492, w: BAND, h: 22 }),
  ]);

const image = (demo) =>
  slide("s-image", "Image", "Full-bleed image with the claim on a solid paper panel at the bottom left, so the text keeps its contrast on any photo. Replace the placeholder asset with a photo or diagram downscaled to 2560px. Keep captions in the text elements, since text baked into the image cannot be edited.", [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 504, w: 1040, h: 216, fill: PAPER }),
    f.rect({ id: "mark", x: M, y: 530, w: 56, h: 6, fill: INK }),
    kickerText({ id: "kicker", ...ph(demo, "IN PRODUCTION", "KICKER"), x: M, y: 548, w: 900, h: 20 }),
    f.text({ id: "hero-title", ...ph(demo, "Every answer now cites the policy page it came from", "Claim about the image"), fontSize: 34, fontWeight: 700, lineHeight: 1.12, letterSpacing: -0.8, x: M, y: 576, w: 940, h: 80 }),
    label({ id: "hero-sub", ...ph(demo, "Support assistant reply view, September 2026", "Source"), x: M, y: 666, w: 800, h: 22 }),
  ]);

const closing = (demo) =>
  slide(
    "s-closing",
    "Closing",
    "Closing, on ink. End on the ask, as a claim the audience can say yes to, rather than the word Questions. The accent appears only in the short bar above the kicker. The mono line is where to send people: a URL, a name, a date. {{company}} resolves from File > Properties.",
    [
      ...masthead(demo, "THE ASK", { ink: DARK_RULE, bar: ACCENT, color: FADE }),
      display({ id: "close-line", ...ph(demo, "Approve a two-week production trial of the smaller reranker.", "The ask"), fontSize: 72, letterSpacing: -2.2, lineHeight: 1.02, color: PAPER, x: M, y: 176, w: 1060, h: 230 }),
      rule({ id: "close-rule", x: M, y: 468, w: BAND, fill: DARK_RULE }),
      label({ id: "close-meta", ...ph(demo, "{{company}}, platform team", "Contact or link"), fontSize: 18, color: FADE, x: M, y: 488, w: 1000, h: 26 }),
    ],
    INK,
  );

// Wireframe features, as fractions of the capture: the pass-rate tile, the latency
// chart panel and the regressions list. Callouts and the highlight are placed from these.
const WIRE = {
  kpi: { x: 0.2, y: 0.16, w: 0.2, h: 0.2 },
  chart: { x: 0.2, y: 0.44, w: 0.46, h: 0.48 },
  rows: { x: 0.7, y: 0.44, w: 0.27, h: 0.48 },
};
const spotBox = (fr, s) => ({ x: Math.round(fr.x + 1 + s.x * (fr.w - 2)), y: Math.round(fr.y + 1 + s.y * (fr.h - 2)), w: Math.round(s.w * (fr.w - 2)), h: Math.round(s.h * (fr.h - 2)) });

// Stand-in for a screenshot: an eval dashboard drawn in code at the frame's inner
// size. Sidebar, three stat tiles, a latency chart with the step in the accent, a list.
const shotSvg = (W, H) => {
  const r = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const px = (s) => ({ x: s.x * W, y: s.y * H, w: s.w * W, h: s.h * H });
  const side = [0.5, 0.7, 0.6, 0.8, 0.55].map((k, i) => r(W * 0.02, H * (0.16 + i * 0.08), W * 0.14 * k, H * 0.025, HAIR)).join("");
  const tiles = [0, 1, 2]
    .map((i) => {
      const t = px({ ...WIRE.kpi, x: WIRE.kpi.x + i * 0.26 });
      return r(t.x, t.y, t.w, t.h, WHITE, `stroke="${HAIR}"`) + r(t.x + t.w * 0.1, t.y + t.h * 0.2, t.w * 0.5, t.h * 0.12, HAIR) + r(t.x + t.w * 0.1, t.y + t.h * 0.5, t.w * 0.4, t.h * 0.3, i ? MARK : ACCENT);
    })
    .join("");
  const c = px(WIRE.chart);
  const ys = [0.25, 0.26, 0.24, 0.25, 0.55, 0.64, 0.66, 0.67, 0.67, 0.66];
  const pts = ys.map((v, i) => `${(c.x + c.w * (0.06 + (i * 0.88) / 9)).toFixed(1)},${(c.y + c.h * (0.1 + v * 0.8)).toFixed(1)}`).join(" ");
  const flat = ys.map((_, i) => `${(c.x + c.w * (0.06 + (i * 0.88) / 9)).toFixed(1)},${(c.y + c.h * 0.45).toFixed(1)}`).join(" ");
  const chartEl = r(c.x, c.y, c.w, c.h, WHITE, `stroke="${HAIR}"`) + `<polyline points="${flat}" fill="none" stroke="${MARK}" stroke-width="2"/><polyline points="${pts}" fill="none" stroke="${ACCENT}" stroke-width="3"/>`;
  const l = px(WIRE.rows);
  const rows = [0, 1, 2, 3, 4, 5].map((i) => r(l.x + l.w * 0.08, l.y + l.h * (0.12 + i * 0.14), l.w * (i % 2 ? 0.6 : 0.8), l.h * 0.04, HAIR)).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${r(0, 0, W, H, PAPER)}${r(0, 0, W * 0.18, H, PANEL)}${side}` +
    `${r(W * 0.2, H * 0.05, W * 0.3, H * 0.04, INK)}${tiles}${chartEl}${r(l.x, l.y, l.w, l.h, WHITE, `stroke="${HAIR}"`)}${rows}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

// A warm grey grid stands in for the photo the user will supply.
const placeholderSvg = () => {
  const lines = [];
  for (let x = 0; x <= 1280; x += 64) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="720" stroke="#C9C2B8" stroke-width="1"/>`);
  for (let y = 0; y <= 720; y += 64) lines.push(`<line x1="0" y1="${y}" x2="1280" y2="${y}" stroke="#C9C2B8" stroke-width="1"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#DCD6CD"/>${lines.join("")}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-assertion-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Assertion",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "assertion-evidence, claim, evidence, data desk, charts" },
    theme: {
      background: PAPER,
      color: INK,
      accent: ACCENT,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: PANEL, tx2: GREY, accent2: INK, accent3: MARK, accent4: HAIR, hlink: ACCENT },
      chartPalette: [ACCENT, MARK, GREY],
      table: { headerBg: PAPER, headerColor: INK, borderColor: HAIR, borderWidth: 1, fontSize: 22, color: INK, radius: 0 },
    },
    fonts: [
      { family: "Schibsted Grotesk", asset: "schibsted-grotesk", weight: "400 900" },
      { family: "JetBrains Mono", asset: "jetbrains-mono", weight: "400 700" },
    ],
    assets: {
      "schibsted-grotesk": dataUri(join(root, "fonts", "schibsted-grotesk-latin.woff2")),
      "jetbrains-mono": dataUri(join(root, "fonts", "jetbrains-mono-latin.woff2")),
      placeholder: placeholderSvg(),
      shot: shotSvg(SHOT.w - 2, SHOT.h - 2),
      "shot-notes": shotSvg(NOTES_SHOT.w - 2, NOTES_SHOT.h - 2),
      clip: shotSvg(CLIP.w - 2, CLIP.h - 2),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
