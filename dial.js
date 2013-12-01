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

$(function() {
    $.getJSON("data.json",function(_data) {
	data = _data;
	root.children = data;
	initdata(data,root,1);

	curnode = root.children[0];

	calc(false);
	display();
	expand();
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
    while(newnode.children){
	newnode = newnode.children[0];
    }
    if(curnode != newnode){
	curnode = newnode;
	calc(false);
	display();
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

function displine(element,height,indent){
}

function display(){
    var body;
    var line;
    var node;
    var y,i;
    body = $('body');
    body.children().remove();
    curnode = list[curindex];
    for(i=0;list[i+curindex];i++){
	y = browserHeight() / 2 + i * 20;
	if(y > browserHeight()) break;
	node = list[i+curindex];
	line = $('<span>');
	line.css('position','absolute');
	line.css('width','500');
	line.css('left',String(40 + node.level * 40));
	line.css('color',i == 0 ? '#00f' : '#000');
	line.css('top',String(y));
	line.text(node.title);
	body.append(line);
    }
    for(i= -1;list[i+curindex];i--){
	y = browserHeight() / 2 + i * 20;
	if(y > browserHeight()) break;
	node = list[i+curindex];
	line = $('<span>');
	line.css('position','absolute');
	line.css('width','500');
	line.css('left',String(40 + node.level * 40));
	line.css('color','#000');
	line.css('top',String(y));
	line.text(node.title);
	body.append(line);
    }
}

function calc(exp){
    var i;
    var node;
    list = {};
    list[0] = curnode;
    curindex = 0;
    node = curnode;
    for(i=1;node = nextNode(node,exp);i++){
	list[i] = node;
    }
    node = curnode;
    for(i= -1;node = prevNode(node,exp);i--){
	list[i] = node;
    }
}

function nextNode(node,exp){
    var nextnode;

    // 全部たどる場合
    if(exp){
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
//    timeout = setTimeout(function(){
//	expand();
//    },1500);
    if(e.keyCode == 39){
	if(list[curindex+1]) curindex += 1;
	clearTimeout(timeout);
	timeout = setTimeout(function(){
	    expand();
	},1500);
    }
    else if(e.keyCode == 37){
	clearTimeout(timeout);
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


