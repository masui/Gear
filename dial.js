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
var list;

$(function() {
    $.getJSON("data.json",function(_data) {
	data = _data;
	root.children = data;
	initdata(data,root,1);

	curnode = root.children[0];

	calc();
	display();
    });
});

var browserHeight = function(){  
    if(window.innerHeight){ return window.innerHeight; }  
    else if(document.body){ return document.body.clientHeight; }  
    return 0;  
};

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

function displine(element,height,indent){
}

function display(){
}

function calc(){
    var i;
    var node;
    list = {};
    list[0] = curnode;
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
    nextnode = (node.children ? node.children[0] : node.younger);
    while(!nextnode && node.parent){
	node = node.parent;
	nextnode = node.younger;
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
    if(e.keyCode == 39){
	curnode = nextNode(curnode) || curnode;
	$("#title").text(curnode.title);
    }
    else if(e.keyCode == 37){
	curnode = prevNode(curnode) || curnode;
	$("#title").text(curnode.title);
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


