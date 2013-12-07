class UniqPrint
  @@cache = {}
  def self.puts(line)
    unless @@cache.has_key? line
      STDOUT.puts line
      @@cache[line] = true
    end
  end
end

source = ARGV.shift

photos = []

File.open(source).read.split(/[\r\n]/).each do |line|
  line.strip!
  next unless line =~ /^\[.+/
  year,month,day,hour,min,sec,md5 = line.scan(/^\[\"(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\",\s\"([a-z0-9]+)\"/)[0]
  time = Time.new(year.to_i, month.to_i, day.to_i, hour.to_i, min.to_i, sec.to_i)

  photos.push :time => time, :md5 => md5
end

photos.sort{|a,b|a[:time] <=> b[:time]}.each do |i|
  time = i[:time]
  md5 = i[:md5]
  UniqPrint.puts "title:#{time.year}"
  UniqPrint.puts "\ttitle:#{time.year}/#{time.month}"
  UniqPrint.puts "\t\ttitle:#{time.year}/#{time.month}/#{time.day}"
  UniqPrint.puts "\t\t\turl:#{md5}.jpg"
end
