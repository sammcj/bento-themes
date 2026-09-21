#!/usr/bin/env node
// Usage: node scripts/build.mjs <theme-dir-name>
// Reads themes/<name>/theme.mjs, writes <Name>.doc.json and <Name>.bento.html beside it.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertDoc, splice } from "./lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const name = process.argv[2];
if (!name) {
  console.error("usage: build.mjs <theme>");
  process.exit(2);
}

const dir = join(root, "themes", name);
const { default: makeDoc } = await import(pathToFileURL(join(dir, "theme.mjs")));
const doc = makeDoc({ root });
assertDoc(doc);

const runtime = readFileSync(join(root, "runtime", "Bento_Slides.bento.html"), "utf8");
const file = doc.title.replace(/\s+/g, "_");
writeFileSync(join(dir, `${file}.doc.json`), JSON.stringify(doc, null, 1) + "\n");
writeFileSync(join(dir, `${file}.bento.html`), splice(runtime, doc));
console.log(`${name}: ${doc.slides.length} slides, ${(doc.layouts ?? []).length} layouts -> themes/${name}/${file}.bento.html`);
