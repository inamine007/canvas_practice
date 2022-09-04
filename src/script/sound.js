/**
 * 効果音を再生するための簡易的なクラス
 */
class Sound {
  /**
   * @constructor
   */
  constructor(){
    /**
     * オーディオコンテキスト
     * @type {AudioContext}
     */
    this.ctx = new AudioContext();
    /**
     * デコードしたオーディオデータ
     * @type {AudioBuffer}
     */
    this.source = null;

    this.pause = false;
  }

  setPause() {
    if(this.pause === true) {
      this.ctx.resume();
      this.pause = false;
    } else {
      this.ctx.suspend();
      this.pause = true;
    }
  }

  /**
   * オーディオファイルをロードする
   * @param {string} audioPath - オーディオファイルのパス
   * @param {function} callback - ファイルのロード完了時に呼ばれるコールバック関数
   */
  load(audioPath, callback){
    // fetch を利用してオーディオファイルをロードする
    fetch(audioPath)
    .then((response) => {
      // ロード完了したレスポンスから AudioBuffer 生成のためのデータを取り出す
      return response.arrayBuffer();
    })
    .then((buffer) => {
      // 取り出したデータから AudioBuffer を生成する
      return this.ctx.decodeAudioData(buffer);
    })
    .then((decodeAudio) => {
      // 再利用できるようにするために AudioBuffer をプロパティに確保しておく
      this.source = decodeAudio;
      // 準備完了したのでコールバック関数を呼び出す
      callback();
    })
    .catch(() => {
      // なにかしらのエラーが発生した場合
      callback('error!');
    });
  }
  /**
   * AudioBuffer から AudioBufferSourceNode を生成し再生する
   */
  play(loop=false, loopCount=null){
    // ノードを生成する
    let node = new AudioBufferSourceNode(this.ctx, {buffer: this.source});
    // ノードを接続する
    node.connect(this.ctx.destination);
    // ノードの再生が完了した後の解放処理を設定しておく
    node.addEventListener('ended', () => {
      // 念のため stop を実行
      node.stop();
      // ノードの接続を解除する
      node.disconnect();
      // ノードをガベージコレクタが解放するように null でリセットしておく
      node = null;
    }, false);
    // ノードの再生を開始する
    node.start();
    if(loop === true) {
      let time = this.ctx.currentTime;
      node.loop = true;
      if(loopCount) node.stop(time + (node.buffer.duration * loopCount));
    }
  }
}

