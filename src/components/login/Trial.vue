<template>
  <!-- お試しログインページ -->
	<div class="wrap">
    
		<!-- ヘッダー（ログインしているかどうかで変化させる） -->
		<header>
      <!-- ログインしていない時のヘッダー -->
      <template v-if="!token">
        <router-link to="/"><p class="header_title">ひとこと日記</p></router-link>
      </template>
      
      <!-- ログインしている時のヘッダー -->
      <template v-if="token">
        <!-- HeaderVueコンポーネントタグを使ってヘッダーを表示する -->
        <HeaderVue ref="header"></HeaderVue> <!--「ref="header"」を記述して、HeaderVueコンポーネントのメソッドを呼び出せるようにしておく -->
      </template>
		</header><!-- header end -->
		
		<!-- コンテンツエリア -->
		<div id="content">
			<h1><span>ログイン</span></h1>
      
      <!-- まだログインしていない場合はこちらを表示する -->
      <template v-if="!token">
        <p class="info">お試しユーザーとしてログインします。<br>現在入力されているログイン名とパスワードのまま、「ログインする」を押してください。</p>
        <form>
          <dl>
            <!-- ログイン名 -->
            <dt><span>ログイン名</span></dt>
            <dd>
              <input type="text" size="25" maxlength="255" v-model="login_name">
            </dd>
            <!-- パスワード -->
            <dt><span>パスワード</span></dt>
            <dd>
              <input type="password" size="25" maxlength="255" v-model="password">
            </dd>
          </dl>
          
          <!-- ログインアラート表示 -->
          <p class="p_alert" v-show="not_match_alert">ログイン名、またはパスワードが違います。</p>
          
          <!-- ログインボタン -->
          <input class="btn" type="button" value="ログインする" @click="clickLoginBtn()">
        </form>
      </template>
      
      <!-- 既にログインしている場合はこちらを表示する -->
      <template v-if="token">
        <p>現在、ログイン中です。</p>
        <p><router-link to="/mypage">日記(マイページ)へ</router-link></p>
        <p class="link_text" @click="logout()">ログアウト</p>
      </template>
      
		</div><!-- content end -->
		<!-- フッター -->
		<footer>&copy; 2021 Sekiguchi Atsushi</footer>
	
	</div><!-- wrap end -->
</template>

<script>
import axios from 'axios'  //axiosの読み込み
import crypto from 'crypto'  //crypto-jsの読み込み
import HeaderVue from '../diary/Header'  //Header.vueコンポーネントをインポートする
export default {
  data() {
    return {
      //入力値
      login_name: 'trial',
      password: 'TrialUser001',
      
      //ログインアラートのフラグ
      not_match_alert: false,
      
      //ログイン実行フラグ（tureならログインを実行する、falseなら実行しない）
      doLoginFig: true  //初期設定はtrue
    }
  },
  
  computed: {
    token() {  //トークンが存在するかを取得する
      let flg
      if(this.$store.getters.getToken != null){
        flg = true
      }else{
        flg = false
      }
      return flg
    }
  },
  
  components: {  //コンポーネントを登録する
    HeaderVue  //Header.vueコンポーネントを登録する
  },
  
  methods: {
    //■ [1]ログインボタンを押した時に実行する関数
    clickLoginBtn() {
      //アラートをクリアする（既に出ているアラートを消す）
      this.not_match_alert = false
      
      //ログイン実行フラグを初期値にリセットする
      this.doLoginFig = true
      
      //まず、入力値に特殊文字が入っていないかを確認
      if(this.checkExStr(this.login_name) || this.checkExStr(this.password)){  //特殊文字が使われているかをチェックする関数[2]を使用して、真偽を判定する
        this.not_match_alert = true //アラートをオン
        this.doLoginFig = false //ログイン実行フラグをオフ
      }
      
      //上記のチェックを通過した場合
      if(this.doLoginFig == true) {
        //ログイン情報を送信する関数[3]を実行する
        this.doLogin()
      }
    },
    
    //■ [2]特殊文字の使用チェック関数（文字列内に特殊文字が使用されていたら、trueを返す）
    checkExStr(str) {
      let checkFlg = false
      if(str.indexOf('&') != -1) { checkFlg = true; }
      if(str.indexOf('<') != -1) { checkFlg = true; }
      if(str.indexOf('>') != -1) { checkFlg = true; }
      if(str.indexOf('"') != -1) { checkFlg = true; }
      if(str.indexOf("'") != -1) { checkFlg = true; }
      if(str.indexOf(';') != -1) { checkFlg = true; }
      return checkFlg
    },
    
    //■ [3]ログイン情報を送信する関数
    doLogin() {
      //パスワードをハッシュ化する
      const hash_password = crypto.createHash('sha512').update(this.password).digest('hex')
      
      //axios.post()で、Expressサーバーへpost通信してデータを送信する
      axios.post(
        '/user_login',  //axios.post()の第一引数にエンドポイントを指定する。ユーザー登録のURLは「/user_regist」である。
        { login_name: this.login_name, password: hash_password }  //axios.post()の第二引数に送信するデータを指定する
      )
      .then(response => {  //リクエスト成功時の処理
        //結果はJSONの「login」の値で受け取れる
        //「login」の結果で場合分けする
        if(response.data.login == 'faild'){  //結果がfaildなら、ログイン名とパスワードの組み合わせが正しくない
          //ログインアラートを出す
          this.not_match_alert = true
          //console.log(response.data.login)
          
        }else if(response.data.login == 'success'){  //結果がsuccessなら、ログイン処理成功
          //ログイン成功時の処理を行う
          //受け取ったトークンとニックネームを、Vuexへ格納する。（commitを使ってmutationsを実行する）
          this.$store.commit('setToken', response.data.token)
          this.$store.commit('setNickname', response.data.nickname)
          //console.log('Vuex token: ', this.$store.getters.getToken); console.log('Vuex nickname: ', this.$store.getters.getNickname)
          //マイページへリダイレクトする
          this.$router.push('/mypage/')
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを表示する
        alert('ログイン処理で通信エラーが発生し、ログインできませんでした。')
      })
    },
    
    
    //■ ログアウトを行うメソッド
    logout() {
      //Header.vueコンポーネントのlogout()を実行する
      //this.$refs.<ref名>.<子コンポーネントのメソッド> の記述で、子コンポーネントのメソッドを実行できる
      this.$refs.header.logout()
    }
  }
}
</script>

<style scoped>
/* 全体 */
.wrap{
  width: 100%;
}

/* ヘッダー */
header{
	width: 100%;
	height: 56px;
	background-image: url(/images/bg_header.png);
	background-size: contain;
	background-repeat: repeat-x;
}

/* ヘッダータイトル */
header .header_title{
	height:50px;
	width:179px;
	background-image:url(/images/img_header.png);
  background-size: contain;
	font-size:1px;
	text-indent:-9999px;
}

/* ページ本文 */
#content{
	padding:10px 15px 50px 15px;
}

/* h1タイトル */
h1{
	margin-top:8px;
	margin-bottom:16px;
}
h1 span{
  font-size:20px;
  padding:5px 8px 5px 7px;
	border-left:#666666 solid 14px;
	border-bottom:#666666 solid 3px;
	font-weight:bold;
}

.info{
	padding-bottom:15px;
}

/* リンクテキストのデコレーション */
.link_text{
  text-decoration: underline;
  color: blue;
  cursor: pointer;
}

/* 入力値 */
dt{
	margin-bottom:5px;
}
dd{
	margin-bottom:1.5em;
}

dt>span{
	padding:3px;
	border-left:#006699 solid 5px;
	border-bottom:#006699 solid 1px;
	color:#003399;
	font-weight:bold;
}

.p_alert{
	color:#F00;
}

input{
	font-size:16px;
}

.btn{
	padding:2px 10px;
}

/* フッター */
footer{
	color:#333;
	padding:8px 0 6px 15px;
	background-color:#fafbfd;
	border-top: #f0f0f0 1px solid;
}

</style>