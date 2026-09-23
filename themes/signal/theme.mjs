// Signal: big-type keynote slides after iA Presenter's New York and LA themes and
// the Takahashi and Lessig methods, for keynotes, AI strategy talks and exec openers.
// One idea per slide, and headline size carries the importance: display slides
// (cover, section, statement, big figure, quote, closing) set Anton at 128-400px,
// content slides a 72px Anton headline over Instrument Sans at 24px body.
// 64px side margins, a 1152px band; content runs from y 184 to 644 under the headline.
//
// Colour: content slides sit on warm paper with one vermilion accent (kickers, the
// key figure, the key series, row or stage). Section dividers, statements, the
// big-figure slide and the closing are full-bleed fields in one of four colours that rotate by
// section: chartreuse, vermilion, lilac, cobalt. This breaks the repo's one-accent
// rule on purpose, and only on those full-bleed fields, the cover's bars and the
// agenda, which previews the four fields. Text on each field is ink or white,
// whichever the computed contrast favours.
//
// The mark is a four-bar signal meter, bars rising in quarter steps. Beside every
// page number it is a static 20px mark. On section dividers (200px) and in the
// agenda key the lit bars count the section, derived from the field colour; the
// closing, in the last colour, lights all four. The cover draws it at 600px with one
// bar per section colour, the deck's colour key. No animation: ids stay stable so a
// morph can be switched on later.
import { join } from "node:path";
import { columns, dataUri, factory } from "../../scripts/lib.mjs";

// WCAG ratios on PAPER: INK 16.8, GREY 6.2 (5.6 on PANEL), ACCENT 4.85 (4.4 on PANEL, large only).
// White on ACCENT 5.3. MUTE 3.25 (graphics that carry meaning); LINE is decoration only.
const PAPER = "#F6F4EF";
const INK = "#141414";
const GREY = "#5E5B55";
const ACCENT = "#C8330E"; // vermilion, darkened from the field colour so small text passes
const MUTE = "#8C877E"; // comparison chart series and bar segments
const LINE = "#D8D3CA"; // hairlines and unlit meter bars
const SPLIT = "#E6E2DA"; // chart gridlines
const PANEL = "#ECE9E2"; // stage tiles, letterbox ground behind screenshots
const WHITE = "#FFFFFF";

// Section fields. Ink on CHARTREUSE 14.5, on VERMILION 5.9, on LILAC 8.6; white on COBALT 6.7
// (ink on cobalt would be 2.75, white on vermilion 3.1, so each field takes the other).
const FIELDS = [
  { bg: "#D9F04A", ink: INK }, // chartreuse
  { bg: "#FF5A36", ink: INK }, // vermilion
  { bg: "#B7A5FF", ink: INK }, // lilac
  { bg: "#2F45E8", ink: WHITE }, // cobalt, clear of Office blue's hue and lightness
];
const [CHARTREUSE, VERMILION, LILAC, COBALT] = FIELDS;

const DISPLAY = "Anton, 'Arial Narrow', Impact, sans-serif";
const SANS = "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif";

const M = 64;
const BAND = 1152;
const RIGHT = M + BAND; // 1216
const TOP = 184;
const BOTTOM = 644;
const C2 = columns(2, { margin: M, gutter: 32 }); // 560 at 64, 656
const C3 = columns(3, { margin: M, gutter: 32 }); // 362 at 64, 458, 852
const C4 = columns(4, { margin: M, gutter: 64 }); // 240 at 64, 368, 672, 976; gutters carry the arrows

const f = factory({ fontFamily: SANS, color: INK, accent: ACCENT });

// Type scale (px). Anton: big figure 400, section 176, points numerals 176, cover,
// statement, closing and figures 150, body figures 144, quote and column figures 128,
// headline 72, image headline 64, agenda 56/48, stage 44. Instrument Sans: subtitle 30,
// lead 28, body 24, notes 22, captions and sources 18, kicker and footer 16.
const display = (o) => f.text({ fontFamily: DISPLAY, lineHeight: 0.95, ...o });
const headText = (o) => display({ fontSize: 72, lineHeight: 1.05, ...o });
const lead = (o) => f.text({ fontSize: 28, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.3, ...o });
const body = (o) => f.text({ fontSize: 24, lineHeight: 1.4, ...o });
const small = (o) => f.text({ fontSize: 18, lineHeight: 1.35, color: GREY, ...o });
const kickerText = (o) => f.text({ fontSize: 16, fontWeight: 700, letterSpacing: 1.6, lineHeight: 1.2, color: ACCENT, ...o });
const hair = (o) => f.rect({ fill: LINE, h: 1, ...o });

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// The signal meter: four bars bottom-aligned at `base`, rising in quarter steps of h.
// The first `lit` bars take `on`; the rest take `off` (a colour, dimmed by opacity on fields).
const meter = (p, x, base, { w, gap, h, lit = 4, on, off, offOpacity = 1, colours }) =>
  [0, 1, 2, 3].map((i) => {
    const bh = Math.round((h * (i + 1)) / 4);
    const isOn = i < lit;
    return f.rect({ id: `${p}${i}`, x: x + i * (w + gap), y: base - bh, w, h: bh, fill: colours ? colours[i] : isOn ? on : off, opacity: isOn || colours ? 1 : offOpacity });
  });
// Section number of a field colour, 1 to 4, for the meters that count sections.
const sectionOf = (c) => FIELDS.indexOf(c) + 1;

// Footer: deck title, page number and the meter as a static mark (no section meaning).
const chrome = ({ ink = INK, sub = GREY } = {}) => [
  small({ id: "run-title", html: "{{title}}", fontSize: 16, color: sub, x: M, y: 670, w: 700, h: 22 }),
  small({ id: "run-page", html: "{{page:2}}", fontSize: 16, fontWeight: 700, color: ink, align: "right", x: RIGHT - 160, y: 670, w: 120, h: 22 }),
  ...meter("mark", RIGHT - 29, 689, { w: 5, gap: 3, h: 20, on: ink }),
];
const fieldChrome = (c) => chrome({ ink: c.ink, sub: c.ink });
// Field slides share the recolouring instruction.
const RECOLOUR = "To move it to another section, change the slide background and every text colour together (white on cobalt, ink on the rest), including run-title, run-page and the mark bars.";

const HEAD_PH = "Headline, one line, about 35 characters";
const slide = (id, name, notes, elements, background = PAPER) => ({ id, name, background, transition: "none", notes, elements });
const content = (id, name, notes, demo, [kick, head], els) =>
  slide(id, name, notes, [
    ...chrome(),
    kickerText({ id: "kicker", ...ph(demo, kick, "KICKER"), x: M, y: 44, w: BAND, h: 20 }),
    headText({ id: "slide-head", ...ph(demo, head, HEAD_PH), x: M, y: 70, w: BAND, h: 80 }),
    ...els,
  ]);

// A numbered disc centred on (cx, cy): accent fill, white numeral, white ring so it reads on any screenshot.
const badge = (p, n, cx, cy, d = 36) => {
  const box = { x: cx - d / 2, y: cy - d / 2, w: d, h: d };
  return [
    f.ellipse({ id: `${p}${n}`, ...box, fill: ACCENT, stroke: WHITE, strokeWidth: 2 }),
    f.text({ id: `${p}n${n}`, html: String(n), fontSize: 18, fontWeight: 700, lineHeight: 1, color: WHITE, align: "center", valign: "middle", ...box }),
  ];
};

const cover = (demo) =>
  slide("s-cover", "Cover", "Cover. Title and company fill from File > Properties, so set them once. The title holds two lines of about ten characters each at 150px. The subtitle is the talk in one sentence. The four bars are the deck's colour key: one per section, in the order the section fields use them. The date is a literal, since {{date}} would show the day the deck is presented.", [
    kickerText({ id: "kicker", ...ph(demo, "AI STRATEGY OFFSITE / SEPTEMBER 2026", "KICKER"), x: M, y: 56, w: 760, h: 20 }),
    display({ id: "deck-title", html: "{{title}}", fontSize: 150, lineHeight: 0.9, valign: "bottom", x: M, y: 130, w: 780, h: 290 }),
    f.text({ id: "cover-sub", ...ph(demo, "A year of the support assistant in production, and why the next dollar goes to evals before models.", "The talk in one sentence"), fontSize: 30, fontWeight: 500, lineHeight: 1.25, x: M, y: 452, w: 740, h: 120 }),
    f.text({ id: "run-title", html: "{{company}}", fontSize: 18, fontWeight: 700, lineHeight: 1.3, x: M, y: 630, w: 500, h: 24 }),
    small({ id: "run-page", ...ph(demo, "23 September 2026", "Date"), x: M, y: 656, w: 500, h: 24 }),
    ...meter("cv-b", 880, 656, { w: 66, gap: 24, h: 600, colours: FIELDS.map((c) => c.bg) }),
  ]);

const agenda = (demo) => {
  const items = demo
    ? [
        ["What we shipped", "The support assistant now resolves 41% of tickets without a person."],
        ["What broke", "Three regressions reached customers before anyone measured."],
        ["What the gate changed", "1,200 prompts run on every build since April. None have leaked since."],
        ["What we ask", "An eval team of three for FY27, decided by 31 October."],
      ]
    : [1, 2, 3, 4].map((n) => [`Section ${n}`, "What the audience learns in this section"]);
  const rowH = (BOTTOM - TOP) / 4;
  const rows = items.flatMap(([t, d], i) => {
    const y = Math.round(TOP + i * rowH);
    const mid = { y, h: Math.round(rowH), valign: "middle" };
    // Key: a small meter in the section's colour, lit to the section number, as on its divider.
    const key = meter(`ag-m${i}-`, M, Math.round(y + rowH / 2 + 18), { w: 8, gap: 4, h: 36, lit: i + 1, on: FIELDS[i].bg, off: LINE });
    return [
      hair({ id: `ag-r${i}`, x: M, y, w: BAND }),
      ...key,
      display({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), fontSize: 56, lineHeight: 1, x: M + 72, w: 90, ...mid }),
      display({ id: `ag-t${i}`, ...ph(demo, t, t), fontSize: 48, lineHeight: 1, x: M + 176, w: 460, ...mid }),
      body({ id: `ag-d${i}`, ...ph(demo, d, d), fontSize: 22, lineHeight: 1.3, color: GREY, x: 720, w: RIGHT - 720, ...mid }),
    ];
  });
  return content("s-agenda", "Agenda", "Agenda. One row per section. The small meter beside each number is lit to the section number in the colour its section divider will use, so the audience learns the colour key here. Keep to four sections; the colours rotate in this order.", demo, ["AGENDA", "Four sections, one decision"], [...rows, hair({ id: "ag-r4", x: M, y: BOTTOM, w: BAND })]);
};

// Section divider: a full-bleed field in the section's colour, with the meter lit to the section number.
const section = (demo) => {
  const c = CHARTREUSE;
  return slide("s-section", "Section", "Section divider, a full-bleed field. Each section takes the next colour in the order chartreuse, vermilion, lilac, cobalt (the agenda rows show which); change the slide background and the text colour together, using white on cobalt. Light the meter bars up to the section number (set the fill of the unlit ones to the text colour at 20% opacity). The title holds two short lines at 176px.", [
    display({ id: "sec-num", ...ph(demo, "01", "01"), fontSize: 64, lineHeight: 1, color: c.ink, x: M, y: 52, w: 300, h: 64 }),
    display({ id: "sec-title", ...ph(demo, "What we shipped", "Section title"), fontSize: 176, lineHeight: 1.0, color: c.ink, x: M, y: 120, w: BAND, h: 352 }),
    f.text({ id: "sec-lead", ...ph(demo, "Twelve months of the support assistant in production, from pilot to 41% of tickets.", "What this section covers"), fontSize: 30, fontWeight: 500, lineHeight: 1.25, color: c.ink, x: M, y: 560, w: 780, h: 80 }),
    ...meter("sec-b", RIGHT - 272, 656, { w: 56, gap: 16, h: 200, lit: sectionOf(c), on: c.ink, off: c.ink, offOpacity: 0.2 }),
  ], c.bg);
};

const statement = (demo) => {
  const c = CHARTREUSE;
  return slide("s-statement", "Statement", `Statement, a full-bleed field in the colour of its section. One sentence the audience should remember, under about ten words so it holds at 150px in three lines. The source line is optional. ${RECOLOUR}`, [
    ...fieldChrome(c),
    display({ id: "stmt", ...ph(demo, "Every gain this year started with a measurement.", "One sentence to remember"), fontSize: 150, lineHeight: 1.0, color: c.ink, x: M, y: 76, w: 1100, h: 460 }),
    f.text({ id: "stmt-src", ...ph(demo, "Resolution rate, answer quality and cost all moved after the eval gate went in, and not before.", "Source or context"), fontSize: 22, fontWeight: 500, lineHeight: 1.35, color: c.ink, x: M, y: 568, w: 820, h: 60 }),
  ], c.bg);
};

const titleBody = (demo) => {
  const figs = demo
    ? [["41%", "of tickets resolved without a person in September"], ["3 min", "median time to first answer, down from 4 hours"]]
    : [["00", "What the figure measures"], ["00", "What the figure measures"]];
  return content("s-body", "Title and body", "Title and body. The explanation on the left at 24px, up to two figures on the right, the first in the accent. If the copy does not fit, cut words rather than shrinking the type.", demo, ["WHAT SHIPPED", "Four tickets in ten need no person"], [
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>The assistant answers in the help centre and in the first reply to every emailed ticket. It cites the policy page each answer comes from, and hands over to a person when it cannot find one.</p><p>Refunds, account closures and anything mentioning a complaint go straight to the team. Those rules are code in the router, not instructions in the prompt.</p><p>The rest it resolves on its own: order status, delivery windows, password resets and plan changes. Those four make up two thirds of the queue, and each has a policy page short enough to quote whole.</p>",
        "Explanation",
      ),
      x: M,
      y: TOP,
      w: 680,
      h: BOTTOM - TOP,
    }),
    f.rect({ id: "body-rule", x: 776, y: TOP, w: 1, h: BOTTOM - TOP, fill: LINE }),
    ...figs.flatMap(([v, l], i) => {
      const y = TOP + i * 240;
      return [
        display({ id: `body-v${i}`, ...ph(demo, v, v), fontSize: 144, lineHeight: 0.95, color: i === 0 ? ACCENT : INK, x: 808, y, w: RIGHT - 808, h: 140 }),
        body({ id: `body-l${i}`, ...ph(demo, l, l), fontSize: 22, lineHeight: 1.35, color: GREY, x: 808, y: y + 152, w: RIGHT - 808, h: 60 }),
      ];
    }),
  ]);
};

const points = (demo) => {
  const items = demo
    ? [
        ["Write the eval before the prompt", "Each new behaviour starts as ten failing prompts with an expected answer. The prompt change is done when they pass."],
        ["Gate every build", "Prompt, model and retrieval changes all run the 1,200-prompt set. A build that drops a point does not ship."],
        ["Keep people on the hard cases", "Refunds and complaints go to the team. The router decides that in code, so no prompt change can move it."],
      ]
    : [1, 2, 3].map((n) => [`Point ${n}`, "One or two sentences that back the point up"]);
  const els = items.flatMap(([h, d], i) => {
    const x = C3.x[i];
    const w = C3.w;
    return [
      display({ id: `pt-n${i}`, html: String(i + 1), fontSize: 176, lineHeight: 0.85, color: i === 0 ? ACCENT : INK, x, y: TOP, w, h: 150 }),
      f.rect({ id: `pt-r${i}`, x, y: TOP + 170, w, h: 3, fill: i === 0 ? ACCENT : INK }),
      lead({ id: `pt-h${i}`, ...ph(demo, h, h), x, y: TOP + 192, w, h: 68 }),
      body({ id: `pt-d${i}`, ...ph(demo, d, d), x, y: TOP + 276, w, h: BOTTOM - TOP - 276 }),
    ];
  });
  return content("s-points", "Points", "Points. Three at most, each a big numeral, a lead of two lines or fewer and a short paragraph at 24px. The first point takes the accent; move it to the point the talk turns on.", demo, ["WHAT WE WOULD DO AGAIN", "Three habits that paid for themselves"], els);
};

const twoCol = (demo) => {
  const cols = demo
    ? [
        ["l", "Before the gate", "3", "REGRESSIONS REACHED CUSTOMERS, JAN TO MAR", "<p>Changes shipped when a reviewer liked a handful of answers. Customers found the regressions: a refund answer quoting the 2023 policy, and two weeks of missing citations. Each took days to trace back to the change that caused it.</p>"],
        ["r", "After the gate", "0", "REGRESSIONS REACHED CUSTOMERS, APR TO SEP", "<p>Every build runs the full set three times. Twenty-two builds stopped at the gate in six months, each with the failing prompts listed beside the diff. The fix lands before a customer sees the problem.</p>"],
      ]
    : [
        ["l", "Left heading", "00", "WHAT THE FIGURE MEASURES", "Left body"],
        ["r", "Right heading", "00", "WHAT THE FIGURE MEASURES", "Right body"],
      ];
  const els = cols.flatMap(([s, head, v, l, copy], i) => {
    const x = C2.x[i];
    const w = C2.w;
    const key = i === 1;
    return [
      lead({ id: `col-${s}-head`, ...ph(demo, head, head), x, y: TOP, w, h: 36 }),
      f.rect({ id: `col-${s}-rule`, x, y: TOP + 48, w, h: 3, fill: key ? ACCENT : INK }),
      display({ id: `col-${s}-fig`, ...ph(demo, v, v), fontSize: 128, lineHeight: 0.95, color: key ? ACCENT : INK, x, y: TOP + 72, w, h: 124 }),
      kickerText({ id: `col-${s}-figl`, ...ph(demo, l, l), color: GREY, x, y: TOP + 206, w, h: 20 }),
      body({ id: `col-${s}-body`, ...ph(demo, copy, copy), x, y: TOP + 248, w, h: BOTTOM - TOP - 248 }),
    ];
  });
  return content("s-twocol", "Two columns", "Two columns, 560px each. A before and after, or two options, each with a lead, a figure and a short body. The side the talk favours takes the accent on its rule and figure.", demo, ["WHAT BROKE", "Regressions stopped at the gate"], els);
};

const numbers = (demo) => {
  const stats = demo
    ? [
        ["41%", "Tickets resolved without a person", "Up from 12% in October 2025"],
        ["22", "Builds stopped at the gate since April", "Each listed its failing prompts beside the diff"],
        ["0", "Regressions that reached customers since April", "Three in the quarter before the gate"],
      ]
    : [0, 1, 2].map(() => ["00", "What the figure measures", "The comparison that gives it meaning"]);
  const els = stats.flatMap(([v, l, d], i) => {
    const x = C3.x[i];
    const key = i === 0;
    return [
      f.rect({ id: `st-r${i}`, x, y: TOP, w: C3.w, h: 3, fill: key ? ACCENT : INK }),
      display({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 150, lineHeight: 0.95, color: key ? ACCENT : INK, x, y: TOP + 36, w: C3.w, h: 144 }),
      lead({ id: `st-l${i}`, ...ph(demo, l, l), x, y: TOP + 208, w: C3.w, h: 68 }),
      body({ id: `st-d${i}`, ...ph(demo, d, d), fontSize: 22, lineHeight: 1.35, color: GREY, x, y: TOP + 296, w: C3.w, h: 60 }),
    ];
  });
  return content("s-numbers", "Numbers", "Numbers. Three figures at 150px, four characters at most, each with what it measures and the comparison that gives it meaning. The figure the talk turns on takes the accent. The source line closes the band.", demo, ["TWELVE MONTHS", "The year in three numbers"], [
    ...els,
    hair({ id: "st-foot-rule", x: M, y: 588, w: BAND }),
    small({ id: "st-note", ...ph(demo, "Help centre and email tickets, October 2025 to September 2026. Builds counted from the gate going live on 7 April.", "Source"), x: M, y: 600, w: BAND, h: 44 }),
  ]);
};

// Figure: a Lessig-style single number on a full-bleed field.
const figure = (demo) => {
  const c = LILAC;
  return slide("s-figure", "Big figure", `Big figure, a full-bleed field in the colour of its section. One number at 400px and one sentence saying what it counts. Keep the number to five or six characters. ${RECOLOUR}`, [
    ...fieldChrome(c),
    display({ id: "fig-v", ...ph(demo, "1,200", "00"), fontSize: 400, lineHeight: 0.85, color: c.ink, x: M - 8, y: 60, w: BAND, h: 360 }),
    f.text({ id: "fig-l", ...ph(demo, "prompts in the regression set. Every build runs all of them, three times, before it can ship.", "What the number counts"), fontSize: 30, fontWeight: 500, lineHeight: 1.25, letterSpacing: -0.3, color: c.ink, x: M, y: 468, w: 900, h: 130 }),
  ], c.bg);
};

// Chart geometry: the plot box inside the chart element, so direct labels can sit
// beside the last point of each series. The y axis is pinned with min and max.
const CH = { x: M, y: TOP, w: BAND, h: 412, left: 64, right: 250, top: 24, bottom: 36, max: 50 };
const plotY = (v) => CH.y + CH.h - CH.bottom - (v / CH.max) * (CH.h - CH.top - CH.bottom);
const plotX = (i, n) => CH.x + CH.left + ((i + 0.5) * (CH.w - CH.left - CH.right)) / n;

const chart = (demo) => {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const series = [
    [demo ? "Resolved without a person" : "Key series", [12, 15, 17, 18, 19, 21, 26, 30, 33, 36, 39, 41], ACCENT],
    [demo ? "Answers flagged wrong" : "Comparison series", [9.1, 8.6, 9.0, 8.8, 9.2, 8.4, 5.3, 4.2, 3.7, 3.3, 3.0, 2.8], MUTE],
  ];
  const labels = series.map(([name, data], i) => {
    const last = data[data.length - 1];
    return small({ id: `chart-lab${i}`, ...ph(demo, `${name}<br>${last}%`, i ? "Comparison label" : "Key label"), fontWeight: 600, lineHeight: 1.25, color: i ? GREY : ACCENT, x: CH.x + CH.w - CH.right + 16, y: Math.round(plotY(last) - 23), w: CH.right - 16, h: 46 });
  });
  const xe = Math.round(plotX(6, months.length));
  const axisText = { color: GREY, fontSize: 16 };
  return content("s-chart", "Chart", "Chart. The series the talk is about takes the accent and a heavier line; the rest are grey. Each series is labelled at its last point instead of a legend, so move the label boxes if the data changes. Gridlines are painted a hairline tone because charts-lite ignores splitLine.show. The vertical rule marks the event the chart is about.", demo, ["WHAT THE GATE CHANGED", "Resolution climbed once we measured"], [
    f.chart({
      id: "chart-main",
      preset: "line",
      x: CH.x,
      y: CH.y,
      w: CH.w,
      h: CH.h,
      option: {
        textStyle: { fontFamily: SANS },
        grid: { left: CH.left, right: CH.right, top: CH.top, bottom: CH.bottom },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: demo ? months : months.map((_, i) => String(i + 1)), axisLine: { lineStyle: { color: INK, width: 1 } }, axisLabel: axisText },
        yAxis: { type: "value", min: 0, max: CH.max, axisLine: { lineStyle: { color: PAPER } }, splitLine: { lineStyle: { color: SPLIT, width: 1 } }, axisLabel: { ...axisText, formatter: "{value}%" } },
        series: series.map(([name, data, color]) => ({ name, type: "line", data, symbol: "none", smooth: false, lineStyle: { color, width: color === ACCENT ? 5 : 2.5 } })).reverse(),
      },
    }),
    ...labels,
    f.rect({ id: "chart-event", x: xe, y: CH.y + CH.top, w: 1, h: CH.h - CH.top - CH.bottom, fill: INK }),
    kickerText({ id: "chart-event-lab", ...ph(demo, "EVAL GATE", "EVENT"), color: INK, x: xe + 10, y: CH.y + 4, w: 160, h: 20 }),
    small({ id: "chart-src", ...ph(demo, "Share of help centre and email tickets per month. Flagged means a support agent marked the answer wrong.", "Source"), x: M, y: 608, w: BAND, h: 36 }),
  ]);
};

const cell = (html, extra = {}) => ({ html, ...extra });
const num = (html, extra = {}) => cell(html, { align: "right", ...extra });
const TABLE_ROW = 64;
const KEY_ROW = 2;

const table = (demo) => {
  const data = demo
    ? [
        ["Model", "Pass rate", "p95", "Cost per ticket", "Hosting"],
        ["Large (current)", "86.3%", "1.00 s", "1.00×", "Self-hosted GPU"],
        ["Medium", "85.4%", "0.62 s", "0.34×", "Self-hosted GPU"],
        ["Small, fine-tuned", "84.1%", "0.41 s", "0.12×", "Self-hosted GPU"],
        ["Frontier API", "88.2%", "1.38 s", "2.60×", "API, data leaves AU"],
        ["Medium, no reranker", "82.9%", "0.48 s", "0.31×", "Self-hosted GPU"],
      ]
    : [["Column", "Column", "Column", "Column", "Column"], ...[1, 2, 3, 4, 5].map(() => ["Row", "", "", "", ""])];
  const rows = data.map((r, i) => ({
    cells: r.map((html, c) => {
      const hl = i === KEY_ROW ? { color: ACCENT, bold: true } : {};
      return c === 0 || c === 4 ? cell(html, hl) : num(html, hl);
    }),
  }));
  const y = (i) => TOP + i * TABLE_ROW;
  return content("s-table", "Table", "Table. Ink rules at the top, under the header and at the foot with hairlines between rows, drawn as rects over a borderless table (rows are uniform, so the pitch is height divided by rows). The row the talk is about is set bold in the accent. Numbers sit flush right. The reading of the table goes in the source line.", demo, ["WHAT IT COSTS", "Medium passes at a third of the cost"], [
    f.table({
      id: "tbl-main",
      x: M,
      y: TOP,
      w: BAND,
      h: TABLE_ROW * data.length,
      columns: [{ w: 2.3 }, { w: 1.1 }, { w: 1 }, { w: 1.5 }, { w: 2.1 }],
      rows,
      style: { headerBg: PAPER, headerColor: INK, borderColor: PAPER, borderWidth: 0, cellPadX: 16, cellPadY: 16, fontSize: 24, color: INK, radius: 0 },
    }),
    f.rect({ id: "tbl-rule-top", x: M, y: y(0), w: BAND, h: 3, fill: INK }),
    f.rect({ id: "tbl-rule-head", x: M, y: y(1), w: BAND, h: 1, fill: INK }),
    ...[2, 3, 4, 5].map((i) => hair({ id: `tbl-rule${i}`, x: M, y: y(i), w: BAND })),
    f.rect({ id: "tbl-rule-foot", x: M, y: y(6), w: BAND, h: 1, fill: INK }),
    small({ id: "tbl-note", ...ph(demo, "All five on the 1,200-prompt set, mean of three runs; the gate is 85%. Cost is per resolved ticket relative to the current large model, including retrieval.", "Source or reading of the table"), x: M, y: 588, w: BAND, h: 56 }),
  ]);
};

// Process: four stage tiles joined by arrow connectors, then where 100 builds
// stopped as a proportional bar, so the key stage's share is visible at a glance.
const STAGES_DEMO = [
  ["Change", "Any edit", "A prompt, model, retrieval or router edit."],
  ["Eval", "38 min", "1,200 prompts, three runs, against the 85% gate."],
  ["Review", "1 day", "A person reads every newly failing answer."],
  ["Canary", "48 h", "5% of traffic, rolled back on any flag spike."],
];
const KEY_STAGE = 1;
const TILE_H = 196;
const tile = (i, x, y, key) => f.rect({ id: `pr-k${i}`, x, y, w: C4.w, h: TILE_H, fill: key ? ACCENT : PANEL });
const tileText = (demo, i, x, y, name, v, key) => [
  kickerText({ id: `pr-n${i}`, html: String(i + 1).padStart(2, "0"), color: key ? WHITE : GREY, x: x + 20, y: y + 20, w: 60, h: 20 }),
  display({ id: `pr-t${i}`, ...ph(demo, name, `Stage ${i + 1}`), fontSize: 44, lineHeight: 1, color: key ? WHITE : INK, x: x + 20, y: y + 60, w: C4.w - 40, h: 48 }),
  lead({ id: `pr-v${i}`, ...ph(demo, v, "Duration"), color: key ? WHITE : INK, x: x + 20, y: y + TILE_H - 54, w: C4.w - 40, h: 34 }),
];

const OUTCOMES = [
  ["Stopped at eval", 22],
  ["Stopped at review", 6],
  ["Rolled back", 1],
  ["Shipped", 71],
];

const process = (demo) => {
  const stages = demo ? STAGES_DEMO : [0, 1, 2, 3].map((i) => [`Stage ${i + 1}`, "Figure", "What happens at this stage"]);
  const els = stages.flatMap(([name, v, d], i) => {
    const x = C4.x[i];
    const key = i === KEY_STAGE;
    return [
      tile(i, x, TOP, key),
      ...tileText(demo, i, x, TOP, name, v, key),
      body({ id: `pr-d${i}`, ...ph(demo, d, d), fontSize: 22, lineHeight: 1.35, x, y: TOP + TILE_H + 16, w: C4.w, h: 90 }),
      ...(i < 3 ? [f.line({ id: `pr-a${i}`, x: x + C4.w, y: TOP + TILE_H / 2 - 1, w: C4.gutter, h: 2, fill: INK, lineEnd: "arrow", from: { el: `pr-k${i}`, side: "right" }, to: { el: `pr-k${i + 1}`, side: "left" } })] : []),
    ];
  });
  // Outcome bar: segment widths in proportion to count, 2px gaps between.
  const total = OUTCOMES.reduce((s, [, n]) => s + n, 0);
  let x = M;
  const segY = 544;
  const seg = OUTCOMES.flatMap(([name, n], i) => {
    const w = Math.round(((BAND - 6) * n) / total);
    const fill = i === 0 ? ACCENT : i === 3 ? LINE : MUTE;
    const out = [f.rect({ id: `pr-s${i}`, x, y: segY, w, h: 48, fill })];
    const text = ph(demo, `${name.toUpperCase()} ${n}`, "SHARE");
    if (i === 0) out.push(kickerText({ id: `pr-sl${i}`, ...text, color: WHITE, x: x + 16, y: segY + 14, w: w - 24, h: 20 }));
    if (i === 3) out.push(kickerText({ id: `pr-sl${i}`, ...text, color: INK, align: "right", x: x + 16, y: segY + 14, w: w - 32, h: 20 }));
    if (i === 1) out.push(small({ id: `pr-sl${i}`, ...ph(demo, "6 stopped at review, 1 rolled back in canary", "Share"), x, y: segY + 58, w: 600, h: 24 }));
    x += w + 2;
    return out;
  });
  return content("s-process", "Process", "Process. Stage tiles joined by arrow connectors (the arrows follow the tiles if you move them), then a proportional bar of where the builds ended. The stage the talk is about is filled with the accent. In the demo the Eval tile is clickable: a transparent rect over it links to a state slide with the breakdown, and the left arrow returns.", demo, ["HOW A BUILD SHIPS", "Every change runs the gate"], [
    ...els,
    kickerText({ id: "pr-bar-lab", ...ph(demo, "WHERE 100 BUILDS SINCE APRIL ENDED", "WHAT THE BAR COUNTS"), color: GREY, x: M, y: 514, w: 600, h: 20 }),
    ...seg,
    ...(demo
      ? [
          f.rect({ id: "pr-hit1", x: C4.x[KEY_STAGE] - 12, y: TOP - 12, w: C4.w + 24, h: TILE_H + 120, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          small({ id: "pr-hint", html: "Click Eval for the breakdown", fontWeight: 600, color: ACCENT, align: "right", x: RIGHT - 400, y: 512, w: 400, h: 24 }),
        ]
      : []),
  ]);
};

const processDetail = () => {
  const causes = [
    ["Refund policy answers", 9],
    ["Missing citations", 7],
    ["Escalation missed", 4],
    ["Over latency budget", 2],
  ];
  const [name, v] = STAGES_DEMO[KEY_STAGE];
  const scale = 520 / 9;
  return {
    id: "s-process-detail",
    stateOf: "s-process",
    background: PAPER,
    transition: "none",
    notes: "State slide for the Eval stage, hidden from the arrow-key sequence and reached by clicking the stage. It keeps the stage tile and breaks the 22 stopped builds down by cause, with the largest in the accent. The left arrow returns to the process slide.",
    elements: [
      ...chrome(),
      kickerText({ id: "kicker", html: "HOW A BUILD SHIPS / EVAL", x: M, y: 44, w: BAND, h: 20 }),
      headText({ id: "slide-head", html: "Why 22 builds stopped at the gate", x: M, y: 70, w: BAND, h: 80 }),
      tile(KEY_STAGE, M, TOP, true),
      ...tileText(true, KEY_STAGE, M, TOP, name, v, true),
      ...causes.flatMap(([lab, n], i) => {
        const y = TOP + 4 + i * 49;
        const key = i === 0;
        return [
          body({ id: `det-l${i}`, html: lab, fontSize: 22, fontWeight: key ? 600 : 400, color: key ? INK : GREY, x: 352, y: y + 5, w: 260, h: 30 }),
          f.rect({ id: `det-b${i}`, x: 616, y, w: Math.round(n * scale), h: 40, fill: key ? ACCENT : MUTE }),
          lead({ id: `det-v${i}`, html: String(n), fontSize: 24, color: key ? ACCENT : INK, x: 628 + Math.round(n * scale), y: y + 5, w: 60, h: 30 }),
        ];
      }),
      hair({ id: "det-rule", x: M, y: TOP + TILE_H + 28, w: BAND }),
      body({
        id: "det-body",
        html: "<p>Nine builds quoted the 2023 refund policy after a retrieval change pulled the archived page above the current one. The fix was a date filter, not a prompt.</p><p>Seven dropped the citation line when a prompt was shortened. The gate caught each one in 38 minutes.</p>",
        x: M,
        y: TOP + TILE_H + 52,
        w: BAND,
        h: 170,
      }),
      small({ id: "det-back", html: "Left arrow returns to the process", x: M, y: 612, w: 400, h: 24 }),
    ],
  };
};

// A framed screenshot, letterboxed on the panel colour. Ids are prefixed so two frames can share a slide.
const frame = (p, asset, { x, y, w, h }, stroke = LINE) => [
  f.rect({ id: `${p}-frame`, x, y, w, h, fill: PANEL, stroke, strokeWidth: 1 }),
  f.image({ id: `${p}-img`, src: `asset:${asset}`, fit: "contain", x: x + 1, y: y + 1, w: w - 2, h: h - 2 }),
];

const SHOT = { x: M, y: TOP, w: BAND, h: 404 };
const NOTES_SHOT = { x: M, y: TOP, w: 736, h: BOTTOM - TOP };
const CLIP = { w: C2.w, h: 300 };

const screenshot = (demo) =>
  content("s-screenshot", "Screenshot", "Screenshot. One large capture across the band, letterboxed on a pale panel, with a caption under it. In the demo an accent outline marks the part the talk is about; move it to match your capture. Replace the shot asset with a PNG downscaled to 2560px wide, and keep captions in text rather than baked into the image.", demo, ["THE GATE", "One dashboard decides every release"], [
    ...frame("shot", "shot", SHOT),
    ...(demo ? [f.rect({ id: "shot-hl", ...spotBox(SHOT, WIRE.kpi), fill: "transparent", stroke: ACCENT, strokeWidth: 4, radius: 2 })] : []),
    small({ id: "shot-caption", ...ph(demo, "Eval dashboard, build 412. The first tile is the pass rate against the 85% gate.", "Caption"), x: M, y: 604, w: BAND, h: 40 }),
  ]);

const screenshotNotes = (demo) => {
  const items = demo
    ? [
        ["Pass rate against the gate", "86.3% on build 412. The tile turns red below 85%.", WIRE.kpi],
        ["Pass rate by week", "The step in April is the gate. Nothing else changed.", WIRE.chart],
        ["Newly failing prompts", "Passed last build, fail now. Each links to the diff.", WIRE.rows],
      ]
    : [1, 2, 3].map((n) => [`What to look at ${n}`, "What it shows and why it matters", [WIRE.kpi, WIRE.chart, WIRE.rows][n - 1]]);
  const callouts = items.flatMap(([, , spot], i) => {
    const b = spotBox(NOTES_SHOT, spot);
    return badge("shot-c", i + 1, b.x + 6, b.y + 6);
  });
  const nx = 876;
  const notesEls = items.flatMap(([h, d], i) => {
    const y = TOP + i * 146;
    return [
      ...badge("shot-k", i + 1, 850, y + 17),
      // The first note keeps the ids every theme shares; the rest count from 2 like the badges.
      lead({ id: i ? `shot-t${i + 1}` : "shot-lead", ...ph(demo, h, h), fontSize: 24, x: nx, y, w: RIGHT - nx, h: 32 }),
      body({ id: i ? `shot-d${i + 1}` : "shot-body", ...ph(demo, d, d), fontSize: 22, lineHeight: 1.35, color: GREY, x: nx, y: y + 40, w: RIGHT - nx, h: 90 }),
    ];
  });
  return content("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. Numbered accent discs sit on the capture and the same numbers key the notes on the right, so the audience can find each point without a pointer. Move the discs onto the features of your capture. Three notes fill the column.", demo, ["READING THE GATE", "Three panels decide a release"], [
    ...frame("shot", "shot-notes", NOTES_SHOT),
    ...callouts,
    ...notesEls,
    small({ id: "shot-caption", ...ph(demo, "Eval dashboard, build 412, 22 September.", "Caption"), x: nx, y: 616, w: RIGHT - nx, h: 28 }),
  ]);
};

const clippings = (demo) => {
  const shots = demo
    ? [
        ["Build 311, before the gate", "Quotes the 2023 refund window of 30 days. A customer found it."],
        ["Build 412, after the gate", "Quotes the current 14-day window and cites the policy page."],
      ]
    : [
        ["Left caption", "One sentence on what the clipping shows"],
        ["Right caption", "One sentence on what the clipping shows"],
      ];
  const els = shots.flatMap(([h, d], i) => {
    const x = C2.x[i];
    const p = i === 0 ? "clip-l" : "clip-r";
    const key = i === 1;
    return [
      ...frame(p, "clip", { x, y: TOP, ...CLIP }, key ? ACCENT : LINE),
      lead({ id: `${p}-head`, ...ph(demo, h, h), color: key ? ACCENT : INK, x, y: TOP + CLIP.h + 24, w: C2.w, h: 36 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), x, y: TOP + CLIP.h + 72, w: C2.w, h: BOTTOM - TOP - CLIP.h - 72 }),
    ];
  });
  return content("s-clippings", "Two clippings", "Two clippings side by side, each with a lead and a sentence. The side the talk favours has an accent frame and lead. Crop both clippings to the same aspect ratio before embedding so the frames match.", demo, ["SAME QUESTION, TWO BUILDS", "The refund answer, before and after"], els);
};

const quote = (demo) =>
  slide("s-quote", "Quote", "Pull quote on paper. A real sentence someone said, under about twelve words so it holds at 128px in three lines, with a name, role and date underneath.", [
    ...chrome(),
    display({ id: "q-mark", html: "“", fontSize: 240, lineHeight: 0.75, color: ACCENT, x: M - 4, y: 44, w: 160, h: 180 }),
    display({ id: "q-body", ...ph(demo, "If it isn’t in the eval set, it isn’t a requirement yet.", "Quotation"), fontSize: 128, lineHeight: 0.98, x: M, y: 168, w: 1100, h: 380 }),
    f.rect({ id: "q-rule", x: M, y: 580, w: 64, h: 6, fill: ACCENT }),
    kickerText({ id: "q-attrib", ...ph(demo, "HEAD OF SUPPORT OPERATIONS, PILOT REVIEW, JUNE 2026", "NAME, ROLE, DATE"), fontSize: 18, color: INK, x: M, y: 606, w: BAND, h: 24 }),
  ]);

const image = (demo) =>
  slide("s-image", "Image", "Full-bleed image with the headline on a solid paper panel at the bottom left, so the text keeps its contrast on any photo. Replace the placeholder asset with a photo downscaled to 2560px, and keep captions in the text elements.", [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 452, w: 980, h: 268, fill: PAPER }),
    kickerText({ id: "kicker", ...ph(demo, "EVERY MONDAY", "KICKER"), x: M, y: 488, w: 860, h: 20 }),
    display({ id: "hero-title", ...ph(demo, "The support team reads every failing answer", "Headline about the image"), fontSize: 64, lineHeight: 1.0, x: M, y: 520, w: 860, h: 128 }),
    small({ id: "hero-sub", ...ph(demo, "Weekly eval review, Melbourne office", "Caption"), x: M, y: 666, w: 800, h: 24 }),
  ]);

const closing = (demo) => {
  const c = COBALT;
  return slide("s-closing", "Closing", "Closing, a full-bleed field in the last section's colour, with the meter lit to that section (all four bars in a four-section deck). End on the ask as a sentence under about seven words that the audience can say yes to, not the word Questions. The line under it says who to talk to and by when; {{company}} fills from File > Properties.", [
    display({ id: "close-line", ...ph(demo, "Fund an eval team of three for FY27.", "The ask"), fontSize: 150, lineHeight: 1.0, color: c.ink, x: M, y: 76, w: 860, h: 460 }),
    f.text({ id: "close-meta", ...ph(demo, "{{company}} platform team. Decision by 31 October.", "Contact or deadline"), fontSize: 28, fontWeight: 500, lineHeight: 1.3, color: c.ink, x: M, y: 588, w: 760, h: 36 }),
    ...meter("close-b", RIGHT - 272, 624, { w: 56, gap: 16, h: 200, lit: sectionOf(c), on: c.ink }),
  ], c.bg);
};

// Wireframe features, as fractions of the capture: the pass-rate tile, the weekly
// chart and the failing-prompts list. Callouts and the highlight are placed from these.
const WIRE = {
  kpi: { x: 0.2, y: 0.16, w: 0.2, h: 0.22 },
  chart: { x: 0.2, y: 0.46, w: 0.46, h: 0.46 },
  rows: { x: 0.7, y: 0.46, w: 0.27, h: 0.46 },
};
const spotBox = (fr, s) => ({ x: Math.round(fr.x + 1 + s.x * (fr.w - 2)), y: Math.round(fr.y + 1 + s.y * (fr.h - 2)), w: Math.round(s.w * (fr.w - 2)), h: Math.round(s.h * (fr.h - 2)) });

// Stand-in for a screenshot: an eval dashboard drawn in code at the frame's inner size.
const shotSvg = (W, H) => {
  const r = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
  const px = (s) => ({ x: s.x * W, y: s.y * H, w: s.w * W, h: s.h * H });
  const side = [0.5, 0.7, 0.6, 0.8, 0.55].map((k, i) => r(W * 0.02, H * (0.16 + i * 0.08), W * 0.14 * k, H * 0.025, LINE)).join("");
  const tiles = [0, 1, 2]
    .map((i) => {
      const t = px({ ...WIRE.kpi, x: WIRE.kpi.x + i * 0.26 });
      return r(t.x, t.y, t.w, t.h, WHITE, `stroke="${LINE}"`) + r(t.x + t.w * 0.1, t.y + t.h * 0.2, t.w * 0.5, t.h * 0.12, LINE) + r(t.x + t.w * 0.1, t.y + t.h * 0.5, t.w * 0.4, t.h * 0.3, i ? MUTE : ACCENT);
    })
    .join("");
  const c = px(WIRE.chart);
  const ys = [0.7, 0.68, 0.7, 0.69, 0.67, 0.66, 0.4, 0.33, 0.29, 0.27, 0.25, 0.24];
  const pts = ys.map((v, i) => `${(c.x + c.w * (0.06 + (i * 0.88) / 11)).toFixed(1)},${(c.y + c.h * (0.1 + v * 0.8)).toFixed(1)}`).join(" ");
  const chartEl = r(c.x, c.y, c.w, c.h, WHITE, `stroke="${LINE}"`) + `<line x1="${c.x + c.w * 0.06}" y1="${c.y + c.h * 0.5}" x2="${c.x + c.w * 0.94}" y2="${c.y + c.h * 0.5}" stroke="${MUTE}" stroke-width="2" stroke-dasharray="6 6"/><polyline points="${pts}" fill="none" stroke="${ACCENT}" stroke-width="4"/>`;
  const l = px(WIRE.rows);
  const rows = [0, 1, 2, 3, 4, 5].map((i) => r(l.x + l.w * 0.08, l.y + l.h * (0.12 + i * 0.14), l.w * (i % 2 ? 0.6 : 0.8), l.h * 0.04, LINE)).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${r(0, 0, W, H, PAPER)}${r(0, 0, W * 0.18, H, PANEL)}${side}` +
    `${r(W * 0.2, H * 0.05, W * 0.3, H * 0.045, INK)}${tiles}${chartEl}${r(l.x, l.y, l.w, l.h, WHITE, `stroke="${LINE}"`)}${rows}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

// Stand-in for the photo: warm grey with the meter drawn large and faint, so the placeholder reads as deliberate.
const placeholderSvg = () => {
  const bars = [0, 1, 2, 3].map((i) => `<rect x="${1000 + i * 56}" y="${660 - (i + 1) * 130}" width="40" height="${(i + 1) * 130}" fill="#CFC9BE"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#DDD8CF"/>${bars}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, figure, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-signal-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Signal",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "keynote, big type, takahashi, lessig, strategy" },
    theme: {
      background: PAPER,
      color: INK,
      accent: ACCENT,
      fontFamily: SANS,
      headingFamily: DISPLAY,
      // The four section fields sit in accent2-5 so the editor's palette offers them.
      palette: { bg2: PANEL, tx2: GREY, accent2: CHARTREUSE.bg, accent3: VERMILION.bg, accent4: LILAC.bg, accent5: COBALT.bg, hlink: ACCENT },
      chartPalette: [ACCENT, MUTE, INK],
      table: { headerBg: PAPER, headerColor: INK, borderColor: LINE, borderWidth: 1, fontSize: 24, color: INK, radius: 0 },
    },
    fonts: [
      { family: "Anton", asset: "anton", weight: "400" },
      { family: "Instrument Sans", asset: "builtin:instrument-sans", weight: "400 700" },
    ],
    assets: {
      anton: dataUri(join(root, "fonts", "anton-latin.woff2")),
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
