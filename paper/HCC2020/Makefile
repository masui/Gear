all:
	platex -kanji=utf8 paper
	pbibtex paper
	platex -kanji=utf8 paper
	platex -kanji=utf8 paper
	dvipdfmx paper
	scp paper.pdf pitecan.com:/www/www.pitecan.com/tmp/hcc.pdf
#	open paper.pdf

spell:
	aspell --lang=en -t -a < paper.tex | grep -v '^\*$$' | grep -v '^$$' | ruby -ne 'puts $$_.split[1]' | sort -u
