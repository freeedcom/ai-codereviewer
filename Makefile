.PHONY: compile

compile:
	ncc build src/main.ts -o dist
	ncc build src/main.ts -o dist -s
	ncc build src/main.ts -o dist --license license.txt
