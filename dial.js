//
// 回転ダイヤルであらゆるコンテンツを閲覧する
// 2013/12/1 増井
// pitecan.com:/home/masui/git/DialLens.git
// 
// Issues:
//  * 早送り/ページ送りも回転で制御する
//  * 階層の最後から次のカテゴリに移動したとき可逆的に戻れるようにする
//  * キーワードからの写真検索
//  * 富豪的実装のスリム化
//  * Wikipedia, 辞書などコンテンツ増強
//  * 行の高さやインデントなどを定数で指定する
//  * コンテンツを動的に取得する
//

var useAnimation = true;   // アニメーションを使うかどうか
var showContents = false;  // コンテンツを別ウィンドウで表示 (デバッグ時false)

var nodeList = {};         // 表示可能ノードのリスト. nodeList[0]を中心に表示する
var oldNodeList;           // アニメーション前のnodeList
var spans;                 // 表示されるspan要素のリスト
var oldSpans;              // アニメーション前のspans

var shrinking = false;     // 回転方向

var timeout;
var StepTimeout = 1000;    // 段階的展開のタイムアウト
var ExpandTimeout = 1500;  // 無操作時展開のタイムアウト
var AnimationTime = 300;   // ズーミングのアニメーション時間

var win;
if(showContents){
    win = window.open();  // YouTube, クックパッド等がiframeで表示できないので別ウィンドウを開く
}

$(function() { // jQueryのready関数. 最初に呼ばれる
    $.getJSON("data.json",function(data) {
	initdata(data,null,0);
	calc(data[0]);
	timeout = setTimeout(expand,ExpandTimeout);
    });
});

var initdata = function(nodes,parent,level){
    for(var i=0;i<nodes.length;i++){
	var node = nodes[i];
	node.number = i;
	node.level = level;
	node.elder = (i > 0 ? nodes[i-1] : null);
	node.younger = (i < nodes.length-1 ? nodes[i+1] : null);
	node.parent = parent;
	if(node.children){
	    initdata(node.children,node,level+1);
	}
    }
};

var browserHeight = function(){ // jQuery式の標準関数がありそうだが?
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

var expand = function(){ // 注目してるエントリの子供を段階的に展開する
    timeout = null;
    shrinking = false;
    if(nodeList[0].children){
	calc(nodeList[0].children[0]);
	timeout = setTimeout(expand,StepTimeout);
    }
};

var intValue = function(s){
    return Number(s.replace(/px/,''));
};

var cssWidth = function(entry){
    return intValue(entry.css('width'));
};

var refresh = function(){ // ゴミDOMを始末する. 富豪的すぎるかも?
    var i;
    for(i in spans) spans[i].show();
    for(i in oldSpans) oldSpans[i].remove();
};

var dispLine = function(node,ind,top,color,bold,parent,showloading){
    var span;
    var left = 5 + node.level * 20;
    span = $('<span>');
    span.attr('class','line');
    span.css('width',String(cssWidth(parent)-left));
    span.css('left',String(left));
    span.css('color',color);
    span.css('top',String(top));
    if(bold) span.css('font-weight','bold');
    span.text('・' + node.title);
    if(showloading){ // ローディングGIFアニメ表示
	// http://preloaders.net/ で作成したロード中アイコンを利用
	span.append($(' <span>&nbsp;</span>'));
	span.append($('<img src="loading.gif" style="height:12pt;">'));
    }
    parent.append(span);

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
	body.children().remove(); // 富豪的に生成したDOMを消す
    }

    if(nodeList[0].url && showContents){ // 別ウィンドウにコンテンツ表示
    	win.location.href = nodeList[0].url;
    }

    // 新しいノードの表示位置計算
    node = nodeList[0];
    dispLine(node, 0, center, '#00f', true, body, node.children);
    for(i=1;nodeList[i];i++){
	top = center + i * 20;
	if(top > browserHeight() - 40) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000', false, body, false);
    }
    for(i= -1;nodeList[i];i--){
	top = center + i * 20;
	if(top < 0) break;
	node = nodeList[i];
	dispLine(node, i, top, '#000', false, body, false);
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
				    this.remove();
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
				    color: '#fff',
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
		    oldnode.span.hide();
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
				    color: '#000',
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

$(window).keydown(function(e){
    refresh();
    clearTimeout(timeout);
    if(e.keyCode == 40 || e.keyCode == 39){ // 39 = 右, 40 = 下
	timeout = setTimeout(expand,ExpandTimeout);
	shrinking = false;
	if(nodeList[1]){
	    calc(nodeList[1]);
	}
    }
    else if(e.keyCode == 38 || e.keyCode == 37){ // 37 = 左, 38 = 上
	timeout = setTimeout(expand,ExpandTimeout);
	shrinking = true;
	if(nodeList[-1]){
	    calc(nodeList[-1]);
	}
    }
    return false;
});
