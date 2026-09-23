# Changelog

<!-- AI agents: After completing changes to this project, add a terse TLDR style bullet describing the change under today's date heading (## YYYY-MM-DD), newest date first. Create the date heading if it does not exist. Log only changes a reader would care about - new capability, changed or broken behaviour, removals, real fixes. Skip cosmetic and housekeeping edits (wording, formatting, typos, file moves); git history covers those. One line per change, aim under 15 words - say what changed, not how it was implemented. Write more only when the change is genuinely complex and the reasoning cannot be recovered from the source or git history. No versioning is required. -->

## 2026-09-23

- Added Signal, Transit and Transcript themes, light only
- `assertDoc` allows literal points numerals, transcript role labels and Transit's "you are here" tab in layouts
- README: run Share > Reset access before sharing a theme deck (Go live mints no keys)
- Added Assertion, Bento Grid (light and dark) and Schematic themes with 64px or 40px margins
- `assertDoc` now allows literal screenshot callout numerals (`shot-cn`, `shot-kn`) in layouts
- Decks now open with live sharing off; `template: true` dropped because it forced key minting
- Added CLAUDE.md and CHANGELOG.md for future contributors

## 2026-09-22

- Added screenshot, screenshot-with-notes and two-clippings layouts to every theme
- Split Mono into Mono Light and Mono Dark sharing one builder
- Added Mono and Tufte themes for technical and data-heavy talks
- Set Tufte in EB Garamond, replacing Newsreader
- Added Swiss and Rams themes, the generator pipeline and the headless render check
- Removed all animation from the templates; `assertDoc` now rejects `fx` and non-`none` transitions
