//
// 回転ダイヤルであらゆるコンテンツを閲覧する
// 2013/12/1 増井
// 
// Issues:
//  * リストのアニメーション (必要か?)
//  * キーワードからの写真検索
//  * 富豪的実装のスリム化
//  * Wikipedia, 辞書などコンテンツ増強
//

var doanimation = true;
var showcontents = false;

var list = {};                 // 表示エントリのリスト. list[0]が表示中心
var lines;

var shrinking = false;

var timeout;
var StepTimeout = 800;    // 段階的展開のタイムアウト
var ExpandTimeout = 1500; // 無操作時に展開のタイムアウト
var AnimationTime = 300;

var win = window.open();  // YouTube, クックパッド等がiframeで表示できないので別ウィンドウを開く

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

var displine = function(node,ind,y,color,bold,parent,showloading){
    var line;
    var x = 5 + node.level * 20;
    line = $('<span>');
    line.attr('class','line');
    line.css('width',String(Number(parent.css('width').replace(/px/,''))-x));
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

    if(doanimation) line.hide();
    lines[ind] = line;
    node.line = line; // ???
};

var nodestr = function(node){
    return node.title + node.level + node.url;
};

var display = function(newlist){ // calc()で計算したリストを表示
    var oldlist = list;
    list = newlist;

    var oldlines = lines;
    lines = {};

    var node2index = {};

    var body;
    var line;
    var node;
    var y;
    var i,j,k;
    var parent;
    var center = browserHeight() / 2;
    body = $('body');
    if(!doanimation){
	body.children().remove(); // 毎回富豪的にDOMを生成する
    }

    // ウィンドウにコンテンツ表示
    if(list[0].url){
	if(showcontents){
    	    win.location.href = list[0].url;
	}
    }

    // 新しいノードの表示位置計算
    node = list[0];
    node2index[nodestr(node)] = 0;
    displine(node, 0, center, '#00f', true, body, node.children);
    for(i=1;list[i];i++){
	y = center + i * 20;
	if(y > browserHeight() - 40) break;
	node = list[i];
	node2index[nodestr(node)] = i;
	displine(node, i, y, '#000', false, body, false);
    }
    for(i= -1;list[i];i--){
	y = center + i * 20;
	if(y < 0) break;
	node = list[i];
	node2index[nodestr(node)] = i;
	displine(node, i, y, '#000', false, body, false);
    }

    // アニメーション表示
    if(doanimation){
	for(i in oldlist){
	    var oldnode = oldlist[i];
	    j = node2index[nodestr(oldnode)];
	    if(j == 0 || j){
		if(oldlines[i]){ // ?????
		    oldlines[i].animate(
			{
			    top: list[j].line.css('top')
			},
			{
			    duration: AnimationTime,
			    complete: function(){
				this.remove();
				for(k in lines){
				    lines[k].show();
				}
				for(k in oldlines){
			            oldlines[k].remove();
				}
			    }
			}
		    );
		}
	    }
	    else {
		parent = oldnode.parent;
		if(parent && shrinking){
		    j = node2index[nodestr(parent)];
		    if(j == 0 || j){
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
					for(k in lines){
					    lines[k].show();
					}
					for(k in oldlines){
					    oldlines[k].remove();
					}
				    }
				}
			    );
			}
		    }
		}
		
		
		//if(oldlines[i]){ ///
		//oldlines[i].remove();
		//}
	    }
	}
	if(false){
	    for(i in list){
		var newnode = list[i];
		var found = false;
		for(k in oldlist){
		    if(newnode == oldlist[k]) found = true;
		}
		if(!found){
		    parent = newnode.parent;
		    if(parent && !shrinking){
			j = node2index[nodestr(parent)];
			if(j == 0 || j){
			    var dest = newnode.line.css('top');
			    newnode.line.show();
			    newnode.line.css('color','#000');
			    newnode.line.css('opacity',0);
			    newnode.line.css('top',parent.line.css('top'));
			    newnode.line.animate(
				{
				    top: dest,
				    color: '#000',
				    opacity: 1.0
				},
				{
				    duration: AnimationTime,
				    complete: function(){
					// this.remove();
					for(k in lines){
					    lines[k].show();
					}
					for(k in oldlines){
					    oldlines[k].remove();
					}
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
