#	cd javascripts; coffee -b -c gear.coffee; cd ..

apps: mac windows

app:
	cp ../Data/data.json .
	zip app.nw \
		package.json \
		index.html \
		stylesheets/gear.css \
		javascripts/jquery.js \
		javascripts/jquery.mousewheel.js \
		javascripts/gear.js \
		data.json \
		loading.gif
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

