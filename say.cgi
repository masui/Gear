#! /usr/bin/ruby
# -*- coding: utf-8 -*-
require 'cgi'

cgi = CGI.new('html3')
text = cgi.params['text'][0].to_s
level = cgi.params['level'][0].to_i

File.open("/tmp/text","w"){ |f|
  f.puts text
}

system "killall say"
system "killall afplay"

sound = false
if level == 0 then
  sound = "/System/Library/Sounds/Glass.aiff"
  #sound = "oodaiko.mp3"
elsif level == 1 then
  sound = "/System/Library/Sounds/Hero.aiff"
  #sound = "kodaiko.mp3"
elsif level == 2 then
  sound = "/System/Library/Sounds/Blow.aiff"
elsif level == 3 then
  sound = "/System/Library/Sounds/Sosumi.aiff"
end

if sound then
  system "/usr/bin/afplay #{sound} & /usr/bin/say -r 300 #{text}"
  # system "say -r 300 #{level}"
else
  system "/usr/bin/say -r 300 #{text}"
end

cgi.out {
  text
}

