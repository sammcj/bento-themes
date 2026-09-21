// Rams: mid-century product design after Dieter Rams and Braun. Warm grey
// ground, charcoal text, hairlines, one geometric sans (Jost, a Futura
// revival), and a single orange indicator ("dot") that is the only colour on
// the page. The dot sits on a dial on the cover and recurs through the deck:
// a 12px indicator in the footer, a 48px disc on dividers, a large disc at the end.
// No animation anywhere: the ids stay stable so a morph can be switched on later.
import { join } from "node:path";
import { COLS, dataUri, factory } from "../../scripts/lib.mjs";

const GROUND = "#E4E1DA";
const INK = "#262624";
const GREY = "#6B6862";
const HAIR = "#BDB9AF";
const BLACK = "#1E1E1C";
const BLACK_TX = "#E4E1DA";
const BLACK_GREY = "#A9A59C";
const BLACK_HAIR = "#3E3D39";
const ORANGE = "#EF5B14";
const FONT = "Jost, Futura, 'Century Gothic', 'Avenir Next', sans-serif";

const t = { fontFamily: FONT, color: INK, accent: ORANGE };
const f = factory(t);

// Type scale (px): display 88, section 60, title 40, lead 26, body 24, label 15.
// Jost has a small x-height, so body sits at 24 where a grotesque would take 22.
// Jost's medium weight (500) does the display work; body stays regular.
const display = (o) => f.text({ fontSize: 88, fontWeight: 500, lineHeight: 1.0, ...o });
const heading = (o) => f.text({ fontSize: 40, fontWeight: 500, lineHeight: 1.1, ...o });
const body = (o) => f.text({ fontSize: 24, lineHeight: 1.4, ...o });
const label = (o) => f.text({ fontSize: 15, fontWeight: 500, lineHeight: 1.3, letterSpacing: 2, color: GREY, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
const ring = (o) => f.ellipse({ fill: "transparent", stroke: INK, strokeWidth: 2, ...o });
// Process knobs sit on the track, so they take the ground colour to mask it.
const knob = (o) => ring({ fill: GROUND, ...o });

// Footer chrome on every content slide; stable ids keep it morphing in place.
const chrome = ({ dark = false, dot = true } = {}) => [
  hair({ id: "foot-rule", x: 96, y: 640, w: 1088, fill: dark ? BLACK_HAIR : HAIR }),
  ...(dot ? [f.ellipse({ id: "dot", x: 96, y: 654, w: 12, h: 12 })] : []),
  label({ id: "run-title", html: "{{title}}", color: dark ? BLACK_GREY : GREY, x: 124, y: 650, w: 600, h: 20 }),
  label({ id: "run-page", html: "{{page:2}}", color: dark ? BLACK_TX : INK, align: "right", x: 984, y: 650, w: 200, h: 20 }),
];

const slideHead = (html) => [
  heading({ id: "slide-head", html, x: 96, y: 92, w: 1088, h: 52 }),
  hair({ id: "head-rule", x: 96, y: 160, w: 1088, fill: INK }),
];

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// Tick marks around the cover dial, as an SVG path in a 448px box.
const dialTicks = () => {
  const c = 224;
  const parts = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = major ? 196 : 206;
    const r2 = 214;
    parts.push(`M${(c + r1 * Math.sin(a)).toFixed(1)} ${(c - r1 * Math.cos(a)).toFixed(1)} L${(c + r2 * Math.sin(a)).toFixed(1)} ${(c - r2 * Math.cos(a)).toFixed(1)}`);
  }
  return parts.join(" ");
};

const cover = (demo) => ({
  id: "s-cover",
  name: "Cover",
  background: GROUND,
  transition: "none",
  notes:
    "Cover. Title and company fill from File > Properties. The date is a literal so it records when the deck was written, rather than the {{date}} token which shows the day it is presented. The orange indicator on the dial is the deck's one colour; it recurs as the small dot in the footer, on the dividers and on the closing slide.",
  elements: [
    hair({ id: "foot-rule", x: 96, y: 640, w: 1088 }),
    label({ id: "run-title", html: "{{company}}", x: 96, y: 650, w: 600, h: 20 }),
    label({ id: "run-page", html: "2026-09-22", color: INK, align: "right", x: 984, y: 650, w: 200, h: 20 }),
    ring({ id: "dial", x: 736, y: 96, w: 448, h: 448 }),
    f.path({ id: "dial-ticks", d: dialTicks(), pathBox: [0, 0, 448, 448], fill: "transparent", stroke: INK, strokeWidth: 2, x: 736, y: 96, w: 448, h: 448 }),
    ring({ id: "dial-inner", x: 736 + 64, y: 96 + 64, w: 320, h: 320, strokeWidth: 1, stroke: HAIR }),
    f.ellipse({
      id: "dot",
      x: 736 + 224 - 14,
      y: 96 + 64 - 14,
      w: 28,
      h: 28,
    }),
    display({ id: "deck-title", html: "{{title}}", valign: "bottom", x: 96, y: 260, w: 600, h: 300 }),
    body({ id: "cover-sub", ...ph(demo, "A subtitle, the event, or the client", "Subtitle"), color: GREY, x: 96, y: 576, w: 600, h: 48 }),
  ],
});

const agenda = (demo) => {
  const items = demo
    ? ["Where we are", "What changed", "What we propose", "What we need from you"]
    : ["Item one", "Item two", "Item three", "Item four"];
  const rows = items.flatMap((it, i) => {
    const y = 192 + i * 108;
    return [
      f.text({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), fontSize: 22, fontWeight: 500, color: GREY, x: 96, y: y + 4, w: 60, h: 32 }),
      f.text({ id: `ag-t${i}`, ...(demo ? { html: it } : { html: "", placeholder: it }), fontSize: 28, lineHeight: 1.2, x: 176, y, w: 1008, h: 40 }),
      hair({ id: `ag-r${i}`, x: 96, y: y + 76, w: 1088 }),
    ];
  });
  return {
    id: "s-agenda",
    name: "Agenda",
    background: GROUND,
    transition: "none",
    notes: "Agenda. The footer carries the indicator, the deck title and the page number. Four rows fit; delete rows rather than shrinking the type.",
    elements: [...chrome(), ...slideHead("Agenda"), ...rows],
  };
};

const section = (demo) => ({
  id: "s-section",
  name: "Section",
  background: BLACK,
  transition: "none",
  notes: "Section divider on Braun black. The indicator becomes a 48px disc beside the section number. Number sections only when the order matters; otherwise delete the numeral.",
  elements: [
    ...chrome({ dark: true, dot: false }),
    f.ellipse({ id: "dot", x: 96, y: 200, w: 48, h: 48 }),
    display({ id: "sec-num", ...ph(demo, "02", "01"), color: BLACK_TX, x: 176, y: 180, w: 400, h: 96 }),
    f.text({ id: "sec-title", ...ph(demo, "What changed since the last review", "Section title"), fontSize: 60, fontWeight: 500, lineHeight: 1.08, color: BLACK_TX, valign: "bottom", x: 96, y: 340, w: 1000, h: 260 }),
  ],
});

const statement = (demo) => ({
  id: "s-statement",
  name: "Statement",
  background: GROUND,
  transition: "none",
  notes: "Statement. One sentence, no bullets. Under twenty words holds at 52px. The line beneath is for a source or a consequence; delete it if the sentence stands alone.",
  elements: [
    ...chrome(),
    f.text({ id: "stmt", ...ph(demo, "Good design is as little design as possible. Less, but better.", "One idea, one sentence"), fontSize: 52, fontWeight: 500, lineHeight: 1.15, x: 96, y: 188, w: 1000, h: 340 }),
    f.text({ id: "stmt-src", ...ph(demo, "Dieter Rams, the tenth principle", "Source or context"), fontSize: 20, color: GREY, x: 96, y: 580, w: 1000, h: 32 }),
  ],
});

const titleBody = (demo) => ({
  id: "s-body",
  name: "Title and body",
  background: GROUND,
  transition: "none",
  notes: "Title and body. The body column is 816px so lines stay readable. Use <ul> for bullets. Body stays at 24px; if it does not fit, cut words or split the slide.",
  elements: [
    ...chrome(),
    ...slideHead(demo ? "Less, but better" : "Slide title"),
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>Between 1961 and 1995 Dieter Rams led design at Braun and set down ten principles for good design. The products were quiet: warm grey housings, one orange control, type set in a geometric sans and nothing that did not need to be there.</p><p>A slide can behave the same way. Say the thing once, leave the rest of the surface empty, and put the only colour on the control that matters.</p><ul><li>Useful before beautiful</li><li>Unobtrusive, so the content can speak</li><li>Thorough down to the last detail</li></ul>",
        "Body copy",
      ),
      x: 96,
      y: 192,
      w: 816,
      h: 432,
    }),
  ],
});

const points = (demo) => {
  const items = demo
    ? [
        ["Honest", "It does not make a product appear more innovative, powerful or valuable than it really is."],
        ["Long-lasting", "It avoids being fashionable and therefore never appears antiquated."],
        ["Environmentally friendly", "It makes an important contribution to the preservation of the environment."],
      ]
    : [
        ["Point one", "Supporting sentence"],
        ["Point two", "Supporting sentence"],
        ["Point three", "Supporting sentence"],
      ];
  const rows = items.flatMap(([h, d], i) => {
    const y = 192 + i * 144;
    return [
      hair({ id: `pt-r${i}`, x: 96, y, w: 1088 }),
      f.text({ id: `pt-h${i}`, html: h, fontSize: 26, fontWeight: 500, lineHeight: 1.2, x: 96, y: y + 20, w: 340, h: 70 }),
      body({ id: `pt-d${i}`, html: d, x: 470, y: y + 22, w: 714, h: 104 }),
    ];
  });
  return {
    id: "s-points",
    name: "Points",
    background: GROUND,
    transition: "none",
    notes: "Points. Three rows, each a hairline, a medium lead and a sentence. Three fill the band; for more, split the slide.",
    elements: [...chrome(), ...slideHead(demo ? "Three of the ten principles" : "Slide title"), ...rows],
  };
};

const twoCol = (demo) => ({
  id: "s-twocol",
  name: "Two columns",
  background: GROUND,
  transition: "none",
  notes: "Two columns, 528px each with a 32px gutter. Each has a 26px lead line and a hairline before 22px body. Suits before/after or problem/response.",
  elements: [
    ...chrome(),
    ...slideHead(demo ? "Then and now" : "Slide title"),
    f.text({ id: "col-l-head", ...ph(demo, "1961", "Left heading"), fontSize: 26, fontWeight: 500, lineHeight: 1.2, x: COLS[2].x[0], y: 192, w: COLS[2].w, h: 36 }),
    hair({ id: "col-l-rule", x: COLS[2].x[0], y: 240, w: COLS[2].w }),
    body({ id: "col-l-body", ...ph(demo, "The SK 4 record player put the turntable under a clear acrylic lid. Critics called it Snow White's coffin. Every competitor copied the lid within a decade.", "Left body"), x: COLS[2].x[0], y: 256, w: COLS[2].w, h: 368 }),
    f.text({ id: "col-r-head", ...ph(demo, "Now", "Right heading"), fontSize: 26, fontWeight: 500, lineHeight: 1.2, x: COLS[2].x[1], y: 192, w: COLS[2].w, h: 36 }),
    hair({ id: "col-r-rule", x: COLS[2].x[1], y: 240, w: COLS[2].w }),
    body({ id: "col-r-body", ...ph(demo, "The same restraint reads as calm on a screen: one typeface, a warm grey ground, and an orange mark that tells you where to look. Everything else is left off.", "Right body"), x: COLS[2].x[1], y: 256, w: COLS[2].w, h: 368 }),
  ],
});

const numbers = (demo) => {
  const stats = demo
    ? [
        ["10", "principles of good design, written down in the 1970s"],
        ["34", "years Rams led design at Braun"],
        ["1", "colour on the product, on the control that matters"],
      ]
    : [
        ["00", "Label"],
        ["00", "Label"],
        ["00", "Label"],
      ];
  const els = stats.flatMap(([v, l], i) => {
    const x = COLS[3].x[i];
    return [
      hair({ id: `st-r${i}`, x, y: 192, w: COLS[3].w, fill: INK }),
      f.text({ id: `st-v${i}`, html: v, fontSize: 104, fontWeight: 500, lineHeight: 1.0, x, y: 212, w: COLS[3].w, h: 112 }),
      body({ id: `st-l${i}`, html: l, color: GREY, x, y: 340, w: COLS[3].w, h: 90 }),
    ];
  });
  return {
    id: "s-numbers",
    name: "Numbers",
    background: GROUND,
    transition: "none",
    notes: "Headline numbers. One plain number per box at 104px with a one-line label. The note at the bottom carries the source or the consequence.",
    elements: [
      ...chrome(),
      ...slideHead(demo ? "In numbers" : "Slide title"),
      ...els,
      hair({ id: "st-foot-rule", x: 96, y: 548, w: 1088 }),
      body({ id: "st-note", ...ph(demo, "Rams joined Braun in 1955 and became head of design in 1961. The ten principles were first published in the late 1970s and revised through the 1980s.", "Source or consequence"), fontSize: 20, color: GREY, x: 96, y: 564, w: 1088, h: 60 }),
    ],
  };
};

const chart = (demo) => ({
  id: "s-chart",
  name: "Chart",
  background: GROUND,
  transition: "none",
  notes: "Chart. Series in charcoal, orange and grey. Bar and line data are plain numbers; only pie takes {name, value}. The legend must be an object to render. textStyle.fontFamily is set so the chart uses Jost rather than the browser default.",
  elements: [
    ...chrome(),
    ...slideHead(demo ? "Products in the catalogue" : "Slide title"),
    f.chart({
      id: "chart-main",
      preset: "bar",
      x: 96,
      y: 184,
      w: 1088,
      h: 440,
      option: {
        textStyle: { fontFamily: FONT },
        grid: { left: 48, right: 8, top: 44, bottom: 32 },
        legend: { top: 0, textStyle: { color: INK, fontSize: 16 } },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: ["1960", "1965", "1970", "1975", "1980", "1985"], axisLine: { lineStyle: { color: INK } }, axisLabel: { color: INK, fontSize: 16 } },
        yAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: HAIR } }, axisLabel: { color: GREY, fontSize: 14 } },
        series: [
          { name: "Audio", type: "bar", data: [12, 18, 24, 22, 19, 14], itemStyle: { color: INK } },
          { name: "Personal care", type: "bar", data: [4, 9, 15, 21, 26, 30], itemStyle: { color: ORANGE } },
          { name: "Average", type: "line", data: [8, 13, 19, 21, 22, 22], symbol: "none", lineStyle: { color: GREY, width: 2 } },
        ],
      },
    }),
  ],
});

const table = (demo) => ({
  id: "s-table",
  name: "Table",
  background: GROUND,
  transition: "none",
  notes: "Comparison table. Header row in Braun black, 1px hairlines, no zebra. Tables are for specs and comparisons; a numeric trend belongs in the chart layout.",
  elements: [
    ...chrome(),
    ...slideHead(demo ? "Three radios" : "Slide title"),
    f.table({
      id: "tbl-main",
      x: 96,
      y: 192,
      w: 1088,
      h: 432,
      columns: [{ w: 1.4 }, { w: 1 }, { w: 1 }, { w: 1.4 }],
      rows: demo
        ? [
            { cells: [{ html: "Model" }, { html: "Year" }, { html: "Bands" }, { html: "Note" }] },
            { cells: [{ html: "T 3 pocket radio" }, { html: "1958" }, { html: "MW" }, { html: "The dial the cover borrows" }] },
            { cells: [{ html: "TP 1 radio and player" }, { html: "1959" }, { html: "MW" }, { html: "Portable, one unit" }] },
            { cells: [{ html: "T 1000 world receiver", bold: true }, { html: "1963" }, { html: "LW MW SW FM" }, { html: "Still in production plans", color: ORANGE, bold: true }] },
            { cells: [{ html: "RT 20 table radio" }, { html: "1961" }, { html: "MW FM" }, { html: "Wood and grey" }] },
          ]
        : [
            { cells: [{ html: "Column" }, { html: "Column" }, { html: "Column" }, { html: "Column" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
          ],
      style: { headerBg: BLACK, headerColor: BLACK_TX, borderColor: HAIR, borderWidth: 1, cellPadX: 16, cellPadY: 14, fontSize: 20, color: INK, radius: 0 },
    }),
  ],
});

const process = (demo) => {
  const steps = demo
    ? [
        ["Question", "Does the product need to exist at all, and for whom."],
        ["Reduce", "Remove every part and control that does not earn its place."],
        ["Detail", "Radii, gaps, type and colour, decided once and applied everywhere."],
        ["Test", "Put it in a home for a month and watch what people actually touch."],
      ]
    : [
        ["Step one", "What happens"],
        ["Step two", "What happens"],
        ["Step three", "What happens"],
        ["Step four", "What happens"],
      ];
  const els = steps.flatMap(([h, d], i) => {
    const x = COLS[4].x[i];
    return [
      knob({ id: `pr-k${i}`, x, y: 192, w: 44, h: 44 }),
      f.text({ id: `pr-n${i}`, html: String(i + 1), fontSize: 20, fontWeight: 500, lineHeight: 1, align: "center", valign: "middle", x, y: 192, w: 44, h: 44 }),
      f.text({ id: `pr-t${i}`, html: h, fontSize: 26, fontWeight: 500, lineHeight: 1.2, x, y: 260, w: COLS[4].w, h: 36 }),
      body({ id: `pr-d${i}`, html: d, x, y: 308, w: COLS[4].w, h: 316 }),
    ];
  });
  return {
    id: "s-process",
    name: "Process",
    background: GROUND,
    transition: "none",
    notes: "Process. Four numbered knobs joined by a dotted orange track. In the demo, step 2 is clickable: a transparent rect over it links to a state slide, and the left arrow returns.",
    elements: [
      ...chrome(),
      ...slideHead(demo ? "How a Braun product was designed" : "Slide title"),
      f.line({ id: "pr-flow", x: 140, y: 212, w: 1044, h: 2, fill: ORANGE, stroke: ORANGE, strokeWidth: 2, strokeStyle: "dotted" }),
      ...els,
      ...(demo
        ? [
            f.rect({ id: "pr-hit1", x: COLS[4].x[1] - 12, y: 184, w: COLS[4].w + 24, h: 440, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
            f.text({ id: "pr-hint", html: "Click step 2 for detail", fontSize: 16, color: GREY, x: COLS[4].x[1], y: 600, w: 254, h: 24 }),
          ]
        : []),
    ],
  };
};

const processDetail = () => ({
  id: "s-process-detail",
  stateOf: "s-process",
  background: GROUND,
  transition: "none",
  notes: "State slide for step 2 (hidden from the arrow-key sequence, reached by clicking the step). Left arrow returns to the process slide.",
  elements: [
    ...chrome(),
    ...slideHead("How a Braun product was designed"),
    knob({ id: "pr-k1", x: 96, y: 192, w: 44, h: 44 }),
    f.text({ id: "pr-n1", html: "2", fontSize: 20, fontWeight: 500, lineHeight: 1, align: "center", valign: "middle", x: 96, y: 192, w: 44, h: 44 }),
    f.text({ id: "pr-t1", html: "Reduce", fontSize: 26, fontWeight: 500, lineHeight: 1.2, x: 96, y: 260, w: 340, h: 36 }),
    body({
      id: "det-body",
      html: "<p>Every control is a claim on the user's attention. The SK 4 had a single row of them. The T 3 had one dial and one wheel, and the wheel was the only thing in colour.</p><p>Reduction is not minimalism for its own sake: the parts that remain get the whole budget of care.</p>",
      x: 470,
      y: 260,
      w: 714,
      h: 280,
    }),
    f.text({ id: "det-back", html: "Left arrow returns to the process", fontSize: 16, color: GREY, x: 96, y: 600, w: 400, h: 24 }),
  ],
});

const quote = (demo) => ({
  id: "s-quote",
  name: "Quote",
  background: GROUND,
  transition: "none",
  notes: "Pull quote between two hairlines. Use a real sentence someone said, with a name.",
  elements: [
    ...chrome(),
    hair({ id: "q-rule-top", x: 96, y: 192, w: 1088, fill: INK }),
    f.text({ id: "q-body", ...ph(demo, "Indifference towards people and the reality in which they live is actually the one and only cardinal sin in design.", "Quotation"), fontSize: 40, fontWeight: 400, lineHeight: 1.25, x: 96, y: 236, w: 1040, h: 260 }),
    hair({ id: "q-rule-bottom", x: 96, y: 528, w: 1088, fill: INK }),
    f.text({ id: "q-attrib", ...ph(demo, "Dieter Rams", "Name, source"), fontSize: 20, color: GREY, x: 96, y: 548, w: 1000, h: 32 }),
  ],
});

const image = (demo) => ({
  id: "s-image",
  name: "Image",
  background: BLACK,
  transition: "none",
  notes: "Full-bleed image with a dark scrim and the caption at the bottom left. Replace the placeholder asset with a photo downscaled to 2560px before embedding. Keep captions in the text element, since text baked into a photo cannot be edited.",
  elements: [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 0, w: 1280, h: 720, fill: BLACK, opacity: 0.5 }),
    f.text({ id: "hero-title", ...ph(demo, "The object, photographed plainly", "Caption or title"), fontSize: 52, fontWeight: 500, lineHeight: 1.1, color: BLACK_TX, valign: "bottom", x: 96, y: 380, w: 900, h: 130 }),
    f.ellipse({ id: "dot", x: 96, y: 534, w: 12, h: 12 }),
    body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a real photograph", "Subtitle"), color: BLACK_TX, x: 124, y: 524, w: 800, h: 40 }),
  ],
});

const closing = (demo) => ({
  id: "s-closing",
  name: "Closing",
  background: GROUND,
  transition: "none",
  notes: "Closing. The indicator becomes a 480px disc. End on the ask rather than the word Questions. The second line is where to send people: a URL, a name, a date. {{author}} and {{company}} resolve from File > Properties.",
  elements: [
    f.ellipse({ id: "dot", x: 704, y: 120, w: 480, h: 480 }),
    f.text({ id: "close-line", ...ph(demo, "Take one control off the next thing you ship.", "The ask"), fontSize: 56, fontWeight: 500, lineHeight: 1.1, valign: "bottom", x: 96, y: 200, w: 560, h: 372 }),
    body({ id: "close-meta", ...ph(demo, "{{company}}", "Contact or link"), color: GREY, x: 96, y: 592, w: 560, h: 40 }),
  ],
});

// A neutral placeholder stands in for the photo the user will supply.
const placeholderSvg = () => {
  const rings = [];
  for (let r = 60; r <= 420; r += 60) rings.push(`<circle cx="640" cy="360" r="${r}" fill="none" stroke="#4A4A47" stroke-width="1"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#343432"/>${rings.join("")}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-rams-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    template: true,
    title: "Rams",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "rams, braun, mid-century, product design" },
    theme: {
      background: GROUND,
      color: INK,
      accent: ORANGE,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: BLACK, tx2: GREY, accent2: INK, accent3: GREY, accent4: HAIR, hlink: ORANGE },
      table: { headerBg: BLACK, headerColor: BLACK_TX, borderColor: HAIR, borderWidth: 1, fontSize: 20, color: INK, radius: 0 },
    },
    fonts: [{ family: "Jost", asset: "jost", weight: "400 600" }],
    assets: { jost: dataUri(join(root, "fonts", "jost-latin.woff2")), placeholder: placeholderSvg() },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
