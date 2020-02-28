#
# 美人時計をSerencastで観賞する
#
(0..23).each { |h|
  hh = sprintf("%02d",h)
  puts " #{hh}:--"
  (0..5).each { |m1|
    puts "  #{hh}:#{m1}-"
    (0..9).each { |m2|
      puts "   [#{hh}:#{m1}#{m2} http://www.bijint.com/assets/pict/jp/pc/#{hh}#{m1}#{m2}.jpg]"
    }
  }
}

