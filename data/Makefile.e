# -*- coding: utf-8 -*-
#
# news.ltsv, aozora.ltsvなどからjson生成
#

CONTENTS = \
	Music/music.e.ltsv \
	Radio/radio.e.ltsv \
	YouTube/youtube.e.ltsv \
	GIF/gif.e.ltsv \
	Comics/comics.e.ltsv \
	Photos/photos.e.ltsv \
	Geta/geta.e.ltsv \
	Stations/stations.e.ltsv


json: getnews
	~masui/.rbenv/shims/bundle exec ruby ltsv2json ${CONTENTS} | /usr/local/bin/jq . > data.json

getnews:
	cd News; make

