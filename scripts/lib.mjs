// Shared helpers for theme generators. A theme module exports a function that
// returns a full bento/slides document; build.mjs writes it into the runtime.
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

export const W = 1280;
export const H = 720;
export const MARGIN = 96;
export const BAND = W - MARGIN * 2; // 1088
export const RIGHT = W - MARGIN; // 1184

// Column arithmetic inside the 96px margins (from bento.page/agents.md).
export const COLS = {
  2: { w: 528, x: [96, 656], gutter: 32 },
  3: { w: 340, x: [96, 470, 844], gutter: 34 },
  4: { w: 254, x: [96, 374, 652, 930], gutter: 24 },
  "60/40": { w: [624, 432], x: [96, 752], gutter: 32 },
};

const MIME = { ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };

export function dataUri(path) {
  const mime = MIME[extname(path)];
  if (!mime) throw new Error(`no mime type for ${basename(path)}`);
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
}

// Element factories bound to a theme's typographic defaults, so a generator
// writes only what differs. Bento drops unknown keys silently and fills
// missing ones with editor defaults (system font, centred), never the theme's,
// which is why every field is written out here.
export function factory(t) {
  const base = (o) => ({ rotation: 0, opacity: 1, ...o });
  return {
    text: (o) =>
      base({
        type: "text",
        fontFamily: t.fontFamily,
        fontWeight: 400,
        color: t.color,
        align: "left",
        valign: "top",
        lineHeight: 1.3,
        ...o,
      }),
    rect: (o) => base({ type: "shape", shape: "rect", stroke: "none", strokeWidth: 0, radius: 0, fill: t.accent, ...o }),
    ellipse: (o) => base({ type: "shape", shape: "ellipse", stroke: "none", strokeWidth: 0, fill: t.accent, ...o }),
    // Lines take their colour from fill and draw horizontally across the box.
    line: (o) => base({ type: "shape", shape: "line", stroke: "none", strokeWidth: 0, fill: t.color, h: 2, ...o }),
    path: (o) => base({ type: "shape", shape: "path", stroke: "none", strokeWidth: 0, fill: t.accent, ...o }),
    image: (o) => base({ type: "image", fit: "contain", radius: 0, ...o }),
    chart: (o) => base({ type: "chart", ...o }),
    table: (o) => base({ type: "table", header: true, ...o }),
  };
}

// Layout text that may keep literal html: numerals and glyphs that are not user copy.
// Everything else in a layout is either a {{token}} or an empty html with a placeholder.
const LAYOUT_LITERALS = /^(q-mark|ag-n\d+|pr-n\d+)$/;

// Sanity checks that the runtime would otherwise fail silently on.
export function assertDoc(doc) {
  const problems = [];
  const slideIds = new Set(doc.slides.map((s) => s.id));
  const checkSlide = (s, label, isLayout) => {
    const ids = new Set();
    for (const e of s.elements) {
      if (!e.id) problems.push(`${label}: element without id`);
      if (ids.has(e.id)) problems.push(`${label}: duplicate id ${e.id}`);
      ids.add(e.id);
      if (e.x < 0 || e.y < 0 || e.x + e.w > W + 0.01 || e.y + e.h > H + 0.01) problems.push(`${label}/${e.id}: off canvas (${e.x}+${e.w}, ${e.y}+${e.h})`);
      if (e.type === "text") {
        if (!("html" in e)) problems.push(`${label}/${e.id}: text without html`);
        if (e.html === "" && !e.placeholder) problems.push(`${label}/${e.id}: empty html needs a placeholder`);
        if (typeof e.fontSize !== "number") problems.push(`${label}/${e.id}: text without fontSize (the runtime would pick its own)`);
        else if (e.fontSize < 14) problems.push(`${label}/${e.id}: fontSize ${e.fontSize} below 14px floor`);
        if (isLayout && e.html && !e.html.includes("{{") && !LAYOUT_LITERALS.test(e.id)) problems.push(`${label}/${e.id}: layout copy must be a placeholder, not html "${e.html.slice(0, 30)}"`);
      }
      if (e.fontFamily && !e.fontFamily.includes(",")) problems.push(`${label}/${e.id}: fontFamily needs a fallback stack`);
      if (e.link && !slideIds.has(e.link) && !/^https?:/.test(e.link)) problems.push(`${label}/${e.id}: link target ${e.link} does not exist`);
      // Themes here are static by design: no entrances, loops, step reveals or count-ups.
      if (e.fx) problems.push(`${label}/${e.id}: carries fx (templates are animation-free)`);
    }
    if (s.transition && s.transition !== "none") problems.push(`${label}: transition must be "none"`);
  };
  for (const s of doc.slides) {
    if (!s.notes) problems.push(`${s.id}: missing notes`);
    if (s.stateOf && !slideIds.has(s.stateOf)) problems.push(`${s.id}: stateOf ${s.stateOf} does not exist`);
    checkSlide(s, s.id, false);
  }
  for (const l of doc.layouts ?? []) {
    if (!l.name) problems.push("layout without name");
    checkSlide(l, `layout ${l.name}`, true);
    for (const e of l.elements) if (e.link) problems.push(`layout ${l.name}/${e.id}: layouts must not carry link`);
  }
  if (problems.length) throw new Error("document check failed:\n  " + problems.join("\n  "));
}

// Replace the #bento-doc block. Escaping "<" keeps the JSON free of a literal
// "</script>", which also makes this splice idempotent.
export function splice(runtimeHtml, doc) {
  const open = runtimeHtml.indexOf('id="bento-doc"');
  if (open < 0) throw new Error("runtime has no #bento-doc block");
  const start = runtimeHtml.indexOf(">", open) + 1;
  const end = runtimeHtml.indexOf("</script>", start);
  const json = JSON.stringify(doc).replaceAll("<", "\\u003c");
  return runtimeHtml.slice(0, start) + json + runtimeHtml.slice(end);
}
