# Scripts and patches for Tombloo

Firefox アドオン [Tombloo](https://github.com/to/tombloo/wiki) で利用できるパッチやスクリプトを置いてます。

## インストール

各スクリプトのビュー (ファイル名クリック) の右上にある **raw** リンクを右クリックして 「Tomblooパッチのインストール」 から行います。

※ 直接インストールしても無効なファイルもあります。
   詳細は以下から。

## 各パッチの概要

各パッチの詳細に記事へのリンクを載せています。  
注意点などもあるので目を通してみてください。

*  **tombloo.extension.twitter.enclose.js**  
   Twitterポスト時に括弧(「」)等でタイトルを囲うパッチ。  
   最大文字数超えないよう 140 文字に切り詰めたりする。  
   括弧で囲うかどうかはオプションで変更可。  
   [TwitterにPOSTするとき先頭に“見てる”を付けてタイトルを括弧で囲うTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.extension.twitter.enclose.js]

*  **tombloo.model.evernote.relogin.js**  
   Evernoteのログイン切れてたら自動で再ログインするパッチ。  
   [Evernoteのログイン切れてたら自動で再ログインするTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.model.evernote.relogin.js]

*  **tombloo.model.googlereader.quickadd.js**  
   Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ。  
   [Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.model.googlereader.quickadd.js]

*  **tombloo.poster.bookmark.pot.assort.js**  
   Postersに「Bookmark」と「Audio」を追加するパッチ。  
   [「Audio」と「Bookmark」をポスト一覧に追加するTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.poster.bookmark.pot.assort.js]

*  **tombloo.service.actions.installpatch.fix.js**  
   パッチのインストールに失敗しなくなるパッチ。  
   [Tomblooパッチのインストールに失敗しなくなるパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.actions.installpatch.fix.js]

*  **tombloo.service.pixiv.js**  
   pixivポスト用多機能パッチ。  
   [pixivからブックマークと同時にPOSTできるTomblooパッチがサムネイル対応 | 圧縮電子精神音楽浮遊構造体][tombloo.service.pixiv.js]

*  **tombloo.service.post.notify.js**  
   ポスト完了時に通知メッセージを表示するパッチ。  
   [POST完了時に通知メッセージを表示するTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.post.notify.js]

*  **tombloo.model.googleplus.circle.js**  
   Google+で指定のサークルにポストできるようにするパッチ。  
   ※ このスクリプトは [YungSangさん製の Google+ モデル][model.gplus.js] が必要です  
   [Google+で指定のサークルにポストできるようにするTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.model.googleplus.circle.js]

*  **tombloo.extension.update.patches.js**  
   インストール済みのパッチすべてを一括でアップデートできるパッチ。  
   [インストールされてる全てのパッチを一括でアップデートできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.extension.update.patches.js]

*  **tombloo.service.tinami.js**  
   TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるパッチ。  
   [TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.tinami.js]

*  **tombloo.service.actions.urlshortener.js**  
   リンクやページの短縮URLをクリップボードにコピーできるパッチ。  
   [ページやリンクの短縮URLをクリップボードにコピーできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.actions.urlshortener.js]

*  **tombloo.extractor.googleplus.js**  
   Google+ストリーム上の画像を原寸大でポストできるパッチ。  
   [Google+ストリーム上の画像を原寸大でポストできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.extractor.googleplus.js]

*  **tombloo.service.actions.changeacount.resize.js**  
   「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするパッチ。  
   [「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.actions.changeacount.resize.js]

*  **tombloo.extractor.tumblr.reblog.tags.js**  
   Tumblrでリブログ時にタグも一緒にポストできるパッチ。  
   [Tumblrでリブログ時にタグの継承を可能にするTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.extractor.tumblr.reblog.tags.js]

*  **tombloo.service.actions.copytitle.js**  
   ページのタイトルやURLをクリップボードにコピーするだけのパッチ。  
   [ページのタイトルや(非圧縮の)URLをクリップボードにコピーするだけのTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.actions.copytitle.js]

*  **tombloo.service.actions.element.js**  
   ページ内のDOM要素を削除したり操作できるパッチ。  
   [ページ内のDOM要素を削除したり操作できるTomblooパッチ | 圧縮電子精神音楽浮遊構造体][tombloo.service.actions.element.js]










[tombloo.extension.twitter.enclose.js]: http://polygon-planet.blogspot.com/2011/06/twitterposttombloo.html "TwitterにPOSTするとき先頭に“見てる”を付けてタイトルを括弧で囲うTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.model.evernote.relogin.js]: http://polygon-planet.blogspot.com/2011/07/evernotetombloo.html "Evernoteのログイン切れてたら自動で再ログインするTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.model.googlereader.quickadd.js]: http://polygon-planet.blogspot.com/2011/07/googletombloo.html "Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.poster.bookmark.pot.assort.js]: http://polygon-planet.blogspot.com/2011/06/audiobookmarktombloo.html "「Audio」と「Bookmark」をポスト一覧に追加するTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.actions.installpatch.fix.js]: http://polygon-planet.blogspot.com/2011/05/tombloo.html "Tomblooパッチのインストールに失敗しなくなるパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.pixiv.js]: http://polygon-planet.blogspot.com/2011/04/pixivposttombloo.html "pixivからブックマークと同時にPOSTできるTomblooパッチがサムネイル対応 | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.post.notify.js]: http://polygon-planet.blogspot.com/2011/05/posttombloo.html "POST完了時に通知メッセージを表示するTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[model.gplus.js]: https://github.com/YungSang/Scripts-for-Tombloo "YungSang/Scripts-for-Tombloo - GitHub"

[tombloo.model.googleplus.circle.js]: http://polygon-planet.blogspot.com/2011/07/googletombloo_17.html "Google+で指定のサークルにポストできるようにするTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.extension.update.patches.js]: http://polygon-planet.blogspot.com/2011/07/tombloo.html "インストールされてる全てのパッチを一括でアップデートできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.tinami.js]: http://polygon-planet.blogspot.com/2011/07/tinamitombloo.html "TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.actions.urlshortener.js]: http://polygon-planet.blogspot.com/2011/08/urltombloo.html "ページやリンクの短縮URLをクリップボードにコピーできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.extractor.googleplus.js]: http://polygon-planet.blogspot.com/2011/08/googletombloo.html "Google+ストリーム上の画像を原寸大でポストできるTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.actions.changeacount.resize.js]: http://polygon-planet.blogspot.com/2011/08/tombloo.html "「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.extractor.tumblr.reblog.tags.js]: http://polygon-planet.blogspot.com/2011/08/tumblrtombloo.html "Tumblrでリブログ時にタグの継承を可能にするTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.actions.copytitle.js]: http://polygon-planet.blogspot.com/2011/10/urltombloo.html "ページのタイトルや(非圧縮の)URLをクリップボードにコピーするだけのTomblooパッチ | 圧縮電子精神音楽浮遊構造体"


[tombloo.service.actions.element.js]: http://polygon-planet.blogspot.com/2011/11/domtombloo.html "ページ内のDOM要素を削除したり操作できるTomblooパッチ | 圧縮電子精神音楽浮遊構造体"




