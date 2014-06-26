express    = require 'express'
path       = require 'path'

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
if process.env.BLE?
  Firmata = require 'ble-firmata'
  arduino = new Firmata()
  arduino.connect process.env.BLE
else if process.env.ARDUINO?
  Firmata = require 'arduino-firmata'
  arduino = new Firmata()
  arduino.connect process.env.ARDUINO
else
  console.error 'read README.md, set ENV variable "ARDUINO" or "BLE"'
  process.exit 1

arduino.once 'connect', ->
  arduino.on 'analogChange', (e) ->
    return if e.pin > 1
    data =
      type: 'paddle'
      direction: if e.pin == 0 then "left" else "right"
      value: e.value
    console.log data
    ts.write data



