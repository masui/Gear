#
# モノレールをSerencastで観賞する
#
(0..14).each { |m|
  mm = sprintf("%02d",m)
  id = sprintf("%04d",m*60+1)
  puts " [#{mm}:00 http://pitecan.com/monorail/monorail#{id}.jpg]"
  (0..5).each { |s1|
    id = sprintf("%04d",m*60+s1*10+1)
    puts "  [#{mm}:#{s1}0 http://pitecan.com/monorail/monorail#{id}.jpg]"
    (0..9).each { |s2|
      id = sprintf("%04d",m*60+s1*10+s2+1)
      puts "   [#{mm}:#{s1}#{s2} http://pitecan.com/monorail/monorail#{id}.jpg]"
    }
  }
}

