THEMES := $(notdir $(wildcard themes/*))
RUNTIME := runtime/Bento_Slides.bento.html

.PHONY: all build check runtime clean $(THEMES)

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

## runtime: fetch the latest signed Bento release (the app every theme is spliced into)
runtime:
	curl -fsSL https://bento.page/releases/slides/Bento_Slides.bento.html -o $(RUNTIME)
	@grep -q 'id="bento-doc"' $(RUNTIME) && echo "runtime ok"

$(RUNTIME):
	$(MAKE) runtime

clean:
	rm -rf .build themes/*/preview themes/*/*.bento.html themes/*/*.doc.json

help:
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //'
