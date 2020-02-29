conv:
	ffmpeg -i monorail.mp4 -ss 0 -t 1440 -r 1 -vf scale=960:-1 monorail%04d.jpg
upload:
	scp monorail*.jpg pitecan.com:/www/www.pitecan.com/monorail
