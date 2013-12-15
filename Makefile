all:
	echo make dat / make scp
dat:
	cd Data; make; cd ..
	mv Data/data.json .

pitecan:
	ssh pitecan.com 'cd /www/www.pitecan.com/tmp/DialLens; git pull'

#	scp data.json dial.js dial.css index.html jque* loading.gif pitecan.com:/www/www.pitecan.com/tmp/DialLens

push:
	git push
