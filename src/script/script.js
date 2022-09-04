/**
 * キーの押下状態を調べるためのオブジェクト
 * このオブジェクトはプロジェクトのどこからでも参照できるように
 * window オブジェクトのカスタムプロパティとして設定する
 * @global
 * @type {object}
 */
window.isKeyDown = {};
/**
 * スコアを格納する
 * このオブジェクトはプロジェクトのどこからでも参照できるように
 * window オブジェクトのカスタムプロパティとして設定する
 * @global
 * @type {number}
 */
window.gameScore = 0;

/**
 * canvasの幅
 * @type {number}
 */
const CANVAS_WIDTH = 640;
/**
 * canvasの高さ
 * @type {number}
 */
const CANVAS_HEIGHT = 480;
/**
 * 敵キャラクター（小）のインスタンス数
 * @type {number}
 */
const ENEMY_SMALL_MAX_COUNT = 40;
/**
 * 岩のインスタンス数
 * @type {number}
 */
 const ENEMY_BLOCK_MAX_COUNT = 40;

 const ENEMY_ASSAULT_MAX_COUNT = 20;
/**
 * 敵キャラクター（大）のインスタンス数
 * @type {number}
 */
const ENEMY_LARGE_MAX_COUNT = 5;
/**
 * ショットの最大個数
 * @type {number}
 */
const SHOT_MAX_COUNT = 30;
const FUNNEL_SHOT_MAX_COUNT = 30;
/**
 * 敵キャラクターのショットの最大個数
 * @type {number}
 */
const ENEMY_SHOT_MAX_COUNT = 100;
/**
 * ボスキャラクターのホーミングショットの最大個数
 * @type {number}
 */
const HOMING_MAX_COUNT = 50;
const BOSS_ENEMY_SHOT_MAX_COUNT = 30;
/**
 * 爆発エフェクトの最大個数
 * @type {number}
 */
const EXPLOSION_MAX_COUNT = 10;
/**
 * 背景を流れる星の個数
 * @type {number}
 */
const BACKGROUND_STAR_MAX_COUNT = 100;
/**
 * 背景を流れる星の最大サイズ
 * @type {number}
 */
const BACKGROUND_STAR_MAX_SIZE = 3;
/**
 * 背景を流れる星の最大速度
 * @type {number}
 */
const BACKGROUND_STAR_MAX_SPEED = 4;

const DROP_ITEM_MAX_COUNT = 30;

const CLEAR_BONUS = 1000;

/**
 * Canvas2D API をラップしたユーティリティクラス
 * @type {Canvas2DUtility}
 */
let util = null;
/**
* 描画対象となる Canvas Element
* @type {HTMLCanvasElement}
*/
let canvas = null;
/**
* Canvas2D API のコンテキスト
* @type {CanvasRenderingContext2D}
*/
let ctx = null;
/**
 * シーンマネージャー
 * @type {SceneManager}
 */
let scene = null;
/**
* 実行開始時のタイムスタンプ
* @type {number}
*/
let startTime = null;
/**
* 自機キャラクターのインスタンス
* @type {Viper}
*/
let viper = null;
let funnel = null;
/**
 * ボスキャラクターのインスタンスを格納する配列
 * @type {Boss}
 */
let boss = null;
/**
 * 敵キャラクターのインスタンスを格納する配列
 * @type {Array<Enemy>}
 */
let enemyArray = [];
/**
* ショットのインスタンスを格納する配列
* @type {Array<Shot>}
*/
let shotArray = [];
let funnelShotArray = [];
/**
 * シングルショットのインスタンスを格納する配列
 * @type {Array<Shot>}
 */
let singleShotArray = [];
/**
 * 敵キャラクターのショットのインスタンスを格納する配列
 * @type {Array<Shot>}
 */
let enemyShotArray = [];
/**
 * ボスキャラクターのホーミングショットのインスタンスを格納する配列
 * @type {Array<Homing>}
 */
let homingArray = [];
let bossEnemyShotArray = [];
/**
 * 爆発エフェクトのインスタンスを格納する配列
 * @type {Array<Explosion>}
 */
let explosionArray = [];
/**
 * 流れる星のインスタンスを格納する配列
 * @type {Array<BackgroundStar>}
 */
let backgroundStarArray = [];
/**
 * 再スタートするためのフラグ
 * @type {boolean}
 */
let restart = false;
/**
 * 効果音再生のための Sound クラスのインスタンス
 * @type {Sound}
 */
let explosionSound = null;
let powerupSound = null;
let shotSound = null;
let clearSound = null;
let warningSound = null;
let bgCommonSound = null;
let bgBossSound = null;

let dropItemArray = [];
let openingId = null;

let title = null;
let soundOnButton = null;
let soundOffButton = null;
let warningAlpha = 0.1;

let isFinish = false;
let tmpScore = 0;

window.addEventListener('load', () => {
  // ユーティリティクラスを初期化
  util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
  // ユーティリティクラスからcanvasを取得
  canvas = util.canvas;
  // ユーティリティクラスから2dコンテキストを取得
  ctx = util.context;
  // canvas の大きさを設定
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  for(let i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
    // 星の速度と大きさはランダムと最大値によって決まるようにする
    let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
    let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
    // 星のインスタンスを生成する
    backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
    // 星の初期位置もランダムに決まるようにする
    let x = Math.random() * CANVAS_WIDTH;
    let y = Math.random() * CANVAS_HEIGHT;
    backgroundStarArray[i].set(x, y);
  }
  viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
  viper.setOpening(100, CANVAS_HEIGHT / 2);
  viper.setVectorFromAngle(degreesToRadians(0));
  title = new Opening(ctx, CANVAS_WIDTH / 2, 0, 300, 150, './image/title.png', 'title');
  soundOnButton = new Opening(ctx, 220, 320, 150, 75, './image/button1.png', 'button');
  soundOffButton = new Opening(ctx, 420, 320, 150, 75, './image/button2.png', 'button');
  openingLoadCheck();

  canvas.addEventListener("click", e => {
    // マウスの座標をCanvas内の座標とあわせるため
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    if(soundOnButton.hit(point)) {
      // ユーザーがクリック操作を行った際に初めてオーディオ関連の処理を開始する
      explosionSound = new Sound();
      shotSound = new Sound();
      clearSound = new Sound();
      warningSound = new Sound();
      powerupSound = new Sound();
      bgCommonSound = new Sound();
      bgBossSound = new Sound();
      // 音声データを読み込み、準備完了してから初期化処理を行う
      soundCheck();
    } else if(soundOffButton.hit(point)) {
      // 初期化処理を行う
      initialize();
      // インスタンスの状態を確認する
      loadCheck();
    }
  }, { once: true });
}, false);

function soundCheck() {
  const promise1 = new Promise((resolve, reject) => {
    explosionSound.load('./sound/explosion.mp3', (error) => {
      if(error != null){
        reject('explosionSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise2 = new Promise((resolve, reject) => {
    shotSound.load('./sound/shot.mp3', (error) => {
      if(error != null){
        reject('shotSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise3 = new Promise((resolve, reject) => {
    clearSound.load('./sound/donpafu.mp3', (error) => {
      if(error != null){
        reject('clearSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise4 = new Promise((resolve, reject) => {
    warningSound.load('./sound/warning.mp3', (error) => {
      if(error != null){
        reject('warningSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise5 = new Promise((resolve, reject) => {
    powerupSound.load('./sound/powerup.mp3', (error) => {
      if(error != null){
        reject('powerupSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise6 = new Promise((resolve, reject) => {
    bgCommonSound.load('./sound/bg_common.mp3', (error) => {
      if(error != null){
        reject('bgCommonSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  const promise7 = new Promise((resolve, reject) => {
    bgBossSound.load('./sound/bg_boss.mp3', (error) => {
      if(error != null){
        reject('bgBossSound ファイルの読み込みエラーです');
      }
      resolve();
    });
  });
  Promise.all([promise1, promise2, promise3, promise4, promise5, promise6, promise7]).then(() => {
    // 初期化処理を行う
    initialize();
    // インスタンスの状態を確認する
    loadCheck();
  }).catch(err => {
    alert(err);
    location.reload();
  });
}

/**
 * canvas やコンテキストを初期化する
 */
function initialize(){
  let i;
  
  // シーンを初期化する
  scene = new SceneManager();
  // 爆発エフェクトを初期化する
  for(i = 0; i < EXPLOSION_MAX_COUNT; ++i){
    explosionArray[i] = new Explosion(ctx, 100.0, 15, 40.0, 1.0);
    // 爆発エフェクト発生時に効果音を再生できるよう設定する
    explosionArray[i].setSound(explosionSound);
  }

  // 自機キャラクターを初期化する
  viper = new Viper(ctx, 0, 0, 64, 64, './image/viper.png');
  // 登場シーンからスタートするための設定を行う
  viper.setComing(
    -50,   // 登場演出時の開始 X 座標
    CANVAS_HEIGHT / 2, // 登場演出時の開始 Y 座標
    100,   // 登場演出を終了とする X 座標
    CANVAS_HEIGHT / 2 // 登場演出を終了とする Y 座標
  );
  viper.setVectorFromAngle(degreesToRadians(0));
  viper.setSound(shotSound);

  funnel = new Funnel(ctx, 0, 0, 32, 32, './image/viper.png');
  funnel.setVectorFromAngle(degreesToRadians(0));

  // ショットを初期化する
  for(i = 0; i < SHOT_MAX_COUNT; ++i){
    shotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
    singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
    singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, './image/viper_single_shot.png');
  }

  // ショットを自機キャラクターに設定する
  viper.setShotArray(shotArray, singleShotArray);

  for(i = 0; i < FUNNEL_SHOT_MAX_COUNT; ++i){
    funnelShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/viper_shot.png');
  }
  funnel.setShotArray(null, singleShotArray);

  // 敵キャラクターのショットを初期化する
  for(i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i){
    enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, './image/enemy_shot.png');
    enemyShotArray[i].setTargets([viper, funnel]); // 引数は配列なので注意
    enemyShotArray[i].setExplosions(explosionArray);
  }

  // ボスキャラクターのホーミングショットを初期化する
  for(i = 0; i < HOMING_MAX_COUNT; ++i){
    homingArray[i] = new Homing(ctx, 0, 0, 32, 32, './image/homing_shot.png');
    homingArray[i].setTargets([viper]); // 引数は配列なので注意
    homingArray[i].setExplosions(explosionArray);
  }
  for(i = 0; i < BOSS_ENEMY_SHOT_MAX_COUNT; ++i){
    bossEnemyShotArray[i] = new Enemy(ctx, 0, 0, 32, 32, './image/enemy_small.png');
    bossEnemyShotArray[i].setShotArray(enemyShotArray);
    bossEnemyShotArray[i].setAttackTargets([viper, funnel]);
    bossEnemyShotArray[i].setExplosions(explosionArray);
  }

  // ボスキャラクターを初期化する
  boss = new Boss(ctx, 0, 0, 128, 128, './image/boss.png');
  // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
  boss.setShotArray(enemyShotArray);
  // ボスキャラクターはホーミングショットを持っているので設定する
  boss.setHomingArray(homingArray);
  boss.setEnemyArray(bossEnemyShotArray);
  // 敵キャラクターは常に自機キャラクターを攻撃対象とする
  boss.setAttackTarget(viper);
  boss.setVectorFromAngle(180 * Math.PI / 180);

  // ドロップアイテムセット
  for(i = 0; i < DROP_ITEM_MAX_COUNT; i++) {
    dropItemArray[i] = new Item(ctx, 0, 0, 32, 32, './image/powerup.png');
    dropItemArray[i].setAttackTarget(viper);
    dropItemArray[i].setSound(powerupSound);
  }

  // 敵キャラクター（小）を初期化する
  for(i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
    enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, './image/enemy_small.png');
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    enemyArray[i].setShotArray(enemyShotArray);
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[i].setAttackTargets([viper, funnel]);
  }

  // 敵キャラクター（大）を初期化する
  for(i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i){
    enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, './image/enemy_large.png');
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTargets([viper, funnel]);
  }

  // 岩を初期化する
  for(i = 0; i < ENEMY_BLOCK_MAX_COUNT; ++i){
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, './image/block.png');
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + i].setAttackTargets([viper, funnel]);
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + i].setDropItemArray(dropItemArray);
  }

  for(i = 0; i < ENEMY_ASSAULT_MAX_COUNT; ++i){
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 48, 48, './image/assault.png');
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT + i].setAttackTargets([viper, funnel]);
    enemyArray[ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT + i].setDropItemArray(dropItemArray);
  }
  // ボスキャラクターも衝突判定の対象とするために配列に加えておく
  let concatEnemyArray = enemyArray.concat([boss]);

  // 衝突判定を行うために対象を設定する
  // 爆発エフェクトを行うためにショットに設定する
  for(i = 0; i < SHOT_MAX_COUNT; ++i){
    shotArray[i].setTargets(concatEnemyArray);
    singleShotArray[i * 2].setTargets(concatEnemyArray);
    singleShotArray[i * 2 + 1].setTargets(concatEnemyArray);
    shotArray[i].setExplosions(explosionArray);
    singleShotArray[i * 2].setExplosions(explosionArray);
    singleShotArray[i * 2 + 1].setExplosions(explosionArray);
  }

  for(i = 0; i < FUNNEL_SHOT_MAX_COUNT; ++i){
    funnelShotArray[i].setTargets(concatEnemyArray);
    funnelShotArray[i].setExplosions(explosionArray);
  }
  viper.setFunnel(funnel);

  // 流れる星を初期化する
  for(i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
    // 星の速度と大きさはランダムと最大値によって決まるようにする
    let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
    let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
    // 星のインスタンスを生成する
    backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
    // 星の初期位置もランダムに決まるようにする
    let x = Math.random() * CANVAS_WIDTH;
    let y = Math.random() * CANVAS_HEIGHT;
    backgroundStarArray[i].set(x, y);
  }
}

/**
 * インスタンスの準備が完了しているか確認する
 */
function loadCheck(){
  // 準備完了を意味する真偽値
  let ready = true;
  // AND 演算で準備完了しているかチェックする
  ready = ready && viper.ready;
  ready = ready && funnel.ready;
  // 同様に敵キャラクターの準備状況も確認する
  enemyArray.map((v) => {
    ready = ready && v.ready;
  });
  // 同様にショットの準備状況も確認する
  shotArray.map((v) => {
    ready = ready && v.ready; 
  });
  // 同様にホーミングショットの準備状況も確認する
  homingArray.map((v) => {
    ready = ready && v.ready;
  });
  bossEnemyShotArray.map((v) => {
    ready = ready && v.ready;
  });
  // 同様にシングルショットの準備状況も確認する
  singleShotArray.map((v) => {
    ready = ready && v.ready;
  });
  // 同様に敵キャラクターのショットの準備状況も確認する
  enemyShotArray.map((v) => {
    ready = ready && v.ready;
  });
  dropItemArray.map((v) => {
    ready = ready && v.ready;
  });
  funnelShotArray.map((v) => {
    ready = ready && v.ready;
  });

  // 全ての準備が完了したら次の処理に進む
  if(ready === true){
    // イベントを設定する
    eventSetting();
    // シーンを定義する
    sceneSetting();
    // 実行開始時のタイムスタンプを取得する
    startTime = Date.now();
    // 描画処理を開始する
    render();
  }else{
    // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
    setTimeout(loadCheck, 100);
  }
}

function openingLoadCheck() {
  let ready = true;
  ready = ready && viper.ready;
  ready = ready && title.ready;
  ready = ready && soundOnButton.ready;
  ready = ready && soundOffButton.ready;
  if(ready === true) {
    openingRender();
  } else {
    setTimeout(openingLoadCheck, 100);
  }
}

/**
 * イベントを設定する
 */
function eventSetting(){
  // キーの押下時に呼び出されるイベントリスナーを設定する
  window.addEventListener('keydown', (event) => {
    // キーの押下状態を管理するオブジェクトに押下されたことを設定する
    isKeyDown[`key_${event.key}`] = true;
    // ゲームオーバーから再スタートするための設定（エンターキー）
    if(event.key === 'Enter'){
      // 自機キャラクターのライフが 0 以下の状態
      if(viper.life <= 0 || isFinish){
        // 再スタートフラグを立てる
        restart = true;
      }
    }
  }, false);
  // キーが離された時に呼び出されるイベントリスナーを設定する
  window.addEventListener('keyup', (event) => {
    // キーが離されたことを設定する
    isKeyDown[`key_${event.key}`] = false;
  }, false);
}

/**
 * シーンを設定する
 */
function sceneSetting(){
  // イントロシーン
  scene.add('intro', (time) => {
    if(bgCommonSound !== null && scene.frame === 0) {
      if(bgCommonSound.pause === true) {
        bgCommonSound.setPause();
      } else {
        bgCommonSound.play(true);
      }
    }
    // 3 秒経過したらシーンを invade_default_type に変更する
    if(time > 3.0){
      scene.use('invade_default_type');
    }
  });
  // invade シーン（default type の敵キャラクターを生成）
  scene.add('invade_default_type', (time) => {
    // シーンのフレーム数が 30 で割り切れるときは敵キャラクターを配置する
    if(scene.frame % 50 === 0){
      // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
      for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
        if(enemyArray[i].life <= 0){
          let e = enemyArray[i];
          // ここからさらに２パターンに分ける
          // frame を 60 で割り切れるかどうかで分岐する
          if(scene.frame % 100 === 0){
            // 左側面から出てくる
            e.set(CANVAS_WIDTH, e.height, 2, 'default');
            // 進行方向は 30 度の方向
            e.setVectorFromAngle(degreesToRadians(150));
          }else{
            // 右側面から出てくる
            e.set(CANVAS_WIDTH, CANVAS_HEIGHT - e.height, 2, 'default');
            // 進行方向は 150 度の方向
            e.setVectorFromAngle(degreesToRadians(210));
          }
          break;
        }
      }
    }
    blockAttack(3, 3);
    // シーンのフレーム数が 400 になったとき次のシーンへ
    if(scene.frame === 400){
      scene.use('invade_assault_type');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // invade シーン（wave move type の敵キャラクターを生成）
  scene.add('invade_assault_type', (time) => {
    if(scene.frame === 0) {
      if(viper.shotRank === 1) {
        dropItemArray[0].set(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      }
    }
    let num = Math.floor(Math.random() * 10) + 1;
    let dropItemProbability = 3;
    // シーンのフレーム数が 50 で割り切れるときは敵キャラクターを配置する
    if(scene.frame % 50 === 0){
      let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT + ENEMY_ASSAULT_MAX_COUNT;
      for(let j = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT; j < i; j++){
        if(enemyArray[j].life <= 0){
          let e = enemyArray[j];
          let height = Math.random() * (CANVAS_HEIGHT);
          e.setExplosions(explosionArray);
          e.set(CANVAS_WIDTH, height, 5, 'assault');
          e.setVectorFromAngle(degreesToRadians(180));
          if(num % dropItemProbability === 0) {
            e.setHasItem(true);
          } else {
            e.setHasItem(false);
          }
          break;
        }
      }
    }
    blockAttack();
    // シーンのフレーム数が 450 になったとき次のシーンへ
    if(scene.frame === 450){
      scene.use('blank');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // 間隔調整のための空白のシーン
  scene.add('blank', (time) => {
    // シーンのフレーム数が 150 になったとき次のシーンへ
    if(scene.frame === 150){
      scene.use('invade_wave_move_type');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // invade シーン（wave move type の敵キャラクターを生成）
  scene.add('invade_wave_move_type', (time) => {
    // シーンのフレーム数が 50 で割り切れるときは敵キャラクターを配置する
    if(scene.frame % 50 === 0){
      // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
      for(let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i){
        if(enemyArray[i].life <= 0){
          let e = enemyArray[i];
          // ここからさらに２パターンに分ける
          // frame が 200 以下かどうかで分ける
          if(scene.frame <= 200){
            // 左側を進む
            e.set(CANVAS_WIDTH, e.height * 2, 2, 'wave');
          }else{
            // 右側を進む
            e.set(CANVAS_WIDTH, CANVAS_HEIGHT - e.height * 2, 2, 'wave');
          }
          break;
        }
      }
    }
    blockAttack();
    // シーンのフレーム数が 450 になったとき次のシーンへ
    if(scene.frame === 450){
      scene.use('invade_large_type');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  // invade シーン（large type の敵キャラクターを生成）
  scene.add('invade_large_type', (time) => {
    // シーンのフレーム数が 100 になった際に敵キャラクター（大）を配置する
    if(scene.frame === 100){
      // ライフが 0 の状態の敵キャラクター（大）が見つかったら配置する
      let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
      for(let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j){
        if(enemyArray[j].life <= 0){
          let e = enemyArray[j];
          // 画面中央あたりから出現しライフが多い
          e.set(CANVAS_WIDTH, CANVAS_HEIGHT / 2, 50, 'large');
          break;
        }
      }
    }
    // シーンのフレーム数が 700 になったとき次のシーンへ
    if(scene.frame === 700){
      scene.use('warning');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if(viper.life <= 0){
      scene.use('gameover');
    }
  });
  scene.add('warning', (time) => {
    if(bgCommonSound !== null && scene.frame === 0) {
      bgCommonSound.setPause();
    }
    if(warningSound !== null && scene.frame === 0) {
      warningSound.play(true, 2);
    }
    // 流れる文字の幅は画面の幅の半分を最大の幅とする
    let textWidth = CANVAS_WIDTH / 2;
    // 文字の幅を全体の幅に足し、ループする幅を決める
    let loopWidth = CANVAS_WIDTH + textWidth;
    // フレーム数に対する除算の剰余を計算し、文字列の位置とする
    let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
    // 文字列の描画
    ctx.font = 'bold 72px sans-serif';
    util.drawText('WARNING', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
    warningAlpha = 0.01 * (scene.frame % 100);
    util.drawRect(0, 0, canvas.width, canvas.height, `rgba(255, 0, 0, ${warningAlpha})`);
    if(scene.frame === 100) {
      if(viper.shotRank === 1) {
        dropItemArray[0].set(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      }
    }
    // シーンのフレーム数が 700 になったとき次のシーンへ
    if(scene.frame === 480){
      ctx.globalAlpha = 1.0;
      scene.use('invade_boss');
    }
  });
  // invade シーン（ボスキャラクターを生成）
  scene.add('invade_boss', (time) => {
    if(bgBossSound !== null && scene.frame === 10) {
      console.log(bgBossSound.pause, bgCommonSound);
      if(bgBossSound.pause === true) {
        bgBossSound.setPause();
      } else {
        bgBossSound.play(true);
      }
    }
    // シーンのフレーム数が 0 となる最初のフレームでボスを登場させる
    if(scene.frame === 0){
      // 画面中央上から登場するように位置を指定し、ライフは 250 に設定
      boss.set(CANVAS_WIDTH + 100, CANVAS_HEIGHT / 2, 250);
      // ボスキャラクター自身のモードは invade から始まるようにする
      boss.setMode('invade');
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    // ゲームオーバー画面が表示されているうちにボス自身は退避させる
    if(viper.life <= 0){
      scene.use('gameover');
      boss.setMode('escape');
    }
    // ボスが破壊されたらシーンを intro に設定する
    if(boss.life <= 0){
      for(let i=0; i < boss.homingArray.length; i++) {
        boss.homingArray[i].life = 0;
      }
      for(let i=0; i < boss.enemyArray.length; i++) {
        boss.enemyArray[i].life = 0;
      }
      for(let i=0; i < boss.shotArray.length; i++) {
        boss.shotArray[i].life = 0;
      }
      scene.use('gameclear');
    }
  });
  // ゲームオーバーシーン
  // ここでは画面にゲームオーバーの文字が流れ続けるようにする
  scene.add('gameover', (time) => {
    if(bgCommonSound !== null && scene.frame === 0) {
      if(bgCommonSound.pause === false) bgCommonSound.setPause();
    }
    if(bgBossSound !== null && scene.frame === 0) {
      if(bgBossSound.pause === false) bgBossSound.setPause();
    }
    // 流れる文字の幅は画面の幅の半分を最大の幅とする
    let textWidth = CANVAS_WIDTH / 2;
    // 文字の幅を全体の幅に足し、ループする幅を決める
    let loopWidth = CANVAS_WIDTH + textWidth;
    // フレーム数に対する除算の剰余を計算し、文字列の位置とする
    let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
    // 文字列の描画
    ctx.font = 'bold 72px sans-serif';
    util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
    // 再スタートのための処理
    if(restart === true){
      // 再スタートフラグはここでまず最初に下げておく
      restart = false;
      // スコアをリセットしておく
      gameScore = 0;
      // 再度スタートするための座標等の設定
      viper.setComing(
        -50,   // 登場演出時の開始 X 座標
        CANVAS_HEIGHT / 2, // 登場演出時の開始 Y 座標
        100,   // 登場演出を終了とする X 座標
        CANVAS_HEIGHT / 2 // 登場演出を終了とする Y 座標
      );
      // シーンを intro に設定
      scene.use('intro');
    }
  });
  // 一番最初のシーンには intro を設定する
  scene.use('intro');
  // 岩
  function blockAttack(life=10, dropItemProbability=4) {
    if(scene.frame % 150 === 0){
      let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT + ENEMY_BLOCK_MAX_COUNT;
      let num = Math.floor(Math.random() * 10) + 1;
      for(let j = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT; j < i; j++){
        if(enemyArray[j].life <= 0){
          let e = enemyArray[j];
          let height = Math.random() * (CANVAS_HEIGHT);
          e.set(CANVAS_WIDTH, height, life, 'block');
          e.setAttackTargets([viper, funnel]);
          e.setExplosions(explosionArray);
          // 進行方向は 30 度の方向
          e.setVectorFromAngle(degreesToRadians(180));
          if(num % dropItemProbability === 0) {
            e.setHasItem(true);
          } else {
            e.setHasItem(false);
          }
          break;
        }
      }
    }
  }
  // ゲームクリア
  scene.add('gameclear', (time) => {
    if(bgBossSound !== null && scene.frame === 0) {
      bgBossSound.setPause();
    }
    let title = 'Game Clear!';
    let text1 = `Clear Bonus　+${CLEAR_BONUS}`;
    let text2 = `Score　${zeroPadding(gameScore, 5)}`;

    if(scene.frame === 0) {
      tmpScore = gameScore;
    }
    // タイトルの描画
    if(scene.frame >= 100) {
      ctx.font = 'bold 48px sans-serif';
      let textWidth = ctx.measureText(title);
      util.drawText(title, (CANVAS_WIDTH / 2) - (textWidth.width / 2), CANVAS_HEIGHT / 2 - 60, '#fff');
    }

    // ボーナステキストの描画
    if(scene.frame >= 150) {
      ctx.font = 'bold 24px sans-serif';
      textWidth = ctx.measureText(text1);
      util.drawText(text1, (CANVAS_WIDTH / 2) - (textWidth.width / 2), CANVAS_HEIGHT / 2, '#fff');
    }

    // スコアの描画
    if(scene.frame >= 180 && scene.frame < 230) {
      textWidth = ctx.measureText(text2);
      util.drawText(text2, (CANVAS_WIDTH / 2) - (textWidth.width / 2), CANVAS_HEIGHT / 2 + 50, '#fff');
    }
    if(scene.frame >= 230) {
      let totalScore = tmpScore + CLEAR_BONUS;
      textWidth = ctx.measureText(text2);
      if(gameScore >= totalScore && !isFinish) {
        gameScore = totalScore;
        util.drawText(text2, (CANVAS_WIDTH / 2) - (textWidth.width / 2), CANVAS_HEIGHT / 2 + 50, '#fff');
        isFinish = true;
        if(clearSound !== null) {
          clearSound.play();
        }
      } else {
        if(!isFinish) {
          gameScore += 25;
        } else {
          if(restart === true){
            restart = false;
            isFinish = false;
            gameScore = 0;
            viper.setComing(
              -50,
              CANVAS_HEIGHT / 2,
              100,
              CANVAS_HEIGHT / 2
            );
            scene.use('intro');
          }
        }
        util.drawText(text2, (CANVAS_WIDTH / 2) - (textWidth.width / 2), CANVAS_HEIGHT / 2 + 50, '#fff');
      }
    }
  });
}

/**
 * 描画処理を行う
 */
function render(){
  // グローバルなアルファを必ず 1.0 で描画処理を開始する
  ctx.globalAlpha = 1.0;
  // 描画前に画面全体を暗いネイビーで塗りつぶす
  util.drawRect(0, 0, canvas.width, canvas.height, '#111122');

  // 現在までの経過時間を取得する(ミリ秒を秒に変換するため1000で除算)
  let nowTime = (Date.now() - startTime) / 1000;
  // 時間の経過が見た目にわかりやすいように自機をサイン波で動かす
  let s = Math.sin(nowTime);
  // サインやコサインは半径1の円を基準にしているので、得られる値の範囲が
  // -1.0 ~ 1.0になるため、効果がわかりやすくなるように100倍する
  let x = s * 100.0;

  // スコアの表示
  ctx.font = 'bold 24px monospace';
  util.drawText(zeroPadding(gameScore, 5), 30, 50, '#ffffff');

  // シーンを更新する
  scene.update();

  // 流れる星の状態を更新する
  backgroundStarArray.map((v) => {
    v.update();
  });

  // 自機キャラクターの状態を更新する
  viper.update();
  funnel.update();

  // ボスキャラクターの状態を更新する
  boss.update();

  // 敵キャラクターの状態を更新する
  enemyArray.map((v) => {
    v.update();
  });

  // ショットの状態を更新する
  shotArray.map((v) => {
    v.update();
  });

  // シングルショットの状態を更新する
  singleShotArray.map((v) => {
    v.update();
  });

  // 敵キャラクターのショットの状態を更新する
  enemyShotArray.map((v) => {
    v.update();
  });

  // ボスキャラクターのホーミングショットの状態を更新する
  homingArray.map((v) => {
    v.update();
  });
  bossEnemyShotArray.map((v) => {
    v.update();
  });
  dropItemArray.map((v) => {
    v.update();
  });
  funnelShotArray.map((v) => {
    v.update();
  });

  // 爆発エフェクトの状態を更新する
  explosionArray.map((v) => {
    v.update();
  });

  cancelAnimationFrame(openingId);
  // 恒常ループのために描画処理を再帰呼び出しする
  requestAnimationFrame(render);
}

function openingRender() {
  ctx.globalAlpha = 1.0;
  util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
  backgroundStarArray.map((v) => {
    v.update();
  });
  viper.update();
  title.update();
  soundOnButton.update();
  soundOffButton.update();
  openingId = requestAnimationFrame(openingRender);
}

/**
 * 度数法の角度からラジアンを生成する
 * @param {number} degrees - 度数法の度数
 */
function degreesToRadians(degrees){
  return degrees * Math.PI / 180;
}

/**
 * 数値の不足した桁数をゼロで埋めた文字列を返す
 * @param {number} number - 数値
 * @param {number} count - 桁数（２桁以上）
 */
function zeroPadding(number, count){
  // 配列を指定の桁数分の長さで初期化する
  let zeroArray = new Array(count);
  // 配列の要素を '0' を挟んで連結する（つまり「桁数 - 1」の 0 が連なる）
  let zeroString = zeroArray.join('0') + number;
  // 文字列の後ろから桁数分だけ文字を抜き取る
  return zeroString.slice(-count);
}