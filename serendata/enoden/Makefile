conv:
	ffmpeg -i enoden.mp4 -ss 0 -t 1440 -r 1 -vf scale=960:-1 enoden%04d.jpg
upload:
	scp enoden*.jpg pitecan.com:/www/www.pitecan.com/enoden
