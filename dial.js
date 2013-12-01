//
// 回転ダイヤルであらゆるコンテンツを閲覧する
// 2013/12/1 増井
// 

//
// リストのアニメーションをどうするか?
//  * 現在の状態の<span>リストを作る
//  * 次の状態の<span>リストを作る
//   - 同じ<span>が移動する場合はアニメーション移動
//   - 消える場合は移動しながらフェードアウト
//   - 新しく出る場合は移動しながらフェードイン
//

var root = {};
var curnode;
var curindex = 0;
var list;
var timeout;

var win = window.open();

$(function() {
    $.getJSON("data.json",function(data) {
	root.children = data;
	initdata(data,root,0);
	curnode = root.children[0];

	calc();
	display();
	timeout = setTimeout(function(){
	    expand();
	},1000);
    });
});

var browserHeight = function(){  
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

// 現在見ているところを段階的に展開する
var expand = function(){
    var newnode = curnode;
    if(newnode.children){
	newnode = newnode.children[0];
    }
    if(curnode != newnode){
	curnode = newnode;
	calc();
	display();
	timeout = setTimeout(expand,500);
    }
};

var initdata = function(node,parent,level){
    for(var i=0;i<node.length;i++){
	var n = node[i];
	n.number = i;
	n.level = level;
	n.elder = (i > 0 ? node[i-1] : null);
	n.younger = (i < node.length-1 ? node[i+1] : null);
	n.parent = parent;
	if(n.children){
	    initdata(n.children,n,level+1);
	}
    }
};

var displine = function(text,x,y,color,parent){
    var line;
    line = $('<span>');
    line.css('position','absolute');
    line.css('width',String(Number(parent.css('width').replace(/px/,''))-x));
    line.css('text-overflow','ellipsis');
    line.css('white-space','nowrap');
    line.css('overflow','hidden');
    line.css('left',String(x));
    line.css('color',color);
    line.css('top',String(y));
    line.text(text);
    parent.append(line);
};

var display = function(){
    var tree;
    var line;
    var node;
    var y,i;
    var center = browserHeight() / 2;
    // tree = $('#tree');
    tree = $('body');
    tree.children().remove();
    curnode = list[curindex];
    // $('#view').attr('src',curnode.url); // iframeの場合
    if(curnode.url){
	win.location.href = curnode.url;
    }

    node = list[curindex];
    displine(node.title, 10 + node.level * 20, center, '#00f', tree);
    for(i=1;list[i+curindex];i++){
	y = center + i * 20;
	if(y > browserHeight() - 40) break;
	node = list[i+curindex];
	displine(node.title, 10 + node.level * 20, y, '#000' ,tree);
    }
    for(i= -1;list[i+curindex];i--){
	y = center + i * 20;
	if(y < 0) break;
	node = list[i+curindex];
	displine(node.title, 10 + node.level * 20, y, '#000' ,tree);
    }
};

var calc = function(){
    var node;
    list = {};
    list[0] = curnode;
    curindex = 0;
    node = curnode;
    for(var i=1;node = nextNode(node);i++){
	list[i] = node;
    }
    node = curnode;
    for(var i= -1;node = prevNode(node);i--){
	list[i] = node;
    }
};

var nextNode = function(node){
    var nextnode;
    nextnode = node.younger;
    while(!nextnode && node.parent){
	node = node.parent;
	nextnode = node.younger;
    }
    return nextnode;
};

var prevNode = function(node){
    var prenode = node.elder;
    while(!prenode && node.parent != root){
	prenode = node.parent;
    }
    return prenode;
}

$(window).keydown(function(e){
    clearTimeout(timeout);
    if(e.keyCode == 40 || e.keyCode == 39){ // 39 = 右
	if(list[curindex+1]) curindex += 1;
	timeout = setTimeout(function(){
	    expand();
	},1500);
    }
    else if(e.keyCode == 38 || e.keyCode == 37){ // 37 = 左
	timeout = setTimeout(function(){
	    expand();
	},1500);
	if(list[curindex-1]){
	    if(list[curindex-1].level < list[curindex].level){ // 親に戻ったときは閉じる
		curnode = list[curindex-1];
		calc(false);
		display();
	    }
	    else {
		curindex -= 1;
	    }
	}
    }
    display();
    return false;
});
