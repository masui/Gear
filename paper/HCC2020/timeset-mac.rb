require 'io/console'

def randTime()
  t = rand(867)
  min = t / 60
  sec = ("0" + (t % 60).to_s)[-2,2]
  "#{min}:#{sec}"
end

start = Time.now.to_f

i = 0
puts randTime
while (key = STDIN.getch)
  i +=1
  if i < 5
    puts randTime
  elsif i == 5
    time = Time.now.to_f - start
    puts time / 5
    exit
  end
end
