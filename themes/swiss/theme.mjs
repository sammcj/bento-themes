// Swiss: International Typographic Style. One grotesque (Archivo), flush-left
// ragged-right, a 2px rule and running head on every slide, and a single red
// square ("mark") that recurs at a different scale: a 400px block on the cover,
// a 16px dot beside the page number, a bar on dividers, full-bleed at the end.
// No animation anywhere: the ids stay stable so a morph can be switched on later.
import { join } from "node:path";
import { COLS, dataUri, factory } from "../../scripts/lib.mjs";

const PAPER = "#F3F1EC";
const INK = "#141414";
const GREY = "#6B6B6B";
const HAIR = "#C9C6BF";
const RED = "#E2231A";
const FONT = "Archivo, 'Helvetica Neue', Helvetica, Arial, sans-serif";

const t = { fontFamily: FONT, color: INK, accent: RED };
const f = factory(t);

// Type scale (px): display 96, section 64, title 44, lead 28, body 22, label 16.
// Archivo already sets tight, so display tracking stays near zero.
const display = (o) => f.text({ fontSize: 96, fontWeight: 700, lineHeight: 1.0, letterSpacing: -1, ...o });
const heading = (o) => f.text({ fontSize: 44, fontWeight: 700, lineHeight: 1.05, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
const body = (o) => f.text({ fontSize: 22, lineHeight: 1.35, ...o });
const label = (o) => f.text({ fontSize: 16, fontWeight: 500, lineHeight: 1.3, color: GREY, ...o });

// Content slides share this chrome; the ids stay stable so it morphs in place.
const chrome = ({ mark = true } = {}) => [
  f.line({ id: "head-rule", x: 96, y: 64, w: 1088, h: 2, fill: INK }),
  label({ id: "run-title", html: "{{title}}", x: 96, y: 76, w: 600, h: 22 }),
  label({ id: "run-page", html: "{{page:2}}", color: INK, align: "right", x: 1004, y: 76, w: 148, h: 22 }),
  ...(mark ? [f.rect({ id: "mark", x: 1168, y: 78, w: 16, h: 16 })] : []),
];

const slideHead = (html) => heading({ id: "slide-head", html, x: 96, y: 120, w: 1088, h: 60 });

// Every builder returns a slide. `demo` fills sample content; otherwise the
// user-editable text becomes a placeholder for the layout picker.
const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

const cover = (demo) => ({
  id: "s-cover",
  name: "Cover",
  background: PAPER,
  transition: "none",
  notes:
    "Cover. Title and company fill from File > Properties, so set them once. The date is a literal: it records when the deck was written, and it is deliberately not the {{date}} token, which would show whatever day the deck is presented. The red square is the deck's one mark; it reappears at a different scale on the dividers and the closing slide.",
  elements: [
    f.line({ id: "head-rule", x: 96, y: 64, w: 1088, h: 2, fill: INK }),
    label({ id: "run-title", html: "{{company}}", x: 96, y: 76, w: 600, h: 22 }),
    label({ id: "run-page", html: "2026-09-22", color: INK, align: "right", x: 1004, y: 76, w: 180, h: 22 }),
    f.rect({
      id: "mark",
      x: 784,
      y: 160,
      w: 400,
      h: 400,
    }),
    display({ id: "deck-title", html: "{{title}}", valign: "bottom", x: 96, y: 300, w: 640, h: 292 }),
    body({ id: "cover-sub", ...ph(demo, "A subtitle, the event, or the client", "Subtitle"), color: GREY, x: 96, y: 608, w: 640, h: 48 }),
  ],
});

const agenda = (demo) => {
  const items = demo
    ? ["Where we are", "What changed", "What we propose", "What we need from you"]
    : ["Item one", "Item two", "Item three", "Item four"];
  const rows = items.flatMap((it, i) => {
    const y = 200 + i * 112;
    return [
      heading({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), x: 96, y, w: 120, h: 56 }),
      f.text({ id: `ag-t${i}`, ...(demo ? { html: it } : { html: "", placeholder: it }), fontSize: 28, fontWeight: 500, lineHeight: 1.2, x: 256, y: y + 6, w: 928, h: 44 }),
      hair({ id: `ag-r${i}`, x: 96, y: y + 88, w: 1088 }),
    ];
  });
  return {
    id: "s-agenda",
    name: "Agenda",
    background: PAPER,
    transition: "none",
    notes: "Agenda. The running head shows the deck title, the page number sits at the right with the red mark beside it. Four rows fit the band; delete a row rather than shrinking the type.",
    elements: [...chrome(), slideHead(demo ? "Agenda" : "Agenda"), ...rows],
  };
};

const section = (demo) => ({
  id: "s-section",
  name: "Section",
  background: PAPER,
  transition: "none",
  notes: "Section divider. The mark becomes a vertical bar. Number the sections only if the order matters to the audience; otherwise delete the numeral and let the title sit alone.",
  elements: [
    ...chrome({ mark: false }),
    f.rect({ id: "mark", x: 96, y: 200, w: 24, h: 456 }),
    display({ id: "sec-num", ...ph(demo, "02", "01"), x: 160, y: 200, w: 400, h: 100 }),
    f.text({ id: "sec-title", ...ph(demo, "What changed since the last review", "Section title"), fontSize: 64, fontWeight: 700, lineHeight: 1.05, valign: "bottom", x: 160, y: 380, w: 1000, h: 276 }),
  ],
});

const statement = (demo) => ({
  id: "s-statement",
  name: "Statement",
  background: PAPER,
  transition: "none",
  notes: "Statement. One sentence, no bullets, flush left. Keep it under about twenty words so it holds at 56px. The source line underneath is optional.",
  elements: [
    ...chrome(),
    f.text({ id: "stmt", ...ph(demo, "Every slide should be able to stand alone on a wall and still be understood in three seconds.", "One idea, one sentence"), fontSize: 56, fontWeight: 700, lineHeight: 1.1, x: 96, y: 200, w: 1088, h: 380 }),
    label({ id: "stmt-src", ...ph(demo, "Josef Müller-Brockmann, paraphrased", "Source or context"), fontSize: 18, x: 96, y: 620, w: 1088, h: 36 }),
  ],
});

const titleBody = (demo) => ({
  id: "s-body",
  name: "Title and body",
  background: PAPER,
  transition: "none",
  notes: "Title and body. The body box runs the full band. Use <ul> for bullets, or replace the box with a chart or table. Body stays at 22px; if it does not fit, cut words or split the slide.",
  elements: [
    ...chrome(),
    slideHead(demo ? "The grid is a tool, not a cage" : "Slide title"),
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>The International Typographic Style came out of Swiss design schools in the 1950s. It favours a mathematical grid, sans-serif type set flush left, objective photography and the removal of anything that does not carry information.</p><p>Its lessons still hold for a slide: one typeface, one accent, generous margins, and text you can read from the back of the room.</p><ul><li>Align everything to the same left edge</li><li>Let white space do the separating</li><li>Use size and weight for hierarchy, never colour alone</li></ul>",
        "Body copy",
      ),
      x: 96,
      y: 200,
      w: 816,
      h: 456,
    }),
  ],
});

const points = (demo) => {
  const items = demo
    ? [
        ["Objective", "Type carries the message. Decoration is removed until only information remains."],
        ["Asymmetric", "The grid is respected, and used unevenly. Weight sits where the eye should go first."],
        ["Systematic", "Sizes, margins and rules repeat across every page so the reader stops noticing them."],
      ]
    : [
        ["Point one", "Supporting sentence"],
        ["Point two", "Supporting sentence"],
        ["Point three", "Supporting sentence"],
      ];
  const rows = items.flatMap(([h, d], i) => {
    const y = 200 + i * 152;
    return [
      f.line({ id: `pt-r${i}`, x: 96, y, w: 1088, h: 2, fill: INK }),
      f.text({ id: `pt-h${i}`, html: h, fontSize: 28, fontWeight: 700, lineHeight: 1.2, x: 96, y: y + 16, w: 300, h: 40 }),
      body({ id: `pt-d${i}`, html: d, x: 470, y: y + 18, w: 714, h: 110 }),
    ];
  });
  return {
    id: "s-points",
    name: "Points",
    background: PAPER,
    transition: "none",
    notes: "Points. Three rows, each a 2px rule, a bold lead and a sentence. Three fill the band; for more, split the slide.",
    elements: [...chrome(), slideHead(demo ? "Three things the style asks of you" : "Slide title"), ...rows],
  };
};

const twoCol = (demo) => ({
  id: "s-twocol",
  name: "Two columns",
  background: PAPER,
  transition: "none",
  notes: "Two columns, 528px each with a 32px gutter. Each column has a 28px lead line and 22px body. Good for before/after or problem/response.",
  elements: [
    ...chrome(),
    slideHead(demo ? "Before and after" : "Slide title"),
    f.text({ id: "col-l-head", ...ph(demo, "Before", "Left heading"), fontSize: 28, fontWeight: 700, lineHeight: 1.2, x: COLS[2].x[0], y: 200, w: COLS[2].w, h: 40 }),
    f.line({ id: "col-l-rule", x: COLS[2].x[0], y: 252, w: COLS[2].w, h: 2, fill: INK }),
    body({ id: "col-l-body", ...ph(demo, "Six typefaces across the deck. Centred headings that change size on every slide. Bullets nested three deep, with the important number in the footer where nobody looks.", "Left body"), x: COLS[2].x[0], y: 272, w: COLS[2].w, h: 384 }),
    f.text({ id: "col-r-head", ...ph(demo, "After", "Right heading"), fontSize: 28, fontWeight: 700, lineHeight: 1.2, x: COLS[2].x[1], y: 200, w: COLS[2].w, h: 40 }),
    f.line({ id: "col-r-rule", x: COLS[2].x[1], y: 252, w: COLS[2].w, h: 2, fill: INK }),
    body({ id: "col-r-body", ...ph(demo, "One typeface at three sizes. Every heading on the same baseline. The number the audience came for set at 112px, alone, with a one-line label.", "Right body"), x: COLS[2].x[1], y: 272, w: COLS[2].w, h: 384 }),
  ],
});

const numbers = (demo) => {
  const stats = demo
    ? [
        ["68%", "of slide decks in the sample used more than three typefaces"],
        ["3s", "median time an audience spends reading a slide before listening"],
        ["1", "accent colour is all this template allows"],
      ]
    : [
        ["00", "Label"],
        ["00", "Label"],
        ["00", "Label"],
      ];
  const els = stats.flatMap(([v, l], i) => {
    const x = COLS[3].x[i];
    return [
      f.line({ id: `st-r${i}`, x, y: 200, w: COLS[3].w, h: 2, fill: INK }),
      f.text({ id: `st-v${i}`, html: v, fontSize: 112, fontWeight: 700, lineHeight: 1.0, letterSpacing: -1, x, y: 224, w: COLS[3].w, h: 120 }),
      body({ id: `st-l${i}`, html: l, color: GREY, x, y: 364, w: COLS[3].w, h: 90 }),
    ];
  });
  return {
    id: "s-numbers",
    name: "Numbers",
    background: PAPER,
    transition: "none",
    notes: "Headline numbers. One plain number per box at 112px with a one-line label. The line at the bottom gives the numbers their consequence; delete it if the numbers speak alone.",
    elements: [
      ...chrome(),
      slideHead(demo ? "What the audit found" : "Slide title"),
      ...els,
      hair({ id: "st-foot-rule", x: 96, y: 576, w: 1088 }),
      body({ id: "st-note", ...ph(demo, "Sample of 120 internal decks presented between March and August. Typeface count includes fonts embedded in pasted screenshots.", "Source or consequence"), fontSize: 20, color: GREY, x: 96, y: 592, w: 1088, h: 64 }),
    ],
  };
};

const chart = (demo) => ({
  id: "s-chart",
  name: "Chart",
  background: PAPER,
  transition: "none",
  notes: "Chart. Two bar series in ink and red plus a target line in grey. Bar and line data are plain numbers; only pie takes {name, value}. The legend must be an object to render. textStyle.fontFamily is set so the chart uses Archivo rather than the browser default.",
  elements: [
    ...chrome(),
    slideHead(demo ? "Decks reworked per month" : "Slide title"),
    f.chart({
      id: "chart-main",
      preset: "bar",
      x: 96,
      y: 200,
      w: 1088,
      h: 456,
      option: {
        textStyle: { fontFamily: FONT },
        grid: { left: 48, right: 8, top: 44, bottom: 32 },
        legend: { top: 0, textStyle: { color: INK, fontSize: 16 } },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"], axisLine: { lineStyle: { color: INK } }, axisLabel: { color: INK, fontSize: 16 } },
        yAxis: { type: "value", axisLine: { show: false }, splitLine: { lineStyle: { color: HAIR } }, axisLabel: { color: GREY, fontSize: 14 } },
        series: [
          { name: "Submitted", type: "bar", data: [14, 18, 22, 21, 26, 31], itemStyle: { color: INK } },
          { name: "Reworked", type: "bar", data: [9, 12, 11, 8, 7, 5], itemStyle: { color: RED } },
          { name: "Target", type: "line", data: [10, 9, 8, 7, 6, 5], symbol: "none", lineStyle: { color: GREY, width: 2 } },
        ],
      },
    }),
  ],
});

const table = (demo) => ({
  id: "s-table",
  name: "Table",
  background: PAPER,
  transition: "none",
  notes: "Comparison table. Header row in ink, 1px hairlines, no zebra. Tables are for specs and comparisons; a numeric trend belongs in the chart layout.",
  elements: [
    ...chrome(),
    slideHead(demo ? "Options on the table" : "Slide title"),
    f.table({
      id: "tbl-main",
      x: 96,
      y: 200,
      w: 1088,
      h: 456,
      columns: [{ w: 1.6 }, { w: 1 }, { w: 1 }, { w: 1.4 }],
      rows: demo
        ? [
            { cells: [{ html: "Option" }, { html: "Effort" }, { html: "Risk" }, { html: "Payback" }] },
            { cells: [{ html: "Do nothing" }, { html: "None" }, { html: "High" }, { html: "Never" }] },
            { cells: [{ html: "Patch the current flow" }, { html: "Low" }, { html: "Medium" }, { html: "Two quarters" }] },
            { cells: [{ html: "Rebuild the pipeline", bold: true }, { html: "High" }, { html: "Low" }, { html: "One quarter", color: RED, bold: true }] },
            { cells: [{ html: "Buy a product" }, { html: "Medium" }, { html: "Medium" }, { html: "Three quarters" }] },
          ]
        : [
            { cells: [{ html: "Column" }, { html: "Column" }, { html: "Column" }, { html: "Column" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
            { cells: [{ html: "Row" }, { html: "" }, { html: "" }, { html: "" }] },
          ],
      style: { headerBg: INK, headerColor: PAPER, borderColor: HAIR, borderWidth: 1, cellPadX: 16, cellPadY: 14, fontSize: 20, color: INK, radius: 0 },
    }),
  ],
});

const process = (demo) => {
  const steps = demo
    ? [
        ["Collect", "Pull every deck presented this half into one folder."],
        ["Measure", "Count typefaces, colours and words per slide. No judgement yet."],
        ["Rebuild", "Re-set the ten most-viewed decks on this template."],
        ["Compare", "Show both versions to the same audience a week apart."],
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
      f.line({ id: `pr-r${i}`, x, y: 200, w: COLS[4].w, h: 2, fill: INK }),
      heading({ id: `pr-n${i}`, html: String(i + 1), x, y: 216, w: 80, h: 56 }),
      f.text({ id: `pr-t${i}`, html: h, fontSize: 24, fontWeight: 700, lineHeight: 1.2, x, y: 316, w: COLS[4].w, h: 36 }),
      body({ id: `pr-d${i}`, html: d, x, y: 364, w: COLS[4].w, h: 292 }),
    ];
  });
  return {
    id: "s-process",
    name: "Process",
    background: PAPER,
    transition: "none",
    notes: "Process. Four numbered columns on a dashed red line. In the demo, step 2 is clickable: a transparent rect over it links to a state slide. Left arrow returns.",
    elements: [
      ...chrome(),
      slideHead(demo ? "How the audit ran" : "Slide title"),
      ...els,
      f.line({ id: "pr-flow", x: 96, y: 290, w: 1088, h: 3, fill: RED, stroke: RED, strokeWidth: 3, strokeStyle: "dashed", lineEnd: "arrow" }),
      ...(demo
        ? [
            f.rect({ id: "pr-hit1", x: COLS[4].x[1] - 12, y: 200, w: COLS[4].w + 24, h: 456, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
            label({ id: "pr-hint", html: "Click step 2 for detail", x: COLS[4].x[1], y: 632, w: 254, h: 24 }),
          ]
        : []),
    ],
  };
};

const processDetail = () => ({
  id: "s-process-detail",
  stateOf: "s-process",
  background: PAPER,
  transition: "none",
  notes: "State slide for step 2 (hidden from the arrow-key sequence, reached by clicking the step). Left arrow returns to the process slide.",
  elements: [
    ...chrome(),
    slideHead("How the audit ran"),
    f.line({ id: "pr-r1", x: 96, y: 200, w: 1088, h: 2, fill: INK }),
    heading({ id: "pr-n1", html: "2", x: 96, y: 216, w: 80, h: 56 }),
    f.text({ id: "pr-t1", html: "Measure", fontSize: 24, fontWeight: 700, lineHeight: 1.2, x: 96, y: 316, w: 340, h: 36 }),
    body({
      id: "det-body",
      html: "<p>Three counts per slide: typefaces, colours, words. Screenshots count for whatever fonts are visible in them, because the audience sees those too.</p><p>We also logged the first thing each reviewer's eye landed on. In 41 of 120 decks it was the page number.</p>",
      x: 470,
      y: 316,
      w: 714,
      h: 260,
    }),
    label({ id: "det-back", html: "Left arrow returns to the process", x: 96, y: 620, w: 400, h: 24 }),
  ],
});

const quote = (demo) => ({
  id: "s-quote",
  name: "Quote",
  background: PAPER,
  transition: "none",
  notes: "Pull quote. Use a real sentence someone said, with a name. The red quotation mark is the only decoration on the slide.",
  elements: [
    ...chrome(),
    f.text({ id: "q-mark", html: "“", fontSize: 240, fontWeight: 700, lineHeight: 0.8, color: RED, x: 84, y: 180, w: 160, h: 200 }),
    f.text({ id: "q-body", ...ph(demo, "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice.", "Quotation"), fontSize: 40, fontWeight: 500, lineHeight: 1.25, x: 96, y: 320, w: 1040, h: 280 }),
    label({ id: "q-attrib", ...ph(demo, "Josef Müller-Brockmann, Grid Systems in Graphic Design, 1981", "Name, source"), fontSize: 18, x: 96, y: 616, w: 1000, h: 40 }),
  ],
});

const image = (demo) => ({
  id: "s-image",
  name: "Image",
  background: INK,
  transition: "none",
  notes: "Full-bleed image with an ink scrim and the title at the bottom left. Replace the placeholder asset with a photo downscaled to 2560px before embedding. Text baked into the photo cannot be edited, so keep captions in the text element.",
  elements: [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 0, w: 1280, h: 720, fill: INK, opacity: 0.45 }),
    f.rect({ id: "mark", x: 96, y: 520, w: 24, h: 24 }),
    f.text({ id: "hero-title", ...ph(demo, "Objective photography, cropped to the grid", "Caption or title"), fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: PAPER, valign: "bottom", x: 96, y: 360, w: 900, h: 140 }),
    body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a real photograph", "Subtitle"), color: PAPER, x: 136, y: 520, w: 800, h: 40 }),
  ],
});

const closing = (demo) => ({
  id: "s-closing",
  name: "Closing",
  background: PAPER,
  transition: "none",
  notes: "Closing. The mark fills the slide. End on the ask rather than the word Questions. The second line is where to send people: a URL, a name, a date. {{author}} and {{company}} resolve from File > Properties.",
  elements: [
    f.rect({ id: "mark", x: 0, y: 0, w: 1280, h: 720 }),
    f.text({ id: "close-line", ...ph(demo, "Re-set one deck on this grid before the next review.", "The ask"), fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: PAPER, valign: "bottom", x: 96, y: 200, w: 1000, h: 392 }),
    body({ id: "close-meta", ...ph(demo, "{{company}}", "Contact or link"), color: PAPER, x: 96, y: 616, w: 1000, h: 40 }),
  ],
});

// A neutral grey grid stands in for the photo the user will supply.
const placeholderSvg = () => {
  const lines = [];
  for (let x = 0; x <= 1280; x += 128) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="720" stroke="#5A5A5A" stroke-width="1"/>`);
  for (let y = 0; y <= 720; y += 120) lines.push(`<line x1="0" y1="${y}" x2="1280" y2="${y}" stroke="#5A5A5A" stroke-width="1"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#3C3C3C"/>${lines.join("")}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-swiss-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    template: true,
    title: "Swiss",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "swiss, international typographic style, grid" },
    theme: {
      background: PAPER,
      color: INK,
      accent: RED,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: INK, tx2: GREY, accent2: INK, accent3: GREY, accent4: HAIR, hlink: RED },
      table: { headerBg: INK, headerColor: PAPER, borderColor: HAIR, borderWidth: 1, fontSize: 20, color: INK, radius: 0 },
    },
    fonts: [{ family: "Archivo", asset: "archivo", weight: "400 700" }],
    assets: { archivo: dataUri(join(root, "fonts", "archivo-latin.woff2")), placeholder: placeholderSvg() },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
