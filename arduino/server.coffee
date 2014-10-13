express = require 'express'
path    = require 'path'
Firmata =
  if process.env.BLE?
    require 'ble-firmata'
  else
    require 'arduino-firmata'

process.env.PORT ||= 3000

## HTTP, Socket.IO, Linda ##
app = express()
app.use express.static path.resolve './'

server = app.listen process.env.PORT
io = require('socket.io').listen server
linda = require('linda').Server.listen(io: io, server: server)
ts = linda.tuplespace('paddle')
console.log "server start - port:#{process.env.PORT}"

## Arduino ##
arduino = new Firmata()
arduino.once 'connect', ->
  arduino.on 'analogChange', (e) ->
    return if e.pin > 1
    data =
      type: 'paddle'
      direction: if e.pin == 0 then "left" else "right"
      value: e.value
    console.log data
    ts.write data

arduino.connect process.env.BLE or process.env.ARDUINO
