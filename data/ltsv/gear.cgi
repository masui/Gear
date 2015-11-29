#!/usr/bin/ruby
# -*- coding: utf-8 -*-
#
#  http://pitecan.com/gear.ltsv?host=gear.masuilab.org&name=Gear&title=masui
#

require 'net/http'
require 'uri'

def get_web_data(url)
  u = URI.parse(URI.encode(url)) # UTFな文字列をparseできないようなので
  res = Net::HTTP.start(u.host, u.port){ |http|
    # http.get(u.path)

    req = Net::HTTP::Get.new(u.path)
    req.basic_auth 'pitecan', 'masu1lab'
    http.request(req)
    #response = http.request(req)
    #response.body
  }
  res.body
end

def get_gyazz_data(host, name, title)
  get_web_data("#{host}/#{name}/#{title}/text")
end

def process(data, indent, host, name, title)
  # puts "#{host} -- #{name} -- #{title}"
  a = get_gyazz_data(host, name, title).split(/\n/)
  a.each { |line|
    if line =~ /^(\s*)\[\[(http.*)\]\]/ # ltsv取得
      indent = $1.length
      get_web_data($2).split(/\n/).each { |l|
        # l.sub!('videom.masuilab', 'video.masuilab') # videomのltsvのバグ対応
        data << "#{' '*indent}#{l}"
      }
    elsif line =~ /^(\s*)\[\[(.*)\]\]/ # Gyazzページ
      indent = $1.length
      process(data, indent, host, name, $2)
    else
      data << line
    end
  }
end

require 'cgi'
cgi = CGI.new('html3')

host = cgi.params['host'][0].to_s
host = "gyazz.masuilab.org" if host == ''
name = cgi.params['name'][0].to_s
name = "Gear" if name == ''
title = cgi.params['title'][0].to_s
title = "masui" if title == ''
format = cgi.params['format'][0].to_s
format = "ltsv" if format == ''

data = []
process(data, 0, "http://#{host}", name, title)
out = data.join("\n") + "\n"

if format == 'json'
  tmpltsv = "/tmp/tmpltsv#{$$}"
  tmpjson = "/tmp/tmpjson#{$$}"
  File.open(tmpltsv,"w"){ |f|
    data.each { |line|
      f.puts line
    }
  }
  jq = '/usr/local/bin/jq'
  jq = '/usr/bin/jq' unless File.exist?(jq)
  # system "/usr/bin/ruby /www/www.pitecan.com/ltsv2json #{tmpltsv} | #{jq} . > #{tmpjson}" # json gemが入ってない
  system "/home/masui/.rbenv/shims/ruby /www/www.pitecan.com/ltsv2json #{tmpltsv} | #{jq} . > #{tmpjson}"
  out = File.read(tmpjson)
end

cgi.out({"Access-Control-Allow-Origin" => '*'}){ # クロスドメインアクセス可能にするため
  out
}
