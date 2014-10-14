apps: mac windows

data.json: ../data/data.json
	cp ../data/data.json .

javascripts/gear.js: ../javascripts/gear.coffee
	-mkdir javascripts
	cp ../javascripts/gear.coffee javascripts
	coffee -c -b javascripts/gear.coffee

images/loading.gif: ../images/loading.gif
	-mkdir images
	cp ../images/loading.gif images

app: data.json javascripts/gear.js images/loading.gif
	zip -r app.nw \
		package.json \
		index.html \
		stylesheets/gear.css \
		javascripts/jquery.js \
		javascripts/jquery.mousewheel.js \
		javascripts/gear.js \
		node_modules \
		data.json \
		images/loading.gif
mac: app
	/bin/rm -f Gear.dmg
	cp app.nw Gear.app/Contents/Resources
dmg: mac
	hdiutil create -srcfolder Gear.app -volname Gear Gear.dmg

windows: app
	/bin/rm -f Gear.zip
	cat Gear/nw.exe app.nw > Gear/Gear.exe
zip: windows
	zip Gear.zip Gear/*

upload: dmg zip
	scp Gear.zip pitecan.com:/www/www.pitecan.com/tmp
	scp Gear.dmg pitecan.com:/www/www.pitecan.com/tmp

