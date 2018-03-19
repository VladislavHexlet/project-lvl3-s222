install: install-deps install-flow-typed

install-deps:
	npm install

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npm run eslint — src/

publish:
	npm publish

.PHONY: test
