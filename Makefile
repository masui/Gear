all:
	echo make dat / make scp
dat:
	cd /www/www.pitecan.com/tmp/Dial/Data; make; cd /www/www.pitecan.com/tmp/Dial
	mv /www/www.pitecan.com/tmp/Dial/Data/data.json /www/www.pitecan.com/tmp/Dial

push:
	git push

paddle:
	npm start & sleep 2; open 'http://localhost:3000/paddle.html'

kill:
	killall node

