<template>
  <!-- ヘルプページ -->
  <div class="wrap">
    <!-- ヘッダー -->
		<header>
			<router-link to="/"><p class="header_title">ひとこと日記</p></router-link>
		</header><!-- header end -->
    
    <div id="content">
      <h1><span>機能紹介</span></h1>
      <p>ひとこと日記の機能について説明します。</p>
      <hr>

      <h2>ユーザー登録機能</h2>
      <p>このサイトのユーザーアカウントを作成して、日記機能を使用できるようにします。<br>ログイン名、パスワード、氏名またはニックネームを決めて登録してください。</p>
      <hr>
      
      <h2>ログイン機能</h2>
      <p>このサイトにログインし、日記機能を使用することができます。<br>ログイン名とパスワードが必要です。</p>
      <hr>
      
      <h2>日記機能</h2>
      <h3>日記のリスト表示</h3>
      <ul>
        <li>日記ページにアクセスすると、ひと月ごとの日記リストが表示されます。</li>
        <li>「前の月」、「次の月」リンクをタップすると、前月や来月の日記リストが見られます。</li>
      </ul>
      
      <h3>日記の表示</h3>
      <ul>
        <li>日記がある日付ボックスをタップすると、日記が全文表示され、編集ボタンが表示されます。</li>
      </ul>

      <h3>日記の作成</h3>
      <ul>
        <li>日記がない日付ボックスをタップすると、日記作成用のページへ移動します。</li>
        <li>日記が作成されると、日付ボックス内に日記の文章が一行だけ表示されます。</li>
      </ul>

      <h3>日記の編集・削除</h3>
      <ul>
        <li>編集ボタンをタップすると、既存の日記の文章を編集するページに移動します。</li>
        <li>また、日記を削除することも可能です。</li>
      </ul>
      
      <h3 class="example">使用例</h3>
      <img src="/images/trial_example.png" width="300" height="502" alt="日記の使い方">
      <br>
      
      <hr>

      <h2>メニュー機能</h2>
      <p>左上のメニューアイコンをタップすると、メニューが開きます。</p>
      
      <h3>機能紹介</h3>
      <ul>
        <li>このページです</li>
        <li>本サイトの機能について解説しています。</li>
      </ul>
      
      <h3>ログアウト</h3>
      <ul>
        <li>このサイトからログアウトします。</li>
        <li>再ログインは、ログインページから行ってください。</li>
      </ul>

      <h3>ユーザー登録を解除</h3>
      <ul>
        <li>ユーザー登録を解除します。</li>
        <li>ユーザー登録を解除すると、登録したユーザー情報や日記データは全て失われます。</li>
      </ul>
      
      <hr>
      
      <p class="link"><router-link to="/mypage">ひとこと日記 ≫ 日記に戻る</router-link></p>
    </div><!-- content end -->
    
    <!-- フッター -->
    <footer>&copy; 2021 Sekiguchi Atsushi</footer>
    
  </div>
</template>


<script>
</script>


<style scoped>
/* ■全体 */
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

/* コンテンツエリア */
#content{
	width:94%;
  margin:0 auto;
  font-size:14px;
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
h1 + p{
	margin-bottom:20px;
	font-size:15px;
}
p{
	margin-bottom:15px;
}
h2{
	font-size:18px;
}
h2:before{
	content: "●";
	font-size:1.5em;
}
ul{
	margin-bottom:15px;
	list-style:none;
}
h3{
	font-size:15px;
}
h3:before{
	content: "■";
	font-size:1em;
}
h3.example{
	margin-bottom:5px;
}
p.link{
	margin-top:10px;
}

/* フッター */
footer{
	color:#333;
	padding:8px 0 6px 15px;
	background-color:#fafbfd;
	border-top: #f0f0f0 1px solid;
}
</style>