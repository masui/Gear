#
# Gyazzに記述されたltsvのリストを読んで展開する
#
#

isNode = (typeof require != "undefined")

if isNode
  request = require 'request'
  get = (url, func) ->
    request.get url, (err, response, body) ->
      if !err
        func body
else
  get = (url, func) ->
    $.get url, (data) ->
      func data

count = 0

root = [] # 結果

dump = (a) ->
  if typeof(a) == "string"
    console.log a
  else
    a.forEach (line) ->
      dump line

process = (tree, indent, url, callback) ->
  console.log "PROCESS #{url} indent=#{indent}"
  count += 1 # 非同期なget()を呼ぶたびにカウントアップ
  # request.get url, (err, response, body) ->
  get url, (body) ->
    lines = body.split(/\n/)
    [0...lines.length].map (i) ->
      line = lines[i]
      if !line.match(/^\s*#/) && !line.match(/^\s*$/)
        if line.match(/^(\s*)\S/)
          lineindent = line.match(/^(\s*)\S/)[1].length
        # lineindent = 0
        a = line.match /\[\[(.*)\]\]/
        if a
          link = a[1]
          tree[i] = []
          if link.match /^http/
            process tree[i], indent+lineindent, link.split(/\s/)[0], callback
          else
            console.log "===" + a[1]
            process tree[i], indent+lineindent, "http://gyazz.masuilab.org/Gear/#{encodeURI(a[1])}/text", callback
        else
          tree[i] = line
    count -= 1 # get()成功したらカウントダウン
    if count == 0
      callback root

process root, 0, "http://gyazz.masuilab.org/Gear/masui/text", dump
