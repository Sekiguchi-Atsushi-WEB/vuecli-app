//Vue Routerの設定

//基本機能のインポート
import Vue from 'vue' //Vueをインポート
import Router from  'vue-router' //vue-routerをインポート

//ルーターのコンポーネントのインポート
//日記系ページのコンポーネント
import Index from './components/diary/Index.vue'
import Mypage from './components/diary/Mypage.vue'
import Edit_Create from './components/diary/Edit_Create.vue'
import Edit_Update from './components/diary/Edit_Update.vue'
import Help from './components/diary/Help.vue'
//ログイン系ページのコンポーネント
import Regist from './components/login/Regist.vue'
import Login from './components/login/Login.vue'
import Trial from './components/login/Trial.vue'


//routerプラグインを設定する
Vue.use(Router)

//今月の年月を取得して、パスパラメータを作成する
const NowDate = new Date()
let mypagePathStr = '/mypage/' + NowDate.getFullYear() + '/' + (NowDate.getMonth() +1)

//new Router()でURLとコンポーネントを紐付けてマッピングする。それをモジュール化している。
export default new Router({
  mode: 'history',  //historyモードにする
  routes: [
    {path: '/', component: Index},   //ルートアクセス
    {path: '/mypage', redirect: mypagePathStr},  //パスパラメータ無しで/mypageにアクセスしたら、パスパラメータ付きのURLへリダイレクトする
    {path: '/mypage/:year/:month', component: Mypage},  // /mypageに動的URLでパスパラメータを定義
    {path: '/edit/c/:ymdNo', component: Edit_Create},  //Edit_Createへのルーティングを定義
    {path: '/edit/u/:ymdNo', component: Edit_Update},  //Edit_Updateへのルーティングを定義
    {path: '/help', component: Help},  //Helpへのルーティングを定義
    {path: '/regist', component: Regist},  //Registへのルーティングを定義
    {path: '/login', component: Login},  //Loginへのルーティングを定義
    {path: '/trial', component: Trial},  //Trialへのルーティングを定義
    {path: '*', redirect: mypagePathStr}  //404アクセスは、全てmypageにリダイレクトする
  ],
  scrollBehavior(to, from, sevedPositon) { //scrollBehaviorを設定して、リンク動作時にブラウザバックとページ内idリンクへの遷移を実装する
    if(to.hash) { //ページ内idリンクの遷移を設定する（ページ内idリンクは使わないが、いちおう実装しておく）
      return { selector: to.hash }
    }
    if(sevedPositon) { //もしsevedPositonの値があれば、sevedPositonの値をリターンする（ブラウザバックを実装）
      return { sevedPositon }
    }
    //通常時の動作
    return { x: 0, y: 0 }
  }
})
