# -*- coding: utf-8 -*-
#
# news.ltsv, aozora.ltsvなどからjson生成
#

CONTENTS = \
	News/news.ltsv \
	Info/info.ltsv \
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
	Geta/geta.ltsv \
	Stations/stations.ltsv

#	Bookmarks/bookmarks.ltsv \

json: getnews
	~/.rbenv/shims/bundle exec ruby ltsv2json ${CONTENTS} | /usr/local/bin/jq . > data.json

getnews:
	cd News; make

