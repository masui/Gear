all: date.ltsv makeltsv
	ruby ../data/ltsv2json date.ltsv | /usr/local/bin/jq . > date.json

date.ltsv: makeltsv
	ruby makeltsv > date.ltsv
