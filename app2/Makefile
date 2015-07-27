javascripts/gear.js: javascripts/gear.coffee
	coffee -c -b javascripts/gear.coffee

run:
	nw
nw:
	zip app.nw \
		00README \
		package.json \
		index.html \
		stylesheets/gear.css \
		javascripts/jquery.js \
		javascripts/jquery.mousewheel.js \
		javascripts/gear.js \
		javascripts/linda.js \
		javascripts/socket.io.js \
		data.json \
		images/loading.gif
#	cp app.nw Gear.app/Contents/Resources

mac:
	/bin/rm -r -f build
	nwbuild --platform osx64 .
dmg: mac
	/bin/rm -f Gear.dmg
	hdiutil create -srcfolder build/Gear/osx64/Gear.app -volname Gear Gear.dmg
