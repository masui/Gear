//
// 回転ダイヤルであらゆるコンテンツを閲覧する
// 2013/12/1 増井
// 
// Issues:
//  * 早送り/ページ送りも回転で制御する
//  * 階層の最後から次のカテゴリに移動したとき可逆的に戻れるようにする
//  * キーワードからの写真検索
//  * 富豪的実装のスリム化
//  * Wikipedia, 辞書などコンテンツ増強
//  * 行の高さやインデントなどを定数で指定する
//

var useAnimation = true;   // アニメーションを使うかどうか
var showContents = false;  // コンテンツを別ウィンドウで表示 (デバッグ時false)

var list = {};             // 表示エントリのリスト. list[0]を中心に表示する
var oldlist;               // アニメーション前のリスト
var lines;
var oldlines;

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

var browserHeight = function(){ // jQuery式の書き方がありそうだが?
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

var expand = function(){ // 注目してるエントリの子供を段階的に展開する
    timeout = null;
    shrinking = false;
    if(list[0].children){
	calc(list[0].children[0]);
	timeout = setTimeout(expand,StepTimeout);
    }
};

var intValue = function(s){
    return Number(s.replace(/px/,''));
};

var cssWidth = function(entry){
    return intValue(entry.css('width'));
};

var refresh = function(){ // ゴミDOMを始末する
    var i;
    for(i in lines) lines[i].show();
    for(i in oldlines) oldlines[i].remove();
};

var dispLine = function(node,ind,top,color,bold,parent,showloading){
    var line;
    var left = 5 + node.level * 20;
    line = $('<span>');
    line.attr('class','line');
    line.css('width',String(cssWidth(parent)-left));
    line.css('left',String(left));
    line.css('color',color);
    line.css('top',String(top));
    if(bold) line.css('font-weight','bold');
    line.text('・' + node.title);
    if(showloading){ // ローディングGIFアニメ表示
	// http://preloaders.net/ で作成したロード中アイコンを利用
	line.append($(' <span>&nbsp;</span>'));
	line.append($('<img src="loading.gif" style="height:12pt;">'));
    }
    parent.append(line);

    if(useAnimation) line.hide();
    lines[ind] = line;
    node.line = line;
};

var hashIndex = function(hash,entry){ // ハッシュの値を検索. 標準関数ないのか?
    for(var i in hash){
	if(hash[i] == entry) return i;
    }
    return null;
};

var display = function(newlist){ // calc()で計算したリストを表示
    oldlist = list;
    list = newlist;
    oldlines = lines;
    lines = {};

    var line;
    var node;
    var top;
    var i,j,k;
    var parent;
    var center = browserHeight() / 2;
    var body = $('body');
    if(!useAnimation){
	body.children().remove(); // 富豪的に生成したDOMを消す
    }

    if(list[0].url && showContents){ // 別ウィンドウにコンテンツ表示
    	win.location.href = list[0].url;
    }

    // 新しいノードの表示位置計算
    node = list[0];
    dispLine(node, 0, center, '#00f', true, body, node.children);
    for(i=1;list[i];i++){
	top = center + i * 20;
	if(top > browserHeight() - 40) break;
	node = list[i];
	dispLine(node, i, top, '#000', false, body, false);
    }
    for(i= -1;list[i];i--){
	top = center + i * 20;
	if(top < 0) break;
	node = list[i];
	dispLine(node, i, top, '#000', false, body, false);
    }

    // アニメーション表示
    if(useAnimation){
	for(i in oldlist){
	    var oldnode = oldlist[i];
	    j = hashIndex(list,oldnode);
	    if(j != null){ // エントリが移動する場合
		if(lines[j]){ // 見える場所に移動する場合
		    if(oldlines[i]){ // ?????
			oldlines[i].animate(
			    {
				top: list[j].line.css('top')
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
		else { // 見えなくなるものは即座に消す
		    if(oldnode.line){
			oldnode.line.hide();
		    }
		}
	    }
	    else { // エントリが消える場合
		if(shrinking){
		    j = hashIndex(list,oldnode.parent);
		    if(j != null){ // 親の位置にシュリンクしながら消える
			if(oldlines[i]){ // ?????
			    oldlines[i].animate(
				{
				    top: list[j].line.css('top'),
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
		    oldnode.line.hide();
		}
	    }
	}
	for(i in list){ // 新たに出現するもの
	    var newnode = list[i];
	    k = hashIndex(oldlist,newnode);
	    if(k == null){
		parent = newnode.parent;
		if(parent && !shrinking){ // 親の位置から出現する
		    j = hashIndex(list,parent);
		    if(j != null){
			if(newnode.line){
			    var dest = newnode.line.css('top');
			    newnode.line.show();
			    newnode.line.css('opacity',0);
			    newnode.line.css('top',intValue(parent.line.css('top'))+20);
			    newnode.line.animate(
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

var calc = function(centernode){ // centernodeを中心にlistを再計算して表示
    var node;
    var i;
    var newlist = {}; // 毎回富豪的にリストを生成
    newlist[0] = centernode;
    node = centernode;
    for(i=1;node = nextNode(node);i++){
	newlist[i] = node;
    }
    node = centernode;
    for(i= -1;node = prevNode(node);i--){
	newlist[i] = node;
    }
    display(newlist);
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
	if(list[1]){
	    calc(list[1]);
	}
    }
    else if(e.keyCode == 38 || e.keyCode == 37){ // 37 = 左, 38 = 上
	timeout = setTimeout(expand,ExpandTimeout);
	shrinking = true;
	if(list[-1]){
	    calc(list[-1]);
	}
    }
    return false;
});
