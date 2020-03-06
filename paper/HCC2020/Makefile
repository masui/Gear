all:
	platex -kanji=utf8 paper
	pbibtex paper
	platex -kanji=utf8 paper
	platex -kanji=utf8 paper
	dvipdfmx paper
	scp paper.pdf pitecan.com:/www/www.pitecan.com/tmp/hcc.pdf
#	open paper.pdf


