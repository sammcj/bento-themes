// Mono Light: the Mono theme on warm paper. Same builders, marks and layouts as
// themes/mono-dark; only the palette differs. The accent is a deep green because
// phosphor green fails 4.5:1 on paper. Ratios on GROUND: TEXT 15.1, GREY 6.1,
// ACCENT 5.8; on PANEL: GREY 5.4, ACCENT 5.2, STRING 5.7; GROUND on ACCENT 5.8.
import { makeMono } from "../mono-dark/theme.mjs";

export const LIGHT = {
  GROUND: "#F2F1EC",
  TEXT: "#1A1C1F",
  GREY: "#565B61",
  HAIR: "#D3D1CA",
  PANEL: "#E7E5DF",
  HEADER: "#DCDAD3",
  ACCENT: "#156B34",
  STRING: "#7A4E12",
  keywords: "mono, terminal, monospace, light, engineering",
};

export default ({ root }) => makeMono(LIGHT, { root, title: "Mono Light", slug: "mono-light" });
