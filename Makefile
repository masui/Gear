all:
	echo make dat / make scp
dat:
	cd Data; make
	mv Data/data.json .
scp:
	scp data.json dial.js dial.css index.html jque* loading.gif pitecan.com:/www/www.pitecan.com/tmp/DialLens

push:
	git push

