all:
	echo make dat / make scp
dat:
	cd Data; make; cd ..
	mv Data/data.json .

pitecan:
	ssh pitecan.com 'cd /www/www.pitecan.com/tmp/DialLens; git pull'

push:
	git push
