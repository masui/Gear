mds:
	~masui/.rbenv/shims/bundle exec ruby ../data/ltsv2json mds.ltsv | /usr/local/bin/jq . > dict.json
	/bin/cp dict.json ..
words:
	~masui/.rbenv/shims/bundle exec ruby ../data/ltsv2json words.ltsv | /usr/local/bin/jq . > dict.json
	/bin/cp dict.json ..
ejdic: ejdic.ltsv
	~masui/.rbenv/shims/bundle exec ruby ../data/ltsv2json ejdic.ltsv | /usr/local/bin/jq . > dict.json
	/bin/cp dict.json ..

mds.ltsv: eiwa.mds words2ltsv
	ruby words2ltsv eiwa.mds | uniq > mds.ltsv
words.ltsv: linux.words words2ltsv
	ruby words2ltsv linux.words | uniq > words.ltsv

# http://kujirahand.com/web-tools/EJDictFreeDL.php
ejdic.ltsv: ejdic-hand-utf8.txt
	ruby words2ltsv ejdic-hand-utf8.txt | head -210000 | uniq > ejdic.ltsv
