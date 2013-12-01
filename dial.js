//
//
// リストのアニメーションをどうするか?
//  * 現在の状態の<span>リストを作る
//  * 次の状態の<span>リストを作る
//   - 同じ<span>が移動する場合はアニメーション移動
//   - 消える場合は移動しながらフェードアウト
//   - 新しく出る場合は移動しながらフェードイン
//
//

var data;
var root = {};
var curnode;
var curindex = 0;
var list;
var timeout;
var expandtimeout;

var win = window.open();
win.location.href = "http://pitecan.com/";

$(function() {
    $.getJSON("data.json",function(_data) {
	data = _data;
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

// 現在見ているところを子供まで展開する
function expand(){
    var newnode = curnode;
    if(false){
	while(newnode.children){
	    newnode = newnode.children[0];
	}
	if(curnode != newnode){
	    curnode = newnode;
	    calc();
	    display();
	}
    }
    else {
	if(newnode.children){
	    newnode = newnode.children[0];
	}
	if(curnode != newnode){
	    curnode = newnode;
	    calc();
	    display();
	    expandtimeout = setTimeout(expand,500);
	}
    }
}

var initdata = function(node,parent,level){
    var i;
    for(i=0;i<node.length;i++){
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

function displine(text,x,y,color,parent){
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
}

function display(){
    var tree;
    var line;
    var node;
    var y,i;
    var center = browserHeight() / 2;
    // tree = $('#tree');
    tree = $('body');
    tree.children().remove();
    curnode = list[curindex];
    // $('#view').attr('src',curnode.url);
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
}

function calc(){
    var i;
    var node;
    list = {};
    list[0] = curnode;
    curindex = 0;
    node = curnode;
    for(i=1;node = nextNode(node);i++){
	list[i] = node;
    }
    node = curnode;
    for(i= -1;node = prevNode(node);i--){
	list[i] = node;
    }
}

function nextNode(node){
    var nextnode;

    // 全部たどる場合
    if(false){
	nextnode = (node.children ? node.children[0] : node.younger);
	while(!nextnode && node.parent){
	    node = node.parent;
	    nextnode = node.younger;
	}
    }
    // 子供はたどらない場合
    else {
	nextnode = node.younger;
	while(!nextnode && node.parent){
	    node = node.parent;
	    nextnode = node.younger;
	}
    }

    return nextnode;
}

function prevNode(node){
    var prenode = node.elder;
    while(!prenode && node.parent != root){
	prenode = node.parent;
    }
    return prenode;
}

$(window).keydown(function(e){
    clearTimeout(expandtimeout);
    clearTimeout(timeout);
    if(e.keyCode == 39){
	if(list[curindex+1]) curindex += 1;
	timeout = setTimeout(function(){
	    expand();
	},1500);
    }
    else if(e.keyCode == 37){
	timeout = setTimeout(function(){
	    expand();
	},1500);
	if(list[curindex-1]){
	    if(list[curindex-1].level < list[curindex].level){
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

function display___(node){
    var line = $('<span>');
    line.css('position','absolute');
    line.css('left','40');
    line.css('top','' + browserHeight() / 2);
    line.text('らいん');
    $('body').append(line);
    line.animate({ 
	width: "80%",
	//opacity: 0.4,
	marginLeft: "0.6in",
	fontSize: "20em", 
	borderWidth: "10px"
    }, 600 );
    line = $('<span>');
    line.css('position','absolute');
    line.css('width','500');
    line.css('left','40');
    line.css('top','' + (browserHeight() / 2 + 100));
    line.text('らいん!!!!');
    $('body').append(line);
    line.animate({ 
	width: "80%",
	//opacity: 0.4,
	marginLeft: "0.6in",
	fontSize: "20em", 
	borderWidth: "10px"
    }, 1200 );
}


