#
# gear.js - 単純装置で階層的コンテンツを閲覧する
#
# node-webkitで動くようにしたもの
# 
# http://GitHub.com/masui/Gear
#

useAnimation =       true        unless useAnimation?        # アニメーションを使うかどうか
showContents =       true        unless showContents?        # メニューだけだでなく内容も表示するか
autoexpand =         true        unless autoexpand?          # 自動展開(デフォルト動作)
pauseAtLevelChange = true        unless pauseAtLevelChange?
dontShowSingleNode = true        unless dontShowSingleNode?  # 辞書に使うときとか
json =               'data.json' unless json?

nodeList = {}     # 表示可能ノードのリスト. nodeList[0]を中心に表示する
spans = {}        # 表示されるspan要素のリスト
shrinking = false # 回転方向

StepTime = 1000       # 段階的展開のタイムアウト時間   ?????
ExpandTime = 1500     # 無操作時展開のタイムアウト時間
expandTimeout = null

AnimationTime = 300   # ズーミングのアニメーション時間

HideTime = 1600       # 無操作時にメニューを消すアニメーション
hideTimeout = null

typeCount = 0           # 連打したかどうか: 連打されてたら表示を行なう
typeCountTimeout = null

loadData = ->
  $.getJSON json, (data) ->
    initData data, null, 0
    calc data[0]
    expandTimeout = setTimeout expand, ExpandTime

initData = (nodes,parent,level) -> # 木構造をセットアップ
  #for i, node of nodes
  for i in [0...nodes.length]
    node = nodes[i]
    node.level = level
    node.elder = (if i > 0 then nodes[i-1] else null)
    node.younger = (if i < nodes.length-1 then nodes[i+1] else null)
    node.parent = parent
    initData(node.children,node,level+1) if node.children

$ -> # document.ready()
  if typeof(require) != 'undefined' # node-webkitかどうか
    # v0.10からMacではこれが必要らしい
    nw = require 'nw.gui'
    win = nw.Window.get()
    nativeMenuBar = new nw.Menu({ type: "menubar" })
    if nativeMenuBar.createMacBuiltin
      nativeMenuBar.createMacBuiltin "Gear",
        hideEdit: true
        hideWindow: true
      win.menu = nativeMenuBar
     window.addEventListener "resize", ->
      	win.enterFullscreen()
      ,false
  loadData()

refresh = -> # 不要DOMを始末する. 富豪的すぎるかも?
  span.show() for i, span of spans
  span.remove() for i, span of oldSpans

browserHeight = -> # jQuery式の標準関数がありそうだが?
  if window.innerHeight
    return window.innerHeight
  if document.body
    return document.body.clientHeight
  return 0

resizefunc = ->
  height = screen.height
  width = screen.width
  $('body').css('width',width)
  $('body').css('height',height)
  $('#iframe').css('width',width)
  $('#iframe').css('height',height)
  $('#image').css('width',width)
  $('#image').css('height',height)
  $('#menu').css('height',height)
  $('#panel').css('width',width)
  $('#panel').css('height',height)


expand = -> # 注目してるエントリの子供を段階的に展開する
  clearTimeout hideTimeout
  hideTimeout = setTimeout hideLines, HideTime

  expandTimeout = null
  shrinking = false
  if nodeList[0].children
  	calc nodeList[0].children[0]
  	expandTimeout = setTimeout expand, StepTime

intValue = (s) ->
  Number s.replace(/px/,'')

hideLines = ->
  $('span').animate
    opacity:0.0
  , 700

dispLine = (node,ind,top,color,bold,parent,showloading) ->
  return if typeCount < 2 && !nodeList[0].children

  span = $('<span>')
  span.attr 'class', 'line'
  span.css 'width', parent.css('width')
  span.css 'color', color
  span.css 'top', String(top)
  span.css 'font-weight','bold' if bold

  span.text Array(node.level+1).join("　")+'・' + node.title

  if showloading # ローディングGIFアニメ表示
	  #  http://preloaders.net/ で作成したロード中アイコンを利用
  	span.append $(' <span>&nbsp;</span>')
  	span.append $('<img src="loading.gif" style="height:12pt;">')

  parent.append span

  span.hide() if useAnimation
  spans[ind] = span
  node.span = span

`
var hashIndex = function(hash,entry){ // ハッシュの値を検索. 標準関数ないのか?
  for(var i in hash){
    if(hash[i] == entry) return i;
  }
  return null;
};

var display = function(newNodeList){ // calc()で計算したリストを表示
    oldNodeList = nodeList;
    nodeList = newNodeList;
    oldSpans = spans;
    spans = {};

    var node;
    var top;
    var i,j,k;
    var parent;
    var center = browserHeight() / 2;
    var body = $('body');
    if(!useAnimation){
	//body.children().remove(); // 富豪的に生成したDOMを消す
    }

    if(nodeList[0].url && showContents){ // iframeコンテンツ表示
    	var url = nodeList[0].url;
	if(url.match(/twitter\.com/)){
	    // 無視
	}
	else if(url.match(/www\.ted\.com/)){
	    // 無視
	}
	else if(url.match(/(gif|jpg|jpeg|png)$/i)){
	    $('#iframe').css('display','none');
	    $('#image').css('display','block');
	    $('#image').attr('src',url);
	}
	else {
	    $('#iframe').css('display','block');
	    $('#image').css('display','none');
	    $('#iframe').attr('src',url);
	}
	// window.focus(); // 前面に持ってくる
    }

    // 新しいノードの表示位置計算
    node = nodeList[0];
    menu = $('#menu');
    dispLine(node, 0, center, '#0000ff', true, menu, node.children);
    for(i=1;nodeList[i];i++){
	top = center + i * 30;
	if(top > browserHeight() - 40) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000000', false, menu, false);
    }
    for(i= -1;nodeList[i];i--){
	top = center + i * 30;
	if(top < 0) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000000', false, menu, false);
    }

    // アニメーション表示
    if(useAnimation){
	for(i in oldNodeList){ // 古いエントリの扱いを調査
	    var oldnode = oldNodeList[i];
	    j = hashIndex(nodeList,oldnode); // 新しいリストに存在するか調査
	    if(j != null){ // 新しいリストに存在する == エントリが移動する
		if(spans[j]){ // 見える場所に移動する場合
		    if(oldSpans[i]){
			oldSpans[i].animate( // 移動アニメーション
			    {
				top: nodeList[j].span.css('top')
			    },
			    {
				duration: AnimationTime,
				complete: function(){
				    //this.remove();
				    typeCount = 2;
				    refresh();
				}
			    }
			);
		    }
		}
		else { // 見えなくなるエントリは即座に消す
		    if(oldnode.span){
			oldnode.span.hide();
		    }
		}
	    }
	    else { // 古いエントリが消える場合
		if(shrinking){
		    j = hashIndex(nodeList,oldnode.parent);
		    if(j != null){ // 親の位置にシュリンクしながら消える
			if(oldSpans[i]){
			    oldSpans[i].animate(
				{
				    top: nodeList[j].span.css('top'),
				    color: '#ffffff',
				    opacity: 0.1
				},
				{
				    duration: AnimationTime,
				    complete: function(){
					this.remove();
					typeCount = 2;
					refresh();
				    }
				}
			    );
			}
		    }
		}
		else { // 即座に消す
		    if(oldnode.span != undefined){
			oldnode.span.hide();
		    }
		}
	    }
	}
	for(i in nodeList){ // 新たに出現するエントリ
	    var newnode = nodeList[i];
	    k = hashIndex(oldNodeList,newnode);
	    if(k == null){
		parent = newnode.parent;
		if(parent && !shrinking){ // 親の位置から出現する
		    j = hashIndex(nodeList,parent);
		    if(j != null){
			if(newnode.span){
			    var dest = newnode.span.css('top');
			    newnode.span.show();
			    newnode.span.css('opacity',0);
			    newnode.span.css('top',intValue(parent.span.css('top'))+20);
			    newnode.span.animate(
				{
				    top: dest,
				    color: '#000000',
				    opacity: 1.0
				},
				{
				    duration: AnimationTime,
				    complete: function(){
					typeCount = 2;
					refresh();
				    }
				}
			    );
			}
		    }
		}
	    }
	}
    }
};

var calc = function(centerNode){ // centerNodeを中心にnodeListを再計算して表示
    var node;
    var i;
    var newNodeList = {}; // 毎回富豪的にリストを生成
    newNodeList[0] = centerNode;
    node = centerNode;
    for(i=1;node = nextNode(node);i++){
	newNodeList[i] = node;
    }
    node = centerNode;
    for(i= -1;node = prevNode(node);i--){
	newNodeList[i] = node;
    }
    display(newNodeList);
};

var nextNode = function(node){
    var nextnode = node.younger;
    while(!nextnode && node.parent){
	node = node.parent;
	nextnode = node.younger;
    }
    return nextnode;
};

var prevNode = function(node){
    var prevnode = node.elder;
    while(!prevnode && node.parent){
	prevnode = node.parent;
    }
    return prevnode;
};


var move = function(delta){ // 視点移動
    if(typeCount == 0){
	clearTimeout(typeCountTimeout);
	typeCount = 1;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }
    else if(typeCount == 1){
	clearTimeout(typeCountTimeout);
	typeCount = 2;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }
    else if(typeCount == 2){
	clearTimeout(typeCountTimeout);
	typeCount = 2;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }

    refresh();

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines,HideTime);

    clearTimeout(expandTimeout);
    if(!mouseisdown){
	expandTimeout = setTimeout(expand,ExpandTime);
    }

    shrinking = true;

    if(nodeList[delta]){
    	calc(nodeList[delta]);
    }

    return false;
};

var movex = function(delta){ // 視点移動
  if(typeCount == 0){
    clearTimeout(typeCountTimeout);
	typeCount = 1;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }
    else if(typeCount == 1){
	clearTimeout(typeCountTimeout);
	typeCount = 2;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }
    else if(typeCount == 2){
	clearTimeout(typeCountTimeout);
	typeCount = 2;
	typeCountTimeout = setTimeout(function(){
	    typeCount = 0;
	},1000);
    }


    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines,HideTime);

    clearTimeout(expandTimeout);
    if(!mouseisdown){
	expandTimeout = setTimeout(expand,ExpandTime);
    }

    shrinking = true; // ?

    refresh();

    if(nodeList[delta]){
	var newNodeList = {};
	for(i=0;nodeList[i+delta];i++){
	    newNodeList[i] = nodeList[i+delta];
	}
	for(i=-1;nodeList[i+delta];i--){
	    newNodeList[i] = nodeList[i+delta];
	}
	display(newNodeList);
    }

    return false;
};

$(window).blur(function(){ // ????
    setTimeout(window.focus,100);
});

$(window).mousewheel(function(event, delta, deltaX, deltaY) {
    return movex(delta < 0 ? 1 : -1);
});

var mousedowny = 0;
var mouseisdown = false;
var step = 0;

var downfunc = function(e){
    e.preventDefault();
    if(e.type == 'mousedown'){
	mousedowny = e.pageY;
    }
    if(e.type == 'touchstart'){
	mousedowny = event.changedTouches[0].pageY;
	//mousedowny = event.touches[0].pageY;
    }
    mouseisdown = true;
};

var upfunc = function(e){
    //alert('upfunc');
    e.preventDefault();

    mouseisdown = false;

    clearTimeout(expandTimeout);
    expandTimeout = setTimeout(expand,ExpandTime);

    step = 0;
};

var movefunc = function(e){
    e.preventDefault();
    if(mouseisdown){
	var delta = 0;
	if(e.type == 'mousemove'){
	    delta = e.pageY - mousedowny;
	}
	else if(e.type == 'touchmove'){
	    delta = event.changedTouches[0].pageY - mousedowny;
	}
	var i;
	var newstep;
	if(delta > 0){
	    newstep = Math.floor(delta / 20.0);
	    if(newstep > step){
		for(i=0;i<newstep-step;i++) movex(-1);
	    }
	    else if(newstep < step){
		for(i=0;i<step-newstep;i++) movex(1);
	    }
	    //$('#debug').text("step="+step+", newstep="+newstep+", y="+event.changedTouches[0].pageY);
	    step = newstep;
	}
	if(delta < 0){
	    newstep = Math.floor((0-delta) / 20.0);
	    if(newstep > step){
		for(i=0;i<newstep-step;i++) movex(1);
	    }
	    else if(newstep < step){
		for(i=0;i<step-newstep;i++) movex(-1);
	    }
	    //$('#debug').text("step="+step+", newstep="+newstep+", y="+event.changedTouches[0].pageY);
	    step = newstep;
	}
    }
};

var keydownfunc = function(e){
    switch(e.keyCode){
    case 40: return move(1);   // 下
    case 39: return movex(1);  // 右
    case 38: return move(-1);  // 上
    case 37: return movex(-1); // 左
    }
    return false;
};

$(window).on({
    'mousedown': downfunc,
    'touchstart': downfunc,
    'mouseup': upfunc,
    'touchend': upfunc,
    'mousemove': movefunc,
    'touchmove': movefunc,
    'keydown': keydownfunc,
    'resize': resizefunc
});`
