all: build release

build: schemas/gschemas.compiled

release: MultiClock.zip

schemas/gschemas.compiled: schemas/*.xml
	glib-compile-schemas schemas

MultiClock.zip: build
	rm -f MultiClock.zip && zip MultiClock.zip $(shell git ls-files | grep -v ^.gitignore)
