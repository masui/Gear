# -*- coding: utf-8 -*-
#
# news.ltsv, aozora.ltsvなどからjson生成
#

CONTENTS = \
	News/news.ltsv \
	Bookmarks/bookmarks.ltsv \
	Music/music.ltsv \
	Music2/music2.ltsv \
	Radio/radio.ltsv \
	YouTube/youtube.ltsv \
	GIF/gif.ltsv \
	Comics/comics.ltsv \
	Photos/photos.ltsv \
	Aozora/aozora.ltsv \
	Recipe/allrecipe.ltsv \
	Geta/geta.ltsv \
	Stations/stations.ltsv


json: getnews
	~masui/.rbenv/shims/bundle exec ruby ltsv2json ${CONTENTS} | /usr/local/bin/jq . > data.json

getnews:
	cd News; make

