#! /usr/bin/ruby
# -*- coding: utf-8 -*-
#
# Macの音量制御
#

require 'cgi'

cgi = CGI.new('html3')
level = cgi.params['level'][0].to_i

system "killall say"
system "killall afplay"
system "killall osascript"

# volume = `osascript -e "(get Volume settings)'s output volume"`

# system "/usr/bin/osascript -e 'set Volume output volume 30'"

# system "/usr/bin/say -r 300 'システムの音量は#{level}です'"

File.open("/tmp/volume","w"){ |f|
  f.puts level
}

system "/usr/bin/osascript -e 'set Volume output volume #{level}'"

cgi.out {
  ''
}

