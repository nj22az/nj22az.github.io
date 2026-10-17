CC ?= cc
CFLAGS ?= -O2 -std=c99 -Wall -Wextra -Wpedantic
LDLIBS = -lm -ldl
SOURCES = src/main.c src/combat.c src/platform.c src/render.c src/model.c

.PHONY: all test clean sanitize
all: build/ferry-deck-fighters
build:
	mkdir -p build
build/ferry-deck-fighters: $(SOURCES) src/combat.h src/platform.h src/render.h src/model.h | build
	$(CC) $(CPPFLAGS) $(CFLAGS) $(LDFLAGS) $(SOURCES) -o $@ $(LDLIBS)
build/combat-test: tests/combat_test.c src/combat.c src/combat.h | build
	$(CC) $(CPPFLAGS) $(CFLAGS) tests/combat_test.c src/combat.c -o $@ -lm
test: build/combat-test build/model-test
	./build/combat-test
	./build/model-test
sanitize:
	$(MAKE) clean
	$(MAKE) test CFLAGS='-O1 -g -std=c99 -Wall -Wextra -fsanitize=address,undefined'
clean:
	rm -rf build

build/model-test: tests/model_test.c src/model.c src/model.h src/combat.c src/combat.h | build
	$(CC) $(CPPFLAGS) $(CFLAGS) tests/model_test.c src/model.c src/combat.c -o $@ -lm -ldl
model-test: build/model-test
	./build/model-test
