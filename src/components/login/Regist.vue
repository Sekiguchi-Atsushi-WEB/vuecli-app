<template>
  <!-- ユーザー登録ページ -->
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
      
			<h1><span>新規ユーザー登録</span></h1>
      
      <!-- まだログインしていない場合はこちらを表示する -->
      <template v-if="!token">
        <p class="info">以下の項目に必要事項を入力して、「登録する」を押してください。</p><br>
        <form>
          <dl>
            <!-- ログイン名 -->
            <dt><span>ログイン名</span></dt>
            <dd>
              <p class="note">半角英数字で任意の文字を入れてください。メールアドレス可。</p>
              <input type="text" size="25" maxlength="255" v-model="login_name">
              <!-- ログイン名アラート表示 -->
              <p class="p_alert" v-show="login_empty_alert">ログイン名を入力してください</p>
              <p class="p_alert" v-show="login_half_alert">ログイン名は半角英数字にしてください</p>
              <p class="p_alert" v-show="login_dup_alert">このログイン名はすでに他のユーザーが使用しています。他のログイン名を入力してください</p>
            </dd>
            
            <!-- パスワード -->
            <dt><span>パスワード</span></dt>
            <dd>
              <p class="note">半角英数字で8文字以上にしてください。</p>
              <input type="password" size="25" maxlength="255" v-model="password">
              <!-- パスワードアラート表示 -->
              <p class="p_alert" v-show="password_empty_alert">パスワードを入力してください</p>
              <p class="p_alert" v-show="password_half_alert">パスワードは半角英数字にしてください</p>
              <p class="p_alert" v-show="password_length_alert">パスワードは8文字以上にしてください</p>
            </dd>
            
            <!-- 氏名 -->
            <dt><span>お名前・ニックネーム</span></dt>
            <dd>
              <p class="note">ログイン時に表示される名前です。自由に決めてください。</p>
              <input type="text" size="25" maxlength="255" v-model="nickname">
              <!-- 氏名アラート表示 -->
              <p class="p_alert" v-show="nickname_empty_alert">お名前・ニックネームを入力してください</p>
              <p class="p_alert" v-show="nickname_validate_alert">お名前・ニックネームには、&amp; &lt; &gt; &quot; &#39; &#059; 等の特殊文字を使用しないでください</p>
            </dd>
          </dl>
          
          <!-- 登録ボタン -->
          <input class="btn" type="button" value="登録する" @click="clickRegistBtn()">
        </form>
      </template>
      
      <!-- 既にログインしている場合はこちらを表示する -->
      <template v-if="token">
        <p>現在、ログイン中です。新規ユーザー登録を行う場合はログアウトしてから行ってください。</p>
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
      login_name: '',
      password: '',
      nickname: '',
      
      //入力アラートのフラグ
      login_empty_alert: false,  //ログイン名が空でないか
      login_half_alert: false,  //ログイン名が半角英数字か
      login_dup_alert: false,  //ログイン名が他者とダブっていないか
      password_empty_alert: false,  //パスワードが空でないか
      password_half_alert: false,  //パスワードが半角英数字か
      password_length_alert: false,  //パスワードが8文字以上か
      nickname_empty_alert: false,  //氏名が空でないか
      nickname_validate_alert: false,  //氏名に特殊文字が使われていないか
      
      //登録実行フラグ（tureなら登録を実行する、falseなら実行しない）
      doRegistFig: true  //初期設定はtrue
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
    //■ [1]登録ボタンを押した時に実行する関数
    clickRegistBtn() {
      //アラートをクリアする（既に出ているアラートを消す）
      this.login_empty_alert = false
      this.login_half_alert = false
      this.login_dup_alert = false
      this.password_empty_alert = false
      this.password_half_alert = false
      this.password_length_alert = false
      this.nickname_empty_alert = false
      this.nickname_validate_alert = false
      
      //登録実行フラグを初期値にリセットする
      this.doRegistFig = true
      
      //入力値を検証する関数[2]を実行
      this.verifyValue()
    },
    
    //■ [2]入力値を検証する関数
    verifyValue() {
      //[A]ログイン名のチェック
      //(a-1)空でないか
      if(this.login_name == ''){  //ログイン名が空でないか
        this.login_empty_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      //(a-2)半角英数字か
      if(!(this.login_name.match(/^[0-9a-zA-Z-_.@]+$/)) && this.login_name != ''){
        this.login_half_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      
      //[B]パスワードのチェック
      //(b-1)空でないか
      if(this.password == ''){
        this.password_empty_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      //(b-2)半角英数かどうか
      if(!(this.password.match(/^[0-9a-zA-Z-_]+$/)) && this.password != ''){
        this.password_half_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      //(b-3)8文字以上かどうか
      if(this.password.length < 8 && this.password != ''){
        this.password_length_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      
      //[C]氏名のチェック
      //(c-1)空でないか
      if(this.nickname == ''){
        this.nickname_empty_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      //(c-2)特殊文字が使用されていないか
      if(this.checkExStr(this.nickname)){  //特殊文字が使われているかをチェックする関数[3]を使用して、真偽を判定する
        this.nickname_validate_alert = true //アラートをオン
        this.doRegistFig = false //登録実行フラグをオフ
      }
      
      //以上のチェックを通過した場合
      if(this.doRegistFig == true) {
        //ログイン名のダブリチェック関数[4]を実行する
        this.postRegistInfo()
      }
    },
    
    //■ [3]特殊文字の使用チェック関数（文字列内に特殊文字が使用されていたら、trueを返す）
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
    
    //■ [4]ログイン名のダブリチェック関数
    postRegistInfo() {
      //axios.post()で、Expressサーバーへpost通信してデータを送信する
      axios.post(
        '/user_regist/check_dup',  //axios.post()の第一引数にエンドポイントを指定する。ダブリチェックのURLは「/user_regist/check_dup」である。
        { login_name: this.login_name }  //axios.post()の第二引数に送信するデータを指定する
      )
      .then(response => {  //リクエスト成功時の処理
        //結果はJSONの「login_name_info」の値で受け取れる
        //「login_name_info」の結果で場合分けする
        if(response.data.login_name_info == 'duplicate'){  //結果がduplicateなら、同じログイン名が既に存在している
          this.login_dup_alert = true //ログイン名ダブりのアラートをオンする
        }else if(response.data.login_name_info == 'unique'){  //結果がuniqueなら、ログイン名のダブリはない
          //ユーザー登録する関数[5]を実行する
          this.registUser()
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを表示する
				alert('登録確認処理で通信エラーが発生しました。もう一度登録ボタンを押してください。');
      })
    },
    
    //■ [5]ユーザー登録する関数
    registUser() {
      //確認ダイアログを表示
      let letsRegistFlg = confirm('ログイン名：' + this.login_name + '\nパスワード：********\n' + 'お名前・ニックネーム：' + this.nickname + '\n\n以上の内容で登録しますか？');
      
      //ダイアログでOKが押されたら、以下の処理を実行する
      if(letsRegistFlg){
        //パスワードをハッシュ化する
        const hash_password = crypto.createHash('sha512').update(this.password).digest('hex')
        
        //axios.post()で、Expressサーバーへpost通信してデータを送信する
        axios.post(
          '/user_regist',  //axios.post()の第一引数にエンドポイントを指定する。ユーザー登録のURLは「/user_regist」である。
          { login_name: this.login_name, password: hash_password, nickname: this.nickname }  //axios.post()の第二引数に送信するデータを指定する
        )
        .then(response => {  //リクエスト成功時の処理
          //結果はJSONの「regist」の値で受け取れる
          //「regist」の結果が「success」なら、登録は成功。
          if(response.data.regist == 'success'){
            //受け取ったトークンとニックネームを、Vuexへ格納する。（commitを使ってmutationsを実行する）
            this.$store.commit('setToken', response.data.token)
            this.$store.commit('setNickname', response.data.nickname)
            
            //メッセージを表示する
            alert('ユーザー登録が完了しました。\n日記機能をお使いいただけます。')
            
            //マイページへリダイレクトする
            this.$router.push('/mypage/')
            
          }
        })
        .catch(error => {  //リクエスト失敗時の処理
          console.log(error)
          //アラートを表示する
          alert('登録処理でエラーが発生し、登録できませんでした。');
        })
      }
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
	margin-bottom:2em;
}

dt>span{
	padding:3px;
	border-left:#006699 solid 5px;
	border-bottom:#006699 solid 1px;
	color:#003399;
	font-weight:bold;
}

.note {
  font-size: 14px;
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
