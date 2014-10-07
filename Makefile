javascripts/gear.js: javascripts/gear.coffee
	coffee -c -b javascripts/gear.coffee

all:
	echo make dat / make scp
dat:
	cd /www/www.pitecan.com/tmp/Dial/Data; make; cd /www/www.pitecan.com/tmp/Dial
	mv /www/www.pitecan.com/tmp/Dial/Data/data.json /www/www.pitecan.com/tmp/Dial

push:
	git push origin master

paddle:
	PORT=3000 BLE=paddle npm start & sleep 2; open 'http://localhost:3000/paddle.html'
#	npm start & sleep 2; open 'http://localhost:3000/paddle.html'


kill:
	killall node

upload:
	cd ..; tar cvzf - \
		Gear/demo.html \
		Gear/index.html \
		Gear/images/loading.gif \
		Gear/javascripts/gear.js \
		Gear/javascripts/jquery-1.10.2.js \
		Gear/javascripts/jquery.js \
		Gear/javascripts/jquery.mousewheel.js \
		Gear/stylesheets/gear.css \
		Gear/data.json \
		| ssh pitecan.com "cd /www/www.pitecan.com; tar xvzf -"

zip:
	cd ..; zip Gear.zip \
		Gear/demo.html \
		Gear/index.html \
		Gear/images/loading.gif \
		Gear/javascripts/gear.js \
		Gear/javascripts/jquery-1.10.2.js \
		Gear/javascripts/jquery.js \
		Gear/javascripts/jquery.mousewheel.js \
		Gear/stylesheets/gear.css \
		Gear/data.json \
		Gear/demo.bat

