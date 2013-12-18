all:
	echo make dat / make scp
dat:
	cd Data; make; cd ..
	mv Data/data.json .

push:
	git push
