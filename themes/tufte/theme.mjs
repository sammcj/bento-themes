// Tufte: cream page, one old-style serif (EB Garamond), hairline rules and a
// side-note column beside the main text on the reading layouts. Charts carry
// the minimum ink: no gridlines, thin axes, three series in brick red, ink and
// grey. The recurring "mark" is a 64px brick-red hairline under every title.
// No animation anywhere: the ids stay stable so a morph can be switched on later.
import { join } from "node:path";
import { COLS, dataUri, factory } from "../../scripts/lib.mjs";

const PAPER = "#FFFFF8";
const INK = "#111111";
const GREY = "#666460";
const HAIR = "#CFCBC0";
const RED = "#A51C30";
const FONT = "'EB Garamond', 'Iowan Old Style', Garamond, Georgia, serif";

const t = { fontFamily: FONT, color: INK, accent: RED };
const f = factory(t);

// Main text column and side-note column inside the 96px margins.
const MAIN = { x: 96, w: 704 };
const SIDE = { x: 832, w: 352 };

// Type scale (px): display 96, section 68, title 48, lead 32, body 28, note 20, running head 16.
// Garamond's x-height is small, so every size sits a step above the Newsreader scale it replaced.
// Tufte's headings are never bold; hierarchy comes from size and position.
const display = (o) => f.text({ fontSize: 96, lineHeight: 1.02, letterSpacing: -0.5, ...o });
const heading = (o) => f.text({ fontSize: 48, lineHeight: 1.1, ...o });
const lead = (o) => f.text({ fontSize: 32, lineHeight: 1.2, ...o });
const body = (o) => f.text({ fontSize: 28, lineHeight: 1.4, ...o });
const note = (o) => f.text({ fontSize: 20, lineHeight: 1.4, color: GREY, ...o });
const label = (o) => f.text({ fontSize: 16, lineHeight: 1.3, color: GREY, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
const mark = (o) => f.rect({ id: "mark", x: 96, w: 64, h: 2, ...o });

// Content slides share this chrome; the ids stay stable across slides.
const chrome = () => [
  label({ id: "run-title", html: "{{title}}", x: 96, y: 52, w: 600, h: 20 }),
  label({ id: "run-page", html: "{{page:2}}", align: "right", x: 984, y: 52, w: 200, h: 20 }),
  hair({ id: "head-rule", x: 96, y: 80, w: 1088 }),
];

// Every builder returns a slide. `demo` fills sample content; otherwise the
// user-editable text becomes a placeholder for the layout picker.
const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

const slideHead = (demo, html, placeholder = "Slide title") => [
  heading({ id: "slide-head", ...ph(demo, html, placeholder), x: 96, y: 108, w: 1088, h: 56 }),
  mark({ y: 178 }),
];

// Side notes are italic in the demo; user copy in the layout is upright until they wrap it in <i>.
// `sample` is one paragraph or an array of them; the wrapper owns the markup.
const sideNote = (demo, sample, { id = "side-note", x = SIDE.x, y = 200, w = SIDE.w, h = 456 } = {}) => {
  const html = [sample].flat().map((p) => `<p><i>${p}</i></p>`).join("");
  return note({ id, ...ph(demo, html, "Side note"), x, y, w, h });
};

const slide = (id, name, notes, elements) => ({ id, name, background: PAPER, transition: "none", notes, elements });

const cover = (demo) =>
  slide("s-cover", "Cover", "Cover. Title and company fill from File > Properties, so set them once. The date is a literal: it records when the deck was written, and it is deliberately not the {{date}} token, which would show whatever day the deck is presented. The short red rule is the deck's one mark; it sits under the title of every slide that follows.", [
    label({ id: "run-title", html: "{{company}}", x: 96, y: 52, w: 600, h: 20 }),
    label({ id: "run-page", ...ph(demo, "2026-09-22", "Date"), align: "right", x: 984, y: 52, w: 200, h: 20 }),
    hair({ id: "head-rule", x: 96, y: 80, w: 1088 }),
    display({ id: "deck-title", html: "{{title}}", valign: "bottom", x: 96, y: 200, w: 960, h: 300 }),
    mark({ y: 524 }),
    body({ id: "cover-sub", ...ph(demo, "Evaluation results for the retrieval pipeline, third quarter", "Subtitle"), color: GREY, x: 96, y: 548, w: 704, h: 72 }),
  ]);

const agenda = (demo) => {
  const items = demo ? ["What we measured", "How the benchmark ran", "Latency and cost", "What we recommend"] : ["Item one", "Item two", "Item three", "Item four"];
  const rows = items.flatMap((it, i) => {
    const y = 200 + i * 112;
    return [
      f.text({ id: `ag-t${i}`, ...ph(demo, it, it), fontSize: 30, lineHeight: 1.2, x: MAIN.x, y: y + 40, w: MAIN.w, h: 40 }),
      hair({ id: `ag-r${i}`, x: MAIN.x, y: y + 96, w: MAIN.w }),
    ];
  });
  return slide("s-agenda", "Agenda", "Agenda. Four unnumbered rows in the main column; number them only if the order matters to the audience. The side note says how the session runs. Four rows fit the band; delete a row rather than shrinking the type.", [
    ...chrome(),
    ...slideHead(demo, "Agenda", "Agenda"),
    ...rows,
    sideNote(demo, "Forty minutes. Questions after each section rather than at the end, so the recommendation can build on what was agreed.", { y: 240, h: 200 }),
  ]);
};

const section = (demo) =>
  slide("s-section", "Section", "Section divider. The title sits low on the page with the mark under it and a one-sentence lead in grey. No section numbers: the agenda already gives the order.", [
    ...chrome(),
    f.text({ id: "sec-title", ...ph(demo, "Latency and cost", "Section title"), fontSize: 68, lineHeight: 1.1, valign: "bottom", x: 96, y: 200, w: 1088, h: 220 },),
    mark({ y: 444 }),
    body({ id: "sec-lead", ...ph(demo, "Two changes landed in the period: request batching in week 4 and a smaller reranker in week 6. The charts that follow separate their effects.", "One sentence on what this section covers"), color: GREY, x: 96, y: 468, w: MAIN.w, h: 130 }),
  ]);

const statement = (demo) =>
  slide("s-statement", "Statement", "Statement. One sentence, no bullets, set at 52px across the band. Keep it under about twenty-five words. The source line underneath is optional.", [
    ...chrome(),
    f.text({ id: "stmt", ...ph(demo, "A benchmark number without its confidence interval and its cost is a claim, not a result.", "One idea, one sentence"), fontSize: 52, lineHeight: 1.2, valign: "middle", x: 96, y: 200, w: 1088, h: 340 }),
    mark({ y: 564 }),
    note({ id: "stmt-src", ...ph(demo, "Team evaluation guideline, revised August", "Source or context"), x: 96, y: 588, w: 1088, h: 30 }),
  ]);

const titleBody = (demo) =>
  slide("s-body", "Title and body", "Title and body. The main column is 704px so lines stay readable at 28px; the side note column carries the caveat, source or method in 20px grey. Use <ul> for bullets. If the body does not fit, cut words or split the slide.", [
    ...chrome(),
    ...slideHead(demo, "How the benchmark ran"),
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>Every model saw the same 1,200 prompts in the same order, at the same temperature, through the same gateway, spread across one week so that no model met only the quiet hours.</p><ul><li>Pass rate: a fixed judge model and a written rubric</li><li>Latency: at the gateway, client network time excluded</li><li>Cost: list price for input and output tokens</li></ul><p>Three prompts with wrong reference answers were withdrawn after the run; the tables exclude them. Each model ran the set three times, and the pass rate reported is the mean of the three.</p>",
        "Body copy",
      ),
      x: MAIN.x,
      y: 200,
      w: MAIN.w,
      h: 456,
    }),
    sideNote(demo, [
      "The sample size gives a two point margin on the pass rate at 95% confidence. Differences smaller than that between models are noise.",
      "Temperature was 0 for every model except Model C, whose API does not accept it; its three runs differ by half a point. Raw runs and the rubric are in the appendix.",
    ]),
  ]);

const points = (demo) => {
  const items = demo
    ? [
        ["Coverage", "The set has 1,200 prompts from four product areas. Two of the areas contribute 80% of them."],
        ["Judge drift", "The scoring model changed once in the period. Scores from before week 3 were re-run on the new judge."],
        ["Cost basis", "Cost per million tokens uses list prices. Committed-use discounts are not applied."],
      ]
    : [
        ["Point one", "Supporting sentence"],
        ["Point two", "Supporting sentence"],
        ["Point three", "Supporting sentence"],
      ];
  const rows = items.flatMap(([h, d], i) => {
    const y = 200 + i * 145;
    return [
      hair({ id: `pt-r${i}`, x: MAIN.x, y, w: MAIN.w }),
      lead({ id: `pt-h${i}`, ...ph(demo, h, h), x: MAIN.x, y: y + 12, w: MAIN.w, h: 40 }),
      body({ id: `pt-d${i}`, ...ph(demo, d, d), x: MAIN.x, y: y + 54, w: MAIN.w, h: 80 }),
    ];
  });
  return slide("s-points", "Points", "Points. Three rows in the main column, each a hairline, a 32px lead and one or two sentences. The side note holds what applies to all three. For more than three, split the slide.", [
    ...chrome(),
    ...slideHead(demo, "Three things the numbers do not say"),
    ...rows,
    sideNote(demo, "None of these change the ranking. They do change how far the numbers travel: quote them with the caveats, or not at all."),
  ]);
};

const twoCol = (demo) =>
  slide("s-twocol", "Two columns", "Two columns, 528px each with a 32px gutter. Each column has a 32px lead, a hairline and 28px body. Good for before/after or method/result.", [
    ...chrome(),
    ...slideHead(demo, "Before and after batching"),
    lead({ id: "col-l-head", ...ph(demo, "Before", "Left heading"), x: COLS[2].x[0], y: 200, w: COLS[2].w, h: 40 }),
    hair({ id: "col-l-rule", x: COLS[2].x[0], y: 252, w: COLS[2].w }),
    body({ id: "col-l-body", ...ph(demo, "<p>Each request opened its own connection and carried its own system prompt. At peak the gateway held 400 connections and the p95 sat at 1.8 seconds.</p><p>Retries were unbounded. A slow upstream turned into a storm of duplicate work, and the cost graph showed it as a spike every Tuesday afternoon.</p>", "Left body"), x: COLS[2].x[0], y: 272, w: COLS[2].w, h: 384 }),
    lead({ id: "col-r-head", ...ph(demo, "After", "Right heading"), x: COLS[2].x[1], y: 200, w: COLS[2].w, h: 40 }),
    hair({ id: "col-r-rule", x: COLS[2].x[1], y: 252, w: COLS[2].w }),
    body({ id: "col-r-body", ...ph(demo, "<p>Requests queue for up to 40 ms and go upstream in batches of eight, sharing one cached system prompt. Connections at peak dropped to 60 and the p95 to 1.2 seconds.</p><p>Retries are capped at two with jittered backoff. The Tuesday spike is gone; total tokens for the week fell 11% with no change in pass rate.</p>", "Right body"), x: COLS[2].x[1], y: 272, w: COLS[2].w, h: 384 }),
  ]);

const numbers = (demo) => {
  const stats = demo
    ? [
        ["84%", "pass rate on the held-out set, up from 79% last quarter"],
        ["410 ms", "p50 latency after batching, down from 620 ms"],
        ["$1.90", "cost per million output tokens, down from $2.10"],
      ]
    : [
        ["00", "Label"],
        ["00", "Label"],
        ["00", "Label"],
      ];
  const els = stats.flatMap(([v, l], i) => {
    const x = COLS[3].x[i];
    return [
      hair({ id: `st-r${i}`, x, y: 200, w: COLS[3].w }),
      f.text({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 104, lineHeight: 1.0, letterSpacing: -1, x, y: 240, w: COLS[3].w, h: 116 }),
      f.text({ id: `st-l${i}`, ...ph(demo, l, l), fontSize: 24, lineHeight: 1.35, color: GREY, x, y: 380, w: COLS[3].w, h: 130 }),
    ];
  });
  return slide("s-numbers", "Numbers", "Headline numbers. One number per column at 104px regular weight with a short label; a number with its unit (410 ms) fits the column at that size. The note under the foot rule says where the numbers came from; delete it only if the method is on an earlier slide.", [
    ...chrome(),
    ...slideHead(demo, "Headline results"),
    ...els,
    hair({ id: "st-foot-rule", x: 96, y: 540, w: 1088 }),
    note({ id: "st-note", ...ph(demo, "Held-out set of 300 prompts scored by the week-3 judge, mean of three runs. Latency measured at the gateway, excluding client network time. Cost at list price per million output tokens; input tokens add about 15% at the observed prompt lengths.", "Source or method"), x: 96, y: 556, w: 1088, h: 84 }),
  ]);
};

const axisText = { color: GREY, fontSize: 18 };
const chart = (demo) =>
  slide("s-chart", "Chart", "Chart. A line chart of three series in the main column (brick red, ink, grey) with the reading of the chart in the side note, so the graphic and its explanation sit together. Gridlines are painted in the ground colour because charts-lite ignores splitLine.show; thin axes; the legend is an object so it renders; textStyle.fontFamily is set so the chart uses the serif rather than the browser default. Bar and line data are plain numbers.", [
    ...chrome(),
    ...slideHead(demo, "Latency by week"),
    f.chart({
      id: "chart-main",
      preset: "line",
      x: MAIN.x,
      y: 200,
      w: MAIN.w,
      h: 456,
      option: {
        textStyle: { fontFamily: FONT },
        grid: { left: 60, right: 16, top: 48, bottom: 36 },
        legend: { top: 0, textStyle: { fontSize: 20 } },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: demo ? ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"] : ["A", "B", "C", "D", "E", "F", "G", "H"], axisLine: { lineStyle: { color: INK } }, axisLabel: axisText },
        yAxis: { type: "value", axisLine: { lineStyle: { color: INK } }, splitLine: { lineStyle: { color: PAPER } }, axisLabel: { ...axisText, formatter: "{value} s" } },
        series: [
          { name: demo ? "p50" : "Series 1", type: "line", data: [0.62, 0.61, 0.6, 0.43, 0.41, 0.4, 0.41, 0.41], symbol: "none", lineStyle: { color: RED, width: 2 } },
          { name: demo ? "p95" : "Series 2", type: "line", data: [1.8, 1.85, 1.78, 1.3, 1.25, 1.2, 1.21, 1.19], symbol: "none", lineStyle: { color: INK, width: 2 } },
          { name: demo ? "p99" : "Series 3", type: "line", data: [2.9, 3.1, 2.95, 2.1, 2.0, 1.7, 1.65, 1.6], symbol: "none", lineStyle: { color: GREY, width: 2 } },
        ],
      },
    }),
    sideNote(demo, "Batching landed in week 4. The p95 fell by a third within the week; the p50 moved less because most requests were already single-shot. The second step, in week 6, is the smaller reranker and shows mainly in the p99."),
  ]);

// Cell helpers: numeric columns sit flush right so the digits align.
const cell = (html, extra = {}) => ({ html, ...extra });
const num = (html) => cell(html, { align: "right" });
const table = (demo) =>
  slide("s-table", "Table", "Benchmark table. No header fill, no zebra: rules only above and below the header and at the foot, drawn as hairline rects over a borderless table. Numeric columns are right-aligned. Tables are for results and specs; a trend belongs in the chart layout.", [
    ...chrome(),
    ...slideHead(demo, "Results by model"),
    f.table({
      id: "tbl-main",
      x: 96,
      y: 200,
      w: 1088,
      h: 360,
      columns: [{ w: 1.6 }, { w: 1 }, { w: 1 }, { w: 1 }, { w: 1.3 }],
      rows: demo
        ? [
            { cells: [cell("Model"), num("Pass rate"), num("p50 (ms)"), num("p95 (ms)"), num("Cost per 1M tokens")] },
            { cells: [cell("Model A"), num("84%"), num("410"), num("1,190"), num("$1.90")] },
            { cells: [cell("Model B"), num("81%"), num("330"), num("960"), num("$0.75")] },
            { cells: [cell("Model C"), num("86%"), num("720"), num("2,400"), num("$6.40")] },
            { cells: [cell("Model D"), num("77%"), num("290"), num("880"), num("$0.40")] },
          ]
        : [
            { cells: [cell("Column"), num("Column"), num("Column"), num("Column"), num("Column")] },
            { cells: [cell("Row"), num(""), num(""), num(""), num("")] },
            { cells: [cell("Row"), num(""), num(""), num(""), num("")] },
            { cells: [cell("Row"), num(""), num(""), num(""), num("")] },
            { cells: [cell("Row"), num(""), num(""), num(""), num("")] },
          ],
      style: { headerBg: PAPER, headerColor: INK, borderColor: PAPER, borderWidth: 0, cellPadX: 12, cellPadY: 19, fontSize: 24, color: INK, radius: 0 },
    }),
    // Five rows of 72px: the rules land on the row boundaries of the borderless table above.
    f.rect({ id: "tbl-rule-top", x: 96, y: 200, w: 1088, h: 1, fill: INK }),
    hair({ id: "tbl-rule-head", x: 96, y: 272, w: 1088 }),
    f.rect({ id: "tbl-rule-foot", x: 96, y: 560, w: 1088, h: 1, fill: INK }),
    note({ id: "tbl-note", ...ph(demo, "Pass rate on the 300-prompt held-out set, week-3 judge. Latency at the gateway, cost at list price per million output tokens. Model C is within the two point margin of Model A at three times the cost.", "Source or reading of the table"), x: 96, y: 568, w: 1088, h: 56 }),
  ]);

const process = (demo) => {
  const steps = demo
    ? [
        ["Sample", "Draw 1,200 prompts from production logs, stratified by product area. Strip identifiers and store the set under a version tag."],
        ["Execute", "Run every model on every prompt through the gateway over one week, three times each, shuffled so no model gets only the quiet hours."],
        ["Score", "A fixed judge model grades each answer against the written rubric. A 5% sample is graded by hand to check the judge."],
        ["Report", "Publish pass rate, latency and cost with intervals, the method and the set version, so the next run can be compared."],
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
      hair({ id: `pr-r${i}`, x, y: 262, w: COLS[4].w }),
      heading({ id: `pr-n${i}`, html: String(i + 1), color: GREY, x, y: 278, w: 80, h: 56 }),
      lead({ id: `pr-t${i}`, ...ph(demo, h, h), x, y: 350, w: COLS[4].w, h: 40 }),
      f.text({ id: `pr-d${i}`, ...ph(demo, d, d), fontSize: 26, lineHeight: 1.35, x, y: 398, w: COLS[4].w, h: 214 }),
    ];
  });
  return slide("s-process", "Process", "Process. Four numbered columns under hairlines, the group centred in the band; the numerals are grey because the order matters but the numbers do not. In the demo, step 2 is clickable: a transparent rect over it links to a state slide. Left arrow returns.", [
    ...chrome(),
    ...slideHead(demo, "How a run works"),
    ...els,
    ...(demo
      ? [
          f.rect({ id: "pr-hit1", x: COLS[4].x[1] - 12, y: 200, w: COLS[4].w + 24, h: 456, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          note({ id: "pr-hint", html: "<i>Click step 2 for detail</i>", x: COLS[4].x[1], y: 628, w: 254, h: 28 }),
        ]
      : []),
  ]);
};

const processDetail = () => ({
  id: "s-process-detail",
  stateOf: "s-process",
  background: PAPER,
  transition: "none",
  notes: "State slide for step 2 (hidden from the arrow-key sequence, reached by clicking the step). Left arrow returns to the process slide.",
  elements: [
    ...chrome(),
    ...slideHead(true, "How a run works"),
    hair({ id: "pr-r1", x: 96, y: 216, w: 1088 }),
    heading({ id: "pr-n1", html: "2", color: GREY, x: 96, y: 232, w: 80, h: 56 }),
    lead({ id: "pr-t1", html: "Execute", x: 96, y: 304, w: 340, h: 40 }),
    body({
      id: "det-body",
      html: "<p>Runs go through the production gateway with the same timeouts and retry policy as user traffic, so the latency numbers are the ones users would see.</p><p>Each model's prompts are shuffled and spread across seven days. A model that only ran at 3am would look faster than it is.</p><p>Failed requests are retried twice; a third failure is scored as a fail and counted in the latency at the timeout value.</p>",
      x: 470,
      y: 232,
      w: 714,
      h: 392,
    }),
    note({ id: "det-back", html: "<i>Left arrow returns to the process</i>", x: 96, y: 628, w: 400, h: 28 }),
  ],
});

// An unframed figure, as in Tufte's books: the image sits on the page with a hairline
// under it and the caption in the side-note style beneath. Ids are prefixed so two
// figures can share a slide. Boxes match the placeholder's aspect (SHOT_ASPECT) so the
// demo shows no letterbox; a replacement image letterboxes on cream, which is invisible.
const SHOT_ASPECT = 1088 / 375;
const figure = (p, { x, y, w }) => {
  const h = Math.round(w / SHOT_ASPECT);
  return [f.image({ id: `${p}-img`, src: "asset:shot", fit: "contain", x, y, w, h }), hair({ id: `${p}-rule`, x, y: y + h + 12, w })];
};
const figureFoot = (y, w) => y + Math.round(w / SHOT_ASPECT) + 24;

const screenshot = (demo) =>
  slide("s-screenshot", "Screenshot", "Screenshot. One large capture across the band, unframed, with a hairline under it and a figure caption in the side-note style. Replace the shot asset with a PNG downscaled to 2560px wide; keep the caption in the text element, since text baked into an image cannot be edited or read by a screen reader.", [
    ...chrome(),
    ...slideHead(demo, "The dashboard after batching"),
    ...figure("shot", { x: 96, y: 200, w: 1088 }),
    sideNote(demo, "Latency panel, p95 by minute, one week either side of the change. The step on the Tuesday is the batching deploy.", { id: "shot-caption", x: 96, y: figureFoot(200, 1088), w: 1088, h: 56 }),
  ]);

const screenshotNotes = (demo) =>
  slide("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. The capture sits in the 704px main column with its caption under the hairline; the commentary is a lead and a side note in the 352px column. Use it when the shot needs reading, not just showing: what to look at, and what it means.", [
    ...chrome(),
    ...slideHead(demo, "Reading the trace"),
    ...figure("shot", { x: MAIN.x, y: 200, w: MAIN.w }),
    sideNote(demo, "One request traced end to end, 200 token reply. Spans are drawn to the same time scale; the bar under the trace is the batch window.", { id: "shot-caption", x: MAIN.x, y: figureFoot(200, MAIN.w), w: MAIN.w, h: 90 }),
    lead({ id: "shot-lead", ...ph(demo, "Prefill is the wide span", "What to look at"), x: SIDE.x, y: 200, w: SIDE.w, h: 40 }),
    hair({ id: "shot-lead-rule", x: SIDE.x, y: 252, w: SIDE.w }),
    sideNote(
      demo,
      [
        "The first span is prefill over a 1,400 token prompt. Nothing else starts until it ends, so prompt length sets the floor on time to first token.",
        "The 40 decode spans after it are short and even: memory bound, and cheap to batch with other requests.",
        "The gap before the first token is the 40 ms batch window. It is the price of the p95 improvement on the previous slide.",
      ],
      { id: "shot-body", y: 268, h: 356 },
    ),
  ]);

const clippings = (demo) => {
  const shots = demo
    ? [
        ["Before", "One connection per request and one system prompt each. The p95 sat at 1.8 seconds and the gateway held 400 connections at peak, with a retry storm every Tuesday afternoon."],
        ["After", "Batches of eight on the same nodes, sharing one cached system prompt. The p95 fell to 1.2 seconds and peak connections to 60; the Tuesday storm did not recur."],
      ]
    : [["Left caption", "One sentence on what the clipping shows"], ["Right caption", "One sentence on what the clipping shows"]];
  const els = shots.flatMap(([h, d], i) => {
    const x = COLS[2].x[i];
    const p = i === 0 ? "clip-l" : "clip-r";
    const foot = figureFoot(200, COLS[2].w);
    return [
      ...figure(p, { x, y: 200, w: COLS[2].w }),
      lead({ id: `${p}-head`, ...ph(demo, h, h), x, y: foot, w: COLS[2].w, h: 40 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), x, y: foot + 48, w: COLS[2].w, h: 160 }),
    ];
  });
  return slide("s-clippings", "Two clippings", "Two clippings. Two captures side by side in the 528px columns, each with a hairline, a lead and a few sentences. Suits before/after, two tools doing the same job, or a config and its effect. Crop clippings to the same aspect ratio before embedding so the hairlines land level.", [
    ...chrome(),
    ...slideHead(demo, "Before and after, on the dashboard"),
    ...els,
  ]);
};

const quote = (demo) =>
  slide("s-quote", "Quote", "Pull quote. A real sentence someone wrote, with a name and a source. Set at 44px across 960px; the mark and the attribution sit under it.", [
    ...chrome(),
    f.text({ id: "q-body", ...ph(demo, "Graphical excellence is that which gives to the viewer the greatest number of ideas in the shortest time with the least ink in the smallest space.", "Quotation"), fontSize: 44, lineHeight: 1.25, valign: "middle", x: 96, y: 200, w: 960, h: 340 }),
    mark({ y: 564 }),
    note({ id: "q-attrib", ...ph(demo, "Edward Tufte, The Visual Display of Quantitative Information, 1983", "Name, source"), x: 96, y: 588, w: 960, h: 30 }),
  ]);

const image = (demo) => ({
  id: "s-image",
  name: "Image",
  background: PAPER,
  transition: "none",
  notes: "Full-bleed figure with a light cream scrim and the caption at the bottom left. Replace the placeholder asset with a plot or photograph downscaled to 2560px before embedding. Text baked into the image cannot be edited, so keep captions in the text element.",
  elements: [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: 0, y: 0, w: 1280, h: 720, fill: PAPER, opacity: 0.5 }),
    f.text({ id: "hero-title", ...ph(demo, "A single request, traced end to end", "Caption or title"), fontSize: 52, lineHeight: 1.1, valign: "bottom", x: 96, y: 380, w: 900, h: 120 }),
    mark({ y: 524 }),
    body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a figure or photograph", "Subtitle"), color: GREY, x: 96, y: 548, w: 800, h: 40 }),
  ],
});

const closing = (demo) =>
  slide("s-closing", "Closing", "Closing. The ask at 60px, the mark under it, and where to send people: a URL, a name, a date. End on the ask rather than the word Questions. {{author}} and {{company}} resolve from File > Properties.", [
    f.text({ id: "close-line", ...ph(demo, "Adopt the week-3 judge as the baseline and re-run the set monthly.", "The ask"), fontSize: 60, lineHeight: 1.1, valign: "bottom", x: 96, y: 200, w: 960, h: 300 }),
    mark({ y: 524 }),
    body({ id: "close-meta", ...ph(demo, "{{company}}", "Contact or link"), color: GREY, x: 96, y: 548, w: 960, h: 40 }),
  ]);

// Small multiples: four sparklines on a 2x2 grid, each with a title and its latest value.
// Axis lines and gridlines are painted in the ground colour: charts-lite ignores show:false on them.
// The y range hugs the data so the shape of the series is visible, as on a printed sparkline.
const sparkOption = (data) => {
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const pad = (hi - lo || 1) * 0.6;
  return {
    textStyle: { fontFamily: FONT },
    grid: { left: 4, right: 4, top: 8, bottom: 8 },
    xAxis: { type: "category", data: data.map((_, i) => `W${i + 1}`), axisLine: { lineStyle: { color: PAPER } }, axisLabel: { show: false } },
    yAxis: { type: "value", min: lo - pad, max: hi + pad, axisLine: { lineStyle: { color: PAPER } }, axisLabel: { show: false }, splitLine: { lineStyle: { color: PAPER } } },
    series: [{ name: "value", type: "line", data, symbol: "none", lineStyle: { color: RED, width: 2 } }],
  };
};
const sparklines = (demo) => {
  const cells = demo
    ? [
        ["Pass rate", "84%", [79, 80, 80, 82, 83, 83, 84, 84]],
        ["p50 latency", "410 ms", [620, 610, 600, 430, 410, 400, 405, 410]],
        ["p95 latency", "1.19 s", [1800, 1850, 1780, 1300, 1250, 1200, 1210, 1190]],
        ["Cost per 1M tokens", "$1.90", [2.1, 2.1, 2.05, 1.95, 1.9, 1.9, 1.9, 1.9]],
      ]
    : [
        ["Metric", "00", [3, 4, 4, 5, 6, 6, 7, 7]],
        ["Metric", "00", [3, 4, 4, 5, 6, 6, 7, 7]],
        ["Metric", "00", [3, 4, 4, 5, 6, 6, 7, 7]],
        ["Metric", "00", [3, 4, 4, 5, 6, 6, 7, 7]],
      ];
  const els = cells.flatMap(([title, value, data], i) => {
    const x = COLS[2].x[i % 2];
    const y = 200 + Math.floor(i / 2) * 236;
    return [
      hair({ id: `sp-r${i}`, x, y, w: COLS[2].w }),
      f.text({ id: `sp-t${i}`, ...ph(demo, title, title), fontSize: 24, lineHeight: 1.2, x, y: y + 12, w: 360, h: 32 }),
      f.text({ id: `sp-v${i}`, ...ph(demo, value, value), fontSize: 30, lineHeight: 1.0, align: "right", x: x + 368, y: y + 10, w: 160, h: 34 },),
      f.chart({ id: `sp-c${i}`, preset: "line", x, y: y + 56, w: COLS[2].w, h: 164, option: sparkOption(data) }),
    ];
  });
  return slide("s-sparks", "Small multiples", "Small multiples. Four sparklines on a 2x2 grid, each with a title and its latest value; no axes, no legend, one series in the accent colour. The eye compares shapes across the four. Keep the same time span in every cell.", [
    ...chrome(),
    ...slideHead(demo, "Eight weeks at a glance"),
    ...els,
  ]);
};

// Stand-in for a screenshot: a wireframe of a sidebar, a header and text rows on a
// cream panel one step off the page, hairline bars and one red bar. Aspect SHOT_ASPECT.
const shotSvg = () => {
  const W = 1088, H = 375;
  const PANEL = "#F7F4EA", SIDEBAR = "#EFEBDF";
  const bar = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  const side = [80, 120, 100, 140, 90, 110].map((w, i) => bar(24, 32 + i * 36, w, 8, HAIR)).join("");
  const rows = [0.9, 0.7, 0.85, 0.5, 0.95, 0.6, 0.8].map((k, i) => bar(280, 92 + i * 36, Math.round(760 * k), 8, HAIR)).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bar(0, 0, W, H, PANEL)}` +
    `${bar(0, 0, 240, H, SIDEBAR)}${side}${bar(280, 32, 400, 12, GREY)}${bar(280, 66, 760, 1, HAIR)}${rows}` +
    `${bar(280, 348, 240, 4, RED)}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

// A faint plotted curve on cream stands in for the figure the user will supply.
const placeholderSvg = () => {
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const x = 160 + i * 15;
    const y = 300 - 150 * Math.exp(-i / 22) * Math.cos(i / 4) - i;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${PAPER}"/><line x1="160" y1="100" x2="160" y2="420" stroke="${HAIR}" stroke-width="1"/><line x1="160" y1="420" x2="1120" y2="420" stroke="${HAIR}" stroke-width="1"/><polyline points="${pts.join(" ")}" fill="none" stroke="#8A867C" stroke-width="2"/></svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, sparklines, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-tufte-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Tufte",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "tufte, data, serif, charts, evals" },
    theme: {
      background: PAPER,
      color: INK,
      accent: RED,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: INK, tx2: GREY, accent2: INK, accent3: GREY, accent4: HAIR, hlink: RED },
      chartPalette: [RED, INK, GREY],
      table: { headerBg: PAPER, headerColor: INK, borderColor: HAIR, borderWidth: 1, fontSize: 24, color: INK, radius: 0 },
    },
    fonts: [
      { family: "EB Garamond", asset: "eb-garamond", weight: "400 700" },
      { family: "EB Garamond", asset: "eb-garamond-italic", weight: "400 700", style: "italic" },
    ],
    assets: {
      "eb-garamond": dataUri(join(root, "fonts", "eb-garamond-latin.woff2")),
      "eb-garamond-italic": dataUri(join(root, "fonts", "eb-garamond-italic-latin.woff2")),
      placeholder: placeholderSvg(),
      shot: shotSvg(),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
