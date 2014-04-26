all:
	echo make dat / make scp
dat:
	cd /www/www.pitecan.com/tmp/Dial/Data; make; cd /www/www.pitecan.com/tmp/Dial
	mv /www/www.pitecan.com/tmp/Dial/Data/data.json /www/www.pitecan.com/tmp/Dial

push:
	git push

paddle:
	open index.html
	ruby paddle.rb
