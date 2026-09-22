// Mono: a well-set terminal. One monospace face (JetBrains Mono), one accent
// used for the prompt glyph, the block cursor and the chart's first series. No
// scanlines, glow or animation: the ids stay stable so a morph can be switched
// on later. The recurring mark is a block cursor ("mark") sized 0.6em x 1.1em
// of the text beside it, and a ">" prompt glyph ("prompt") in the accent.
// Two palettes share every builder: DARK (this theme) and LIGHT (themes/mono-light).
import { join } from "node:path";
import { COLS, dataUri, factory } from "../../scripts/lib.mjs";

// Ratios on GROUND: TEXT 14.9, GREY 7.1, ACCENT 13.1; on PANEL: GREY 6.3, STRING 9.4; GROUND on ACCENT 13.1.
export const DARK = {
  GROUND: "#0F1114",
  TEXT: "#E6E4DC",
  GREY: "#9A9FA6",
  HAIR: "#2A2D33",
  PANEL: "#1A1D22",
  HEADER: "#22262C",
  ACCENT: "#5DF28A",
  STRING: "#C4C1B8",
  keywords: "mono, terminal, monospace, dark, engineering",
};

const FONT = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";
// JetBrains Mono advances 0.6em per glyph, so widths of fixed strings are exact.
const CH = 0.6;

export function makeMono({ GROUND, TEXT, GREY, HAIR, PANEL, HEADER, ACCENT, STRING, keywords }, { root, title, slug }) {
  const t = { fontFamily: FONT, color: TEXT, accent: ACCENT };
  const f = factory(t);

  // Type scale (px): display 72, section 64, heading 36, lead 26, body 22, caption 18, status 16.
  // Body is 22 for projectors and video calls; captions and number labels take 18, the floor is 14.
  const display = (o) => f.text({ fontSize: 72, fontWeight: 700, lineHeight: 1.1, ...o });
  const heading = (o) => f.text({ fontSize: 36, fontWeight: 700, lineHeight: 1.15, ...o });
  const lead = (o) => f.text({ fontSize: 26, fontWeight: 700, lineHeight: 1.2, ...o });
  const body = (o) => f.text({ fontSize: 22, lineHeight: 1.45, ...o });
  const caption = (o) => f.text({ fontSize: 18, lineHeight: 1.45, color: GREY, ...o });
  const status = (o) => f.text({ fontSize: 16, lineHeight: 1.3, color: GREY, ...o });
  const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
  // The ">" prompt glyph is a chevron path rather than text, so layouts can carry
  // it as furniture (assertDoc treats literal text in a layout as user copy).
  // size is the font size of the line it sits on; cy is that line's vertical centre.
  const prompt = (size, x, cy, o = {}) => {
    const w = Math.round(size * 0.42);
    const h = Math.round(size * 0.5);
    const sw = Math.max(2, Math.round(size * 0.1));
    const i = sw / 2;
    return f.path({
      id: "prompt",
      d: `M${i} ${i} L${w - i} ${h / 2} L${i} ${h - i}`,
      pathBox: [0, 0, w, h],
      fill: "transparent",
      stroke: ACCENT,
      strokeWidth: sw,
      x,
      y: Math.round(cy - h / 2),
      w,
      h,
      ...o,
    });
  };
  // Centre of the first line of a top-aligned text box.
  const firstLine = (y, size, lh) => y + (size * lh) / 2;
  const cursor = (size, o) => f.rect({ id: "mark", w: Math.round(size * CH), h: Math.round(size * 1.1), ...o });

  const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

  // Status bar on every content slide: hairline, deck title, page number and a cursor.
  const chrome = ({ inverted = false, mark = true } = {}) => {
    const ink = inverted ? GROUND : TEXT;
    return [
      hair({ id: "foot-rule", x: 96, y: 644, w: 1088, fill: inverted ? GROUND : HAIR, opacity: inverted ? 0.3 : 1 }),
      status({ id: "run-title", html: "{{title}}", color: inverted ? GROUND : GREY, x: 96, y: 660, w: 700, h: 22 }),
      status({ id: "run-page", html: "{{page:2}}", color: ink, align: "right", x: 944, y: 660, w: 220, h: 22 }),
      ...(mark ? [cursor(16, { x: 1174, y: 662, fill: inverted ? GROUND : ACCENT })] : []),
    ];
  };

  const slideHead = (demo, html, placeholder = "Slide title") => [
    heading({ id: "slide-head", ...ph(demo, html, placeholder), x: 96, y: 88, w: 1088, h: 48 }),
    hair({ id: "head-rule", x: 96, y: 152, w: 1088 }),
  ];

  const cover = (demo) => ({
    id: "s-cover",
    name: "Cover",
    background: GROUND,
    transition: "none",
    notes:
      "Cover. Title and company fill from File > Properties. The date is a literal so it records when the deck was written; {{date}} would show the day it is presented. An idle prompt line (glyph and block cursor) sits above the title; the two marks recur through the deck: 16px in the status bar, after the section number and as a large block on the closing slide.",
    elements: [
      hair({ id: "foot-rule", x: 96, y: 644, w: 1088 }),
      status({ id: "run-title", html: "{{company}}", x: 96, y: 660, w: 700, h: 22 }),
      status({ id: "run-page", ...ph(demo, "2026-09-22", "Date"), color: TEXT, align: "right", x: 944, y: 660, w: 240, h: 22 }),
      prompt(72, 96, 236),
      cursor(72, { x: 160, y: 199, h: 74 }),
      display({ id: "deck-title", html: "{{title}}", x: 96, y: 300, w: 1088, h: 160 }),
      body({ id: "cover-sub", ...ph(demo, "A slide template for engineering talks", "Subtitle, event or client"), fontSize: 24, color: GREY, x: 96, y: 484, w: 1088, h: 36 }),
    ],
  });

  const agenda = (demo) => {
    const items = demo ? ["Where the latency goes", "What we measured", "What we changed", "What is left"] : ["Item one", "Item two", "Item three", "Item four"];
    const rows = items.flatMap((it, i) => {
      const y = 192 + i * 116;
      return [
        f.text({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), fontSize: 26, color: GREY, lineHeight: 1.2, x: 96, y, w: 60, h: 32 }),
        f.text({ id: `ag-t${i}`, ...ph(demo, it, it), fontSize: 26, lineHeight: 1.2, x: 176, y, w: 1008, h: 32 }),
        ...(i < items.length - 1 ? [hair({ id: `ag-r${i}`, x: 96, y: y + 68, w: 1088 })] : []),
      ];
    });
    return {
      id: "s-agenda",
      name: "Agenda",
      background: GROUND,
      transition: "none",
      notes: "Agenda. Line-number numerals in grey, one item per row. Four rows fit; delete rows rather than shrinking the type. The status bar carries the deck title, the page number and the cursor.",
      elements: [...chrome(), ...slideHead(demo, "Agenda", "Agenda"), ...rows],
    };
  };

  const section = (demo) => ({
    id: "s-section",
    name: "Section",
    background: ACCENT,
    transition: "none",
    notes: "Section divider, inverted: accent ground, type in the ground colour. The cursor sits after the section number. Number sections only when the order matters; otherwise delete the numeral and the cursor.",
    elements: [
      ...chrome({ inverted: true, mark: false }),
      display({ id: "sec-num", ...ph(demo, "02", "01"), fontSize: 88, lineHeight: 1.0, color: GROUND, x: 96, y: 168, w: 160, h: 96 }),
      cursor(88, { x: 96 + Math.round(88 * CH * 2) + 14, y: 168, fill: GROUND }),
      f.text({ id: "sec-title", ...ph(demo, "What we measured", "Section title"), fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: GROUND, valign: "bottom", x: 96, y: 300, w: 1088, h: 300 }),
    ],
  });

  const statement = (demo) => ({
    id: "s-statement",
    name: "Statement",
    background: GROUND,
    transition: "none",
    notes: "Statement. One sentence, no bullets. About 120 characters holds at 44px over three lines. The line beneath is for a source or a consequence; delete it if the sentence stands alone.",
    elements: [
      ...chrome(),
      prompt(48, 96, firstLine(212, 48, 1.25)),
      f.text({ id: "stmt", ...ph(demo, "Batch size four halves p95 latency without changing throughput, on the same hardware.", "One idea, one sentence"), fontSize: 48, fontWeight: 700, lineHeight: 1.25, x: 156, y: 212, w: 1028, h: 300 }),
      f.text({ id: "stmt-src", ...ph(demo, "Measured on the staging cluster, September 2026", "Source or context"), fontSize: 20, color: GREY, x: 156, y: 556, w: 1028, h: 30 }),
    ],
  });

  const titleBody = (demo) => ({
    id: "s-body",
    name: "Title and body",
    background: GROUND,
    transition: "none",
    notes: "Title and body. The body column is 816px, about 61 characters a line in the mono face. Use <ul> for bullets. Body stays at 22px; if it does not fit, cut words or split the slide.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Why batch size matters"),
      body({
        id: "body-copy",
        ...ph(
          demo,
          "<p>A decode step runs the whole model once and produces one token per sequence in the batch. The cost is dominated by reading the weights, so eight sequences cost close to one.</p><p>Batching trades a few milliseconds of queueing for a large drop in per-token cost. The trade only pays while the queue is short enough that waiting does not show up in p95.</p><ul><li>Prefill is compute bound and scales with prompt length</li><li>Decode is memory bound and scales with batch size</li><li>Measure both halves before choosing a batch window</li></ul><p>The rest of the deck is the measurement and what it cost.</p>",
          "Body copy",
        ),
        x: 96, y: 184, w: 816, h: 440,
      }),
    ],
  });

  const points = (demo) => {
    const items = demo
      ? [
          ["Prefill", "The prompt is processed in one pass. Cost grows with prompt length, so a long system prompt is paid on every request unless its prefix is cached."],
          ["Decode", "Tokens are generated one step at a time. Each step reads every weight, so adding sequences to the batch is close to free until memory runs out."],
          ["Scheduling", "The batch window decides how long a request waits for company. Five milliseconds is a reasonable start; tune it against p95, not the mean."],
        ]
      : ["Point one", "Point two", "Point three"].map((p) => [p, "Supporting sentence"]);
    const rows = items.flatMap(([h, d], i) => {
      // Rows of 152: 28px above the copy, three 22px lines (96px), 28px below, so the last row ends at 612.
      const y = 184 + i * 152;
      return [
        ...(i > 0 ? [hair({ id: `pt-r${i}`, x: 96, y, w: 1088 })] : []),
        prompt(26, 96, y + 28 + (26 * 1.2) / 2, { id: `pt-g${i}` }),
        lead({ id: `pt-h${i}`, ...ph(demo, h, h), x: 136, y: y + 28, w: 300, h: 64 }),
        body({ id: `pt-d${i}`, ...ph(demo, d, d), x: 470, y: y + 28, w: 714, h: 100 }),
      ];
    });
    return {
      id: "s-points",
      name: "Points",
      background: GROUND,
      transition: "none",
      notes: "Points. Three rows, each a hairline, a prompt glyph, a bold lead and a sentence. Three fill the band; for more, split the slide.",
      elements: [...chrome(), ...slideHead(demo, "Where the time goes"), ...rows],
    };
  };

  const col = (demo, side, head, copy) => {
    const x = COLS[2].x[side === "l" ? 0 : 1];
    return [
      lead({ id: `col-${side}-head`, ...ph(demo, head, side === "l" ? "Left heading" : "Right heading"), x, y: 184, w: COLS[2].w, h: 34 }),
      hair({ id: `col-${side}-rule`, x, y: 234, w: COLS[2].w }),
      body({ id: `col-${side}-body`, ...ph(demo, copy, side === "l" ? "Left body" : "Right body"), x, y: 254, w: COLS[2].w, h: 362 }),
    ];
  };

  const twoCol = (demo) => ({
    id: "s-twocol",
    name: "Two columns",
    background: GROUND,
    transition: "none",
    notes: "Two columns, 528px each with a 32px gutter, about 44 characters a line. Each has a bold lead and a hairline before the body. Suits before/after or problem/response.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Before and after"),
      ...col(demo, "l", "Before", "<p>Every request ran alone. The GPU spent most of each decode step waiting on memory, and utilisation sat under 30 percent at peak.</p><p>p95 latency was 1.9 seconds for a 200 token reply. Adding replicas raised cost in step with traffic.</p><p>Nobody had measured where the time went, so every fix was a guess.</p>"),
      ...col(demo, "r", "After", "<p>Requests queue for up to 5 milliseconds and leave in batches of up to eight. Utilisation at peak is now above 70 percent on the same hardware.</p><p>p95 latency is 1.0 seconds for the same reply. Two replicas were removed and the error rate did not move.</p><p>The benchmark runs in CI, so the next regression is caught before it ships.</p>"),
    ],
  });

  const numbers = (demo) => {
    const stats = demo
      ? [
          ["8", "sequences per batch at peak, up from one"],
          ["-48%", "p95 latency for a 200 token reply"],
          ["2", "replicas removed with no change in error rate"],
        ]
      : [["00", "Label"], ["00", "Label"], ["00", "Label"]];
    const els = stats.flatMap(([v, l], i) => {
      const x = COLS[3].x[i];
      return [
        f.text({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 120, fontWeight: 700, lineHeight: 1.0, color: i === 1 ? ACCENT : TEXT, x, y: 244, w: COLS[3].w, h: 128 }),
        caption({ id: `st-l${i}`, ...ph(demo, l, l), x, y: 392, w: COLS[3].w, h: 56 }),
      ];
    });
    return {
      id: "s-numbers",
      name: "Numbers",
      background: GROUND,
      transition: "none",
      notes: "Headline numbers. One plain number per column at 120px (four characters fit) with a one-line label. Put the accent on the number that matters, at most one. The note at the bottom carries the source or the consequence.",
      elements: [
        ...chrome(),
        ...slideHead(demo, "In numbers"),
        ...els,
        hair({ id: "st-foot-rule", x: 96, y: 540, w: 1088 }),
        caption({ id: "st-note", ...ph(demo, "Measured over one week of production traffic on the same two node pool. Latency is end to end from the gateway, including queueing.", "Source or consequence"), x: 96, y: 556, w: 1088, h: 56 }),
      ],
    };
  };

  const chart = (demo) => ({
    id: "s-chart",
    name: "Chart",
    background: GROUND,
    transition: "none",
    notes: "Chart. Series in the accent, text and grey colours; axes in the hairline colour. Bar and line data are plain numbers; only pie takes {name, value}. The legend must be an object to render. textStyle.fontFamily is set so the chart uses the mono face rather than the browser default.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Inference latency by batch size"),
      f.chart({
        id: "chart-main", preset: "bar", x: 96, y: 184, w: 1088, h: 440,
        option: {
          color: [ACCENT, TEXT, GREY],
          textStyle: { fontFamily: FONT },
          grid: { left: 84, right: 8, top: 44, bottom: 32 },
          legend: { top: 0, textStyle: { color: TEXT, fontSize: 16 } },
          tooltip: { trigger: "axis" },
          xAxis: { type: "category", data: demo ? ["1", "2", "4", "8", "16", "32"] : ["A", "B", "C", "D", "E", "F"], axisLine: { lineStyle: { color: HAIR } }, axisLabel: { color: TEXT, fontSize: 16 } },
          yAxis: { type: "value", axisLine: { lineStyle: { color: GROUND } }, splitLine: { lineStyle: { color: HAIR } }, axisLabel: { color: GREY, fontSize: 14, formatter: "{value} ms" } },
          series: [
            { name: demo ? "p50" : "Series 1", type: "bar", data: [410, 430, 470, 560, 760, 1180], itemStyle: { color: ACCENT } },
            { name: demo ? "p95" : "Series 2", type: "bar", data: [1900, 1420, 990, 1010, 1240, 1710], itemStyle: { color: TEXT } },
            { name: demo ? "Target p95" : "Series 3", type: "line", data: [1000, 1000, 1000, 1000, 1000, 1000], symbol: "none", lineStyle: { color: GREY, width: 2 } },
          ],
        },
      }),
    ],
  });

  const TABLE_STYLE = { headerBg: HEADER, headerColor: TEXT, borderColor: HAIR, borderWidth: 1, cellPadX: 16, cellPadY: 12, fontSize: 20, color: TEXT, radius: 0 };

  const table = (demo) => ({
    id: "s-table",
    name: "Table",
    background: GROUND,
    transition: "none",
    notes: "Comparison table. Header row on the panel colour, one step off the ground, 1px hairlines, no zebra. Tables are for specs and comparisons; a numeric trend belongs in the chart layout.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Serving options"),
      f.table({
        id: "tbl-main", x: 96, y: 184, w: 1088, h: 440,
        columns: [{ w: 1.3 }, { w: 1 }, { w: 1 }, { w: 1.4 }],
        // Demo row 2 (vllm fp8, the batched option the talk recommends) is bold in its first and last cells.
        rows: (demo
          ? [
              ["Runtime", "Quantisation", "Memory", "Tokens per second"],
              ["vllm 0.6", "bf16", "42 GB", "1,240 at batch 8"],
              ["vllm 0.6", "fp8", "23 GB", "1,610 at batch 8"],
              ["llama.cpp", "q8_0", "24 GB", "610 at batch 1"],
              ["llama.cpp", "q4_k_m", "13 GB", "720 at batch 1"],
              ["mlx", "4 bit", "12 GB", "540 at batch 1"],
            ]
          : [["Column", "Column", "Column", "Column"], ["Row", "", "", ""], ["Row", "", "", ""], ["Row", "", "", ""]]
        ).map((r, i) => ({ cells: r.map((html, c) => (demo && i === 2 && (c === 0 || c === 3) ? { html, bold: true } : { html })) })),
        style: TABLE_STYLE,
      }),
    ],
  });

  // Square node on the process track; the ground fill masks the dotted line beneath.
  const node = (o) => f.rect({ fill: GROUND, stroke: TEXT, strokeWidth: 2, w: 44, h: 44, ...o });
  const nodeNum = (o) => f.text({ fontSize: 20, fontWeight: 700, lineHeight: 1, align: "center", valign: "middle", w: 44, h: 44, ...o });

  const process = (demo) => {
    const steps = demo
      ? [
          ["Tokenise", "The prompt becomes token ids. Cached per template, so a repeated prefix is free."],
          ["Prefill", "One pass over the prompt fills the KV cache. Compute bound: time grows with length."],
          ["Decode", "One token per step per sequence. Memory bound, so batching is nearly free."],
          ["Stream", "Tokens leave as they are produced. The client sees output before the reply ends."],
        ]
      : ["Step one", "Step two", "Step three", "Step four"].map((p) => [p, "What happens"]);
    const els = steps.flatMap(([h, d], i) => {
      const x = COLS[4].x[i];
      return [
        // Group is 275px tall (node 44, lead 31, five 22px lines 160, gaps 24 and 16), centred in the 184..616 band.
        node({ id: `pr-k${i}`, x, y: 262 }),
        nodeNum({ id: `pr-n${i}`, html: String(i + 1), x, y: 262 }),
        lead({ id: `pr-t${i}`, ...ph(demo, h, h), x, y: 330, w: COLS[4].w, h: 32 }),
        body({ id: `pr-d${i}`, ...ph(demo, d, d), x, y: 377, w: COLS[4].w, h: 200 }),
      ];
    });
    return {
      id: "s-process",
      name: "Process",
      background: GROUND,
      transition: "none",
      notes: "Process. Four numbered square nodes on a dotted accent track. In the demo, step 2 is clickable: a transparent rect over it links to a state slide, and the left arrow returns.",
      elements: [
        ...chrome(),
        ...slideHead(demo, "How a request is served"),
        f.line({ id: "pr-flow", x: 140, y: 283, w: 812, h: 2, fill: ACCENT, stroke: ACCENT, strokeWidth: 2, strokeStyle: "dotted" }),
        ...els,
        ...(demo
          ? [
              f.rect({ id: "pr-hit1", x: COLS[4].x[1] - 12, y: 184, w: COLS[4].w + 24, h: 440, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
              f.text({ id: "pr-hint", html: "Click step 2 for detail", fontSize: 16, color: GREY, x: COLS[4].x[1], y: 592, w: 254, h: 24 }),
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
      ...slideHead(true, "How a request is served"),
      node({ id: "pr-k1", x: 96, y: 184 }),
      nodeNum({ id: "pr-n1", html: "2", x: 96, y: 184 }),
      lead({ id: "pr-t1", html: "Prefill", x: 96, y: 252, w: 340, h: 32 }),
      body({
        id: "det-body",
        html: "<p>Prefill runs the attention and feed-forward layers over every prompt token at once, writing keys and values into the cache. It is the compute bound half of a request: doubling the prompt roughly doubles the time.</p><p>A shared system prompt can be prefilled once and its cache reused, which is why prefix caching matters more than any decode trick for chat workloads.</p>",
        x: 470, y: 252, w: 714, h: 330,
      }),
      f.text({ id: "det-back", html: "Left arrow returns to the process", fontSize: 16, color: GREY, x: 96, y: 592, w: 400, h: 24 }),
    ],
  });

  const DEMO_CODE = `import asyncio
from collections import deque

queue: deque[Request] = deque()

async def batch(max_size: int = 8, wait_ms: int = 5) -> None:
    while True:
        await asyncio.sleep(wait_ms / 1000)
        if not queue:
            continue
        items = [queue.popleft() for _ in range(min(max_size, len(queue)))]
        await model.generate(items)  # one forward pass per batch`;

  const code = (demo) => ({
    id: "s-code",
    name: "Code",
    background: GROUND,
    transition: "none",
    notes: "Code. A code element on a panel one step off the ground with a one-line caption. Set grammarName to the language (py, sh, js, ts, go, rust, sql, json, yaml, diff). Twelve lines at 22px fill the panel; long lines do not wrap, so keep them under 78 characters. Token colours come from theme.codePalette.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Batching requests"),
      // Panel spans the band from under the title rule to the caption; twelve 22px lines at 1.35 are 356px.
      f.rect({ id: "code-panel", x: 96, y: 184, w: 1088, h: 392, fill: PANEL }),
      {
        id: "code-main", type: "code", x: 120, y: 202, w: 1040, h: 360, rotation: 0, opacity: 1,
        content: demo ? DEMO_CODE : '# paste code here\nprint("hello")',
        grammarName: "py", fontFamily: FONT, fontSize: 22, lineHeight: 1.35, color: TEXT, align: "left", valign: "top",
      },
      caption({ id: "code-caption", ...ph(demo, "Five millisecond batch window; up to eight requests per forward pass.", "Caption"), x: 96, y: 590, w: 1088, h: 26 }),
    ],
  });

  const quote = (demo) => ({
    id: "s-quote",
    name: "Quote",
    background: GROUND,
    transition: "none",
    notes: "Pull quote between two hairlines, about 45 characters a line at 40px, centred vertically so two or four lines both sit evenly. Use a real sentence someone said, with a name.",
    elements: [
      ...chrome(),
      hair({ id: "q-rule-top", x: 96, y: 208, w: 1088, fill: TEXT }),
      f.text({ id: "q-body", ...ph(demo, "Make it work, make it right, make it fast. In that order, and stop when the measurement says you can.", "Quotation"), fontSize: 40, lineHeight: 1.3, valign: "middle", x: 96, y: 232, w: 1088, h: 256 }),
      hair({ id: "q-rule-bottom", x: 96, y: 512, w: 1088, fill: TEXT }),
      f.text({ id: "q-attrib", ...ph(demo, "Kent Beck, paraphrased by the platform team", "Name, source"), fontSize: 20, color: GREY, x: 96, y: 532, w: 1088, h: 30 }),
    ],
  });

  const image = (demo) => ({
    id: "s-image",
    name: "Image",
    background: GROUND,
    transition: "none",
    notes: "Full-bleed image with a scrim in the ground colour and the caption at the bottom left. Replace the placeholder asset with a screenshot or photo downscaled to 2560px before embedding. Keep captions in the text element, since text baked into an image cannot be edited.",
    elements: [
      f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
      f.rect({ id: "hero-scrim", x: 0, y: 0, w: 1280, h: 720, fill: GROUND, opacity: 0.45 }),
      f.text({ id: "hero-title", ...ph(demo, "The trace, captured plainly", "Caption or title"), fontSize: 44, fontWeight: 700, lineHeight: 1.15, valign: "bottom", x: 96, y: 380, w: 900, h: 140 }),
      prompt(22, 96, firstLine(536, 22, 1.45)),
      body({ id: "hero-sub", ...ph(demo, "Replace the placeholder with a screenshot or diagram", "Subtitle"), x: 126, y: 536, w: 900, h: 34 }),
    ],
  });

  // A framed screenshot: panel, a window bar with three dots, the image letterboxed
  // inside on the panel colour. Ids are prefixed so two frames can share a slide.
  const frame = (p, { x, y, w, h }) => [
    f.rect({ id: `${p}-frame`, x, y, w, h, fill: PANEL, stroke: HAIR, strokeWidth: 1 }),
    f.rect({ id: `${p}-bar`, x, y, w, h: 28, fill: HEADER }),
    ...[0, 1, 2].map((i) => f.ellipse({ id: `${p}-dot${i}`, x: x + 12 + i * 16, y: y + 10, w: 8, h: 8, fill: GREY })),
    f.image({ id: `${p}-img`, src: "asset:shot", fit: "contain", x: x + 1, y: y + 28, w: w - 2, h: h - 29 }),
  ];

  const screenshot = (demo) => ({
    id: "s-screenshot",
    name: "Screenshot",
    background: GROUND,
    transition: "none",
    notes: "Screenshot. One large capture in a window frame spanning the band, letterboxed on the panel colour, with a one-line caption. Replace the shot asset with a PNG downscaled to 2560px wide; keep the caption in the text element, since text baked into an image cannot be edited or read by a screen reader.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "The dashboard after batching"),
      ...frame("shot", { x: 96, y: 184, w: 1088, h: 392 }),
      caption({ id: "shot-caption", ...ph(demo, "Grafana, p95 latency panel, one week either side of the change.", "Caption"), x: 96, y: 590, w: 1088, h: 26 }),
    ],
  });

  const screenshotNotes = (demo) => ({
    id: "s-screenshot-notes",
    name: "Screenshot with notes",
    background: GROUND,
    transition: "none",
    notes: "Screenshot with notes. A medium capture on the left (656px) and a bold lead with commentary on the right. Use it when the shot needs reading, not just showing: what to look at, and what it means. Three prompt-glyph points fit in the right column.",
    elements: [
      ...chrome(),
      ...slideHead(demo, "Reading the trace"),
      ...frame("shot", { x: 96, y: 184, w: 656, h: 392 }),
      caption({ id: "shot-caption", ...ph(demo, "Jaeger, one request, 200 token reply.", "Caption"), x: 96, y: 590, w: 656, h: 26 }),
      lead({ id: "shot-lead", ...ph(demo, "Prefill is the wide span", "What to look at"), x: 784, y: 184, w: 400, h: 34 }),
      hair({ id: "shot-rule", x: 784, y: 234, w: 400 }),
      body({
        id: "shot-body",
        ...ph(
          demo,
          "<p>The first span is prefill over a 1,400 token prompt. Nothing else starts until it ends.</p><p>The 40 decode spans after it are short and even: memory bound, cheap to batch.</p><p>The gap before the first token is the 5 ms batch window.</p>",
          "Commentary",
        ),
        x: 784, y: 254, w: 400, h: 362,
      }),
    ],
  });

  const clippings = (demo) => {
    const shots = demo
      ? [
          ["Before", "One connection per request, p95 at 1.9 seconds."],
          ["After", "Batches of eight, p95 at 1.0 seconds on the same nodes."],
        ]
      : [["Left caption", "One sentence on what the clipping shows"], ["Right caption", "One sentence on what the clipping shows"]];
    const els = shots.flatMap(([h, d], i) => {
      const x = COLS[2].x[i];
      const p = i === 0 ? "clip-l" : "clip-r";
      return [
        ...frame(p, { x, y: 184, w: COLS[2].w, h: 300 }),
        lead({ id: `${p}-head`, ...ph(demo, h, h), x, y: 508, w: COLS[2].w, h: 34 }),
        body({ id: `${p}-body`, ...ph(demo, d, d), x, y: 550, w: COLS[2].w, h: 66 }),
      ];
    });
    return {
      id: "s-clippings",
      name: "Two clippings",
      background: GROUND,
      transition: "none",
      notes: "Two clippings. Two medium captures side by side in window frames, each with a bold lead and one sentence. Suits before/after, two tools doing the same job, or a config and its effect. Crop clippings to the same aspect ratio before embedding so the frames match.",
      elements: [...chrome(), ...slideHead(demo, "Before and after, on the dashboard"), ...els],
    };
  };

  const closing = (demo) => ({
    id: "s-closing",
    name: "Closing",
    background: GROUND,
    transition: "none",
    notes: "Closing. The cursor becomes a 216 by 396px block. End on the ask rather than the word Questions. The second line is where to send people: a URL, a name, a date. {{author}} and {{company}} resolve from File > Properties.",
    elements: [
      cursor(360, { x: 968, y: 162 }),
      prompt(48, 96, firstLine(184, 48, 1.25)),
      f.text({ id: "close-line", ...ph(demo, "Run the benchmark before you tune anything.", "The ask"), fontSize: 48, fontWeight: 700, lineHeight: 1.25, x: 156, y: 184, w: 760, h: 300 }),
      body({ id: "close-meta", ...ph(demo, "{{company}}", "Contact or link"), color: GREY, x: 156, y: 526, w: 760, h: 32 }),
    ],
  });

  // A neutral placeholder stands in for the image the user will supply: a dot
  // grid and one waveform in the accent, drawn in code so the file stays small.
  const placeholderSvg = () => {
    const dots = [];
    for (let y = 40; y < 720; y += 40) for (let x = 40; x < 1280; x += 40) dots.push(`<circle cx="${x}" cy="${y}" r="1.5"/>`);
    const wave = [];
    for (let x = 0; x <= 1280; x += 10) wave.push(`${x === 0 ? "M" : "L"}${x} ${(250 + Math.sin(x / 90) * 90 + Math.sin(x / 23) * 24).toFixed(1)}`);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${PANEL}"/>` +
      `<g fill="${ACCENT}" opacity="0.35">${dots.join("")}</g>` +
      `<path d="${wave.join(" ")}" fill="none" stroke="${ACCENT}" stroke-width="2"/></svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  };

  // Stand-in for a screenshot: a wireframe of a sidebar, a header and text rows,
  // in the panel palette with one accent bar. Same aspect as the large frame.
  const shotSvg = () => {
    const W = 1086, H = 363;
    const bar = (x, y, w, h, fill, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" opacity="${o}"/>`;
    const side = [80, 120, 100, 140, 90, 110].map((w, i) => bar(24, 28 + i * 34, w, 10, HAIR)).join("");
    const rows = [0.9, 0.7, 0.85, 0.5, 0.95, 0.6, 0.8].map((k, i) => bar(280, 84 + i * 36, Math.round(760 * k), 10, HAIR)).join("");
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bar(0, 0, W, H, PANEL)}` +
      `${bar(0, 0, 240, H, HEADER)}${side}${bar(280, 28, 400, 14, GREY, 0.6)}${bar(280, 60, 760, 1, HAIR)}${rows}` +
      `${bar(280, 340, 240, 6, ACCENT, 0.8)}</svg>`;
    return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  };

  const builders = [cover, agenda, section, statement, titleBody, points, twoCol, numbers, chart, table, process, code, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-${slug}-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

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
      palette: { bg2: PANEL, tx2: GREY, accent2: TEXT, accent3: GREY, accent4: HAIR, hlink: ACCENT },
      chartPalette: [ACCENT, TEXT, GREY],
      codePalette: { k: ACCENT, f: TEXT, s: STRING, n: TEXT, c: GREY, p: GREY, a: ACCENT, d: GREY },
      table: TABLE_STYLE,
    },
    fonts: [{ family: "JetBrains Mono", asset: "jetbrains-mono", weight: "400 700" }],
    assets: { "jetbrains-mono": dataUri(join(root, "fonts", "jetbrains-mono-latin.woff2")), placeholder: placeholderSvg(), shot: shotSvg() },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}

export default ({ root }) => makeMono(DARK, { root, title: "Mono Dark", slug: "mono-dark" });
