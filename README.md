# 超簡単に階層データブラウジング

回転ダイヤルや単純なパドル(トグルスイッチ)で大規模階層情報をブラウジングする

## 起動

### マウスホイール/KBだけ使う場合

dial.js で制御する

    % open index.html
    
### パドルを使う場合

圧力センサ付きパドルをBlendMicroで制御している。BlendMicroは圧力値を[ble-firmata](https://www.npmjs.org/package/ble-firmata)でMacのnode.jsに送っていて、そのnodeプログラムがHTTPとLindaのサーバーにもなっている。


必要なnodeモジュールをインストール

    % npm install


#### サーバー起動

blendmicroは[ファームウェア書き込み時](https://github.com/shokai/node-ble-firmata#install)に名前を決められる。

    % PORT=[ポート番号] ARDUINO=[blendmicroの名前] npm start
    % PORT=3000 ARDUINO=paddle npm start

=> http://localhost:3000/paddle.html

パドル/サーバー/ブラウザはlindaのタプルで圧力センサの値を共有している。

#### HTTPサーバー/BlendMicro/Linda/Socket.IOのデバッグ

`DEBUG=*`や`DEBUG=ble*`などを付けるとデバッグ情報が出力される

    % DEBUG=ble* PORT=3000 ARDUINO=paddle npm start
