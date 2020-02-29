#
# 美人時計をSerencastで観賞する
#
i = 1
(0..23).each { |m|
  mm = sprintf("%02d",m)
  puts " #{mm}:--"
  (0..5).each { |s1|
    puts "  #{mm}:#{s1}-"
    (0..9).each { |s2|
      id = sprintf("%04d",i)
      puts "   [#{mm}:#{s1}#{s2} http://pitecan.com/enoden/enoden#{id}.jpg]"
      i += 1
    }
  }
}

