# -*- coding: utf-8 -*-
# -*- ruby -*-
#
#  % test rss.rb
#

require 'rubygems'
require 'rss/1.0'
require 'open-uri'
require 'hpricot'

#
# 取得したフィードを配列で返す。
# フィードが無い場合は空配列を返す。
# 指定したURLが無効な場合はnilを返す。
#
def feeds(url)
  list = []
  begin
    server = open(url)
  rescue
    return nil
  end
  links = Hpricot(server).search('link')
  links.each { |link|
    if link.attributes['type'] == 'application/rss+xml' ||
        link.attributes['type'] == 'application/atom+xml' then
      rss = link.attributes['href']
      if rss !~ /^http:/ then
        if rss =~ /^\// then
          url =~ /(http:\/\/[^\/]+)\//
          rss = $1 + '/' + rss.sub(/^\//,'')
        else
          url.sub(/\/$/,'')
          rss = url + '/' + rss.sub(/^\.\//,'')
        end
      end
      content = ''
      open(rss){ |f|
        content = f.read
      }
      
      rss = nil
      begin
        rss = RSS::Parser::parse(content)
      rescue RSS::InvalidRSSError
        rss = RSS::Parser::parse(content,false)
      end
      if rss then
        rss.items.each { |u|
          list << "url:#{u.link}\ttitle:#{u.title}"
        }
        #rss.channel.items.Seq.lis.each { |u|
        #  list << u.resource
        #}
      else
        content.each_with_index { |line,i|
          while line.sub!(/<link>([^<]*)<\/link>/,'') do
            list << "url:#{$1}\t記事#{i}"
          end
          while line.sub!(/<link.*href="(.*?)"/,'') do
            list << "url:#{$1}\t記事#{i}"
          end
        }
      end
      break
    end
  }
  return list
end

if __FILE__ == $0 then
  require 'test/unit'
  class RSSTest < Test::Unit::TestCase
    def setup
    end
    
    def teardown
    end

    def test_nonexisting_url
      urls = feeds('http://non.existing.url')
      assert(urls == nil)
    end

    def test_invalid_url
      urls = feeds('invalid.url')
      assert(urls == nil)
    end

    def test_no_rss
      urls = feeds('http://pitecan.com/')
      assert(urls == [])
    end

    def test_simple_rss
      urls = feeds('http://www.asahi.com/')
      assert(urls.class == Array)
      assert(urls.length > 0)
      assert(urls[0] =~ /^http/)
    end
  end
end

