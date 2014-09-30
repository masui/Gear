//
// gear.js - 単純装置で階層的コンテンツを閲覧する
//
// node-webkitで動くようにしたもの
// 
// http://GitHub.com/masui/Gear
//

var useAnimation = true;   // アニメーションを使うかどうか
if(typeof(showContents) == 'undefined'){
    var showContents = true;
}
if(typeof(autoexpand) == 'undefined'){
    var autoexpand = true;
}
if(typeof(json) == 'undefined'){
    var json = "data.json";
}
if(typeof(pauseAtLevelChange) == 'undefined'){
    var pauseAtLevelChange = true;
}
if(typeof(dontShowSingleNode) == 'undefined'){
    var dontShowSingleNode = false;
}

var nodeList = {};         // 表示可能ノードのリスト. nodeList[0]を中心に表示する
var oldNodeList;           // アニメーション前のnodeList
var spans = {};            // 表示されるspan要素のリスト
var oldSpans;              // アニメーション前のspans

var shrinking = false;     // 回転方向

var expandTimeout = null;
var StepTime = 1000;       // 段階的展開のタイムアウト時間
var ExpandTime = 1500;     // 無操作時展開のタイムアウト時間
var AnimationTime = 300;   // ズーミングのアニメーション時間

//var win;
var iframe;
var image;
var menu;
var panel;

var typeCount = 0; // 連打したかどうか: 連打されてたら表示を行なう
var typeCountTimeout = null;

var resizefunc = function(){
    //var height = $(window).height();
    //var width = $(window).width();
    var height = screen.height;
    var width = screen.width;
    $('body').css('width',width);
    $('body').css('height',height);
    iframe.css('width',width);
    iframe.css('height',height);
    image.css('width',width);
    image.css('height',height);
    menu.css('height',height);
    panel.css('width',width);
    panel.css('height',height);
}

$(function() { // 最初に呼ばれるjQueryのready関数
    window.moveTo(0,0); // node-webkitだと有効だがブラウザだと駄目っぽい
    window.resizeTo(screen.width,screen.height);

    // v0.10からMacではこれが必要らしい
    var nw = require('nw.gui');
    win = nw.Window.get();
    var nativeMenuBar = new nw.Menu({ type: "menubar" });
    if(nativeMenuBar.createMacBuiltin){
       nativeMenuBar.createMacBuiltin("Gear", {
            hideEdit: true,
            hideWindow: true
        });
        win.menu = nativeMenuBar;
    }

    window.addEventListener("resize", function () {
	// Get the current window
	var win = nw.Window.get();
	win.enterFullscreen();
    },false);

    image = $('#image');
    menu = $('#menu');
    iframe = $('#iframe');
    panel = $('#panel');

    loadData();
});

var loadData = function(){
    $.getJSON(json,function(data){
	initData(data,null,0);
	calc(data[0]);
	expandTimeout = setTimeout(expand,ExpandTime);
    });
    setTimeout(loadData,6*60*60*1000); // 6時間ごとにリロード
};

var initData = function(nodes,parent,level){
    for(var i=0;i<nodes.length;i++){
	var node = nodes[i];
	node.number = i;
	node.level = level;
	node.elder = (i > 0 ? nodes[i-1] : null);
	node.younger = (i < nodes.length-1 ? nodes[i+1] : null);
	node.parent = parent;
	if(node.children){
	    initData(node.children,node,level+1);
	}
    }
};

var browserHeight = function(){ // jQuery式の標準関数がありそうだが?
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

var expand = function(){ // 注目してるエントリの子供を段階的に展開する
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines,1600);

    expandTimeout = null;
    shrinking = false;
    if(nodeList[0].children){
	calc(nodeList[0].children[0]);
	expandTimeout = setTimeout(expand,StepTime);
    }
};

var intValue = function(s){
    return Number(s.replace(/px/,''));
};

var cssWidth = function(entry){
    return intValue(entry.css('width'));
};

var refresh = function(){ // 不要DOMを始末する. 富豪的すぎるかも?
    var i;
    for(i in spans) spans[i].show();
    for(i in oldSpans){
	oldSpans[i].remove();
    }
};

var dispLines = function(){
    $('span').css('visibility','visible');
};
var hideLines = function(){
    $('span').animate({
        opacity:0.0
    }, 700 );
    //$('span').css('visibility','hidden');
};

var dispLine = function(node,ind,top,color,bold,parent,showloading){
    //if(typeCount < 2 && timeout == null) return;
    if(typeCount < 2 && !nodeList[0].children){
        return;
    }

    var span;
    ////var left = 5 + node.level * 20;
    span = $('<span>');
    span.attr('class','line'); // absoluteになってる
    span.css('width',String(cssWidth(parent)));
    ////span.css('width',String(cssWidth(parent)-left));
    ////span.css('left',String(left));
    span.css('left','5');
    span.css('color',color);
    //span.css('background-color',"rgba(255,255,255,0.5)");
    span.css('background-color',"rgba(200,200,200,0.4)");
    span.css('text-shadow','1px 1px 1px #e0e0e0, -1px 1px 1px #e0e0e0, 1px -1px 1px #e0e0e0, -1px -1px 1px #e0e0e0');
    //span.css('text-shadow','3px 3px 2px #ffff80, -3px 3px 2px #ffff80, 3px -3px 2px #ffff80, -3px -3px 2px #ffff80');
    //span.css('text-shadow','3px 3px 2px #d0d0d0');

    span.css('top',String(top));
    span.css('font-family','Helvetica, Arial, Hiragino Kaku Gothic ProN, ヒラギノ角ゴ ProN W3, Meiryo, メイリオ, sans-serif');
    if(bold) span.css('font-weight','bold');


    var text = "";
    for(var i=0;i<node.level;i++){ text += "　"; }
    text += ('・' + node.title);
    span.text(text);

    ////span.text('・' + node.title);
    if(showloading){ // ローディングGIFアニメ表示
	// http://preloaders.net/ で作成したロード中アイコンを利用
	span.append($(' <span>&nbsp;</span>'));
	span.append($('<img src="loading.gif" style="height:12pt;">'));
    }
    parent.append(span);
    //if(typeCount < 2 && timeout == null){
    //	span.css('visibility','hidden');
    //}

    if(useAnimation) span.hide();
    spans[ind] = span;
    node.span = span;
};

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
	    iframe.css('display','none');
	    image.css('display','block');
	    image.attr('src',url);
	}
	else {
	    iframe.css('display','block');
	    image.css('display','none');
	    iframe.attr('src',url);
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

var hideTimeout = null;

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
    hideTimeout = setTimeout(hideLines,1600);

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
    hideTimeout = setTimeout(hideLines,1600);

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

$(window).blur(function(){
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
    event.preventDefault();
    if(mouseisdown){
	var delta = 0;
	if(e.type == 'mousemove'){
	    delta = e.pageY - mousedowny;
	}
	else if(e.type == 'touchmove'){
	    delta = event.changedTouches[0].pageY - mousedowny;
	    //alert("" + mousedowny + " " + event.changedTouches[0].pageY);
	    //delta = event.touches[0].pageY - mousedowny;
	    //$('#debug').text(event.changedTouches[0].pageY);
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
    if(e.keyCode == 40){ // 40 = 下
	return move(1);
    }
    else if(e.keyCode == 38){ // 38 = 上
	return move(-1);
    }
    else if(e.keyCode == 39){ // 39 = 右
	return movex(1);
    }
    else if(e.keyCode == 37){ // 37 = 左
	return movex(-1);
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
});

//$(window).bind('touchend',upfunc);
//$('.line').bind('touchend',upfunc);
//$('span').bind('touchend',upfunc);
//$('body').bind('touchend',upfunc);

//document.addEventListener('touchend',upfunc,false);

