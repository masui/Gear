demo: javascripts/gear.js data.json
	open demo.html

javascripts/gear.js: javascripts/gear.coffee
	coffee -c -b javascripts/gear.coffee

all:
	echo make dat / make scp

.PHONY: data.json
data.json:
	cd data; make
	cp data/data.json .

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
		Gear/demo_say.html \
		Gear/index_say.html \
		Gear/images/loading.gif \
		Gear/javascripts/gear.js \
		Gear/javascripts/jquery-1.10.2.js \
		Gear/javascripts/jquery.js \
		Gear/javascripts/jquery.mousewheel.js \
		Gear/stylesheets/gear.css \
		Gear/data.json \
		| ssh pitecan.com "cd /www/www.pitecan.com; tar xvzf -"

saydemo:
	cd ..; tar cvzf gear.tgz \
		Gear/demo.html \
		Gear/index.html \
		Gear/demo_say.html \
		Gear/index_say.html \
		Gear/images/loading.gif \
		Gear/javascripts/gear.js \
		Gear/javascripts/jquery-1.10.2.js \
		Gear/javascripts/jquery.js \
		Gear/javascripts/jquery.mousewheel.js \
		Gear/stylesheets/gear.css \
		Gear/data.json

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
