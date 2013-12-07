# -*- coding: utf-8 -*-
#
# news.ltsv, aozora.ltsvなどからjson生成
#

CONTENTS = \
	News/news.ltsv \
	Music/music.ltsv \
	YouTube/youtube.ltsv \
	GIF/gif.ltsv \
	Comics/comics.ltsv \
	Photos/photos.ltsv \
	Aozora/aozora.ltsv \
	Recipe/allrecipe.ltsv \
	Geta/geta.ltsv \
	Stations/stations.ltsv

json: getnews
	ruby ltsv2json ${CONTENTS} | jq . > data.json
#	bundle exec ruby ltsv2json ${CONTENTS} | jq . > data.json

getnews:
	cd News; make

