all:
	platex -kanji=utf8 paper
	pbibtex paper
	platex -kanji=utf8 paper
	platex -kanji=utf8 paper
	dvipdfmx paper
	open paper.pdf
upload:
	scp paper.pdf pitecan.com:/www/www.pitecan.com/tmp/strotor.pdf

paperdata.json: paperdata.ltsv
	~masui/.rbenv/shims/bundle exec ruby ../Data/ltsv2json paperdata.ltsv | /usr/local/bin/jq . > paperdata.json

