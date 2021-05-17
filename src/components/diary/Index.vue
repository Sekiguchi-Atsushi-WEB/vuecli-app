<template>
  <!-- トップページ -->
  <div class="wrap">
		
		<!-- コンテンツエリア -->
		<div id="content">
			<h1><span>ひとこと日記</span></h1>
			
			<section>
				<p>『ひとこと日記』は、毎日の小さなできごとを簡単にメモしておけるWebサイトです。</p>
				<p>スマートフォン、タブレット、パソコンなどから利用可能です。</p>
				
				<!-- ログインしているかどうかで出し分けする -->
				<ul v-if="!token"><!-- ログインしていないとき -->
					<li>・ユーザーの方は、<router-link to="/login">ログイン</router-link>へ</li>
					<li>・ユーザー登録がお済みでない方は、<router-link to="/regist">新規ユーザー登録</router-link>へ</li>
					<li>・登録せずに機能を試してみたい方は、<router-link to="/trial">お試しユーザーでログイン</router-link>へ</li>
				</ul>
				
				<ul v-if="token"><!-- ログインしているとき -->
					<li>現在、{{nickname}}さんのアカウントでログイン中です。</li>
					<li><router-link to="/mypage">&gt;&gt;日記を見る</router-link></li>
					<li><span class="link_text" @click="logout">&gt;&gt;ログアウトする</span></li>
				</ul>
			</section>
			
			<section>
				<p class="sec_title">使い方<br>2ステップで簡単操作</p>
				<p><span class="step">STEP 1</span>  ユーザー登録</p>
				<ul>
					<li>・<router-link to="/regist">登録ページ</router-link>にて、ID、パスワード、ニックネームを入力すれば登録完了。日記ページが開きます。</li>
				</ul>
				<p><span class="step">STEP 2</span>  日記を作成</p>
				<ul>
					<li>・日記ページにて、日記を作成したい日付をタップします。</li>
					<li>・日記作成ページに行くので、文章を入力して「作成」をタップ。日記が作成されます。</li>
				</ul>
				<img class="img_idx_st2" src="/images/img_index_step2.png" alt="日記作成">
			</section>

			<section>
				<p class="sec_title">特長</p>
				<ul>
					<li>・日記の更新・削除も簡単</li>
					<li>・様々なデバイスからログインして操作が可能</li>
					<li><router-link to="/help">機能紹介ページはこちら</router-link></li>
				</ul>
			</section>
			
			
		</div><!-- content end -->
		<!-- フッター -->
		<footer>&copy; 2021 Sekiguchi Atsushi</footer>
    
  </div>
</template>

<script>
import axios from 'axios'
export default {
  created() {  //生成時の処理
    //historyモードのリロード問題のための対応処理
    if(this.$route.query.urlpathstr){  //クエリパラメータ付きでルートにアクセスがあった場合、クエリパラメータにはリロード時のパスが入っている
      this.$router.push(this.$route.query.urlpathstr)  //クエリパラメータからリロード時のパスを取り出して、そのパスへとリダイレクトを行う
    }
  },
  
  computed: {
    token() {  //トークン表示用
      return this.$store.getters.getToken
    },
    nickname() {  //ニックネーム表示用プロパティ
      return this.$store.getters.getNickname
    }
  },
	
	methods: {
		//ログアウトするメソッド
    logout() {
      //確認ダイアログを出す
      let logoutFlg = window.confirm('現在、' + this.nickname + 'さんのアカウントでログイン中です。\nログアウトしまか？')
      //OKが押されたら、ログアウトの処理を実行する
      if(logoutFlg){
        //axios.get()で、ExpressサーバーへGET通信してログアウト処理する
        axios.get(
          '/user_login/logout',  //axios.get()の第一引数にエンドポイントを指定する
          { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
        )
        .then( () => {  //リクエスト成功時の処理
          //Vuexから認証情報を削除するメソッドを実行する
          this.deleteToken()
        })
        .catch( () => {  //リクエスト失敗時の処理
          //Vuexから認証情報を削除するメソッドを実行する
          this.deleteToken()
        })
      }
			//ログアウト完了したらメッセージを出す
			alert('ログアウトしました。')
    },
		
    //Vuexから認証情報を削除するメソッド
    deleteToken() {
      //Vuexから認証情報を削除
      this.$store.commit('setToken', null)
      this.$store.commit('setNickname', null)
    }
		
	}
}
</script>


<style scoped>
/* 全体 */
.wrap{
  width: 100%;
}

/* ページ本文 */
#content{
	width: 100%;
}

/* section */
section {
	padding: 20px 5vw 30px 5vw; /* 左右のpaddingは可変にする */
}

section:nth-of-type(2) {
	background-color: #f4f5f7; /* 2つ目のセクションの背景は色を付ける */
}

section:last-of-type {
	padding-bottom: 45px; /* 最後のセクションの末尾に余白を付ける */
}

/* h1タイトル */
h1{
	height: 162px;
	background-image: url(/images/bg_index.png);
	background-size: contain;
	background-repeat: repeat-x;
	overflow:hidden; /* overflow指定は子要素のマージン設定のためのズレ対策 */
	padding: 30px 0 0 39px;
}
h1 span{
	max-width:324px;
	max-height:137px;
	width: 90%;
	height: 90%;
	display: block;
	background-image:url(/images/img_index_h1.png);
	background-repeat: no-repeat;
	background-size: contain;
	margin-left: 5vw;
	font-size:1px;
	text-indent:-9999px;
}
@media only screen and (max-width: 400px) { /* h1のSP対応。不要なpaddingを無くす*/
  h1 { padding: 30px 0 0 0; }
}


/* 文章スタイル */
p{
	padding-bottom:15px;
}

.sec_title:before{  /* セクション見出しの前に■を入れる */
	content: "■";
	font-size:1.5em;
}

ul{
	list-style:none;

}
li{
	padding-left: 1em;
	text-indent: -1em;
	padding-bottom:6px;
}

/* 文章間隔の微調整 */
section:nth-of-type(2) p:first-of-type {
	padding-bottom: 25px; /* 2つ目のセクションの最初のpにpaddingで間隔を開ける */
}

section:nth-of-type(2) ul {
	padding-bottom: 25px; /* 2つ目のセクションのulのみpaddingで間隔を開ける */
}

/* STEPタイトル */
.step{
	background-color: #666666;
	color: #ffffff;
	display: inline-block;
	padding: 2px 4px;
	margin-right: 0.8em;
}

/* 文中画像 */
.img_idx_st2 {
	max-width: 344px;
	max-height: 56px;
	width: 90%;
	height: 90%;
	margin:0 0 5px 15px;
}

/* リンクテキストのデコレーション */
.link_text{
  text-decoration: underline;
  color: blue;
  cursor: pointer;
}
.link_text:visited {
  color: purple;
}

/* フッター */
footer{
	color:#333;
	padding:8px 0 6px 15px;
	background-color:#fafbfd;
	border-top: #f0f0f0 1px solid;
}
</style>