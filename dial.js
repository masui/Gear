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
//

var useAnimation = true;  // アニメーションを使うかどうか
var showContents = false;  // コンテンツを別ウィンドウで表示 (デバッグ時false)

var list = {};            // 表示エントリのリスト. list[0]が表示中心
var oldlist;
var lines;
var oldlines;

var shrinking = false;

var timeout;
var StepTimeout = 1000;    // 段階的展開のタイムアウト
var ExpandTimeout = 1500; // 無操作時に展開のタイムアウト
var AnimationTime = 300;

var win;
if(showContents){
    win = window.open();  // YouTube, クックパッド等がiframeで表示できないので別ウィンドウを開く
}

$(function() {
    $.getJSON("data.json",function(data) {
	initdata(data,null,0);
	calc(data[0]);
	timeout = setTimeout(expand,ExpandTimeout);
    });
});

var browserHeight = function(){ // jQuery式の書き方がありそうだが?
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

// 表示中心を段階的に展開する
var expand = function(){
    timeout = null;
    shrinking = false;
    if(list[0].children){
	calc(list[0].children[0]);
	timeout = setTimeout(expand,StepTimeout);
    }
};

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

var value = function(s){
    return Number(s.replace(/px/,''));
};

var width = function(entry){
    return value(entry.css('width'));
};

var update = function(){
    var i;
    for(i in lines) lines[i].show();
    for(i in oldlines) oldlines[i].remove();
};

var displine = function(node,ind,y,color,bold,parent,showloading){
    var line;
    var x = 5 + node.level * 20;
    line = $('<span>');
    line.attr('class','line');
    line.css('width',String(width(parent)-x));
    line.css('left',String(x));
    line.css('color',color);
    line.css('top',String(y));
    if(bold) line.css('font-weight','bold');
    line.text('・' + node.title);
    if(showloading){
	// http://preloaders.net/ で作成したロード中アイコンを利用
	line.append($(' <span>&nbsp;</span>'));
	line.append($('<img src="loading.gif" style="height:12pt;">'));
    }
    parent.append(line);

    if(useAnimation) line.hide();
    lines[ind] = line;
    node.line = line;
};

var hashfind = function(hash,entry){
    for(var i in hash){
	if(hash[i] == entry) return i;
    }
    return null;
}

var display = function(newlist){ // calc()で計算したリストを表示
    oldlist = list;
    list = newlist;
    oldlines = lines;
    lines = {};

    var body;
    var line;
    var node;
    var y;
    var i,j,k;
    var parent;
    var center = browserHeight() / 2;
    body = $('body');
    if(!useAnimation){
	body.children().remove(); // 毎回富豪的にDOMを生成する
    }

    // ウィンドウにコンテンツ表示
    if(list[0].url){
	if(showContents){
    	    win.location.href = list[0].url;
	}
    }

    // 新しいノードの表示位置計算
    node = list[0];
    displine(node, 0, center, '#00f', true, body, node.children);
    for(i=1;list[i];i++){
	y = center + i * 20;
	if(y > browserHeight() - 40) break;
	node = list[i];
	displine(node, i, y, '#000', false, body, false);
    }
    for(i= -1;list[i];i--){
	y = center + i * 20;
	if(y < 0) break;
	node = list[i];
	displine(node, i, y, '#000', false, body, false);
    }

    // アニメーション表示
    if(useAnimation){
	for(i in oldlist){
	    var oldnode = oldlist[i];
	    j = hashfind(list,oldnode);
	    if(j != null){ // 新しいリストにノードが含まれる場合
		if(lines[j]){ // ノードが見えている場合
		    if(oldlines[i]){ // ?????
			oldlines[i].animate(
			    {
				top: list[j].line.css('top')
			    },
			    {
				duration: AnimationTime,
				complete: function(){
				    this.remove();
				    update();
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
	    else { // 表示が消える場合
		if(shrinking){
		    j = hashfind(list,oldnode.parent);
		    if(j != null){ // 親の位置にシュリンクする
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
					update();
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
	    k = hashfind(oldlist,newnode);
	    if(k == null){
		parent = newnode.parent;
		if(parent && !shrinking){
		    j = hashfind(list,parent);
		    if(j != null){
			if(newnode.line){
			    var dest = newnode.line.css('top');
			    newnode.line.show();
			    newnode.line.css('opacity',0);
			    newnode.line.css('top',value(parent.line.css('top'))+20);
			    newnode.line.animate(
				{
				    top: dest,
				    color: '#000',
				    opacity: 1.0
				},
				{
				    duration: AnimationTime,
				    complete: function(){
					update();
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
    update();
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
