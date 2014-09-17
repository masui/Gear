//
// gear.js - 回転ダイヤルやスイッチで階層的コンテンツを閲覧する
// (C) 増井俊之 2013/12/1
// 
//   http://GitHub.com/masui/Dial
//

var useAnimation = true;   // アニメーションを使うかどうか

//var showContents = true;   // コンテンツを別ウィンドウで表示 (デバッグ時false)
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

var timeout;
var StepTime = 1000;       // 段階的展開のタイムアウト時間
var ExpandTime = 1500;     // 無操作時展開のタイムアウト時間
var AnimationTime = 300;   // ズーミングのアニメーション時間

var undoStack = [];        // undoのためにヒストリを覚えておく
var undoTimeout;           // 
var UndoTime = 1000;       // この時間以内ならundoを許す

//var win;
if(showContents){
  var height = screen.availHeight;
  var menuwidth = screen.availWidth / 5;
  if(menuwidth > 300) menuwidth = 300;
  var width = screen.availWidth - menuwidth;
  param = "top=0,left="+menuwidth+",height="+height+",width="+width+",scrollbars=yes";
  contentswin = window.open("","Contents",param);
  $.contentswin = contentswin;
  // win = window.open();  // YouTube, クックパッド等がiframeで表示できないので別ウィンドウを開く
}

$(function() { // 最初に呼ばれるjQueryのready関数
  loadData();
});

var loadData = function(){
//  $.getJSON("data.json",function(data){
  $.getJSON(json,function(data){
    initData(data,null,0);
    $.refresh();
    $.calc(data[0]);
    if(autoexpand){
      timeout = setTimeout(expand,ExpandTime);
    }
    else {
      expand();
    }
  });
  setTimeout(loadData,6*60*60*1000); // 6時間ごとにリロード
};

$.allfocus = function(){
  window.focus();
  contentswin.focus();
};

var say = function(node){
  return;
  text = node.title;
  if(text){
    //if(! node.children){
    //  text = text.substring(0,6);
    //}
    $.ajax({
      type: "GET",
      async: true,
      url: "http://localhost/~masui/say.cgi?text=" + text + "&level=" + node.level
    });
  }

};

var singleDescendant = function(node){
  //alert(node.title);
  if(node.children){
    if(node.children.length != 1){
      return null;
    }
    else {
      //alert("one child");
      //alert(node.title);
      return singleDescendant(node.children[0]);
    }
  }
  else {
    //alert("no children");
    //alert(node.title);
    return node;
  }
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
      var desc = singleDescendant(node);
      if(desc && dontShowSingleNode){
        node.children = null;
        node.title = desc.title;
      }
      else {
        initData(node.children,node,level+1);
      }
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
    say(nodeList[0].children[0]);
    $.calc(nodeList[0].children[0]);
    if(autoexpand){
      timeout = setTimeout(expand,StepTime);
    }
  }
};

var intValue = function(s){
  return Number(s.replace(/px/,''));
};

var cssWidth = function(entry){
  return intValue(entry.css('width'));
};

$.refresh = function(){ // 不要DOMを始末する. 富豪的すぎるかも?
  var i;
  for(i in spans) spans[i].show();
  for(i in oldSpans){
    oldSpans[i].remove();
  }
};

var ancestor = function(a,c){ // aがcの祖先か
  //while(a){
  //  if(a == c.parent) return true;
  //  a = a.parent;
  //}
  //return false;
  var p = c.parent;
  if(!p) return false;
  if(a == p) return true;
  return ancestor(a,p);
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
  //span.text('・' + node.title);
  span.text('・');

  if(node.children){
    if(ancestor(node,nodeList[0])){
      span.append($('<span style="font-size:10pt;color:#060;">▼&nbsp;</span>'));
    }
    else {
      span.append($('<span style="font-size:10pt;color:#060;">▶&nbsp;</span>'));
    }
  }
  
  s = $('<span>' + node.title + '</span>');
  if(node.children){
    // s.css('font-weight','bold');
  }
  span.append(s);

  if(showloading){ // ローディングGIFアニメ表示
    if(autoexpand){
      // http://preloaders.net/ で作成したロード中アイコンを利用
      span.append($(' <span>&nbsp;</span>'));
      span.append($('<img src="loading.gif" style="height:12pt;">'));
    }
    else {
      span.append($(' <span>&nbsp;</span>'));
      span.append($(' <span style="color:#0d0;">▶</span>'));
    }
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
    //contentswin.focus(); // 前面に持ってくる なんでこうしたんだっけ?
    contentswin.location.href = nodeList[0].url;
    console.log(contentswin);
    console.log("focus");
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
		  $.refresh();
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
		    $.refresh();
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
		  color: '#000000',
		  opacity: 1.0
		},
		{
		  duration: AnimationTime,
		  complete: function(){
		    $.refresh();
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

$.calc = function(centerNode){ // centerNodeを中心にnodeListを再計算して表示
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

var clearUndoStack = function(){
  undoStack = [];
};

var repcount = 0;
var lasttime = new Date();
//var move = function(delta){ // 視点移動
$.move = function(delta){ // 視点移動
  $.refresh();
  if(autoexpand){
    clearTimeout(timeout);
    timeout = setTimeout(expand,ExpandTime);
  }
  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(clearUndoStack,UndoTime);
  shrinking = true;
  
  if(pauseAtLevelChange){
    // キー連打/ダイヤル高速回転したときは階層移動しない
    curtime = new Date();
    timediff = curtime - lasttime;
    lasttime = curtime;
    if(timediff < 300){
      if(delta > 0 && !nodeList[0].younger ||
         delta < 0 && !nodeList[0].elder){
        // 階層の端まで行ったときはそれ以上移動しない。
        // ただししつこく呼んだ場合は移動する
        if(repcount < 15){
          repcount += 1;
          return false;
        }
        else {
          repcount = 0;
        }
      }
    }
  }
  
  if(delta > 0){
    //undoTimeout = setTimeout(clearUndoStack,UndoTime);
    undoStack.push(nodeList[0]);
  }
  if(delta < 0 && undoStack.length > 0){ // undo可能
    $.calc(undoStack.pop());
  }
  else {
    if(nodeList[delta]){
      if(!$.step1){
        $.step1 = nodeList[delta]; // 1ステップ移動先
      }
      $.calc(nodeList[delta]);
    }
  }

  say(nodeList[0]);

  return false;
};

$(window).mousewheel(function(event, delta, deltaX, deltaY) {
  return $.move(delta < 0 ? 1 : -1);
});

$(window).keydown(function(e){
  // 39 = 右, 40 = 下
  // 37 = 左, 38 = 上
  if(autoexpand){
    if(e.keyCode == 40 || e.keyCode == 39){
      return $.move(1);
    }
    else if(e.keyCode == 38 || e.keyCode == 37){
      return $.move(-1);
    }
  }
  else {
    if(e.keyCode == 40){ // 40 = 下
      return $.move(1);
    }
    else if(e.keyCode == 38){ // 38 = 上
      return $.move(-1);
    }
    else if(e.keyCode == 39){ // 39 = 右
      expand();
    }
  }
  return false;
});
