## 超簡単に階層データブラウジング

回転ダイヤルや単純なパドル(トグルスイッチ)で大規模階層情報をブラウジングする

### 起動

#### マウスホイール/KBだけ使う場合

dial.js で制御する

    % open index.html
    
#### パドルを使う場合

paddle-lindaというプログラムがArduino Firmataからパドルの圧力センサ値を読んでLindaタプルを生成し、
paddle.jsがそのタプルを読んでdial.jsをコントロールする

    % cd paddle-linda; npm start
    % open paddle.html



