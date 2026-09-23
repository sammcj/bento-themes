// Bento Grid Light: the Bento Grid theme on a pale grey ground with white tiles.
// Same builders, grid and layouts as themes/bento-grid-dark; only the palette
// differs. The dark theme's lilac is too pale to read as the hero on white, so
// the hero is a deep violet with white text.
// WCAG ratios: TEXT 18.9 on TILE, 16.9 on GROUND; MUTED 6.3 on TILE, 5.6 on GROUND;
// ACCENT 6.7 on TILE, 6.0 on GROUND; HERO_INK 6.7 on ACCENT; HERO_LABEL 5.1 on ACCENT;
// DIM 3.4 on TILE; CODE_STRING 10.4 on TILE.
import { makeBentoGrid } from "../bento-grid-dark/theme.mjs";

export const LIGHT = {
  GROUND: "#F2F2F4",
  TILE: "#FFFFFF",
  HAIR: "#DDDDE3",
  TEXT: "#111113",
  MUTED: "#5F5F69",
  DIM: "#8A8A94",
  ACCENT: "#5B3FD9",
  HERO_INK: "#FFFFFF",
  HERO_LABEL: "#E4DEFF",
  CODE_KEY: "#000000",
  CODE_STRING: "#3F3F46",
  SHOT: { bg: "#F6F6F8", side: "#EDEDF0", card: "#FFFFFF", faint: "#DEDEE3", mid: "#CDCDD4", strong: "#B4B4BD", panel: "#FFFFFF" },
  keywords: "bento, grid, tiles, light, product",
};

export default ({ root }) => makeBentoGrid(LIGHT, { root, title: "Bento Grid Light", slug: "bento-grid-light" });
