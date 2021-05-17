<!-- ヘッダーをコンポーネント化する-->
<template>
  <div>
    <!-- ヘッダー -->
    <header>
      <router-link to="/"><p class="header_title">ひとこと日記</p></router-link><!-- ヘッダータイトル -->
      <p class="menu_icon" :class="{menuOpen: isMenuOpen}" @click="click_menu_icon()">MENU</p><!-- メニューアイコン -->
    </header>
    
    <!-- メニューレイヤー -->
    <div class="mnLyr" :class="{menuOpen: isMenuOpen}">
      <div class="txt_mnLyr">
          <h3>メニュー</h3>
          <ul>
            <li><router-link to="/help">機能紹介</router-link></li>
            <li><span class="link" @click="logout()">ログアウト</span></li>
            <li><span class="link" @click="delete_user_confirm()">ユーザー登録を解除</span></li>
          </ul>
      </div><!-- txt_mnLyr end -->
    </div><!-- mnLyr end -->
    <div class="bck_mnLyr" :class="{menuOpen: isMenuOpen}" @click="click_back_layer()"></div><!-- メニューの下地のバックレイヤー -->
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      isMenuOpen: false  //メニュー開閉の状態管理
    }
  },
  
  methods: {
    //■ メニューレイヤーの表示を操作するメソッド群
    //メニューアイコンを押したとき動作するメソッド
    click_menu_icon() {
      //メニュー開閉の状態管理をトグルする
      if(this.isMenuOpen == false){ this.isMenuOpen = true }
      else if(this.isMenuOpen == true){ this.isMenuOpen = false }
    },
    //バックレイヤーを押下したとき動作するメソッド
    click_back_layer() {
      if(this.isMenuOpen == true){ this.isMenuOpen = false }
    },
    
    
    //■ ログアウト処理に関するメソッド群
    //●ログアウトするメソッド
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
        .then( () => {  //リクエスト成功時の処理
          //Vuexから認証情報を削除してログインページに飛ばすメソッドを実行する
          this.deleteToken()
        })
        .catch( () => {  //リクエスト失敗時の処理
          //Vuexから認証情報を削除してログインページに飛ばすメソッドを実行する
          this.deleteToken()
        })
      }
    },
    
    //●Vuexから認証情報を削除してログインページに飛ばすメソッド
    deleteToken() {
      //Vuexから認証情報を削除
      this.$store.commit('setToken', null)
      this.$store.commit('setNickname', null)
      //ログアウト完了したらメッセージを出す
      alert('ログアウトしました。')
      //ログインページに飛ばす
      this.$router.replace('/login')
    },
    
    
    //■ ユーザー登録の解除処理に関するメソッド群
    //●ユーザー登録の解除を確認するメソッド
    delete_user_confirm() {
      //axios.get()で、ExpressサーバーへGET通信して、削除するユーザーのログイン名とニックネームを取得する
      axios.get(
        '/user_delete/confirm',  //axios.get()の第一引数にエンドポイントを指定する
        { headers: {'token': this.$store.getters.getToken} }  //axios.get()の第二引数にオプションを指定。リクエストヘッダーにtokenを乗せている。
      )
      .then( (response) => {  //リクエスト成功時の処理
        //レスポンスからログイン名とニックネームとユーザーIDを取得する
        let login_name = response.data.login_name
        let nickname = response.data.nickname
        let user_id = response.data.user_id
        
        //ユーザーを削除するメソッドを実行する
        this.delete_user(login_name, nickname, user_id)
      })
      .catch( () => {  //リクエスト失敗時の処理
        //ユーザー登録解除ができないというメッセージを表示する
        alert('データベースとの通信エラーにより、ユーザー登録の解除を行うことができません。\nログインの状態や通信環境を確認してから、再度行ってください。')
      })
    },
    
    //●ユーザーを削除するメソッド
    delete_user(login_name, nickname, user_id) {
      //メッセージ文を生成する
      let msgSr = 'ログイン名：' + login_name + '\nニックネーム：' + nickname + '\n\nこのユーザー登録を解除しますか？\n日記データは全て失われます。この操作は元に戻せません。'
      //確認ダイアログを出す
      let deleteFlg = window.confirm(msgSr)
      //OKが押されたら、ログアウトの処理を実行する
      if(deleteFlg){
        //axios.post()で、ExpressサーバーへPOST通信する
        axios.post(
          '/user_delete',  //axios.post()の第一引数にエンドポイントを指定する
          { user_id: user_id }  //axios.post()の第二引数に送信するデータを指定する
        )
        .then( (response) => {  //リクエスト成功時の処理
          if(response.data.delete_user == 'success'){
            //ユーザー登録を解除したというメッセージを表示する
            alert('ユーザー登録が解除されました')
            //Vuexから認証情報を削除
            this.$store.commit('setToken', null)
            this.$store.commit('setNickname', null)
            //indexページに飛ばす
            this.$router.replace('/')
          }
        })
        .catch( () => {  //リクエスト失敗時の処理
          //ユーザー登録解除でエラーが生じたというメッセージを表示する
          alert('ユーザー登録解除の処理でエラーが生じました。詳細はサイトの管理者にお問い合わせください。')
        })
      }
    }
  }
}
</script>

<style scoped>
/* ■ヘッダー */
header{
	width: 100%;
	height: 56px;
	background-image: url(/images/bg_header.png);
	background-size: contain;
	background-repeat: repeat-x;
  display: flex;
  justify-content: space-between;
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

/* メニューアイコン */
.menu_icon{
	height:50px;
	width:65px;
	background-image:url(/images/img_menu_icon.png);
  background-size: contain;
	font-size:1px;
	text-indent:-9999px;
	cursor:pointer;
}

/* メニューアイコンの図柄を変化させる */
.menu_icon.menuOpen{
  background-image:url(/images/img_menu_icon_open.png);
}

/* ■メニューレイヤー */
/* メニューレイヤーの設定 */
.mnLyr{
	position:absolute;
	top:56px;
	left:0;
	width:100%;
	z-index:2;
	background-color:#fafbfd;
  overflow: hidden;
  transition: max-height 0.3s;
  max-height: 0;
}
/* メニューレイヤーのスライドダウンの設定 */
.mnLyr.menuOpen{
  max-height: 250px;
  border-bottom: #999999 2px solid;
}

/* メニュー文字レイヤーの設定 */
.txt_mnLyr{
	padding:20px;
	font-size:16px;
	font-weight:bold;
	color:#333333;
}
/* メニュー文字の設定 */
.txt_mnLyr h3{
	font-size:18px;
	border-bottom:#666 2px solid;
	border-left:#666 6px solid;
	padding:3px 0 1px 3px;
	margin-bottom:15px;
}
.txt_mnLyr ul{
	list-style:none;
}
.txt_mnLyr ul li{
  padding:3px 0 5px 12px;
}
.txt_mnLyr ul li a{
	text-decoration:none;
	color:#333333;
}
.link{
  cursor: pointer;
}
.btn_mnCls{
	cursor:pointer;
}

/* 透明なバックレイヤーの設定 */
.bck_mnLyr{
	position:absolute;
	top:0;
	left:0;
	width:100%;
	height:100%;
	opacity:0;
	z-index:1;
	display:none;
}
.bck_mnLyr.menuOpen {
  display:block;
}

</style>