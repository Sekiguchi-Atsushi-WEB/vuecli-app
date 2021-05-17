<template>
  <!-- 日記更新ページ -->
  <div class="wrap">
    
    <!-- ヘッダー -->
    <HeaderVue></HeaderVue><!-- HeaderVueコンポーネントタグを使ってヘッダーを表示する -->
    
    <!-- コンテンツエリア -->
    <div id="content" v-if="display_flg"><!-- トークンの延長処理(ユーザー認証処理)が成功したら「display_flg」がtrueになる -->
      <!-- 月日タイトル -->
      <div class="date_title"><span class="date">{{ dateStr }} </span>の日記を<span class="edit">編集</span></div>
      
			<!-- テキストエリア＆ボタン -->
			<form>
				<textarea class="diaryText_area" rows="20" cols="100" v-model="diary_text"></textarea>
				<div class="btn_area">
					<input class="btn" type="button" value="更新" @click="updateDiary()"><br>
          <input class="btn delete_btn" type="button" value="削除" @click="deleteDiary()">
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
  
  created() {  //最初の描画時に実行する
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
        //該当日の日記を取得するメソッドを実行する
        this.getOneDiary()
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
    
    
    //■ 該当日の日記を取得するメソッド
    getOneDiary() {
      //axios.get()で、ExpressサーバーへGET通信してデータを取得する
      axios.get(
        '/get_one_diary/' + this.ymdNo,  //axios.get()の第一引数にエンドポイントを指定する
        { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
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
          
        //authがexpired（期限切れ）でないならば、日記データを受け取って処理する
        }else{
          //レスポンスされた日記の文章を、テキストエリアに反映する
          this.diary_text = response.data.diary_text
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを出す
        alert('データベースとの接続に不具合が生じ、日記データを取得することができませんでした。')
      })
    },
    
    
    //■ 日記を更新するメソッド
    updateDiary() {
      //axios.post()で、Expressサーバーへpost通信してデータを送信する
      axios.post(
        '/edit_update/' + this.ymdNo,  //axios.post()の第一引数にエンドポイントを指定する
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
          
        //authがexpired（期限切れ）でないならば、日記データを受け取って処理する
        }else{
          //日記処理の結果はJSONの「sql_query」の値で受け取れる
          //結果によって日記が更新されたか更新されなかったかわかるので、場合分けする
          //sql_queryがnot_updatedなら、条件が合わなかったので、日記を更新しなかったことを表す
          if(response.data.sql_query == 'not_updated'){
            alert('データベース処理の問題により、日記は更新されませんでした')
            //日記ページに戻る
            this.$router.push('/mypage/' + this.ymdNo.slice(0,4) + '/' + String(Number(this.ymdNo.slice(4,6))) )
            
          //sql_queryがsuccessなら、日記が更新されたことを表す
          }else if(response.data.sql_query == 'success'){
            //更新成功の時は、確認ダイアログを出す
            let linkFlg = window.confirm(this.dateStr +  'の日記が更新されました。\n一覧ページに戻りますか？')
            if(linkFlg == true){  //OKならマイページへ遷移する
              //日記ページに戻る（該当日のidへ遷移する）
              let pathStr = '/mypage/' + this.ymdNo.slice(0,4) + '/' + String(Number(this.ymdNo.slice(4,6)))  //urlパス
              let hashStr = '#list_' + (this.ymdNo)  //idを示すハッシュ
              this.$router.push({ path:pathStr, hash:hashStr })
            }
          }
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを出す
        alert('データベースとの接続に不具合が生じ、日記データを更新することができませんでした。')
      })
    },
    
    
    //■ 日記を削除するメソッド
    deleteDiary() {
      //axios.get()で、Expressサーバーへget通信してデータを送信する
      axios.get(
        '/edit_delete/' + this.ymdNo,  //axios.get()の第一引数にエンドポイントを指定する
        { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
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
          
        //authがexpired（期限切れ）でないならば、日記データを受け取って処理する
        }else{
          //日記処理の結果はJSONの「sql_query」の値で受け取れる
          //結果によって日記が削除されたか削除されなかったかわかるので、場合分けする
          //sql_queryがnot_deletedなら、条件が合わなかったので、日記を削除しなかったことを表す
          if(response.data.sql_query == 'not_deleted'){
            alert('データベース処理の問題により、日記は削除されませんでした')
            //日記ページに戻る
            this.$router.push('/mypage/' + this.ymdNo.slice(0,4) + '/' + String(Number(this.ymdNo.slice(4,6))) )
            
          //sql_queryがsuccessなら、日記が削除されたことを表す
          }else if(response.data.sql_query == 'success'){
            alert(this.dateStr + 'の日記が削除されました')
            this.backDiaryPage()  //日記ページへ戻る
          } 
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを出す
        alert('データベースとの接続に不具合が生じ、日記データを削除することができませんでした。')
      })  
    },
    
    //■ 日記ページへ戻るリンクのメソッド
    backDiaryPage() {
      let yyyy = this.ymdNo.slice(0,4)  //年4桁
      let mm = this.ymdNo.slice(4,6)  //月2桁
      this.$router.push('/mypage/' + yyyy + '/' + String(Number(mm)) )
    },
    
    
    //■ ログアウトするメソッド
    logout() {
      //確認ダイアログを出す
      let logoutFlg = window.confirm('ログアウトしますか？')
      //OKが押されたら、ログアウトの処理を実行する
      if(logoutFlg){
        //axios.get()で、ExpressサーバーへGET通信してログアウト処理する
        axios.get(
          '/user_login/logout',  //axios.get()の第一引数にエンドポイントを指定する
          { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
        )
        .then(response => {  //リクエスト成功時の処理
          console.log(response.logout)
          //Vuexから認証情報を削除してログインページに飛ばすメソッドを実行する
          this.deleteToken()
        })
        .catch( () => {  //リクエスト失敗時の処理
          //Vuexから認証情報を削除してログインページに飛ばすメソッドを実行する
          this.deleteToken()
        })
      }
    },
    
    
    //■ Vuexから認証情報を削除してログインページに飛ばすメソッド
    deleteToken() {
      //Vuexから認証情報を削除
      this.$store.commit('setToken', null)
      this.$store.commit('setNickname', null)
      //ログインページに飛ばす
      this.$router.replace('/login')
    }
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

.delete_btn{
	margin-top:10px;
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