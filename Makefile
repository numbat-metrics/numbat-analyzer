# use locally-installed tools
NPM_BIN := node_modules/.bin/
UGLIFY := $(addprefix $(NPM_BIN), uglifyjs)
LESS := $(addprefix $(NPM_BIN), lessc)
LOGGER := $(addprefix $(NPM_BIN), bistre) -o short
BROWSERIFY := $(addprefix $(NPM_BIN), browserify)
SUPERVISOR := $(addprefix $(NPM_BIN), supervisor)

# bootstrap
BOOTPATH = bower_components/bootstrap

INPUT_DIR = build
OUTPUT_DIR = public

# CSS setup
LESSOPTS := --include-path=bower_components/bootstrap/less
LESSDIR := $(INPUT_DIR)/less
CSSDIR := $(OUTPUT_DIR)/css

LESSFILES := $(wildcard $(LESSDIR)/*.less)
LESSDEPS := $(LESSFILES) $(wildcard $(LESSDIR)/**/*.less)
CSS := $(patsubst $(LESSDIR)%, $(CSSDIR)%, $(patsubst %.less,%.css,$(LESSFILES)))
MINCSS = $(CSS:.css=.min.css)

# javascript etc
JSSRCDIR = $(INPUT_DIR)/js
JSDIR = $(OUTPUT_DIR)/js
JS_SRCS := $(wildcard $(JSSRCDIR)/*.js)
JS_TARGETS := $(patsubst $(JSSRCDIR)%, $(JSDIR)%, $(JS_SRCS))

all:  libs css js

css: $(CSS) $(MINCSS)

$(CSSDIR)/%.css : $(LESSDIR)/%.less $(LESSDEPS)
	@echo Compiling $<
	@$(LESS) $(LESSOPTS) $< > $@

$(CSSDIR)/%.min.css : $(LESSDIR)/%.less
	@echo Minifying $<
	@$(LESS) $(LESSOPTS) --yui-compress $< > $@

js: $(JS_TARGETS)

$(JSDIR)/%.js : $(JSSRCDIR)/%.js
	@echo Browserifying $<
	@browserify -r ./$< -o $@

%.min.js: %.js
	@echo Minifying $<
	@$(UGLIFY) --no-mangle -nc $< > $@

libs: bootstrap
	browserify -r moment -r d3 -r rickshaw -o $(JSDIR)/bundle.js

bootstrap: $(BOOTPATH)/dist/js/bootstrap.js
	@cp $(BOOTPATH)/dist/js/* $(OUTPUT_DIR)/js
