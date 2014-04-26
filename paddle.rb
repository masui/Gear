# -*- coding: utf-8 -*-
require 'rubygems'
require 'linda-socket.io-client'
require './phidgets'

#
# Linda-socket用のセットアップ
#

# linda = Linda::SocketIO::Client.connect('http://node-linda-base.herokuapp.com:80')
linda = Linda::SocketIO::Client.connect('http://localhost:3000')
$ts = linda.tuplespace('paddle')

linda.io.on :connect do
  puts "connect!! <#{linda.url}/#{ts.name}>"
end

linda.io.on :disconnect do
  puts "socket.io disconnect"
end

class Paddle
  UP = 0
  DOWN = 1
  STOP = 2
  @@state = STOP

  def Paddle.msec
    Time.now.instance_eval { self.to_i * 1000 + (usec/1000) }
  end

  def Paddle.sensor(channel,value)
    if channel == 0 then
      if @@state == STOP || @@state == DOWN then
        if value > 20 then
          puts "move(-1);"
          $ts.write type:"paddle", name:"key", value:-1
          @@starttime = self.msec
          @@lasttime = self.msec
          @@state = UP
        end
      else # UP
        curtime = self.msec
        if value < 20 then # 押されなくなった
          @@state = STOP
          $ts.write type:"paddle", name:"stop"
        else
          if curtime - @@starttime > 700 then # 長押し
            if curtime - @@lasttime > 300 then
              @@lasttime = curtime
              puts "up #{value}"
              $ts.write type:"paddle", name:"press", value:-value
            end
          end
        end
      end
    end
    if channel == 1 then
      if @@state == STOP || @@state == UP then
        if value > 20 then
          puts "move(1);"
          $ts.write type:"paddle", name:"key", value:1
          @@starttime = self.msec
          @@lasttime = self.msec
          @@state = DOWN
        end
      else # DOWN
        curtime = self.msec
        if value < 20 then # 押されなくなった
          @@state = STOP
          $ts.write type:"paddle", name:"stop"
        else
          if curtime - @@starttime > 700 then # 長押し
            if curtime - @@lasttime > 300 then
              @@lasttime = curtime
              puts "down #{value}"
              $ts.write type:"paddle", name:"press", value:value
            end
          end
        end
      end
    end
  end
end

phidgets_sensor do |device, input, value, obj|
  # puts "Sensor #{input.index}'s value has changed to #{value}"
  Paddle.sensor(input.index.to_i,value.to_i)

  # ts.write type:"sensor", name:"paddle", index:input.index, value:value
end
