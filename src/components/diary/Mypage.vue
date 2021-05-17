<template>
  <!-- 日記ページ -->
  <div class="wrap">
    
    <!-- ヘッダー -->
    <HeaderVue></HeaderVue><!-- HeaderVueコンポーネントタグを使ってヘッダーを表示する -->
    
    <!-- コンテンツエリア -->
    <div id="content" v-if="display_flg"><!-- トークンの延長処理(ユーザー認証処理)が成功したら「display_flg」がtrueになる -->
      
      <!-- 上部コンテンツ（ログイン名、年月の表示、ページリンク） -->
      <div id="upper_content">
        <!-- ログイン名 -->
        <div class="login_name_area">{{nickname}}さんがログインしています</div>
        <!-- 年月を表示 -->
        <div class="thisMonth"><p class="month_title">{{month}}月の日記</p><p class="year_title">{{year}}年</p></div>
        <!-- 前月・翌月へリンク -->
        <div class="next_pre_pageLink">
          <span class="pre_month_link link_text" @click="gotoPreMonth()">&lt;&lt;前月へ</span>
          <span class="next_month_link link_text" @click="gotoNextMonth()">翌月へ&gt;&gt;</span>
        </div>
      </div>
      
      <!-- メインコンテンツ（日記） -->
      <div id="main_content">
        <ul class="day_box">
          <!-- 日記のliを生成 -->
          <template v-for="(diary, index) in diary_array">
            <!-- 日記が存在する場合のli-->
            <li v-if="diary.diary_text" :id="'list_' + diary.ymdNo" :class="diary.class" :key="'list_' + diary.ymdNo" @click="toggleTextArea(index)">
              <div class="textArea" :class="{open: isTextOpenArray[index]}">
                <div class="diary_main">
                  <span class="diary_date">{{ diary.dateStr }}</span> <!-- 日付の文字 -->
                  <span class="diary_text" v-html="diary.diary_text"></span> <!-- 日記テキスト -->
                </div>
                <div class="diary_edit"> <!-- 編集ボタン -->
                  <span @click="update_diary(diary.ymdNo, diary.dateStr)">編集</span>
                </div>
              </div>
            </li>
            
            <!-- 日記が存在しない場合のli-->
            <li v-if="!diary.diary_text" :id="'list_' + diary.ymdNo" :class="diary.class" :key="'list_' + diary.ymdNo" @click="create_diary(diary.ymdNo, diary.dateStr)">
              <div class="textArea">
                <div class="diary_main">
                  <span class="diary_date">{{ diary.dateStr }}</span> <!-- 日付の文字 -->
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
      
      <!-- 下部コンテンツ（ページリンク、ログアウト） -->
			<div id="lower_content">
        <div class="next_pre_pageLink">
          <span class="pre_month_link link_text" @click="gotoPreMonth()">&lt;&lt;前月へ</span>
          <span class="next_month_link link_text" @click="gotoNextMonth()">翌月へ&gt;&gt;</span>
        </div>
			</div>
      
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
      diary_array: [],  //日記生成配列
      display_flg: false,  //画面表示フラグ
      moveHashFlg: false,  //ハッシュまで画面を移動する準備が出来ているかどうかを格納するフラグ
      hashObject: null,  //ハッシュの情報を格納するオブジェクト
      //↓日記のテキストエリアの開閉状態を管理するフラグを格納した配列
      isTextOpenArray: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    }
  },
  
  computed: {
    year() {  //このページの年
      return this.$route.params.year
    },
    month() {  //このページの月
      return this.$route.params.month
    },
    nickname() {  //ニックネーム
      return this.$store.getters.getNickname
    },
    token() {  //トークン
      return this.$store.getters.getToken
    }
  },
  
  created() {  //最初の描画時にデータを取得する
    //[1]トークンの延長処理を行う（認証処理）
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
        //日記データを取得するメソッドを実行する
        this.getDiaries()
      }else if(response.data.auth == 'faild'){  //不整合
        //認証失敗時に行うメソッドを実行する
        this.authMismatch()
      }
    })
    .catch( ()=> {  //リクエスト失敗時の処理
      //認証失敗時に行うメソッドを実行する
      this.authMismatch()
    })
    
    //[2]ハッシュ情報を受け取って、プロパティに格納する
    this.hashObject = this.$route.hash
  },
  
  updated() {  //描画アップデート時に、ページ外からのハッシュ付きリンク遷移の移動を実装する
    const moveHashFlg = this.moveHashFlg  //ハッシュまで移動する準備が出来ているかを格納するフラグを取得する
    if (this.hashObject && moveHashFlg == true) {  //ハッシュがある場合は、$scrollTo()でハッシュまで移動させる
      this.$scrollTo(this.hashObject, 0, {offset: -6})  //スクロール時間は0ms、オフセットは-6pxに設定する
      //移動したら、ハッシュオブジェクトはnullにしてリセットする
      this.hashObject = null
    }
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
    
    
    //■ 日記データを取得するメソッド
    getDiaries() {
      //リクエストするためのymNoを生成する
      let ymNo = this.year + ('0' + this.month).slice(-2)
      //axios.get()で、ExpressサーバーへGET通信してデータを取得する
      axios.get(
        '/get_diaries/' + ymNo,  //axios.get()の第一引数にエンドポイントを指定する
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
          //rowsにレスポンスされた日記データを格納する
          let rows = response.data.rows
          //日記配列を作成するメソッドを実行する
          this.makeDiaryArray(rows)
        }
      })
      .catch(error => {  //リクエスト失敗時の処理
        console.log(error)
        //アラートを出す
        alert('データベースとの接続に不具合が生じ、日記データを取得することができませんでした。')
      })
    },

    //■ 日記配列を作成するメソッド
    makeDiaryArray(rows) {
      let diary_array = []  //配列を定義
      let lastDate = new Date(this.$route.params.year , this.$route.params.month -2, 0).getDate()  //月末日を取得
      for ( let i=1; i <= lastDate; i++) {  //forループで、1日～月末日までの全ての日記オブジェクトを生成して、配列に格納する
        let obj = {}  //日記オブジェクトを定義
        //その日のymdNoを生成
        let yyyy = this.$route.params.year  //年4桁
        let mm = ('0' + this.month).slice(-2)  //月2桁
        let dd = ('0' + i).slice(-2)  //日2桁
        let ymdNo = yyyy + mm + dd
        //日付を取得
        let date = String(i)
        //ymdNoから曜日を取得
        let day = [ "日", "月", "火", "水", "木", "金", "土" ][new Date(yyyy, parseInt(mm)-1, parseInt(dd)).getDay()]
        
        //クラスを作成する
        let classArray = []
        //土曜、日曜のクラスをセットする
        if(day=='土'){
          classArray.push('saturday_box')
        }else if(day=='日'){
          classArray.push('sunday_box')
        }
        //今日を表すクラスをセットする
        //今日の日付のymdNoを作成
        let today = new Date()
        let today_ymdNo = today.getFullYear() + ('0'+ (today.getMonth()+1) ).slice(-2) + ('0'+ today.getDate()).slice(-2)
        //ymdNoが今日と一致したら、today_boxクラスをセットする
        if(ymdNo == today_ymdNo){
          classArray.push('today_box')
        }
        //取得したクエリ結果と照らし合わせる
        let diary_class = 'diary_not_exists'  //日記存在クラス。初期値は「日記なし」
        let diary_text = ''
        for(let row of rows){  //SQLクエリ結果をforループさせる
          if(ymdNo == row.ymd_no){ //合致するymdNoがある場合
            diary_text = row.diary_text.replace(/\n/g,'<br>')  //日記テキストを、改行を<br>に変換してから、格納する
            diary_class = 'diary_exists'  //日記存在クラスを「日記あり」に変更する
            obj.diary_text = diary_text  //オブジェクトに日記テキストを追加する
          }
        }
        classArray.push(diary_class)  //日記存在クラスをdiary_classに追加する

        //オブジェクトに各パラメータを追加する
        obj.ymdNo = ymdNo //ymdNo
        obj.date = date //日付
        obj.day = day //曜日
        obj.class = classArray //class
        obj.dateStr = this.month + '/' + date + ' (' + day + ')' //「1/11(月)」の形式の文字列
        
        //オブジェクトを配列に追加する
        diary_array.push(obj)
      }
      
      //ハッシュへ移動する準備ができていることを表すフラグをtrueにする（ハッシュ付きURLでのアクセスに対する処理）
      this.moveHashFlg = true
      
      //作成された配列をデータに代入する
      this.diary_array = diary_array
    },
    
    //■ 日記のテキストエリアを開閉するメソッド
    toggleTextArea(index) {
      //日記テキストエリア開閉のフラグを格納した配列に、真偽値を反転してセットする
      //（this.$set()で配列の値を変更すると、変更後にVueの再描画も実行される）
      this.$set( this.isTextOpenArray, index, !(this.isTextOpenArray[index]) )
    },
    
    //■ 前月の日記へ遷移するメソッド
    gotoPreMonth() {
      let year = this.year
      let month = this.month
      if(month == '1'){
        month = '12'
        year = String(Number(year)-1)
      }else{
        month = String(Number(month)-1)
      }
      this.$router.push('/mypage/' + year + '/' + month)
      //axiosを実行して、日記データを取得する
      this.getDiaries()
    },
    
    //■ 来月の日記へ遷移するメソッド
    gotoNextMonth() {
      let year = this.year
      let month = this.month
      if(month == '12'){
        month = '1'
        year = String(Number(year)+1)
      }else{
        month = String(Number(month)+1)
      }
      this.$router.push('/mypage/' + year + '/' + month)
      //axiosを実行して、日記データを取得する
      this.getDiaries()
    },
    
    //■ 日記作成ページへ遷移するメソッド
    create_diary(ymdNo, dateStr) {
      //確認ダイアログを出す
      let editFlg = window.confirm(dateStr + 'の日記を作成しますか')
      if(editFlg == true){  //OKなら作成ページへ遷移
				this.$router.push('/edit/c/' + ymdNo)
			}
    },
    
    //■ 日記更新ページへ遷移するメソッド
    update_diary(ymdNo, dateStr) {
      //確認ダイアログを出す
      let editFlg = window.confirm(dateStr + 'の日記を編集しますか')
      if(editFlg == true){  //OKなら更新ページへ遷移
				this.$router.push('/edit/u/' + ymdNo)
			}
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
	margin:10px auto 20px auto;
}


/* ■上部コンテンツ */
/* ログインネーム表示 */
.login_name_area{
	padding-bottom:7px;
	color:#666666;
	font-size:14px;
}

/* 年月タイトル */
.thisMonth{
  display: flex;
  justify-content: space-between;
  align-items:flex-end;
}
.thisMonth .month_title{
	font-weight:bold;
	font-size:21px;
}
.thisMonth .year_title{
	font-size:16px;
}

/* 前月へ・翌月へリンク */
.next_pre_pageLink{
	font-size:14px;
	width:100%;
	line-height:100%;
	margin-top:10px;
  margin-bottom:15px;
  display: flex;
  justify-content: space-between;  
}

/* リンクテキストのデコレーション */
.link_text{
  text-decoration: underline;
  color: blue;
  cursor: pointer;
}


/* ■メインコンテンツ */
#main_content{
	font-size:14px;
}

/* ul下のスペース */
ul {
  margin-bottom: 20px;
}

/* 日付liの設定 */
.day_box li{
	width:97%;
	border:#666 solid 1px;
	padding:5px;
	margin:10px auto 10px auto;
	list-style:none;
	box-sizing:border-box;
	font-size:13px;
}

/* li内のテキストエリア */
.day_box li .textArea{
	height:1.5em;
	line-height:1.5;
	overflow:hidden;
}
/* liをクリックした時のテキストエリアのスタイル */
.day_box li .textArea.open{
  height:auto;
  transition: height 0.5s;
}

/* 土曜日クラスの設定 */
.day_box li.saturday_box{
	border:#39F solid 2px;
}
.day_box li.saturday_box .diary_date{
	color:#36C;
}

/* 日曜日クラスの設定 */
.day_box li.sunday_box{
	border:#F9C solid 2px;
}
.day_box li.sunday_box .diary_date{
	color:#FF3366;
}

/* 今日クラスの設定 */
.day_box li.today_box{
	border:#9FF solid 5px;
}
.day_box li.today_box .diary_date{
	font-weight:bold;
	color:#333;
}

/* 日記日付<span>の外観設定（日付と本文を区別しやすいように日付に下paddingを付ける） */
.day_box li span.diary_date{
	display:inline-block;
	padding-bottom:3px;
}
/* (土曜と日曜の日付に下paddingは付けない。色で区別できるので) */
.day_box li.sunday_box span.diary_date, .day_box li.saturday_box span.diary_date{
	padding-bottom:0px;
}

/* 日記文<span>の外観設定 */
.day_box li span.diary_text{
	color:#333;
	padding-left:10px;
}

/* 日記文の編集ボタン */
.day_box li div.diary_edit{
	text-align:right;
	padding-top:8px;
	padding-bottom:4px;
}
.day_box li div.diary_edit span{
	text-align:right;
	padding:2px 4px 2px 4px;
	border:#09F solid 1px;
	color:#09F;
	cursor:pointer;
}


/* フッター */
footer{
	color:#333;
	padding:8px 0 6px 15px;
	background-color:#fafbfd;
	border-top: #f0f0f0 1px solid;
}

</style>
