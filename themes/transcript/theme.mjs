// Transcript: slides set as an LLM conversation transcript, for AI engineering talks
// where prompts, responses, tool calls and traces are the evidence. Reads like a
// quiet trace viewer made for projection: a light ground, a mono role label
// (user, assistant, tool, system) in a 128px left gutter, and each turn in a block
// whose fill tells the role apart: white with a hairline for user, a grey tint for
// assistant and tool, a dashed outline for system. Token counts, latency and model
// names sit in small mono metadata at the end of a block. The one teal accent marks
// the turn or span the speaker is talking about (tinted block, 2px outline, teal
// label) and the status dot ("mark") in the header. Hanken Grotesk for turn content,
// JetBrains Mono for roles, metadata, span names and JSON. 64px side margins.
// No animation anywhere: the ids stay stable so a morph can be switched on later.
import { join } from "node:path";
import { columns, dataUri, factory } from "../../scripts/lib.mjs";

// WCAG ratios. On GROUND: INK 16.4, GREY 5.96, ACCENT 5.29, MARK 3.24 (bars only).
// On WHITE: INK 17.6, GREY 6.40, ACCENT 5.67. On TINT: INK 15.1, GREY 5.50, ACCENT 4.88.
// On FOCUS: INK 15.2, GREY 5.52, ACCENT 4.89. WHITE on ACCENT 5.67.
const GROUND = "#F7F7F5";
const WHITE = "#FFFFFF"; // user turns, frames, panels
const TINT = "#EEEEEA"; // assistant and tool turns
const FOCUS = "#E4F1EE"; // the turn under discussion
const INK = "#18191B";
const GREY = "#5C5F66"; // metadata, secondary copy
const MARK = "#868A90"; // span bars and grey chart series
const DASH = "#B4B6B0"; // system turn outline
const HAIR = "#DADAD4";
const SPLIT = "#E7E7E2"; // gridlines
const ACCENT = "#0A7466";
const FONT = "'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";

const M = 64; // side margin
const BAND = 1152;
const RIGHT = M + BAND; // 1216
const GW = 128; // role gutter
const CX = M + GW + 16; // 208, content column
const CW = RIGHT - CX; // 1008
const PAD = 24; // inside a turn block
const TOP = 164; // content band, under a one-line title
const BOTTOM = 664;
const C2 = columns(2, { margin: M, gutter: 24 }); // 564 at 64, 652
const C3 = columns(3, { margin: M, gutter: 24 }); // 368 at 64, 456, 848

const f = factory({ fontFamily: FONT, color: INK, accent: ACCENT });

// Type scale (px). Sans: figures 104, cover 88, statement 68, section 64, closing 56, title 44,
// quote 40, agenda lead 30, subtitle 28, lead 26, system block 24, body 22 (the floor on content slides).
// Mono: span names 22, tool-call code 20, other code 18, role labels 16, metadata and chrome 15.
const head = (o) => f.text({ fontSize: 44, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.8, ...o });
const lead = (o) => f.text({ fontSize: 26, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.3, ...o });
const body = (o) => f.text({ fontSize: 22, lineHeight: 1.45, ...o });
const mono = (o) => f.text({ fontFamily: MONO, fontSize: 16, lineHeight: 1.4, color: GREY, ...o });
const meta = (o) => mono({ fontSize: 15, h: 22, ...o });
const hair = (o) => f.rect({ fill: HAIR, h: 1, ...o });
const code = (o) => ({ type: "code", rotation: 0, opacity: 1, grammarName: "json", fontFamily: MONO, fontSize: 18, lineHeight: 1.45, color: INK, align: "left", valign: "top", ...o });

const ph = (demo, sample, placeholder) => (demo ? { html: sample } : { html: "", placeholder });

// Block styles by role. The focus style marks the one turn the speaker is talking about.
const STYLE = {
  user: { fill: WHITE, stroke: HAIR, strokeWidth: 1 },
  assistant: { fill: TINT },
  tool: { fill: TINT },
  system: { fill: GROUND, stroke: DASH, strokeWidth: 1.5, strokeStyle: "dashed" },
  focus: { fill: FOCUS, stroke: ACCENT, strokeWidth: 2 },
};

// A turn: the block, and its role label in the gutter centred on the first line of copy.
// lineH is the line height of that first line (22px body at 1.45 by default). A focused turn
// takes the accent on block and label; accentLabel puts it on the label alone.
const turn = (demo, p, role, box, { focus = false, accentLabel = focus, kind = role, lineH = 32, textY = box.y + PAD } = {}) => [
  f.rect({ id: `${p}-block`, ...box, radius: 8, ...STYLE[focus ? "focus" : kind] }),
  mono({ id: `${p}-role`, html: role, color: accentLabel ? ACCENT : GREY, fontWeight: accentLabel ? 600 : 400, x: M, y: Math.round(textY + (lineH - 22.4) / 2), w: GW, h: 22 }),
];

// Header on every slide but the image: status dot, deck title, turn number, hairline.
const chrome = (left = "{{title}}") => [
  f.ellipse({ id: "mark", x: M, y: 30, w: 8, h: 8, fill: ACCENT }),
  meta({ id: "run-title", html: left, x: M + 18, y: 23, w: 700 }),
  meta({ id: "run-page", html: "turn {{page:2}}", color: INK, align: "right", x: RIGHT - 240, y: 23, w: 240 }),
  hair({ id: "head-rule", x: M, y: 56, w: BAND }),
];

const slide = (id, name, notes, elements, background = GROUND) => ({ id, name, background, transition: "none", notes, elements });
const content = (id, name, notes, demo, title, els) =>
  slide(id, name, notes, [...chrome(), head({ id: "slide-head", ...ph(demo, title, "Slide title"), x: M, y: 78, w: BAND, h: 52 }), ...els]);

const cover = (demo) =>
  slide("s-cover", "Cover", "Cover. The title is set as the opening user turn and the subtitle as the reply, so the deck starts the way a transcript does. Title and company fill from File > Properties. The date is a literal: {{date}} would show the day the deck is presented. The mono line under the reply is for the event or venue.", [
    ...chrome("{{company}}").map((e) => (e.id === "run-page" ? { ...e, ...ph(demo, "2026-09-23", "Date") } : e)),
    // Title and subtitle are centred in their blocks, and so are the role labels, so one or two lines both sit evenly.
    ...turn(demo, "cover-u", "user", { x: CX, y: 184, w: CW, h: 228 }, { accentLabel: true, lineH: 228, textY: 184 }),
    f.text({ id: "deck-title", html: "{{title}}", fontSize: 88, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2.6, valign: "middle", x: CX + 32, y: 206, w: CW - 64, h: 184 }),
    ...turn(demo, "cover-a", "assistant", { x: CX, y: 428, w: CW, h: 108 }, { lineH: 108, textY: 428 }),
    f.text({ id: "cover-sub", ...ph(demo, "Reading agent traces to find what the eval score hides", "Subtitle or thesis"), fontSize: 28, lineHeight: 1.3, valign: "middle", x: CX + 32, y: 446, w: CW - 64, h: 72 }),
    meta({ id: "cover-meta", ...ph(demo, "Platform engineering meetup, Melbourne", "Event or venue"), fontSize: 16, x: CX, y: 560, w: CW }),
  ]);

// Pass rate by prompt version, v1 to v4.2: the numbers sparkline and the chart both draw it.
const PASS = [64, 67, 71, 71, 71, 82, 86, 88];

// Section lengths in minutes: the agenda prints them and the section map sizes its bars by them.
const SECTIONS = [5, 10, 8, 5];

const agenda = (demo) => {
  const items = demo
    ? [
        ["What the score said", "Pass rate stuck at 71% across three prompt versions"],
        ["What the transcripts said", "58 failures read by hand and sorted by the turn that caused them"],
        ["The fix", "A shorter prompt, a date filter and a rule to cite or decline"],
        ["What we check now", "Trace review is part of the release gate"],
      ].map(([t, d], i) => [t, d, `${SECTIONS[i]} min`])
    : ["one", "two", "three", "four"].map((n) => [`Item ${n}`, "What it covers", "Length"]);
  const pitch = (BOTTOM - TOP) / items.length;
  const rows = items.flatMap(([t, d, m], i) => {
    const y = Math.round(TOP + i * pitch);
    return [
      hair({ id: `ag-r${i}`, x: M, y, w: BAND }),
      mono({ id: `ag-n${i}`, html: String(i + 1).padStart(2, "0"), color: i === 0 ? ACCENT : GREY, fontWeight: 600, x: M, y: y + 30, w: 60, h: 22 }),
      lead({ id: `ag-t${i}`, ...ph(demo, t, t), fontSize: 30, x: CX, y: y + 22, w: CW - 160, h: 40 }),
      body({ id: `ag-d${i}`, ...ph(demo, d, d), color: GREY, x: CX, y: y + 66, w: CW - 160, h: 32 }),
      meta({ id: `ag-m${i}`, ...ph(demo, m, m), align: "right", x: RIGHT - 140, y: y + 30, w: 140 }),
    ];
  });
  return content("s-agenda", "Agenda", "Agenda. One row per section: a mono index in the gutter, a lead, one line on what it covers and a length on the right, like a trace's span list. The first index is in the accent; move it to the section you are in if you reuse the slide. Four rows fill the band; delete one rather than shrinking the type.", demo, "Agenda", rows);
};

// Section map: one bar per section, widths in proportion to their length, the current one in the accent.
const sectionMap = (current) => {
  const gap = 8;
  const total = SECTIONS.reduce((a, b) => a + b, 0);
  let x = CX;
  return SECTIONS.map((n, i) => {
    const w = Math.round(((CW - gap * (SECTIONS.length - 1)) * n) / total);
    const bar = f.rect({ id: `sec-bar${i}`, x, y: 588, w, h: 10, radius: 5, fill: i === current ? ACCENT : HAIR });
    x += w + gap;
    return bar;
  });
};

const section = (demo) =>
  slide("s-section", "Section", "Section divider, display tier. The number sits in the gutter where a role label would, and the bars at the foot are a map of the talk: one per section, in proportion to its length, with the current section in the accent. Recolour the bars for each divider.", [
    ...chrome(),
    // The title sits on its last line, so the lead follows it closely whether it runs to one line or two.
    mono({ id: "sec-num", ...ph(demo, "02", "01"), fontSize: 28, fontWeight: 600, lineHeight: 1, color: ACCENT, x: M, y: 302, w: GW, h: 30 }),
    f.text({ id: "sec-title", ...ph(demo, "What the transcripts said", "Section title"), fontSize: 64, fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.8, valign: "bottom", x: CX, y: 200, w: CW, h: 150 }),
    body({ id: "sec-lead", ...ph(demo, "The score told us something was wrong. The transcripts told us which turn.", "What this section shows"), fontSize: 28, lineHeight: 1.3, color: GREY, x: CX, y: 374, w: CW, h: 76 }),
    ...sectionMap(1),
  ]);

const statement = (demo) =>
  slide("s-statement", "Statement", "Statement, display tier. One sentence the audience should remember, set as a large assistant turn with the role label in the accent. About 100 characters holds at 68px in three lines. The mono line under the hairline carries the source, like the metadata at the end of a turn.", [
    ...chrome(),
    mono({ id: "stmt-role", html: "assistant", color: ACCENT, fontWeight: 600, x: M, y: 222, w: GW, h: 22 }),
    f.text({ id: "stmt", ...ph(demo, "Every failure we fixed was visible in the transcript and invisible in the score.", "One idea, one sentence"), fontSize: 68, fontWeight: 600, lineHeight: 1.1, letterSpacing: -2, x: CX, y: 196, w: CW, h: 228 }),
    hair({ id: "stmt-rule", x: CX, y: 456, w: CW }),
    mono({ id: "stmt-src", ...ph(demo, "58 failing cases from eval run 377, read by two engineers, August 2026", "Source or context"), x: CX, y: 472, w: CW, h: 44 }),
  ]);

const titleBody = (demo) =>
  content("s-body", "Title and body", "Title and body, set as a system prompt: a dashed outline, the system label in the gutter and a token count at the foot. Body is 24px, never below 22, and the line is held to 900px so it reads. Use <ul> for bullets. If it does not fit, cut words or split the slide.", demo, "What the agent is told", [
    ...turn(demo, "body", "system", { x: CX, y: TOP, w: CW, h: BOTTOM - TOP }),
    body({
      id: "body-copy",
      ...ph(
        demo,
        "<p>You are the billing support agent for Southern Grid Energy. You answer questions about bills, tariffs, payment plans and concessions for residential customers in Victoria and New South Wales.</p><ul><li>Call get_account before you quote any figure from a customer's bill.</li><li>Call get_policy for every rule you state, and cite the page it returns.</li><li>If no page answers the question, say so and offer a callback. Never answer from memory.</li><li>Hand over to a person when the customer mentions hardship, a disconnection notice or a complaint.</li></ul><p>Reply in plain Australian English, in three short paragraphs or fewer.</p>",
        "Body copy",
      ),
      fontSize: 24, x: CX + PAD + 8, y: TOP + PAD, w: 900, h: 432,
    }),
    meta({ id: "body-meta", ...ph(demo, "prompt v4, excerpt · 1,146 tokens in full · cached prefix", "Metadata"), align: "right", x: CX + PAD, y: BOTTOM - PAD - 22, w: CW - PAD * 2 }),
  ]);

// Prompt and response: one user turn and one assistant turn, each with its metadata.
const exchange = (demo) =>
  content("s-exchange", "Prompt and response", "Prompt and response. One user turn and the assistant's reply, each with its metadata in mono at the foot of the block. The reply is the turn under discussion, so it carries the accent outline; move the focus style to the user turn if the prompt is the point. The reply block holds about seven lines at 22px.", demo, "One case from the eval set", [
    ...turn(demo, "ex-u", "user", { x: CX, y: TOP, w: CW, h: 132 }),
    body({ id: "ex-u-body", ...ph(demo, "My bill went up this quarter and I haven't changed plans. Why, and can I pay the \\$180 increase off over three months?", "Prompt"), x: CX + PAD + 8, y: TOP + PAD, w: CW - 64, h: 64 }),
    meta({ id: "ex-u-meta", ...ph(demo, "case 118 · 38 tokens", "Metadata"), align: "right", x: CX + PAD, y: TOP + 132 - PAD - 18, w: CW - PAD * 2 }),
    ...turn(demo, "ex-a", "assistant", { x: CX, y: TOP + 148, w: CW, h: BOTTOM - TOP - 148 }, { focus: true }),
    body({
      id: "ex-a-body",
      ...ph(
        demo,
        "<p>Two things changed. Your usage rose from 1,284 kWh to 1,712 kWh as heating started in winter. The usage rate also went from 29.4 to 31.9 cents per kWh on 1 July, when the 2026-27 tariffs began.</p><p>Yes, you can pay it over three months. I can set up a plan of \\$60 a month with no fees, with the first payment due on 15 October.</p><p>Sources: Residential tariffs 2026-27, Payment plans.</p>",
        "Response",
      ),
      x: CX + PAD + 8, y: TOP + 148 + PAD, w: CW - 64, h: 272,
    }),
    meta({ id: "ex-a-meta", ...ph(demo, "claude-sonnet-5 · 128 tokens · 2.26 s · judge: pass", "Metadata"), color: ACCENT, align: "right", x: CX + PAD, y: BOTTOM - PAD - 18, w: CW - PAD * 2 }),
  ]);

const CALL = `{
  "type": "tool_use",
  "name": "get_usage",
  "input": { "account_id": "SGE-4471-092", "quarters": 2 }
}`;
const RESULT = `{
  "q2_kwh": 1284, "q3_kwh": 1712,
  "rate_c_kwh": { "q2": 29.4, "q3": 31.9 },
  "tariff_change": "2026-07-01"
}`;

// Tool call: an assistant turn, the JSON call it made and the result that came back.
// Code is 20px at 1.45 (29px a line). The call block fits its four lines; the result block takes the rest of the band.
const CODE_LINE = 29;
const toolCall = (demo) => {
  const ya = TOP, ha = 80, gap = 14;
  const yc = ya + ha + gap, hc = CODE_LINE * 4 + PAD * 2;
  const yr = yc + hc + gap, hr = BOTTOM - yr;
  return content("s-toolcall", "Tool call", "Tool call. The assistant's line, the tool_use block it emitted as a code element, and the tool_result that came back. JSON is set in mono with grey punctuation; keep lines under 80 characters, since code does not wrap. The call is the turn under discussion, so it carries the accent outline. Timings and token counts sit top right in each block.", demo, "The call that answered it", [
    ...turn(demo, "tc-a", "assistant", { x: CX, y: ya, w: CW, h: ha }),
    body({ id: "tc-a-body", ...ph(demo, "I'll pull two quarters of usage before explaining the change.", "Assistant turn"), x: CX + PAD + 8, y: ya + PAD, w: CW - 320, h: 32 }),
    meta({ id: "tc-a-meta", ...ph(demo, "claude-sonnet-5 · 0.84 s", "Metadata"), align: "right", x: RIGHT - PAD - 260, y: ya + PAD + 5, w: 260 }),
    ...turn(demo, "tc-c", "tool_use", { x: CX, y: yc, w: CW, h: hc }, { focus: true, kind: "tool", lineH: CODE_LINE, textY: yc + PAD }),
    code({ id: "tc-c-code", content: demo ? CALL : '{\n  "name": "tool_name",\n  "input": {}\n}', fontSize: 20, x: CX + PAD + 8, y: yc + PAD, w: CW - 270, h: CODE_LINE * 4 }),
    meta({ id: "tc-c-meta", ...ph(demo, "toolu_01H8 · 26 tokens", "Metadata"), color: ACCENT, align: "right", x: RIGHT - PAD - 210, y: yc + PAD + 4, w: 210 }),
    ...turn(demo, "tc-r", "tool_result", { x: CX, y: yr, w: CW, h: hr }, { kind: "tool", lineH: CODE_LINE, textY: yr + PAD }),
    code({ id: "tc-r-code", content: demo ? RESULT : '{ "result": "" }', fontSize: 20, x: CX + PAD + 8, y: yr + PAD, w: CW - 270, h: hr - PAD * 2 }),
    meta({ id: "tc-r-meta", ...ph(demo, "get_usage · 180 ms · 64 tokens", "Metadata"), align: "right", x: RIGHT - PAD - 280, y: yr + PAD + 4, w: 280 }),
  ]);
};

const points = (demo) => {
  const items = demo
    ? [
        ["system", "Rules buried in a 7,400 token prompt", "The full tariff schedule was pasted into the prompt. The concession rule sat at token 6,100 and was applied in 4 of 12 cases.", "12 of 58 failures"],
        ["tool", "Search returned last year's tariff", "get_policy ranked the 2025-26 page first for any question about rates, and the agent quoted it with full confidence.", "31 of 58 failures"],
        ["assistant", "Answers without a source", "When no page matched, the agent answered from memory instead of saying so, and quoted rules that had since changed.", "15 of 58 failures"],
      ]
    : ["one", "two", "three"].map((n) => ["assistant", `Point ${n}`, "Supporting sentence", "Metadata"]);
  const h = (BOTTOM - TOP - 32) / 3;
  const rows = items.flatMap(([role, t, d, m], i) => {
    const y = Math.round(TOP + i * (h + 16));
    const focus = i === 1;
    return [
      ...turn(demo, `pt-${i}`, role, { x: CX, y, w: CW, h }, { focus, lineH: 34, textY: y + 22 }),
      lead({ id: `pt-h${i}`, ...ph(demo, t, t), x: CX + PAD + 8, y: y + 22, w: CW - 300, h: 34 }),
      meta({ id: `pt-m${i}`, ...ph(demo, m, m), color: focus ? ACCENT : GREY, fontWeight: focus ? 600 : 400, align: "right", x: RIGHT - PAD - 240, y: y + 28, w: 240 }),
      body({ id: `pt-d${i}`, ...ph(demo, d, d), color: INK, x: CX + PAD + 8, y: y + 62, w: CW - 64, h: 64 }),
    ];
  });
  return content("s-points", "Points", "Points, set as three turns. The gutter label says where each point lives (system, tool or assistant turn), the mono figure on the right says how much it matters, and the turn under discussion takes the accent. Three rows fill the band: a lead and up to two lines each.", demo, "Where the 58 failures came from", rows);
};

// Two columns: an eval diff. One shared prompt, then two responses side by side.
const twoCol = (demo) => {
  const yp = TOP, hp = 80;
  const y = yp + hp + 16, hc = BOTTOM - y;
  const w = (CW - 16) / 2;
  const cols = demo
    ? [
        ["l", "Prompt v3", "judge: fail", "Yes. Pensioners get 17.5% off their electricity bill. I've added the concession to your account and you'll see it on your next bill.", "claude-sonnet-5 · 41 tokens · 1.8 s"],
        ["r", "Prompt v4", "judge: pass", "You're likely eligible. The Victorian Annual Electricity Concession takes 17.5% off usage and supply charges for Pensioner Concession Card holders. I can't add it from chat: add your card under My Account, then Concessions. Source: Concessions and rebates.", "claude-sonnet-5 · 74 tokens · 2.0 s"],
      ]
    : [
        ["l", "Left heading", "Verdict", "Left body", "Metadata"],
        ["r", "Right heading", "Verdict", "Right body", "Metadata"],
      ];
  const els = cols.flatMap(([s, hd, v, copy, m], i) => {
    const x = CX + i * (w + 16);
    const focus = i === 1;
    return [
      f.rect({ id: `col-${s}-block`, x, y, w, h: hc, radius: 8, ...STYLE[focus ? "focus" : "assistant"] }),
      f.text({ id: `col-${s}-head`, ...ph(demo, hd, hd), fontSize: 22, fontWeight: 600, lineHeight: 1.3, x: x + PAD, y: y + 20, w: w - 170, h: 30 }),
      meta({ id: `col-${s}-verdict`, ...ph(demo, v, v), color: focus ? ACCENT : GREY, fontWeight: 600, align: "right", x: x + w - PAD - 140, y: y + 24, w: 140 }),
      hair({ id: `col-${s}-rule`, x: x + PAD, y: y + 64, w: w - PAD * 2, fill: focus ? ACCENT : HAIR }),
      body({ id: `col-${s}-body`, ...ph(demo, copy, copy), x: x + PAD, y: y + 82, w: w - PAD * 2, h: hc - 82 - 58 }),
      meta({ id: `col-${s}-meta`, ...ph(demo, m, m), x: x + PAD, y: y + hc - PAD - 20, w: w - PAD * 2 }),
    ];
  });
  return content("s-twocol", "Two columns", "Two columns, set as an eval diff: one shared prompt, then two responses side by side with the judge's verdict top right and the model, tokens and latency at the foot. The response the argument favours takes the accent outline. Each column holds about eight lines at 22px.", demo, "Same case, two prompt versions", [
    ...turn(demo, "tw-u", "user", { x: CX, y: yp, w: CW, h: hp }),
    body({ id: "tw-u-body", ...ph(demo, "I have a pension card. Can I get a discount on my electricity bill?", "Shared prompt"), x: CX + PAD + 8, y: yp + PAD, w: CW - 260, h: 32 }),
    meta({ id: "tw-u-meta", ...ph(demo, "case 047", "Metadata"), align: "right", x: RIGHT - PAD - 200, y: yp + PAD + 5, w: 200 }),
    mono({ id: "tw-a-role", html: "assistant", x: M, y: y + 24, w: GW, h: 22 }),
    ...els,
  ]);
};

// A sparkline path through the data, stretched into its box.
const spark = (id, data, box, color) => {
  const lo = Math.min(...data), hi = Math.max(...data);
  const pts = data.map((v, i) => `${i ? "L" : "M"}${((i * 100) / (data.length - 1)).toFixed(1)} ${(4 + ((hi - v) * 92) / (hi - lo)).toFixed(1)}`);
  return f.path({ id, d: pts.join(" "), pathBox: [0, 0, 100, 100], fill: "transparent", stroke: color, strokeWidth: 3, ...box });
};

const numbers = (demo) => {
  const stats = demo
    ? [
        ["pass rate", "88%", "on 200 cases, up from 71% with prompt v3", PASS],
        ["p95 latency", "3.9 s", "per task, down from 6.4 s", [7.1, 6.8, 6.6, 6.4, 6.2, 4.6, 4.1, 3.9]],
        ["tokens per task", "9.6k", "down from 18.2k once the tariff schedule left the prompt", [21.4, 20.1, 19.0, 18.2, 17.9, 11.2, 10.1, 9.6]],
      ]
    : [0, 1, 2].map(() => ["metric", "00", "What the figure measures", [3, 4, 3, 5, 4, 6, 5, 7]]);
  const th = 420;
  const els = stats.flatMap(([k, v, l, data], i) => {
    const x = C3.x[i];
    const key = i === 0;
    return [
      f.rect({ id: `st-r${i}`, x, y: TOP, w: C3.w, h: th, radius: 8, fill: WHITE, stroke: key ? ACCENT : HAIR, strokeWidth: key ? 2 : 1 }),
      mono({ id: `st-k${i}`, ...ph(demo, k, "metric"), color: key ? ACCENT : GREY, fontWeight: 600, x: x + PAD, y: TOP + 24, w: C3.w - PAD * 2, h: 22 }),
      f.text({ id: `st-v${i}`, ...ph(demo, v, v), fontSize: 104, fontWeight: 600, lineHeight: 1, letterSpacing: -3, color: key ? ACCENT : INK, x: x + PAD - 4, y: TOP + 62, w: C3.w - PAD * 2, h: 108 }),
      body({ id: `st-l${i}`, ...ph(demo, l, l), x: x + PAD, y: TOP + 184, w: C3.w - PAD * 2, h: 64 }),
      hair({ id: `st-sr${i}`, x: x + PAD, y: TOP + 272, w: C3.w - PAD * 2, fill: SPLIT }),
      spark(`st-sp${i}`, data, { x: x + PAD, y: TOP + 292, w: C3.w - PAD * 2, h: 96 }, key ? ACCENT : MARK),
    ];
  });
  return content("s-numbers", "Numbers", "Numbers, set as trace metrics: three panels, each with a mono metric name, the figure, one line of context and a sparkline over the last eight runs. The metric the argument is about takes the accent. Sparklines are paths drawn from the data in theme.mjs; redraw or delete them when the numbers change. The mono note carries the source.", demo, "Prompt v4 against v3, per task", [
    ...els,
    hair({ id: "st-foot-rule", x: M, y: 604, w: BAND }),
    mono({ id: "st-note", ...ph(demo, "Eval run 412, 18 September 2026: 200 recorded support cases, judged by a rubric model and spot-checked by two people.", "Source"), x: M, y: 616, w: BAND, h: 44 }),
  ]);
};

// Chart plot box, so direct labels can sit beside the last point of each series.
const CH = { x: M, y: TOP, w: BAND, h: 440, left: 64, right: 250, top: 28, bottom: 36, min: 50, max: 100 };
const plotY = (v) => CH.y + CH.h - CH.bottom - ((v - CH.min) / (CH.max - CH.min)) * (CH.h - CH.top - CH.bottom);
const plotX = (i, n) => CH.x + CH.left + ((i + 0.5) * (CH.w - CH.left - CH.right)) / n;

const chart = (demo) => {
  const xs = ["v1", "v2", "v3", "v3.1", "v3.2", "v4", "v4.1", "v4.2"];
  const series = [
    [demo ? "All cases" : "Highlighted series", PASS, ACCENT],
    [demo ? "Without tariff questions" : "Comparison series", [80, 83, 85, 86, 86, 87, 88, 89], MARK],
  ];
  const labels = series.map(([name, data], i) => {
    const last = data[data.length - 1];
    // The two series end close together, so the grey label sits above its point and the accent label below.
    return mono({ id: `chart-lab${i}`, ...ph(demo, `${name}<br>${last}%`, i ? "Comparison label" : "Highlighted label"), fontWeight: 600, color: i ? GREY : ACCENT, x: CH.x + CH.w - CH.right + 16, y: Math.round(i ? plotY(last) - 52 : plotY(last) + 8), w: CH.right - 16, h: 44 });
  });
  const x5 = Math.round(plotX(5, xs.length));
  const axis = { color: GREY, fontSize: 15 };
  return content("s-chart", "Chart", "Chart. The series the argument is about is the accent; every other series is grey. Each series is labelled at its last point in mono instead of a legend; move the label boxes if the data changes. Gridlines are a pale hairline because charts-lite ignores splitLine.show. The vertical line marks when the change landed.", demo, "Pass rate by prompt version", [
    f.chart({
      id: "chart-main", preset: "line", x: CH.x, y: CH.y, w: CH.w, h: CH.h,
      option: {
        textStyle: { fontFamily: MONO },
        grid: { left: CH.left, right: CH.right, top: CH.top, bottom: CH.bottom },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: demo ? xs : xs.map((_, i) => String(i + 1)), axisLine: { lineStyle: { color: MARK, width: 1 } }, axisLabel: axis },
        yAxis: { type: "value", min: CH.min, max: CH.max, axisLine: { lineStyle: { color: GROUND } }, splitLine: { lineStyle: { color: SPLIT, width: 1 } }, axisLabel: { ...axis, formatter: "{value}%" } },
        series: series.map(([name, data, color]) => ({ name, type: "line", data, symbol: "circle", symbolSize: color === ACCENT ? 8 : 6, lineStyle: { color, width: color === ACCENT ? 4 : 2 }, itemStyle: { color } })).reverse(),
      },
    }),
    ...labels,
    f.rect({ id: "chart-event", x: x5, y: CH.y + CH.top, w: 1, h: CH.h - CH.top - CH.bottom, fill: MARK }),
    meta({ id: "chart-event-lab", ...ph(demo, "date filter on", "Event"), color: INK, fontWeight: 600, x: x5 + 10, y: CH.y + 2, w: 200 }),
    mono({ id: "chart-src", ...ph(demo, "Mean of three runs per version on the 200-case set. Tariff questions are 64 of the 200.", "Source"), x: M, y: 624, w: BAND, h: 22 }),
  ]);
};

const TABLE_ROW = 72;
const KEY_ROW = 2;
const table = (demo) => {
  const data = demo
    ? [
        ["Configuration", "Pass rate", "p95 latency", "Tokens per task", "Cost per 1k tasks"],
        ["v3, tariff schedule in prompt", "71%", "6.4 s", "18.2k", "AUD 84"],
        ["v4, sonnet", "88%", "3.9 s", "9.6k", "AUD 46"],
        ["v4, haiku", "81%", "1.7 s", "9.9k", "AUD 14"],
        ["v4, sonnet, no date filter", "76%", "3.8 s", "9.7k", "AUD 47"],
        ["v4, sonnet, no citation rule", "83%", "3.7 s", "9.1k", "AUD 44"],
      ]
    : [["Column", "Column", "Column", "Column", "Column"], ...[1, 2, 3, 4, 5].map(() => ["Row", "", "", "", ""])];
  const rows = data.map((r, i) => ({
    cells: r.map((html, c) => ({ html, ...(c ? { align: "right" } : {}), ...(i === KEY_ROW ? { bg: FOCUS, ...(c === 0 || c === 1 ? { color: ACCENT, bold: true } : {}) } : {}) })),
  }));
  const y = (i) => TOP + i * TABLE_ROW;
  return content("s-table", "Table", "Table. A borderless table with hairlines drawn over the row boundaries (rows are uniform, so the pitch is height / rows) and an ink rule under the header. The row under discussion takes the focus tint and its key cells the accent. Numeric columns sit flush right. The mono note says how to read it.", demo, "Prompt v4 against its ablations", [
    f.table({
      id: "tbl-main", x: M, y: TOP, w: BAND, h: TABLE_ROW * data.length,
      columns: [{ w: 2.6 }, { w: 1 }, { w: 1.1 }, { w: 1.3 }, { w: 1.5 }],
      rows,
      style: { headerBg: GROUND, headerColor: INK, borderColor: GROUND, borderWidth: 0, cellPadX: 16, cellPadY: 18, fontSize: 22, color: INK, radius: 0 },
    }),
    f.rect({ id: "tbl-rule-head", x: M, y: y(1), w: BAND, h: 1, fill: INK }),
    ...[2, 3, 4, 5, 6].map((i) => hair({ id: `tbl-rule${i}`, x: M, y: y(i), w: BAND })),
    mono({ id: "tbl-note", ...ph(demo, "Eval run 412, 200 cases, mean of three runs. Removing the date filter costs 12 points; removing the citation rule costs 5 and saves almost nothing.", "Source or reading of the table"), x: M, y: 612, w: BAND, h: 44 }),
  ]);
};

// Process: an agent loop as a trace waterfall. Spans are rows; bars sit on a shared time axis.
const SPANS = [
  ["plan", "llm", "Reads the question, picks two tools", 0, 0.84],
  ["get_policy", "tool", "Searches the policy index", 0.84, 0.62],
  ["get_usage", "tool", "Reads two quarters of meter data", 1.46, 0.18],
  ["answer", "llm", "Writes the reply with citations", 1.64, 2.26],
];
const KEY_SPAN = 1;
const TX = 592; // time axis origin
const PX_S = 136; // pixels per second
const ROW = 104;
const rowY = (i) => 200 + i * ROW;

const spanRow = (demo, i, [name, kind, d, start, dur], ry, key) => {
  const bx = TX + Math.round(start * PX_S);
  const bw = Math.max(6, Math.round(dur * PX_S));
  return [
    mono({ id: `pr-n${i}`, html: String(i + 1).padStart(2, "0"), color: key ? ACCENT : GREY, fontWeight: 600, x: M, y: ry + 22, w: 40, h: 22 }),
    mono({ id: `pr-t${i}`, ...ph(demo, name, `span_${i + 1}`), fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: key ? ACCENT : INK, x: 112, y: ry + 16, w: 300, h: 30 }),
    meta({ id: `pr-k${i}`, ...ph(demo, kind, "kind"), align: "right", x: TX - 124, y: ry + 20, w: 100 }),
    body({ id: `pr-d${i}`, ...ph(demo, d, "What happens"), color: GREY, x: 112, y: ry + 52, w: TX - 136, h: 32 }),
    f.rect({ id: `pr-s${i}`, x: bx, y: ry + 20, w: bw, h: 28, radius: 4, fill: key ? ACCENT : MARK }),
    meta({ id: `pr-v${i}`, ...ph(demo, `${dur.toFixed(2)} s`, "0.00 s"), color: key ? ACCENT : INK, fontWeight: key ? 600 : 400, x: bx + bw + 10, y: ry + 23, w: 80 }),
  ];
};

const timeAxis = (demo, y0, y1) =>
  [0, 1, 2, 3, 4].flatMap((s) => [
    f.rect({ id: `pr-grid${s}`, x: TX + s * PX_S, y: y0, w: 1, h: y1 - y0, fill: SPLIT }),
    meta({ id: `pr-x${s}`, ...ph(demo, `${s} s`, `${s} s`), align: s ? "center" : "left", x: s ? TX + s * PX_S - 30 : TX, y: TOP, w: 60 }),
  ]);

const process = (demo) => {
  const spans = demo ? SPANS : SPANS.map(([, , , s, d], i) => [`span_${i + 1}`, "kind", "What happens", s, d]);
  return content("s-process", "Process", "Process, set as a trace waterfall: one row per span with its name, kind and one line on what it does, and a bar on a shared time axis. The span under discussion takes the accent. Bar positions are computed in theme.mjs from start and duration (136px per second). In the demo the get_policy row is clickable: a transparent rect links to a state slide that opens the span, and the left arrow returns.", demo, "One task, as a trace", [
    ...timeAxis(demo, 192, rowY(4)),
    ...spans.flatMap((s, i) => [...(i ? [hair({ id: `pr-r${i}`, x: M, y: rowY(i), w: BAND })] : []), ...spanRow(demo, i, s, rowY(i), i === KEY_SPAN)]),
    ...(demo
      ? [
          f.rect({ id: "pr-hit1", x: M, y: rowY(KEY_SPAN), w: BAND, h: ROW, fill: "rgba(0,0,0,0)", link: "s-process-detail" }),
          meta({ id: "pr-hint", html: "Click get_policy to open the span", x: M, y: 630, w: 500 }),
        ]
      : []),
  ]);
};

const DET_OUT = `[
  { "page": "Residential tariffs 2026-27", "score": 0.91 },
  { "page": "Payment plans", "score": 0.79 },
  { "page": "Concessions and rebates", "score": 0.64 }
]`;

const processDetail = () => {
  const py = 284, ph2 = 316; // panel starts under the span row's description
  return {
    ...content("s-process-detail", "Process detail", "State slide for the get_policy span (hidden from the arrow-key sequence, reached by clicking the span). It keeps the span row and opens it like a trace viewer's span panel: inputs on the left, output as JSON on the right, and what it means underneath. Left arrow returns to the waterfall.", true, "One task, as a trace", [
      ...timeAxis(true, 192, 236),
      ...spanRow(true, KEY_SPAN, SPANS[KEY_SPAN], 184, true),
      f.rect({ id: "det-panel", x: M, y: py, w: BAND, h: ph2, radius: 8, fill: WHITE, stroke: ACCENT, strokeWidth: 2 }),
      mono({ id: "det-k", html: "query<br>filter<br>top_k<br>index<br>latency", lineHeight: 2, x: M + PAD, y: py + 20, w: 84, h: 160 }),
      mono({ id: "det-v", html: "residential usage rate payment plan<br>effective_to &gt;= today<br>3<br>policy-pages-v12<br>620 ms", lineHeight: 2, color: INK, x: M + PAD + 88, y: py + 20, w: 348, h: 160 }),
      f.rect({ id: "det-split", x: 536, y: py + 24, w: 1, h: 152, fill: HAIR }),
      code({ id: "det-code", content: DET_OUT, x: 556, y: py + 28, w: RIGHT - 556 - PAD, h: 130 }),
      hair({ id: "det-rule", x: M + PAD, y: py + 200, w: BAND - PAD * 2 }),
      body({ id: "det-body", html: "Before v4 the index had no date filter, so the 2025-26 tariff page often outranked the current one by a few hundredths. The filter took it off the list and cleared 31 of the 58 failures.", x: M + PAD, y: py + 220, w: BAND - PAD * 2, h: 70 }),
      meta({ id: "det-back", html: "Left arrow returns to the trace", x: M, y: 630, w: 500 }),
    ]),
    stateOf: "s-process",
  };
};

// A framed screenshot: white panel, hairline, rounded corners, capture letterboxed inside.
const frame = (p, asset, { x, y, w, h }, stroke = HAIR) => [
  f.rect({ id: `${p}-frame`, x, y, w, h, radius: 8, fill: WHITE, stroke, strokeWidth: stroke === ACCENT ? 2 : 1 }),
  f.image({ id: `${p}-img`, src: `asset:${asset}`, fit: "contain", x: x + 2, y: y + 2, w: w - 4, h: h - 4 }),
];

const SHOT = { x: M, y: TOP, w: BAND, h: 440 };
const NOTES_SHOT = { x: M, y: TOP, w: 720, h: BOTTOM - TOP };
const CLIP = { w: C2.w, h: 350 };

// The wireframe's trace mirrors the demo task: [depth, start, duration] as fractions of the
// root span (task, plan, get_policy and its search, get_usage, answer and its stream).
const TRACE = [[0, 0, 1], [1, 0, 0.21], [1, 0.21, 0.16], [2, 0.23, 0.12], [1, 0.37, 0.05], [1, 0.42, 0.58], [2, 0.44, 0.5]];
const SEL = 2;
const WF = { x: 0.34, w: 0.62, y: 0.155, pitch: 0.075, h: 0.04 };
// Wireframe features as fractions of the capture: span tree, selected span bar, span detail.
const WIRE = {
  tree: { x: 0.02, y: 0.16, w: 0.26, h: 0.52 },
  span: { x: WF.x + TRACE[SEL][1] * WF.w, y: WF.y + SEL * WF.pitch, w: TRACE[SEL][2] * WF.w, h: WF.h },
  detail: { x: 0.33, y: 0.7, w: 0.64, h: 0.26 },
};
const spotBox = (fr, s) => ({ x: Math.round(fr.x + 2 + s.x * (fr.w - 4)), y: Math.round(fr.y + 2 + s.y * (fr.h - 4)), w: Math.round(s.w * (fr.w - 4)), h: Math.round(s.h * (fr.h - 4)) });

const grow = (b, d) => ({ x: b.x - d, y: b.y - d, w: b.w + d * 2, h: b.h + d * 2 });

// A numbered accent disc with a white numeral.
const badge = (p, n, cx, cy, d = 32) => {
  const box = { x: cx - d / 2, y: cy - d / 2, w: d, h: d };
  return [
    f.ellipse({ id: `${p}${n}`, ...box, fill: ACCENT, stroke: WHITE, strokeWidth: 2 }),
    f.text({ id: `${p}n${n}`, html: String(n), fontFamily: MONO, fontSize: 16, fontWeight: 700, lineHeight: 1, color: WHITE, align: "center", valign: "middle", ...box }),
  ];
};

const screenshot = (demo) =>
  content("s-screenshot", "Screenshot", "Screenshot. One large capture across the band in a white frame, letterboxed, with a mono caption. In the demo an accent outline marks the span the talk is about; move it to match your capture. Replace the shot asset with a PNG downscaled to 2560px wide and keep captions in text, since text baked into an image cannot be edited.", demo, "The trace view in the eval dashboard", [
    ...frame("shot", "shot", SHOT),
    ...(demo ? [f.rect({ id: "shot-hl", ...grow(spotBox(SHOT, WIRE.span), 6), fill: "transparent", stroke: ACCENT, strokeWidth: 3, radius: 4 })] : []),
    mono({ id: "shot-caption", ...ph(demo, "Eval dashboard, run 412, case 118. Span tree on the left, waterfall on the right, span detail below.", "Caption"), x: M, y: 624, w: BAND, h: 22 }),
  ]);

const screenshotNotes = (demo) => {
  const items = demo
    ? [
        ["The span tree", "Each turn and tool call in order. Indents show which call made which.", WIRE.tree],
        ["The selected span", "get_policy, 620 ms. Its output is the page the agent will quote.", WIRE.span],
        ["Span detail", "Inputs, outputs and token counts. The stale page showed up here.", WIRE.detail],
      ]
    : [1, 2, 3].map((n) => [`What to look at ${n}`, "What it shows and why it matters", [WIRE.tree, WIRE.span, WIRE.detail][n - 1]]);
  const nx = NOTES_SHOT.x + NOTES_SHOT.w + 32;
  const callouts = items.flatMap(([, , spot], i) => {
    const b = spotBox(NOTES_SHOT, spot);
    return badge("shot-c", i + 1, b.x + 4, b.y + 4);
  });
  const notesEls = items.flatMap(([h, d], i) => {
    const y = TOP + i * 158;
    return [
      ...badge("shot-k", i + 1, nx + 16, y + 17),
      lead({ id: i ? `shot-t${i + 1}` : "shot-lead", ...ph(demo, h, h), fontSize: 24, x: nx + 48, y, w: RIGHT - nx - 48, h: 32 }),
      body({ id: i ? `shot-d${i + 1}` : "shot-body", ...ph(demo, d, d), color: GREY, x: nx + 48, y: y + 40, w: RIGHT - nx - 48, h: 96 }),
    ];
  });
  return content("s-screenshot-notes", "Screenshot with notes", "Screenshot with notes. Numbered accent discs sit on the capture and the same numbers key the notes on the right, so the audience can find each point without a pointer. Move the discs onto the features of your capture. Three notes fill the column; the mono caption sits under them.", demo, "Reading one trace", [
    ...frame("shot", "shot-notes", NOTES_SHOT),
    ...callouts,
    ...notesEls,
    mono({ id: "shot-caption", ...ph(demo, "Run 412, case 118", "Caption"), x: nx, y: 638, w: RIGHT - nx, h: 22 }),
  ]);
};

const clippings = (demo) => {
  const shots = demo
    ? [
        ["Before: prompt v3", "get_policy returns the 2025-26 tariff first, and the reply quotes 29.4 cents per kWh."],
        ["After: prompt v4", "The date filter puts the 2026-27 page first. The reply quotes 31.9 cents and cites it."],
      ]
    : [["Left caption", "One sentence on what the clipping shows"], ["Right caption", "One sentence on what the clipping shows"]];
  const els = shots.flatMap(([h, d], i) => {
    const x = C2.x[i];
    const p = i === 0 ? "clip-l" : "clip-r";
    return [
      ...frame(p, "clip", { x, y: TOP, ...CLIP }, i === 1 ? ACCENT : HAIR),
      lead({ id: `${p}-head`, ...ph(demo, h, h), color: i === 1 ? ACCENT : INK, x, y: TOP + CLIP.h + 20, w: C2.w, h: 34 }),
      body({ id: `${p}-body`, ...ph(demo, d, d), x, y: TOP + CLIP.h + 62, w: C2.w, h: BOTTOM - TOP - CLIP.h - 62 }),
    ];
  });
  return content("s-clippings", "Two clippings", "Two clippings side by side, each with a lead and one or two sentences. The side the argument favours has an accent frame and lead. Crop both clippings to the same aspect ratio before embedding so the frames match.", demo, "Case 118 before and after the date filter", els);
};

const quote = (demo) =>
  slide("s-quote", "Quote", "Pull quote, set as a single user turn: a white block, the user label in the accent, and the name, role and date as mono metadata at the foot. Keep the quote under about 25 words so it holds at 40px in three lines.", [
    ...chrome(),
    ...turn(demo, "q", "user", { x: CX, y: 220, w: CW, h: 300 }, { accentLabel: true, lineH: 52, textY: 260 }),
    f.text({ id: "q-body", ...ph(demo, "We sat on a 71% pass rate for a month and argued about the prompt. Reading forty transcripts settled it in an afternoon.", "Quotation"), fontSize: 40, fontWeight: 500, lineHeight: 1.3, letterSpacing: -0.6, x: CX + 40, y: 260, w: CW - 80, h: 160 }),
    hair({ id: "q-rule", x: CX + 40, y: 444, w: CW - 80 }),
    meta({ id: "q-attrib", ...ph(demo, "support platform lead · pilot review · September 2026", "Name, role, date"), fontSize: 16, x: CX + 40, y: 462, w: CW - 80 }),
  ]);

const image = (demo) =>
  slide("s-image", "Image", "Full-bleed image with the caption on a white card at the bottom left, like a trace viewer's tooltip, so the text keeps its contrast on any photo. Replace the placeholder asset with a photo or diagram downscaled to 2560px. Keep captions in the text elements, since text baked into an image cannot be edited.", [
    f.image({ id: "hero-img", src: "asset:placeholder", fit: "cover", x: 0, y: 0, w: 1280, h: 720 }),
    f.rect({ id: "hero-scrim", x: M, y: 528, w: 800, h: 128, radius: 8, fill: WHITE, stroke: HAIR, strokeWidth: 1 }),
    f.ellipse({ id: "mark", x: M + 28, y: 556, w: 8, h: 8, fill: ACCENT }),
    meta({ id: "hero-sub", ...ph(demo, "Support console, reply view, September 2026", "Source"), x: M + 46, y: 549, w: 700 }),
    f.text({ id: "hero-title", ...ph(demo, "Every reply now cites the page it came from", "Caption or claim"), fontSize: 34, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.6, x: M + 28, y: 584, w: 744, h: 44 }),
  ]);

const closing = (demo) =>
  slide("s-closing", "Closing", "Closing, set as the next user turn with the accent outline: the audience's turn. End on the ask rather than the word Questions. The mono line is where to send people: a URL, a name, a date. {{company}} resolves from File > Properties.", [
    ...chrome("{{company}}"),
    // Two lines of the ask fill the block; the label is centred on it so one line also sits evenly.
    ...turn(demo, "close", "user", { x: CX, y: 244, w: CW, h: 196 }, { focus: true, lineH: 196, textY: 244 }),
    f.text({ id: "close-line", ...ph(demo, "Read twenty transcripts before you change the prompt again.", "The ask"), fontSize: 56, fontWeight: 600, lineHeight: 1.15, letterSpacing: -1.6, valign: "middle", x: CX + 40, y: 268, w: CW - 80, h: 148 }),
    mono({ id: "close-meta", ...ph(demo, "{{company}} · platform team", "Contact or link"), x: CX, y: 464, w: CW, h: 22 }),
  ]);

// Stand-in for a screenshot: a trace viewer drawn in code at the frame's inner size.
// Header, a span tree on the left, a waterfall with one accent bar, a span detail panel.
const shotSvg = (W, H) => {
  const r = (x, y, w, h, fill, extra = "") => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}" ${extra}/>`;
  const tree = TRACE.map(([depth], i) => (i === SEL ? r(W * 0.01, H * (0.16 + i * WF.pitch) - H * 0.018, W * 0.28, H * 0.064, FOCUS) : "") + r(W * (0.03 + depth * 0.025), H * (0.16 + i * WF.pitch), W * (0.16 - depth * 0.02), H * 0.028, i === SEL ? ACCENT : HAIR)).join("");
  const bars = TRACE.map(([, s, d], i) => r(W * (WF.x + s * WF.w), H * (WF.y + i * WF.pitch), W * d * WF.w, H * WF.h, i === SEL ? ACCENT : MARK, 'rx="3"')).join("");
  const grid = [0, 1, 2, 3, 4].map((i) => r(W * (WF.x + (i * WF.w) / 4), H * 0.12, 1, H * 0.56, SPLIT)).join("");
  const d = WIRE.detail;
  const detail = r(W * d.x, H * d.y, W * d.w, H * d.h, WHITE, `stroke="${HAIR}"`) + [0.5, 0.35, 0.42, 0.28].map((k, i) => r(W * (d.x + 0.02), H * (d.y + 0.06 + i * 0.065), W * d.w * k, H * 0.025, i ? HAIR : INK)).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${r(0, 0, W, H, WHITE)}${r(0, 0, W, H * 0.08, GROUND)}${r(W * 0.02, H * 0.028, W * 0.18, H * 0.026, INK)}` +
    `${r(0, H * 0.08, W * 0.3, H * 0.92, GROUND)}${grid}${tree}${bars}${detail}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

// A quiet waterfall of grey bars on the ground stands in for the photo the user will supply.
const placeholderSvg = () => {
  const bars = [];
  for (let i = 0; i < 18; i++) {
    const s = (i * 53) % 700;
    bars.push(`<rect x="${120 + s}" y="${40 + i * 38}" width="${80 + ((i * 97) % 420)}" height="18" rx="4" fill="${i === 7 ? ACCENT : "#C9CAC4"}"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#E4E4DF"/>${bars.join("")}</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
};

export default function makeDoc({ root }) {
  const builders = [cover, agenda, section, statement, titleBody, exchange, toolCall, points, twoCol, numbers, chart, table, process, screenshot, screenshotNotes, clippings, quote, image, closing];
  const slides = builders.map((b) => b(true));
  slides.splice(slides.findIndex((s) => s.id === "s-process") + 1, 0, processDetail());
  const layouts = builders.map((b) => {
    const s = b(false);
    return { id: `layout-transcript-${s.id.slice(2)}`, name: s.name, background: s.background, transition: s.transition, notes: "", elements: s.elements };
  });
  for (const s of slides) delete s.name;

  return {
    format: "bento/slides",
    version: 1,
    // No template flag: the runtime would delete collab and mint live-session keys. docId is
    // absent, so every open still mints a fresh deck. Sharing stays off until the user turns it on.
    collab: { on: false },
    title: "Transcript",
    size: { width: 1280, height: 720 },
    meta: { author: "", company: "Company", subject: "", event: "", keywords: "transcript, trace, llm, agents, evals, tool calls" },
    theme: {
      background: GROUND,
      color: INK,
      accent: ACCENT,
      fontFamily: FONT,
      headingFamily: FONT,
      palette: { bg2: TINT, tx2: GREY, accent2: INK, accent3: MARK, accent4: HAIR, hlink: ACCENT },
      chartPalette: [ACCENT, MARK, GREY],
      // JSON strings, keys and values alike, are ink; punctuation and comments grey. No accent in code.
      codePalette: { k: INK, f: INK, s: INK, n: INK, a: INK, c: GREY, p: GREY, d: GREY },
      table: { headerBg: GROUND, headerColor: INK, borderColor: HAIR, borderWidth: 1, fontSize: 22, color: INK, radius: 0 },
    },
    fonts: [
      { family: "Hanken Grotesk", asset: "hanken-grotesk", weight: "100 900" },
      { family: "JetBrains Mono", asset: "jetbrains-mono", weight: "400 700" },
    ],
    assets: {
      "hanken-grotesk": dataUri(join(root, "fonts", "hanken-grotesk-latin.woff2")),
      "jetbrains-mono": dataUri(join(root, "fonts", "jetbrains-mono-latin.woff2")),
      placeholder: placeholderSvg(),
      shot: shotSvg(SHOT.w - 4, SHOT.h - 4),
      "shot-notes": shotSvg(NOTES_SHOT.w - 4, NOTES_SHOT.h - 4),
      clip: shotSvg(CLIP.w - 4, CLIP.h - 4),
    },
    present: { slideNumber: false, progress: false },
    slides,
    layouts,
  };
}
