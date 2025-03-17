VERSION ?= current
SWAGGER_FILE = "api/$(VERSION)/swagger.json"

all: kwebsite

clean:
	rm -rf kwebsite/content/en/docs/* kwebsite/public

kwebsite: clean
	mkdir -p kwebsite/content/en/docs

	sed -i 's|\\u003c|\&lt;|g' $(SWAGGER_FILE)
	sed -i 's|\\u003e|\&gt;|g' $(SWAGGER_FILE)

	sed -i '/```.*```/{s|\&lt;|<|g}' $(SWAGGER_FILE)
	sed -i '/```.*```/{s|\&gt;|>|g}' $(SWAGGER_FILE)

	sed -i '/: ".*"/{s|{|[|g}' $(SWAGGER_FILE)
	sed -i '/: ".*"/{s|}|]|g}' $(SWAGGER_FILE)

	go run cmd/main.go kwebsite --config-dir config/$(VERSION)/ --file $(SWAGGER_FILE) --output-dir kwebsite/content/en/docs --templates ./templates

	find kwebsite -name "_index.md" -print -exec rm {} \;

	mv kwebsite/content/en/docs/common-parameters kwebsite/content/en/docs/common-parameter
	sed -i 's/..\/common-parameters\/common-parameters/..\/common-parameter\/common-parameters/g' `find kwebsite -name "*.md"`
