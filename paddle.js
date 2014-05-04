//
//
//
height = screen.availHeight;
width = screen.availWidth / 5;
if(width > 300) width = 300;
param = "top=0,left=0,height="+height+",width="+width;
menuwin = window.open("index.html","menu",param);

//
// Linda接続
//
//var socket = io.connect('http://node-linda-base.herokuapp.com:80');
var socket = io.connect('http://localhost:3000');
var linda = new Linda().connect(socket);
var ts = linda.tuplespace('paddle');

var direction = 'None';
var value = 0;
//var step1 = null;

var starttime = null;
var movetimer = null;  // move()をsetTimeout()で呼ぶ
var nexttime = null;   // 次のmove()予定時刻

// waitだけ待ってfuncを起動し、その後はintervalごとにfuncを起動
function fire(wait,interval,func){
  //console.log("filre");
  //console.log(wait);
  //console.log(interval);
  curtime = new Date();
  if(wait == 0){
    func();
    nexttime = Number(curtime) + interval;
    movetimer = setTimeout(repeatedfunc(interval,func),interval);
  }
  else {
    nexttime = Number(curtime) + wait;
    movetimer = setTimeout(repeatedfunc(interval,func),wait);
  }
}

var repeatedfunc = function(interval,func){
  return function(){
    fire(0,interval,func);
  };
};

var movefunc = function(delta){
  return function(){
    menuwin.$.move(delta);
  };
};

menuwin.focus();

// linda.io.on('connect', function(){
socket.on('connect', function(){
  ts.watch({type:"paddle"}, function(err, tuple){
    if(err) return;
    direction = tuple.data['direction'];
    value = tuple.data['value'];
    curtime = new Date();
    clearTimeout(movetimer);
    if(value < 10){
      direction = 'None';
      if(curtime - starttime < 300 && menuwin.$.step1){ // 1ステップだけ動かす
        refresh();
        calc(menuwin.$.step1);
      }
      starttime = null;
      nexttime = null;
      menuwin.$.step1 = null;
      repcount = 0;
    }
    else {
      // このあたりのパラメタは結構重要
      var interval = 
            value > 500 ? 30 :
            value > 400 ? 50 :
            value > 300 ? 100 :
            value > 200 ? 200 :
            value > 150 ? 300 :
            value > 80 ? 400 : 400 ;
      if(starttime == null){
        starttime = curtime;
        nexttime = starttime;
      }
      //console.log("nexttime = " + Number(nexttime) + ", curtime = " + Number(curtime));
      //if(nexttime >= curtime){
        fire(nexttime-curtime,interval,movefunc(direction == "left" ? 1 : -1));
      //}
    }
  });
});
