#
# Gyazzに記述されたltsvのリストを読んで展開する
#

isNode = (typeof(require) != "undefined")

if isNode
  request = require 'request'
  get = (url, callback) ->
    request.get url, (err, response, body) ->
      if !err
        callback body
  alert = (msg) ->
    console.log msg
else
  get = (url, callback) ->
    $.get url, (data) ->
      callback data

treeroot = []    # 全LTSVを取得するとき使われる木構造のトップ
root = {}        # 取得したLTSVから生成された階層的データ
parents = []
parents[0] = root

acount = 0 # 実行中の非同期処理の数

dump = (a, callback) ->
  if typeof(a) == "string"
    processline a
  else
    a.forEach (element) ->
      dump element
  if a == treeroot
    # rootにデータが入る!
    callback root

processline = (line) ->
  m = line.match /^(\s*)(\S.*)$/
  indent = m[1].length
  line = m[2]
  node = {}
  parents[indent+1] = node
  if !parents[indent]['children']
    parents[indent]['children'] = []
  parents[indent]['children'].push node
  line.split(/\t/).forEach (entry) ->
    m = entry.match /^([a-zA-Z_]+):(\s*)(.*)$/
    if m
      node[m[1]] = m[3]

process = (tree, indent, url, gyazz, gearname, callback) ->
  acount += 1 # 非同期なget()を呼ぶたびにカウントアップ
  get url, (body) ->
    lines = body.split(/\n/)
    lines = lines.filter (line) ->
      !line.match(/^\s*#/) && !line.match(/^\s*$/)
    [0...lines.length].map (i) ->
      line = lines[i]
      if line.match(/^(\s*)\S/)
        lineindent = line.match(/^(\s*)\S/)[1].length
      a = line.match /\[\[(.*)\]\]/
      if a
        link = a[1]
        tree[i] = []
        if link.match /^http/
          process tree[i], indent+lineindent, link.split(/\s/)[0], gyazz, gearname, callback
        else
          process tree[i], indent+lineindent, "#{gyazz}/#{encodeURI(a[1])}/text", gyazz, gearname, callback
      else
        tree[i] = " ".repeat(indent) + line
    acount -= 1 # get()成功したらカウントダウン
    if acount == 0
      dump treeroot, callback

exports.ltsv = (gyazz, gearname, callback) ->
  process treeroot, 0, "#{gyazz}/#{gearname}/text", gyazz, gearname, callback
  
# exports.ltsv "http://gyazz.masuilab.org/Gear", "test", (root) ->
#   console.log root.children
