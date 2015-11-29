# -*- coding: utf-8 -*-
#
# news.ltsv, aozora.ltsvなどからjson生成
#

CONTENTS = \
	Volume/volume.ltsv \
	News/news.ltsv \
	Info/info.ltsv \
	Menthas/menthas.ltsv \
	Music/music.ltsv \
	Music2/music2.ltsv \
	GyaTV/gyatv.ltsv \
	TED/ted.ltsv \
	Radio/radio.ltsv \
	YouTube/youtube.ltsv \
	GIF/gif.ltsv \
	Comics/comics.ltsv \
	Photos/photos.ltsv \
	Aozora/aozora.ltsv \
	Recipe/allrecipe.ltsv \
	Videom/videom.ltsv \
	Geta/geta.ltsv \
	Stations/stations.ltsv

#	Bookmarks/bookmarks.ltsv \

json: getnews data
getnews:
	cd News; make
data:
	ruby ltsv2json ${CONTENTS} | /usr/local/bin/jq . > data.json

