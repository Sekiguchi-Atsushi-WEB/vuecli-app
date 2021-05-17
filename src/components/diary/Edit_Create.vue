<template>
  <!-- 日記作成ページ -->
  <div class="wrap">
    
    <!-- ヘッダー -->
    <HeaderVue></HeaderVue><!-- HeaderVueコンポーネントタグを使ってヘッダーを表示する -->
    
    <!-- コンテンツエリア -->
    <div id="content" v-if="display_flg"><!-- トークンの延長処理(ユーザー認証処理)が成功したら「display_flg」がtrueになる -->
      <!-- 月日タイトル -->
      <div class="date_title"><span class="date">{{ dateStr }} </span>の日記を<span class="edit">作成</span></div>
      
			<!-- テキストエリア＆ボタン -->
			<form>
				<textarea class="diaryText_area" rows="20" cols="100" v-model="diary_text"></textarea>
				<div class="btn_area">
					<input class="btn" type="button" value="作成" @click="makeDiary()">
        </div>
			</form>
      
			<!-- 戻るリンク -->
			<p class="link_text" @click="backDiaryPage()">&lt;&lt; 戻る</p>
      
		</div><!-- content end -->
		
    <!-- フッター -->
		<footer>&copy; 2021 Sekiguchi Atsushi</footer>
    
  </div><!-- wrap end -->
</template>

<script>
import axios from 'axios'  //axiosをインポートする
import HeaderVue from './Header.vue'  //Header.vueコンポーネントをインポートする
export default {
  data() {
    return {
      diary_text: '', //日記の文章
      display_flg: false  //画面表示フラグ
    }
  },
  
  computed: {
    ymdNo() {  //このページのymdNo
      return this.$route.params.ymdNo
    },
    dateStr() {  //月と日と曜日の文字列
      //ymdNoを年月日に分ける
      let yyyy = this.ymdNo.slice(0,4)  //年4桁
      let mm = this.ymdNo.slice(4,6)  //月2桁
      let dd = this.ymdNo.slice(-2)  //日2桁
      //曜日を取得
      let day = [ "日", "月", "火", "水", "木", "金", "土" ][new Date(yyyy, parseInt(mm)-1, parseInt(dd)).getDay()]
      //月日と曜日の文字列を生成
      return String(Number(mm)) + '月' + String(Number(dd)) + '日(' + day + ')'
    }
  },
  
  created() {
    //トークンの延長処理を行う（認証処理）
    //axios.get()で、ExpressサーバーへGET通信してデータを取得する
    axios.get(
      '/user_auth',  //axios.get()の第一引数にエンドポイントを指定する
      { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
    )
    .then(response => {  //リクエスト成功時の処理
      //認証結果が成功か不整合かで場合分けする
      if(response.data.auth == 'success') {  //成功
        //画面表示フラグをtrueにする
        this.display_flg = true
      }else if(response.data.auth == 'faild'){  //不整合
        //認証失敗時に行うメソッドを実行する
        this.authMismatch()
      }
    })
    .catch( ()=> {  //リクエスト失敗時の処理
      //認証失敗時に行うメソッドを実行する
      this.authMismatch()
    })
  },
  
  components: {  //コンポーネントを登録する
    HeaderVue  //Header.vueコンポーネントを登録する
  },
  
  methods: {
    //■ 認証失敗時に行うメソッド
    authMismatch() {
      //Vuexからトークンとニックネームを削除する
      this.$store.commit('setToken', null)
      this.$store.commit('setNickname', null)
      //メッセージを表示
      alert('未ログイン状態か、またはログインの有効期限が切れています。\n再ログインしてください。')
      //ログイン画面へ飛ばす
      this.$router.replace('/login')
    },
    
    //■ 日記を作成するメソッド
    makeDiary() {
      //日記の文章が空でないか確認する
      if(this.diary_text == ''){  //空なら、アラートを出す
        alert('日記の本文が入力されていません')
      }else{  //空でなければ、axios通信する
        //axios.post()で、Expressサーバーへpost通信してデータを送信する
        axios.post(
          '/edit_create/' + this.ymdNo,  //axios.post()の第一引数にエンドポイントを指定する
          { diary_text: this.diary_text },  //axios.post()の第二引数に送信するデータを指定する
          { headers: {'token': this.$store.getters.getToken} }  //axios.post()の第三引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
        )
        .then(response => {  //リクエスト成功時の処理
          //結果はJSONの値で受け取れる。JSONの内容によって場合分けする
          //ユーザー認証の結果は「auth」の値で受け取れる
          //authがexpired（期限切れ）ならば、ページアクセスを弾く
          if(response.data.auth == 'expired') {
          //アラートを出す
          alert('ログインがタイムアウトしました。もう一度ログインしてください')
          //Vuexから認証情報を削除してログインページに飛ばすメソッドを実行する
          this.deleteToken()
          
          //authがexpired（期限切れ）でないならば、日記処理の結果を受け取って処理する
          //日記処理の結果は「sql_query」の値で受け取れる
          //sql_queryがexistedなら、日記が既に存在しているので、日記を作成しなかったことを表す
          }else if(response.data.sql_query == 'existed'){
            alert('データベース処理の問題により、日記は作成されませんでした')
            //日記ページに戻る
            this.$router.push('/mypage/' + this.ymdNo.slice(0,4) + '/' + String(Number(this.ymdNo.slice(4,6))) )
          
          //sql_queryがsuccessなら、日記を作成されたことを表す
          }else if(response.data.sql_query == 'success'){
            alert(this.dateStr + 'の日記が作成されました')
            //日記ページに戻る（該当日のidへ遷移する）
            let pathStr = '/mypage/' + this.ymdNo.slice(0,4) + '/' + String(Number(this.ymdNo.slice(4,6)))  //urlパス
            let hashStr = '#list_' + (this.ymdNo)  //idを示すハッシュ
            this.$router.push({ path:pathStr, hash:hashStr })
          }
        })
        .catch(error => {  //リクエスト失敗時の処理
          console.log(error)
          //アラートを出す
          alert('データベースとの接続に不具合が生じ、日記データを作成することができませんでした。')
        })
      }
    },
    
    //■ 日記ページへ戻るリンクのメソッド
    backDiaryPage() {
      let yyyy = this.ymdNo.slice(0,4)  //年4桁
      let mm = this.ymdNo.slice(4,6)  //月2桁
      this.$router.push('/mypage/' + yyyy + '/' + String(Number(mm)) )
    },
  }
  
}
</script>


<style scoped>
/* ■全体 */
.wrap{
  width: 100%;
}

/* ■コンテンツエリア */
#content{
	font-size:16px;
	width:90%;
	margin:14px auto 18px auto;
}

/* 月日タイトル */
.date_title{
	font-size:16px;
}
.date_title .date{
	font-size:18px;
	font-weight:bold;
}
.date_title .edit{
	font-size:17px;
	font-weight:bold;
}

/* フォーム */
form{
	font-size:16px;
}

/* テキストエリア */
.diaryText_area{
	width:100%;
	display:block;
	margin:10px 0;
	font-size:16px;
  padding: 5px;
}

input{
	font-size:16px;
}

/* ボタン */
.btn_area{
	width:100%;
	margin:10px auto;
	text-align:right;
}

.btn{
	padding:2px 10px;
}

/* リンクテキストのデコレーション */
.link_text{
  text-decoration: underline;
  color: blue;
  cursor: pointer;
}

/* フッター */
footer{
	color:#333;
	padding:8px 0 6px 15px;
	background-color:#fafbfd;
	border-top: #f0f0f0 1px solid;
}

</style>