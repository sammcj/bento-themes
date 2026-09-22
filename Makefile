THEMES := $(notdir $(wildcard themes/*))
RUNTIME := runtime/Bento_Slides.bento.html
BUILD := .build

.PHONY: all build check runtime clean help $(THEMES)

all: build

## build: generate every theme's .doc.json and .bento.html
build: $(THEMES)

$(THEMES): $(RUNTIME)
	node scripts/build.mjs $@

## check: render every deck headlessly, validate, and refresh preview PNGs (needs a Chromium-based browser)
check: build
	@for t in $(THEMES); do \
		deck=$$(ls themes/$$t/*.bento.html); \
		rm -rf themes/$$t/preview; \
		node scripts/render_check.mjs "$$deck" --out themes/$$t/preview || exit 1; \
	done

## runtime: fetch the latest signed Bento release and record its version in runtime/VERSION
runtime:
	curl -fsSL https://bento.page/releases/slides/Bento_Slides.bento.html -o $(RUNTIME)
	@grep -q 'id="bento-doc"' $(RUNTIME) || { echo "no #bento-doc block in the download" >&2; exit 1; }
	@node scripts/inflate_runtime.mjs $(RUNTIME) --out $(BUILD)/runtime >/dev/null
	@grep -oh '__bentoRuntime",{value:"[^"]*"' $(BUILD)/runtime/*.js | grep -o '[0-9][0-9.]*' | head -1 > runtime/VERSION
	@echo "runtime $$(cat runtime/VERSION)"

$(RUNTIME):
	$(MAKE) runtime

clean:
	rm -rf $(BUILD) themes/*/preview themes/*/*.bento.html themes/*/*.doc.json

help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //'
