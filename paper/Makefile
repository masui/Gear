all:
	platex -kanji=utf8 paper
	pbibtex paper
	platex -kanji=utf8 paper
	platex -kanji=utf8 paper
	dvipdfmx paper
	open paper.pdf
bib:
	jbibtex paper
