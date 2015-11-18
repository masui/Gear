# Gear: 超簡単に階層データブラウジング

回転ダイヤルや単純なパドル(トグルスイッチ)で大規模階層情報をブラウジングする

## 準備

### data.jsonを作る

Rubyが必要

```
% cd Data
% make
% cp data.json ../
```


## 起動

### マウスホイール/KBだけ使う場合

dial.js で制御する

    % open index.html
    
### パドルを使う場合

圧力センサ付きパドルをBlendMicroで制御している。BlendMicroは圧力値を[ble-firmata](https://www.npmjs.org/package/ble-firmata)でMacのnode.jsに送っていて、そのnodeプログラムがHTTPとLindaのサーバーにもなっている。

nodeが使うモジュールなどは package.json に記述されている。

必要なnodeモジュールをインストール

    % cd arduino
    % npm install


#### サーバー起動

- Node.jsが必要
- USB接続かBLE接続を選ぶ
  - 環境変数ARDUINOを指定 : USB接続のArduinoを使う
  - 環境変数BLEを指定 : BLE接続のBlendMicroを使う
  - どちらも指定しない場合、デフォルトでUSB接続Arduinoを使う
- `/paddle.html` から開く


blendmicroは[ファームウェア書き込み時](https://github.com/shokai/node-ble-firmata#install)に名前を決められる。

    % PORT=[ポート番号] BLE=[blendmicroの名前] npm start
    % PORT=3000 BLE=paddle npm start

=> [http://localhost:3000/paddle.html]()

USB接続のArduinoを使う場合、`arduinoは/dev/tty*` のデバイス名で指定する

    % PORT=[ポート番号] ARDUINO=[arduinoのデバイス名] npm start
    % PORT=3000 npm start
    % PORT=3000 ARDUINO=/dev/tty.usb123a4b5c npm start  # デバイス名を指定

=> http://localhost:3000/paddle.html


パドル/サーバー/ブラウザはlindaのタプルで圧力センサの値を共有している。

#### HTTPサーバー/BlendMicro/Linda/Socket.IOのデバッグ

`DEBUG=*`や`DEBUG=ble*`などを付けるとデバッグ情報が出力される

    % DEBUG=ble* PORT=3000 ARDUINO=paddle npm start
