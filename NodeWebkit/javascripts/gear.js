//
// dialnode.js - 回転ダイヤルで階層的コンテンツを閲覧する
// (C) 増井俊之 2014/3/8
// 
//   http://GitHub.com/masui/Dial???
//

var useAnimation = true;   // アニメーションを使うかどうか
var showContents = true;   // コンテンツを別ウィンドウで表示 (デバッグ時false)

var nodeList = {};         // 表示可能ノードのリスト. nodeList[0]を中心に表示する
var oldNodeList;           // アニメーション前のnodeList
var spans = {};            // 表示されるspan要素のリスト
var oldSpans;              // アニメーション前のspans

var shrinking = false;     // 回転方向

var timeout = null;
var StepTime = 1000;       // 段階的展開のタイムアウト時間
var ExpandTime = 1500;     // 無操作時展開のタイムアウト時間
var AnimationTime = 300;   // ズーミングのアニメーション時間

//var undoStack = [];        // undoのためにヒストリを覚えておく
//var undoTimeout;           // 
//var UndoTime = 1000;       // この時間以内ならundoを許す

var win;
var iframe;
var image;

var typeCount = 0; // 連打したかどうか: 連打されてたら表示を行なう
var typeCountTimeout = null;

$(function() { // 最初に呼ばれるjQueryのready関数
    window.moveTo(0,0);
    // window.resizeTo(screen.width * 25 / 100,screen.height);
    window.resizeTo(screen.width,screen.height);
    //location.href = "http://pitecan.com";

    //iframe = $("<iframe>");
    iframe = $('#iframe');
    iframe.css('position','absolute');
    iframe.css('border','none');
    iframe.css('width','100%');
    iframe.css('height','100%');
    iframe.css('top','0pt');
    //iframe.css('left','400pt');
    iframe.css('left','0pt');
    iframe.css('overflow','hidden');
    iframe.attr('scrolling',"no");
    iframe.attr('allowtransparency','false');

    image = $('#image');
    image.css('width','auto');
    image.css('height','100%');
    image.css('max-height','100%');
    image.css('max-width','100%');
    image.css('background-pozsition','center center');

    loadData();
});

var loadData = function(){
    $.getJSON("data.json",function(data){
	initData(data,null,0);
	calc(data[0]);
	timeout = setTimeout(expand,ExpandTime);
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

    timeout = null;
    shrinking = false;
    if(nodeList[0].children){
	calc(nodeList[0].children[0]);
	timeout = setTimeout(expand,StepTime);
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
    //if(typeCount < 2 && !nodeList[0].children) return;

    var span;
    var left = 5 + node.level * 20;
    span = $('<span>');
    span.attr('class','line');
    span.css('width',String(cssWidth(parent)-left));
    span.css('left',String(left));
    span.css('color',color);
    //span.css('background-color',"rgba(255,255,255,0.5)");
    span.css('background-color',"rgba(255,255,255,0.4)");
    span.css('top',String(top));
    span.css('font-family','Helvetica, Arial, Hiragino Kaku Gothic ProN, ヒラギノ角ゴ ProN W3, Meiryo, メイリオ, sans-serif');
    if(bold) span.css('font-weight','bold');
    span.text('・' + node.title);
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
    dispLine(node, 0, center, '#0000ff', true, body, node.children);
    for(i=1;nodeList[i];i++){
	top = center + i * 20;
	if(top > browserHeight() - 40) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000000', false, body, false);
    }
    for(i= -1;nodeList[i];i--){
	top = center + i * 20;
	if(top < 0) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000000', false, body, false);
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

//var clearUndoStack = function(){
//    undoStack = [];
//};

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

    clearTimeout(timeout);
    timeout = setTimeout(expand,ExpandTime);

    // clearTimeout(undoTimeout);
    // undoTimeout = setTimeout(clearUndoStack,UndoTime);
    shrinking = true;
    // if(delta > 0){
    //	undoStack.push(nodeList[0]);
    //}
    //if(delta < 0 && undoStack.length > 0){ // undo可能
    //	calc(undoStack.pop());
    //}
    //else {
    	if(nodeList[delta]){
    	    calc(nodeList[delta]);
    	}
    //}
    return false;
};

var movex = function(delta){ // 視点移動
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines,1600);

    clearTimeout(timeout);
    timeout = setTimeout(expand,ExpandTime);

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
    //return move(delta < 0 ? 1 : -1);
    return movex(delta < 0 ? 1 : -1);
});

$(window).keydown(function(e){
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
});
