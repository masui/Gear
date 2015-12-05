#
# Gyazzに記述されたltsvのリストを読んで展開する
#

request = require 'request'

count = 0

ltsvtree = [] # 結果

dump = (a) ->
  if typeof(a) == "string"
    console.log a
  else
    a.forEach (line) ->
      dump line

process = (subtree, url, callback) ->
  count += 1 # 非同期なget()を呼ぶたびにカウントアップ
  request.get url, (err, response, body) ->
    if !err
      lines = body.split(/\n/)
      [0...lines.length].map (i) ->
        line = lines[i]
        if !line.match /^\s*#/
          a = line.match /\[\[(.*)\]\]/
          if a
            link = a[1]
            subtree[i] = []
            if link.match /^http/
              process subtree[i], link.split(/\s/)[0], callback
            else
              # console.log "===" + a[1]
              process subtree[i], "http://gyazz.masuilab.org/Gear/#{encodeURI(a[1])}/text", callback
          else
            subtree[i] = line
    else
      console.log "ERROR"
    count -= 1 # get()成功したらカウントダウン
    if count == 0
      callback ltsvtree

process ltsvtree, "http://gyazz.masuilab.org/Gear/masui/text", dump

