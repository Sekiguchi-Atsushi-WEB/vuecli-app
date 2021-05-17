import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'  //axiosをインポート
import router from './router.js'  //ルーターJSをインポート
import store from './store.js'  //Vuexを設定しているstore.jsをインポート
import VueScrollTo from 'vue-scrollto'  //vue-scrolltoをインポート

//AxiosオブジェクトにbaseURLを設定する
const baseURL = {  //エンドポイントURLを定義する
  'url01':'************' } //AWS-ELBへの接続用エンドポイント
Axios.defaults.baseURL = baseURL.url01  //baseURLを設定する

Vue.config.productionTip = false

Vue.use(VueScrollTo)  //vue-scrolltoプラグインを適用する

new Vue({
  router,  //インポートしたルーターJSをVueインスタンスに登録
  store,  //Vuexを登録
  render: h => h(App),
}).$mount('#app')
