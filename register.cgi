#!/home/masui/.rbenv/shims/ruby

require 'cgi'
require 'uri'

cgi = CGI.new('html3')
url = URI.decode(cgi.params['url'][0])
title = URI.decode(cgi.params['title'][0])

File.open("/www/www.pitecan.com/tmp/Dial/Data/Bookmarks/bookmarks.ltsv","a"){ |f|
  f.puts " title:#{title}\turl:#{url}"
}
system "cd /www/www.pitecan.com/tmp/Dial; make dat > /dev/null"

cgi.out {
  cgi.html {
    cgi.head {
      ""
    } +
    cgi.body {
      "Registered to Dial"
    }
  }
}

