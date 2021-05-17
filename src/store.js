//Vuexの設定

//基本機能のインポート
import Vue from 'vue'  //Vueをインポート
import Vuex from 'vuex'  //Vuexをインポート
import persistedstate from 'vuex-persistedstate'  //vuex-persistedstateをインポート（VuexをSessonStorageに保存するため）

//VuexプラグインをVueで使うためにuse()する
Vue.use(Vuex)

//Vuexにプロパティを登録して、モジュール化する
export default new Vuex.Store({
  state: {  //stateを定義する。（登録するプロパティは、トークンとニックネームの2つ）
    token: null,  //トークンを定義する（初期値はnull）
    nickname: ''  //ニックネームを定義する（初期値は空白文字）
  },
  getters: {  //gettersを定義する
    getToken: state => state.token,  //tokenのゲッターメソッドを定義する
    getNickname: state => state.nickname,  //nicknameのゲッターメソッドを定義する
  },
  mutations: {  //mutationsを定義する
    setToken(state, token) {  //tokenのセッターメソッドを定義する。引数はstateとtoken 。
      state.token = token  //引数で受け取ったtokenの値を、Vuexのtokenの値に上書き
    },
    setNickname(state, nickname) {  //nicknameのセッターメソッドを定義する。引数はstateとnickname 。
      state.nickname = nickname  //引数で受け取ったnicknameの値を、Vuexのnicknameの値に上書き
    }
  },
  plugins: [persistedstate({  //vuex-persistedstateをプラグインに設定して、VuexをSessonStorageに保存する（ブラウザをリロードしても消えないように）
    key: 'hitokoto',  //key名は「hitokoto」
    paths: ['token', 'nickname'],  //保存するstate名
    storage: window.sessionStorage  //保存先の指定。今回はsessionStorageに保存する。
  })]
})