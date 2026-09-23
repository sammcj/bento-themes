// Transit: station signage and line maps after Massimo Vignelli and Unimark's New York
// subway system (1970-72), for roadmaps, migrations, processes and journeys: anything
// with a sequence and a "you are here".
//
// Content slides open with a black sign band across the top: a thin white rule near its
// upper edge, as on the real signs, the slide title in white Inter, and the page number
// in a green route disc at the right. Content slides carry no run-title: the sign holds the
// slide title, and a running deck title beside it would crowd it. Below it is a near-white ground with 64px side
// margins and a content band from y 168 to 664. One family (Inter, with its optical-size
// axis) carries every level through weight and size.
//
// Route discs are the numbering system: agenda stops, points, process stations, section
// numbers and screenshot callouts are all coloured circles with a white numeral.
// Colour exception: this theme keeps a small fixed set of route colours, the way subway
// lines have colours, where the other themes keep one accent. Green is the current line
// and dominates every slide. Orange is a second line that appears only at an interchange
// or in a legend, and grey is the old line in before/after comparisons. Yellow and purple
// are in the theme palette for decks that need more lines. The process slide is a line
// map: stations joined by thick connectors, ticks for minor stops, a white interchange
// station where the orange line joins, and a "you are here" marker; its detail state
// zooms into the interchange. No animation anywhere; ids are stable so a morph can be
// switched on later.
import { join } from "node:path";
import { columns, dataUri, factory } from "../../scripts/lib.mjs";

// WCAG ratios. On PAPER: INK 17.8, GREY 6.5, GREEN 4.9, ORANGE 4.4 (bold 22px+ only, large text).
// WHITE on SIGN 18.4, SIGN_GREY on SIGN 7.8. WHITE on GREEN 5.1, WHITE on ORANGE 4.6,
// INK on YELLOW 12.1, WHITE on PURPLE 6.2. LINE_GREY 3.3 on PAPER (non-text: the old line).
const PAPER = "#FBFBF9";
const SIGN = "#141414";
const INK = "#141414";
const WHITE = "#FFFFFF";
const GREY = "#5C5C5C";
const SIGN_GREY = "#A8A8A8"; // secondary text on the black sign
const HAIR = "#D6D6D2";
const PANEL = "#EFEFEC"; // letterbox behind captures
const GREEN = "#00803A"; // the current line
const ORANGE = "#C94F0A"; // a second line, at interchanges and in legends
const LINE_GREY = "#8A8C8E"; // the old line in before/after
const YELLOW = "#FCCC0A"; // palette only; takes an ink numeral
const PURPLE = "#A2338F"; // palette only
const SANS = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const M = 64;
const BAND = 1152;
const RIGHT = M + BAND; // 1216
const SIGN_H = 128;
const TOP = 168;
const BOTTOM = 664;
const C2 = columns(2, { margin: M, gutter: 32 }); // 560 at 64, 656
const C3 = columns(3, { margin: M, gutter: 32 }); // 362 at 64, 458, 852
const C4 = columns(4, { margin: M, gutter: 32 }); // 264 at 64, 360, 656, 952

const f = factory({ fontFamily: SANS, color: INK, accent: GREEN });

// Type scale (px): cover 104, section 72, quote 72, closing 64, statement 52, sign title 40,
// figures 96 and 72, point leads 34, agenda titles and title-body copy 32, other leads 26-30,
// body 24-26, notes and descriptions 22, captions 18-20, tags 16.
const heading = (o) => f.text({ fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.6, color: WHITE, valign: "middle", ...o });
const lead = (o) => f.text({ fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.3, ...o });
const body = (o) => f.text({ fontSize: 24, lineHeight: 1.4, ...o });
const caption = (o) => f.text({ fontSize: 18, lineHeight: 1.3, color: GREY, ...o });
const tag = (o) => f.text({ fontSize: 16, fontWeight: 700, lineHeight: 1.2, letterSpacing: 1.2, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// A route disc centred on (cx, cy), grouped with its numeral so they drag as one. The
// numeral only renders in layouts under an id assertDoc allows as a literal (ag-n, pt-n, pr-n, shot-cn/kn).
// `text` overrides the numeral's props, e.g. a placeholder in place of html.
const disc = (id, nid, cx, cy, d, html, { fill = GREEN, color = WHITE, stroke = "none", strokeWidth = 0, size = Math.round(d * 0.46), extra = {}, text = {} } = {}) => {
  const g = { groupId: `${id}-g`, x: cx - d / 2, y: cy - d / 2, w: d, h: d };
  return [
    f.ellipse({ id, ...g, fill, stroke, strokeWidth, ...extra }),
    ...(nid ? [f.text({ id: nid, ...g, html, fontSize: size, fontWeight: 700, lineHeight: 1, letterSpacing: 0, color, align: "center", valign: "middle", ...extra, ...text })] : []),
  ];
};

// A green disc with a white signage arrow (shaft and head, a path so it cannot read as a
// play button): the "this way" mark on the cover and closing slides.
const arrowDisc = (cx, cy, d) => {
  const a = Math.round(d * 0.56);
  return [
    f.ellipse({ id: "mark", groupId: "mark-g", x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: GREEN }),
    f.path({ id: "mark-arrow", groupId: "mark-g", d: "M8 40H54V16L92 50L54 84V60H8Z", pathBox: [0, 0, 100, 100], fill: WHITE, x: cx - a / 2 + 1, y: cy - a / 2, w: a, h: a }),
  ];
};

// The page number sits in a green route disc on the sign. The text box is wider than the
// disc because validate() measures the raw {{page}} token.
const pageDisc = (cx, cy) => [
  f.ellipse({ id: "mark", x: cx - 28, y: cy - 28, w: 56, h: 56, fill: GREEN }),
  f.text({ id: "run-page", html: "{{page}}", fontSize: 22, fontWeight: 700, lineHeight: 1, color: WHITE, align: "center", valign: "middle", x: cx - 60, y: cy - 28, w: 120, h: 56 }),
];

// The sign: black band, white rule near its top edge, title, page disc.
const sign = (h = SIGN_H, y = 0) => [f.rect({ id: "sign", x: 0, y, w: 1280, h, fill: SIGN }), f.rect({ id: "head-rule", x: 0, y: y + 14, w: 1280, h: 2, fill: WHITE })];
const signTop = (demo, title, placeholder = "Slide title") => [
  ...sign(),
  heading({ id: "slide-head", ...ph(demo, title, placeholder), x: M, y: 28, w: 1040, h: 88 }),
  ...pageDisc(1188, 72),
];

const slide = (id, name, notes, elements, background = PAPER) => ({ id, name, background, transition: "none", notes, elements });
const content = (id, name, notes, demo, title, els, placeholder) => slide(id, name, notes, [...signTop(demo, title, placeholder), ...els]);

// A straight connector between two elements' side midpoints, or a free point {x, y}.
// The geometry written here is what the editor derives from from/to, so nothing moves on
// first edit. Round caps reach under the discs, which draw on top, so the line meets them cleanly.
const edge = (b, side) => (side === "top" ? [b.x + b.w / 2, b.y] : side === "bottom" ? [b.x + b.w / 2, b.y + b.h] : side === "left" ? [b.x, b.y + b.h / 2] : [b.x + b.w, b.y + b.h / 2]);
const route = (id, a, sa, b, sb, { fill = GREEN, width = 16 } = {}) => {
  const [x1, y1] = a.id ? edge(a, sa) : [a.x, a.y];
  const [x2, y2] = b.id ? edge(b, sb) : [b.x, b.y];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const r2 = (v) => Math.round(v * 100) / 100;
  const h = width + 8;
  const geo = { x: r2((x1 + x2) / 2 - len / 2), y: r2((y1 + y2) / 2 - h / 2), w: r2(len), h, rotation: r2((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI) };
  const ends = { ...(a.id ? { from: { el: a.id, side: sa } } : {}), ...(b.id ? { to: { el: b.id, side: sb } } : {}) };
  return f.line({ id, ...geo, fill, strokeWidth: width, ...ends });
};
const box = (id, cx, cy, d) => ({ id, x: cx - d / 2, y: cy - d / 2, w: d, h: d });

// "You are here": a black dot with a white ring on the line, and a black tab pointing at it.
const here = (cx, cy, d = 28) => [
  f.ellipse({ id: "here-dot", x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: INK, stroke: WHITE, strokeWidth: 4 }),
  f.rect({ id: "here-tab", x: cx - 84, y: cy - 82, w: 168, h: 36, fill: SIGN }),
  { ...f.rect({ id: "here-point", x: cx - 10, y: cy - 47, w: 20, h: 12, fill: SIGN }), shape: "triangle", rotation: 180 },
  tag({ id: "here-t", html: "YOU ARE HERE", color: WHITE, align: "center", valign: "middle", x: cx - 84, y: cy - 82, w: 168, h: 36 }),
];

const cover = (demo) =>
  slide("s-cover", "Cover", "Cover. Title, company and author fill from File > Properties, so set them once. The subtitle says where the talk goes. The date is a literal: {{date}} would show whatever day the deck is presented. The green disc with the arrow is the 'this way' sign; it returns on the closing slide.", [
    ...sign(448),
    ...arrowDisc(M + 40, 96, 80),
    f.text({ id: "deck-title", html: "{{title}}", fontSize: 104, fontWeight: 700, lineHeight: 1.0, letterSpacing: -3, color: WHITE, valign: "bottom", x: M, y: 176, w: BAND, h: 224 }),
    f.text({ id: "cover-sub", ...ph(demo, "Moving the support knowledge assistant from prototype to production: the route for 2026 and where we are on it", "Where the talk goes, in one sentence"), fontSize: 30, lineHeight: 1.3, letterSpacing: -0.3, x: M, y: 488, w: 1000, h: 80 }),
    hair({ id: "cover-rule", x: M, y: 604, w: BAND }),
    f.text({ id: "run-title", html: "{{company}}", fontSize: 20, fontWeight: 700, lineHeight: 1.3, x: M, y: 624, w: 480, h: 28 }),
    caption({ id: "cv-author", html: "{{author}}", fontSize: 20, x: 560, y: 624, w: 360, h: 28 }),
    caption({ id: "run-page", ...ph(demo, "23 September 2026", "Date"), fontSize: 20, align: "right", x: 936, y: 624, w: 280, h: 28 }),
  ]);

const agenda = (demo) => {
  const items = demo
    ? [
        ["Where we started", "A notebook prototype answering 300 questions a day"],
        ["The route", "Four stations, one a quarter, from prototype to production"],
        ["Changing onto the platform line", "What moved to the shared inference gateway, and what it cost"],
        ["Next stop: production", "SLOs, on-call and switching the prototype off"],
      ]
    : ["one", "two", "three", "four"].map((n) => [`Stop ${n}`, "What this part covers"]);
  const pitch = 132;
  const stops = items.map((_, i) => box(`ag-k${i}`, M + 32, TOP + 36 + i * pitch, 64));
  return content("s-agenda", "Agenda", "Agenda as a strip map: each item is a stop on one line, numbered in a route disc, with a line of detail under it. The line is a set of connectors, so a stop can be moved and the line follows. Four stops fill the band; delete a stop rather than shrinking the type.", demo, "Agenda", [
    ...stops.slice(1).map((b, i) => route(`ag-l${i}`, stops[i], "bottom", b, "top", { width: 14 })),
    ...items.flatMap(([h, d], i) => {
      const y = TOP + i * pitch;
      return [
        ...disc(`ag-k${i}`, `ag-n${i}`, M + 32, y + 36, 64, String(i + 1), { size: 30 }),
        f.text({ id: `ag-t${i}`, ...ph(demo, h, h), fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, x: 160, y: y + 10, w: RIGHT - 160, h: 40 }),
        caption({ id: `ag-d${i}`, ...ph(demo, d, d), fontSize: 22, x: 160, y: y + 56, w: RIGHT - 160, h: 30 }),
      ];
    }),
  ]);
};

const section = (demo) =>
  slide("s-section", "Section", "Section divider: a full sign panel with the section number in a large route disc above the title, the way a station sign sets the line before the destination. Keep the title to two lines; the grey line under it says what the section covers.", [
    ...sign(720),
    ...disc("sec-disc", "sec-num", M + 100, 272, 200, "", { size: 108, text: ph(demo, "3", "1") }),
    f.text({ id: "sec-title", ...ph(demo, "Changing onto the platform line", "Section title"), fontSize: 72, fontWeight: 700, lineHeight: 1.04, letterSpacing: -1.8, color: WHITE, valign: "bottom", x: M, y: 408, w: BAND, h: 160 }),
    f.text({ id: "sec-lead", ...ph(demo, "Shared gateway, single sign-on and audit logs, July to September", "What this section covers"), fontSize: 26, lineHeight: 1.3, color: SIGN_GREY, x: M, y: 592, w: BAND, h: 36 }),
  ], SIGN);

const statement = (demo) =>
  content("s-statement", "Statement", "Statement. One sentence the audience should remember, under about twenty words so it holds at 52px in three lines. The sign carries a short kicker. The grey source line is optional.", demo, "How we ran the migration", [
    f.text({ id: "stmt", ...ph(demo, "We moved the assistant one stage at a time, and every stage had a date and a test it had to pass.", "One idea, one sentence"), fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1.2, valign: "middle", x: M, y: TOP, w: 1040, h: 392 }),
    hair({ id: "stmt-rule", x: M, y: 584, w: BAND }),
    caption({ id: "stmt-src", ...ph(demo, "Migration plan agreed with the support and platform teams, December 2025", "Source or context"), fontSize: 20, x: M, y: 604, w: BAND, h: 28 }),
  ], "Kicker");

const titleBody = (demo) =>
  content("s-body", "Title and body", "Title and body. One block of text at 32px in a 1100px column so lines stay readable. Use <ul> for bullets and <br><br> between paragraphs: validate() measures <p> margins the renderer does not draw, so <p> copy gets a false overflow before it fills the band. If it does not fit, cut words or split the slide rather than shrinking the type.", demo, "Where we started", [
    body({
      id: "body-copy",
      ...ph(
        demo,
        "The support knowledge assistant started in January as a notebook on a shared GPU box. It answered about 300 questions a day from 9,000 help-centre and Confluence pages, and nobody could say how often it was right.<br><br>We gave the migration four stations, one a quarter, and three rules for every release:<ul><li>Change one stage at a time</li><li>Pass the 400-question golden set in CI before merging</li><li>Keep the prototype serving until the new path matches it</li></ul>The rest of this deck is the route map and where we are on it.",
        "Body copy",
      ),
      fontSize: 32,
      lineHeight: 1.5,
      x: M,
      y: TOP,
      w: 1100,
      h: BOTTOM - TOP,
    }),
  ]);

const points = (demo) => {
  const items = demo
    ? [
        ["Measure before you move", "The golden set came first. Every later change had to pass it in CI before it could merge."],
        ["Change one stage per release", "Retrieval, then the platform, then operations. When a score fell, there was one change to look at."],
        ["Keep the old line running", "The prototype served shadow traffic until the new path matched it for four weeks, and only then was it switched off."],
      ]
    : ["one", "two", "three"].map((n) => [`Point ${n}`, "Supporting sentence"]);
  const pitch = (BOTTOM - TOP) / items.length;
  return content("s-points", "Points", "Points. Three rows between hairlines, each numbered in a route disc with a bold lead and one or two sentences. For more than three, split the slide.", demo, "Three rules that kept the migration on time", [
    ...items.flatMap(([h, d], i) => {
      const y = Math.round(TOP + i * pitch);
      return [
        hair({ id: `pt-r${i}`, x: M, y, w: BAND }),
        ...disc(`pt-k${i}`, `pt-n${i}`, M + 40, y + Math.round(pitch / 2), 80, String(i + 1), { size: 38 }),
        lead({ id: `pt-h${i}`, ...ph(demo, h, h), fontSize: 34, x: 176, y: y + 22, w: RIGHT - 176, h: 42 }),
        body({ id: `pt-d${i}`, ...ph(demo, d, d), fontSize: 26, color: GREY, x: 176, y: y + 72, w: 1000, h: 76 }),
      ];
    }),
    hair({ id: "pt-r3", x: M, y: BOTTOM, w: BAND }),
  ]);
};

const twoCol = (demo) => {
  const cols = demo
    ? [
        ["l", "Prototype, January", "0.71", "context recall on the golden set", "<ul><li>One notebook on a shared GPU box</li><li>Dense search only, top 8 chunks</li><li>Quality checked by reading answers</li><li>API keys in environment variables</li><li>One person knew how to restart it</li><li>Answers cited no sources</li></ul>"],
        ["r", "Production, December", "0.89", "context recall on the golden set", "<ul><li>A service on the shared inference gateway</li><li>Hybrid search and a reranker, top 5</li><li>400-question eval gate in CI</li><li>Single sign-on, audit logs, team quotas</li><li>SLOs and a two-person on-call rota</li><li>Every answer cites its source pages</li></ul>"],
      ]
    : [
        ["l", "Left heading", "00", "What the figure measures", "Left body"],
        ["r", "Right heading", "00", "What the figure measures", "Right body"],
      ];
  return content("s-twocol", "Two columns", "Two columns, 560px each: the old line in grey on the left, the current line in green on the right. Each column has a heading, a thick line rule in its route colour, one figure and a short list.", demo, "Prototype line and production line", cols.flatMap(([s, head, v, l, copy], i) => {
    const x = C2.x[i];
    const col = i ? GREEN : LINE_GREY;
    return [
      lead({ id: `col-${s}-head`, ...ph(demo, head, head), fontSize: 30, x, y: TOP, w: C2.w, h: 38 }),
      f.rect({ id: `col-${s}-rule`, x, y: TOP + 52, w: C2.w, h: 10, fill: col }),
      f.text({ id: `col-${s}-fig`, ...ph(demo, v, v), fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: -2, color: i ? GREEN : INK, x, y: TOP + 88, w: C2.w, h: 76 }),
      caption({ id: `col-${s}-figl`, ...ph(demo, l, l), fontSize: 20, x, y: TOP + 172, w: C2.w, h: 28 }),
      body({ id: `col-${s}-body`, ...ph(demo, copy, copy), fontSize: 26, lineHeight: 1.55, x, y: TOP + 224, w: C2.w, h: BOTTOM - TOP - 224 }),
    ];
  }));
};

// Platform indicators: black sign tiles with a white rule, one green tile for the figure that matters.
const numbers = (demo) => {
  const stats = demo
    ? [
        ["0.89", "context recall on the golden set, up from 0.71 in January"],
        ["1.4 s", "p95 from question to first token, down from 2.3 s"],
        ["4,100", "questions a week through the gateway, up from 2,100"],
      ]
    : [0, 1, 2].map(() => ["00", "What the figure measures"]);
  const TILE_H = 400;
  return content("s-numbers", "Numbers", "Headline numbers set as platform indicators: each figure on a sign tile with its label at the foot. The green tile is the figure the slide is about; keep it to one. Figures hold six characters at 96px. The grey line under the tiles carries the source.", demo, "Where the numbers stand", [
    ...stats.flatMap(([v, l], i) => {
      const x = C3.x[i];
      const key = i === 0;
      return [
        f.rect({ id: `st-r${i}`, x, y: TOP, w: C3.w, h: TILE_H, fill: key ? GREEN : SIGN }),
        f.rect({ id: `st-w${i}`, x, y: TOP + 14, w: C3.w, h: 2, fill: WHITE }),
        f.text({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 96, fontWeight: 700, lineHeight: 1, letterSpacing: -3, color: WHITE, x: x + 28, y: TOP + 52, w: C3.w - 56, h: 100 }),
        f.text({ id: `st-l${i}`, ...ph(demo, l, l), fontSize: 24, fontWeight: 500, lineHeight: 1.3, color: WHITE, valign: "bottom", x: x + 28, y: TOP + TILE_H - 156, w: C3.w - 56, h: 128 }),
      ];
    }),
    hair({ id: "st-foot-rule", x: M, y: TOP + TILE_H + 24, w: BAND }),
    caption({ id: "st-note", ...ph(demo, "Recall on the 400-question golden set. Latency and volume at the gateway, four weeks to 20 September 2026.", "Source or consequence"), fontSize: 20, x: M, y: TOP + TILE_H + 44, w: BAND, h: 52 }),
  ]);
};

// Chart geometry: the plot box inside the chart element, so the series labels can sit
// beside each line's last point. The y axis is pinned with min and max.
const CH = { x: M, y: TOP, w: BAND, h: 452, left: 64, right: 200, top: 16, bottom: 36, max: 1000 };
const plotY = (v) => CH.y + CH.h - CH.bottom - (v / CH.max) * (CH.h - CH.top - CH.bottom);

const chart = (demo) => {
  const weeks = ["W27", "W28", "W29", "W30", "W31", "W32", "W33", "W34", "W35", "W36", "W37", "W38"];
  const series = [
    [demo ? "Gateway" : "Current line", [0, 0, 40, 90, 190, 300, 410, 520, 610, 690, 760, 820], GREEN],
    [demo ? "Prototype" : "Old line", [610, 620, 580, 560, 470, 380, 300, 210, 140, 80, 30, 0], LINE_GREY],
  ];
  return content("s-chart", "Chart", "Chart, drawn like a line map: thick lines with station dots at each point, the current line in green and the old line in grey. Each line is labelled at its last point instead of a legend; move the labels if the data changes. Gridlines are a hairline tone because charts-lite ignores splitLine.show.", demo, "Traffic moved from the prototype to the gateway", [
    f.chart({
      id: "chart-main",
      preset: "line",
      x: CH.x,
      y: CH.y,
      w: CH.w,
      h: CH.h,
      option: {
        color: [LINE_GREY, GREEN], // matches the reversed series order
        textStyle: { fontFamily: SANS },
        grid: { left: CH.left, right: CH.right, top: CH.top, bottom: CH.bottom },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: demo ? weeks : weeks.map((_, i) => String(i + 1)), axisLine: { lineStyle: { color: INK, width: 2 } }, axisLabel: { color: GREY, fontSize: 16 } },
        yAxis: { type: "value", min: 0, max: CH.max, axisLine: { lineStyle: { color: PAPER } }, splitLine: { lineStyle: { color: HAIR, width: 1 } }, axisLabel: { color: GREY, fontSize: 16 } },
        series: series.map(([name, data, color]) => ({ name, type: "line", data, symbol: "circle", symbolSize: 14, smooth: false, lineStyle: { color, width: 6 } })).reverse(),
      },
    }),
    ...series.map(([name, data], i) => {
      const last = data[data.length - 1];
      return f.text({ id: `chart-lab${i}`, ...ph(demo, `${name}<br>${last} a day`, i ? "Old line label" : "Current line label"), fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: i ? GREY : GREEN, x: CH.x + CH.w - CH.right + 24, y: Math.round(plotY(last) - 24), w: CH.right - 24, h: 48 });
    }),
    caption({ id: "chart-src", ...ph(demo, "Questions per day at the gateway and the prototype, weekly mean, July to September 2026. Cut-over completed in W38.", "Source"), x: M, y: 636, w: BAND, h: 24 }),
  ]);
};

// Timetable: a black header like a departures board, hairlines between services, the
// status column in route colours. Rows are uniform, so the rules sit at h / rows.
const TABLE_ROW = 76;
const table = (demo) => {
  const data = demo
    ? [
        ["Release", "Change", "Calling at", "Due", "Status"],
        ["R1", "Golden set and eval gate", "dev, CI", "20 Mar", "Arrived"],
        ["R2", "Hybrid search and reranker", "dev, staging, prod", "12 Jun", "Arrived"],
        ["R3", "Move to the shared gateway", "staging, prod", "15 Sep", "Arrived"],
        ["R4", "SLOs and on-call rota", "prod", "30 Oct", "On time"],
        ["R5", "Switch off the prototype", "prod", "11 Dec", "Delayed 2 wks"],
      ]
    : [["Column", "Column", "Column", "Column", "Column"], ...[1, 2, 3, 4, 5].map(() => ["Row", "", "", "", ""])];
  const status = { "On time": { color: GREEN, bold: true }, "Delayed 2 wks": { color: ORANGE, bold: true }, Arrived: { color: GREY } };
  const rows = data.map((r, i) => ({ cells: r.map((html, c) => ({ html, ...(c === 0 && i ? { bold: true } : {}), ...(c === 4 && i ? status[html] ?? {} : {}) })) }));
  return content("s-table", "Table", "Table as a timetable: a black header like a departures board, hairlines between rows drawn as rects over a borderless table, and the status column in route colours: green on time, orange delayed, grey arrived. Orange text is bold so it reads as large text.", demo, "Release timetable", [
    f.table({
      id: "tbl-main",
      x: M,
      y: TOP,
      w: BAND,
      h: TABLE_ROW * data.length,
      columns: [{ w: 1.2 }, { w: 3 }, { w: 2.1 }, { w: 1.1 }, { w: 1.7 }],
      rows,
      style: TABLE_STYLE,
    }),
    ...[2, 3, 4, 5, 6].map((i) => hair({ id: `tbl-rule${i}`, x: M, y: TOP + i * TABLE_ROW, w: BAND, ...(i === 6 ? { h: 2, fill: INK } : {}) })),
    caption({ id: "tbl-note", ...ph(demo, "Due dates as agreed at the December 2025 planning session. R5 waits on the last two teams moving their integrations.", "Source or reading of the table"), x: M, y: 636, w: BAND, h: 24 }),
  ]);
};
const TABLE_STYLE = { headerBg: SIGN, headerColor: WHITE, borderColor: PAPER, borderWidth: 0, cellPadX: 20, cellPadY: 14, fontSize: 22, color: INK, radius: 0 };

// Line map: four stations on the green line, ticks for minor stops, the orange platform
// line joining at a white interchange station, and the "you are here" marker between stations.
const LINE_Y = 360;
const ST_X = C4.x.map((x) => x + 36);
const STATIONS_DEMO = [
  ["Q1 Measure", "Golden set of 400 questions and an eval gate in CI"],
  ["Q2 Retrieve", "Hybrid search and a reranker lift recall to 0.89"],
  ["Q3 Platform", "Change here for the platform line: gateway, SSO, audit logs"],
  ["Q4 Operate", "SLOs, on-call rota, and the prototype switched off"],
];
const INTERCHANGE = 2;
const HERE_X = 840;

// 72px station discs: filled when passed, ringed in ink at the interchange, hollow ahead.
const station = (i, cx, extra = {}) => {
  const style = i === INTERCHANGE ? { fill: WHITE, color: INK, stroke: INK, strokeWidth: 6 } : i < INTERCHANGE ? {} : { fill: WHITE, color: GREEN, stroke: GREEN, strokeWidth: 6 };
  return disc(`pr-k${i}`, `pr-n${i}`, cx, LINE_Y, 72, String(i + 1), { size: 34, ...style, extra });
};

const legend = (demo, items) => {
  let x = M;
  return items.flatMap(([kind, text, w], i) => {
    const d = kind === "here" ? { fill: INK, stroke: WHITE, strokeWidth: 3 } : { fill: kind };
    const out = [f.ellipse({ id: `pr-lg${i}`, x, y: 624, w: 24, h: 24, ...d }), caption({ id: `pr-lt${i}`, ...ph(demo, text, "Legend"), color: INK, x: x + 36, y: 624, w, h: 24 })];
    x += w + 72;
    return out;
  });
};

const process = (demo) => {
  const st = demo ? STATIONS_DEMO : [0, 1, 2, 3].map((i) => [`Station ${i + 1}`, "What happens at this stop"]);
  const nodes = ST_X.map((cx, i) => box(`pr-k${i}`, cx, LINE_Y, 72));
  const ticks = demo ? ["Shadow traffic", "Security review"] : ["Minor stop", "Minor stop"];
  return content("s-process", "Process", "Process as a line map. Stations are route discs joined by connectors, so a station can be dragged and the line follows. Filled discs are stations passed, the white disc with a black ring is the interchange where the orange platform line joins, and the hollow disc is still ahead. Ticks are minor stops. The black marker is where the project is today. In the demo, station 3 is clickable and opens a zoomed view of the interchange; left arrow returns.", demo, "Migration route, 2026", [
    // The orange line comes out from under the sign: a square patch hides the connector's round cap.
    route("pr-orange", { x: ST_X[INTERCHANGE], y: SIGN_H + 8 }, null, nodes[INTERCHANGE], "top", { fill: ORANGE }),
    f.rect({ id: "pr-orange-end", x: ST_X[INTERCHANGE] - 8, y: SIGN_H, w: 16, h: 16, fill: ORANGE }),
    ...nodes.slice(1).map((b, i) => route(`pr-a${i}`, nodes[i], "right", b, "left")),
    ...ticks.flatMap((t, i) => {
      const cx = (ST_X[i] + ST_X[i + 1]) / 2;
      return [
        f.rect({ id: `pr-tick${i}`, x: cx - 3, y: LINE_Y - 30, w: 6, h: 24, fill: GREEN }),
        caption({ id: `pr-tl${i}`, ...ph(demo, t, t), align: "center", x: cx - 90, y: LINE_Y - 60, w: 180, h: 24 }),
      ];
    }),
    ...ST_X.flatMap((cx, i) => station(i, cx, demo && i === INTERCHANGE ? { link: "s-process-detail" } : {})),
    ...here(HERE_X, LINE_Y),
    ...st.flatMap(([h, d], i) => [
      lead({ id: `pr-t${i}`, ...ph(demo, h, h), fontSize: 26, x: C4.x[i], y: LINE_Y + 64, w: C4.w, h: 34 }),
      f.text({ id: `pr-d${i}`, ...ph(demo, d, d), fontSize: 22, lineHeight: 1.35, color: GREY, x: C4.x[i], y: LINE_Y + 106, w: C4.w, h: 96 }),
    ]),
    hair({ id: "pr-lg-rule", x: M, y: 600, w: BAND }),
    ...legend(demo, [
      [GREEN, "Assistant line", 150],
      [ORANGE, "Platform line", 150],
      ["here", "You are here, 23 September", 260],
    ]),
    ...(demo
      ? [
          // Below the line only, so the disc and the you-are-here marker stay selectable in the editor.
          f.rect({ id: "pr-hit1", x: C4.x[INTERCHANGE] - 12, y: LINE_Y + 44, w: C4.w + 24, h: 168, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          caption({ id: "pr-hint", html: "Click station 3 for the interchange", align: "right", x: 856, y: 624, w: 360, h: 24 }),
        ]
      : []),
  ]);
};

// Detail state: the map zoomed in on the interchange. The same line runs off both edges of
// the slide, the orange line comes down from the sign, and the stops inside the station show.
const processDetail = () => {
  const y = 296;
  const cx = 240;
  const steps = [
    ["Gateway keys", "14 Jul", 420],
    ["Single sign-on", "4 Aug", 590],
    ["Audit logs", "25 Aug", 760],
    ["Cut-over", "15 Sep", 930],
  ];
  return {
    id: "s-process-detail",
    stateOf: "s-process",
    background: PAPER,
    transition: "none",
    notes: "Detail state for station 3, reached by clicking it on the route map and hidden from the arrow-key sequence. The map is zoomed in: the green line runs off both edges, the orange platform line comes down from the sign, and the four stops inside the quarter are ticks. Left arrow returns to the route map.",
    elements: [
      ...signTop(true, "Migration route, 2026"),
      f.rect({ id: "det-line", x: 0, y: y - 14, w: 1280, h: 28, fill: GREEN }),
      f.rect({ id: "det-orange", x: cx - 14, y: SIGN_H, w: 28, h: y - SIGN_H, fill: ORANGE }),
      tag({ id: "det-ol", html: "PLATFORM LINE", x: cx + 32, y: SIGN_H + 20, w: 240, h: 20 }),
      tag({ id: "det-gl", html: "ASSISTANT LINE", align: "right", x: 1016, y: y + 36, w: 200, h: 20, color: GREEN }),
      ...steps.flatMap(([t, d, x], i) => [
        f.rect({ id: `det-tick${i}`, x: x - 4, y: y - 50, w: 8, h: 36, fill: GREEN }),
        f.text({ id: `det-t${i}`, html: t, fontSize: 22, fontWeight: 700, lineHeight: 1.2, align: "center", x: x - 88, y: y - 88, w: 176, h: 28 }),
        caption({ id: `det-d${i}`, html: d, fontSize: 20, align: "center", x: x - 88, y: y + 28, w: 176, h: 26 }),
      ]),
      ...disc("pr-k2", "pr-n2", cx, y, 160, "3", { fill: WHITE, color: INK, stroke: INK, strokeWidth: 13, size: 80 }),
      ...here(1130, y, 36),
      hair({ id: "det-rule", x: M, y: 408, w: BAND }),
      lead({ id: "pr-t2", html: "Q3 Platform: change here for the platform line", fontSize: 26, x: M, y: 428, w: BAND, h: 34 }),
      body({ id: "det-body", html: "Inference moved from the notebook's GPU box to the platform team's shared gateway. The assistant now signs in with SSO, every question lands in the audit log, and quotas are set per team.", fontSize: 22, x: M, y: 476, w: C2.w, h: 156 }),
      body({ id: "det-body2", html: "Cut-over took one evening. Shadow traffic had matched the prototype for four weeks, so the switch was a routing change at the gateway. The prototype keeps running, read-only, until R5 in December.", fontSize: 22, x: C2.x[1], y: 476, w: C2.w, h: 156 }),
      caption({ id: "det-back", html: "Left arrow returns to the route map", x: M, y: 640, w: 480, h: 24 }),
    ],
  };
};

// A framed capture: letterboxed on the panel colour inside a hairline, image inset by the rule.
const frame = (p, asset, { x, y, w, h }) => [
  f.rect({ id: `${p}-frame`, x, y, w, h, fill: PANEL, stroke: HAIR, strokeWidth: 1 }),
  f.image({ id: `${p}-img`, src: `asset:${asset}`, fit: "contain", x: x + 1, y: y + 1, w: w - 2, h: h - 2 }),
];
const SHOT = { x: M, y: TOP, w: BAND, h: 456 };
const NOTES_SHOT = { x: M, y: TOP, w: 736, h: 456 };
const CLIP = { w: C2.w, h: 300 };

const screenshot = (demo) =>
  content("s-screenshot", "Screenshot", "Screenshot. One capture across the band, letterboxed on a pale panel inside a hairline, with a caption under it. Replace the shot asset with a PNG downscaled to 2560px wide, and keep captions in text: text baked into an image cannot be edited or read by a screen reader.", demo, "The gateway dashboard after cut-over", [
    ...frame("shot", "shot", SHOT),
    caption({ id: "shot-caption", ...ph(demo, "Gateway dashboard, assistant tenant, week of 15 September 2026.", "Caption"), x: M, y: 636, w: BAND, h: 24 }),
  ]);

// Wireframe features, as fractions of the capture: the traffic panel, the eval tile and the
// error-budget tile. Callouts are placed from these.
const WIRE = { chart: { x: 0.21, y: 0.42, w: 0.5, h: 0.5 }, kpi: { x: 0.21, y: 0.14, w: 0.23, h: 0.2 }, budget: { x: 0.73, y: 0.14, w: 0.24, h: 0.2 } };
const spot = (fr, s) => [Math.round(fr.x + 1 + s.x * (fr.w - 2)), Math.round(fr.y + 1 + s.y * (fr.h - 2))];

const screenshotNotes = (demo) => {
  const items = demo
    ? [
        ["Traffic by path", "The gateway passed 90% of questions on 9 September.", WIRE.chart],
        ["Eval gate", "Build 212 passed 371 of 400. The gate is 360.", WIRE.kpi],
        ["Error budget", "4% of September's budget spent, all in one deploy.", WIRE.budget],
      ]
    : [1, 2, 3].map((n) => [`What to look at ${n}`, "What it shows and why it matters", [WIRE.chart, WIRE.kpi, WIRE.budget][n - 1]]);
  return content("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. Numbered route discs sit on the capture and the same numbers key the notes on the right, so the audience finds each point without a pointer. Move the discs onto your own capture; each is grouped with its numeral.", demo, "Reading the gateway dashboard", [
    ...frame("shot", "shot-notes", NOTES_SHOT),
    ...items.flatMap(([, , s], i) => {
      const [x, y] = spot(NOTES_SHOT, s);
      return disc(`shot-c${i + 1}`, `shot-cn${i + 1}`, x + 4, y + 4, 44, String(i + 1), { stroke: WHITE, strokeWidth: 3, size: 22 });
    }),
    ...items.flatMap(([h, d], i) => {
      const y = TOP + i * 160;
      return [
        ...disc(`shot-k${i + 1}`, `shot-kn${i + 1}`, 852, y + 20, 40, String(i + 1), { size: 20 }),
        lead({ id: i ? `shot-t${i + 1}` : "shot-lead", ...ph(demo, h, h), fontSize: 24, x: 888, y: y + 4, w: RIGHT - 888, h: 32 }),
        f.text({ id: i ? `shot-d${i + 1}` : "shot-body", ...ph(demo, d, d), fontSize: 22, lineHeight: 1.35, color: GREY, x: 888, y: y + 44, w: RIGHT - 888, h: 90 }),
      ];
    }),
    caption({ id: "shot-caption", ...ph(demo, "Gateway dashboard, week of 15 September 2026.", "Caption"), x: M, y: 636, w: NOTES_SHOT.w, h: 24 }),
  ]);
};

const clippings = (demo) => {
  const shots = demo
    ? [
        ["Prototype: dense search, top 8", "Cites the 2024 refunds page. The current policy ranked eleventh and never reached the model."],
        ["Gateway: hybrid and rerank, top 5", "Cites the current refunds policy first, and the 2024 page no longer reaches the prompt."],
      ]
    : [
        ["Left caption", "One sentence on what the clipping shows"],
        ["Right caption", "One sentence on what the clipping shows"],
      ];
  return content("s-clippings", "Two clippings", "Two clippings side by side, each over a thick rule in its line colour: grey for the old line, green for the current one. Crop both clippings to the same aspect ratio before embedding so the frames match.", demo, "The same question on both lines", shots.flatMap(([h, d], i) => {
    const x = C2.x[i];
    const p = i ? "clip-r" : "clip-l";
    return [
      ...frame(p, i ? "clip-good" : "clip-bad", { x, y: TOP, ...CLIP }),
      f.rect({ id: `${p}-rule`, x, y: TOP + CLIP.h + 20, w: C2.w, h: 10, fill: i ? GREEN : LINE_GREY }),
      lead({ id: `${p}-head`, ...ph(demo, h, h), fontSize: 26, x, y: TOP + CLIP.h + 50, w: C2.w, h: 34 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), fontSize: 22, color: GREY, x, y: TOP + CLIP.h + 92, w: C2.w, h: BOTTOM - TOP - CLIP.h - 92 }),
    ];
  }));
};

const quote = (demo) =>
  content("s-quote", "Quote", "Pull quote. A real sentence someone said or wrote, with a name and source. The green quotation mark is the only decoration. The box holds two lines at 72px, about twelve words; for a longer quote drop q-body to 48px, which holds three lines, about twenty-five words.", demo, "Why the signs still work", [
    f.text({ id: "q-mark", html: "“", fontSize: 200, fontWeight: 700, lineHeight: 0.75, color: GREEN, x: M - 8, y: 196, w: 140, h: 150 }),
    f.text({ id: "q-body", ...ph(demo, "If you can design one thing, you can design everything.", "Quotation"), fontSize: 72, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2, valign: "bottom", x: M, y: 320, w: 1100, h: 196 }),
    hair({ id: "q-rule", x: M, y: 568, w: BAND }),
    caption({ id: "q-attrib", ...ph(demo, "Massimo Vignelli, designer of the 1970 New York subway signage and the 1972 map", "Name, source"), fontSize: 22, x: M, y: 588, w: BAND, h: 30 }),
  ], "Kicker");

const image = (demo) =>
  slide("s-image", "Image", "Full-bleed image with a station sign across the foot carrying the title, so the text keeps its contrast on any photo. Replace the placeholder with a photo downscaled to 2560px before embedding, and keep captions in the text elements.", [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 544, w: 1280, h: 176, fill: SIGN }),
    f.rect({ id: "head-rule", x: 0, y: 558, w: 1280, h: 2, fill: WHITE }),
    f.text({ id: "hero-title", ...ph(demo, "Every support question now runs on the gateway", "Caption or title"), fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.6, color: WHITE, x: M, y: 584, w: 1000, h: 48 }),
    f.text({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a photo downscaled to 2560px", "Subtitle"), fontSize: 20, lineHeight: 1.3, color: SIGN_GREY, x: M, y: 644, w: 1000, h: 28 }),
    ...pageDisc(1188, 632),
  ], SIGN);

const closing = (demo) =>
  slide("s-closing", "Closing", "Closing. End on the ask, the next stop, rather than the word Questions. The sign across the foot says where to go next: a URL, a channel or a name. {{company}} resolves from File > Properties.", [
    f.text({ id: "close-line", ...ph(demo, "Next stop: switch off the prototype on 11 December.", "The ask"), fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.6, valign: "bottom", x: M, y: 96, w: 1100, h: 304 }),
    ...sign(264, 456),
    ...arrowDisc(M + 56, 588, 112),
    f.text({ id: "close-meta", ...ph(demo, "{{company}}, AI platform team, #support-assistant", "Contact or link"), fontSize: 30, fontWeight: 500, lineHeight: 1.25, color: WHITE, valign: "middle", x: 224, y: 556, w: 992, h: 64 }),
  ]);

// Stand-in for a capture: the gateway dashboard drawn in code at the frame's inner size.
// A black top bar, a sidebar, three tiles, the traffic panel with the two lines crossing.
const svgUri = (w, h, inner) => "data:image/svg+xml;base64," + Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`).toString("base64");
const r = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const shotSvg = (W, H) => {
  const px = (s) => ({ x: s.x * W, y: s.y * H, w: s.w * W, h: s.h * H });
  const side = [0.5, 0.7, 0.6, 0.8, 0.55].map((k, i) => r(W * 0.02, H * (0.16 + i * 0.07), W * 0.15 * k, H * 0.022, HAIR)).join("");
  const tiles = [0, 1, 2]
    .map((i) => {
      const t = px({ ...WIRE.kpi, x: WIRE.kpi.x + i * 0.26 });
      return r(t.x, t.y, t.w, t.h, WHITE, `stroke="${HAIR}"`) + r(t.x + t.w * 0.08, t.y + t.h * 0.2, t.w * 0.5, t.h * 0.1, HAIR) + r(t.x + t.w * 0.08, t.y + t.h * 0.46, t.w * 0.42, t.h * 0.32, i === 0 ? GREEN : INK);
    })
    .join("");
  const c = px(WIRE.chart);
  const up = [0, 0, 0.05, 0.11, 0.23, 0.37, 0.5, 0.63, 0.74, 0.84, 0.93, 1];
  const pts = (ys) => ys.map((v, i) => `${(c.x + c.w * (0.05 + (i * 0.9) / 11)).toFixed(1)},${(c.y + c.h * (0.9 - v * 0.75)).toFixed(1)}`).join(" ");
  const chartEl = r(c.x, c.y, c.w, c.h, WHITE, `stroke="${HAIR}"`) + `<polyline points="${pts(up.map((v) => 0.75 - v * 0.75))}" fill="none" stroke="${LINE_GREY}" stroke-width="4"/><polyline points="${pts(up)}" fill="none" stroke="${GREEN}" stroke-width="4"/>`;
  const l = px({ x: 0.73, y: 0.42, w: 0.24, h: 0.5 });
  const rows = [0, 1, 2, 3, 4, 5].map((i) => r(l.x + l.w * 0.08, l.y + l.h * (0.12 + i * 0.14), l.w * (i % 2 ? 0.6 : 0.8), l.h * 0.04, HAIR)).join("");
  return svgUri(W, H, `${r(0, 0, W, H, PAPER)}${r(0, 0, W, H * 0.08, SIGN)}${r(W * 0.02, H * 0.025, W * 0.12, H * 0.03, WHITE)}${r(0, H * 0.08, W * 0.18, H * 0.92, PANEL)}${side}${tiles}${chartEl}${r(l.x, l.y, l.w, l.h, WHITE, `stroke="${HAIR}"`)}${rows}`);
};

// Stand-in for a chat answer: the question, answer lines and citation chips. The good
// answer's first citation is green; the bad one cites a stale page, marked grey.
const answerSvg = (W, H, good) => {
  const lines = [0.92, 0.85, 0.9, 0.6].map((k, i) => r(W * 0.06, H * (0.4 + i * 0.08), W * 0.84 * k, H * 0.035, HAIR)).join("");
  const chips = [0, 1, 2].map((i) => r(W * (0.06 + i * 0.26), H * 0.78, W * 0.22, H * 0.09, i === 0 ? (good ? GREEN : LINE_GREY) : PANEL, 'rx="6"')).join("");
  return svgUri(W, H, `${r(0, 0, W, H, WHITE)}${r(0, 0, W, H * 0.1, PANEL)}${r(W * 0.04, H * 0.035, W * 0.2, H * 0.03, GREY)}${r(W * 0.46, H * 0.16, W * 0.48, H * 0.14, PANEL, 'rx="10"')}${r(W * 0.5, H * 0.21, W * 0.36, H * 0.035, GREY)}${lines}${chips}`);
};

// A tiled station wall stands in for the photo the user will supply.
const placeholderSvg = () => {
  const grout = [];
  for (let y = 0; y <= 720; y += 36) grout.push(`M0 ${y}H1280`);
  for (let y = 0; y < 720; y += 36) for (let x = (y / 36) % 2 ? 36 : 0; x <= 1280; x += 72) grout.push(`M${x} ${y}V${y + 36}`);
  return svgUri(1280, 720, `${r(0, 0, 1280, 720, "#E6E6E1")}<path d="${grout.join("")}" stroke="#CFCFC9" stroke-width="2"/>`);
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-transit-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Transit",
    size: { width: 1280, height: 720 },
    meta: { author: "Author", company: "Company", subject: "", event: "", keywords: "transit, wayfinding, signage, roadmap, migration, line map" },
    theme: {
      background: PAPER,
      color: INK,
      accent: GREEN,
      fontFamily: SANS,
      headingFamily: SANS,
      palette: { bg2: PANEL, tx2: GREY, accent2: ORANGE, accent3: YELLOW, accent4: PURPLE, accent5: LINE_GREY, accent6: SIGN, hlink: GREEN },
      chartPalette: [GREEN, LINE_GREY, ORANGE, PURPLE],
      table: TABLE_STYLE,
    },
    fonts: [{ family: "Inter", asset: "inter", weight: "100 900" }],
    assets: {
      inter: dataUri(join(root, "fonts", "inter-latin.woff2")),
      placeholder: placeholderSvg(),
      shot: shotSvg(SHOT.w - 2, SHOT.h - 2),
      "shot-notes": shotSvg(NOTES_SHOT.w - 2, NOTES_SHOT.h - 2),
      "clip-bad": answerSvg(CLIP.w - 2, CLIP.h - 2, false),
      "clip-good": answerSvg(CLIP.w - 2, CLIP.h - 2, true),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
