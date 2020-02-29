#
# モノレールをSerencastで観賞する
#
i = 1
(0..14).each { |m|
  mm = sprintf("%02d",m)
  puts " #{mm}:--"
  (0..5).each { |s1|
    puts "  #{mm}:#{s1}-"
    (0..9).each { |s2|
      id = sprintf("%04d",i)
      puts "   [#{mm}:#{s1}#{s2} http://pitecan.com/monorail/monorail#{id}.jpg]"
      i += 1
    }
  }
}

