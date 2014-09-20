make:
	cp ../Data/data.json .
	zip Gear.app/Contents/Resources/app.nw \
		package.json \
		index.html \
		stylesheets/gear.css \
		javascripts/jquery.js \
		javascripts/jquery.mousewheel.js \
		javascripts/gear.js \
		data.json \
		loading.gif

dmg:
	/bin/rm -f Gear.dmg
	hdiutil create -srcfolder Gear.app -volname Gear Gear.dmg
