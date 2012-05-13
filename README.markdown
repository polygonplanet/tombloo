# Scripts and patches for Tombloo

Firefox アドオン [Tombloo](https://github.com/to/tombloo/wiki) で利用できるパッチやスクリプトを置いてます。

## インストール

raw: のほうのリンク、または 各スクリプトのビュー (ファイル名クリック) の右上にある **raw** リンク
を右クリックして 「Tomblooパッチのインストール」 から行います。

※ 直接インストールしても無効なファイルもあります。
   詳細は以下から。

## 各パッチの概要

各パッチの詳細に記事へのリンクを載せています。  
注意点などもあるので目を通してみてください。

*  **tombloo.extension.twitter.enclose.js**  
   [raw: tombloo.extension.twitter.enclose.js][tombloo.extension.twitter.enclose.js(raw)]  
   Twitterポスト時に括弧(「」)等でタイトルを囲うパッチ。  
   最大文字数超えないよう 140 文字に切り詰めたりする。  
   括弧で囲うかどうかはオプションで変更可。  
   [TwitterにPOSTするとき先頭に“見てる”を付けてタイトルを括弧で囲うTomblooパッチ | 圧縮電子どうのこうの][tombloo.extension.twitter.enclose.js]

*  **tombloo.model.evernote.relogin.js**  
   [raw: tombloo.model.evernote.relogin.js][tombloo.model.evernote.relogin.js(raw)]  
   Evernoteのログイン切れてたら自動で再ログインするパッチ。  
   [Evernoteのログイン切れてたら自動で再ログインするTomblooパッチ | 圧縮電子どうのこうの][tombloo.model.evernote.relogin.js]

*  **tombloo.model.googlereader.quickadd.js**  
   [raw: tombloo.model.googlereader.quickadd.js][tombloo.model.googlereader.quickadd.js(raw)]  
   Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ。  
   [Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ | 圧縮電子どうのこうの][tombloo.model.googlereader.quickadd.js]

*  **tombloo.poster.bookmark.pot.assort.js**  
   [raw: tombloo.poster.bookmark.pot.assort.js][tombloo.poster.bookmark.pot.assort.js(raw)]  
   Postersに「Bookmark」と「Audio」を追加するパッチ。  
   [「Audio」と「Bookmark」をポスト一覧に追加するTomblooパッチ | 圧縮電子どうのこうの][tombloo.poster.bookmark.pot.assort.js]

*  **tombloo.service.actions.installpatch.fix.js**  
   [raw: tombloo.service.actions.installpatch.fix.js][tombloo.service.actions.installpatch.fix.js(raw)]  
   パッチのインストールに失敗しなくなるパッチ。  
   [Tomblooパッチのインストールに失敗しなくなるパッチ | 圧縮電子どうのこうの][tombloo.service.actions.installpatch.fix.js]

*  **tombloo.service.pixiv.js**  
   [raw: tombloo.service.pixiv.js][tombloo.service.pixiv.js(raw)]  
   pixivポスト用多機能パッチ。  
   [pixivからブックマークと同時にPOSTできるTomblooパッチがサムネイル対応 | 圧縮電子どうのこうの][tombloo.service.pixiv.js]

*  **tombloo.service.post.notify.js**  
   [raw: tombloo.service.post.notify.js][tombloo.service.post.notify.js(raw)]  
   ポスト完了時に通知メッセージを表示するパッチ。  
   [POST完了時に通知メッセージを表示するTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.post.notify.js]

*  **tombloo.model.googleplus.circle.js**  
   Google+で指定のサークルにポストできるようにするパッチ。  
   ※ このスクリプトは [YungSangさん製の Google+ モデル][model.gplus.js] が必要です  
   [raw: tombloo.model.googleplus.circle.js][tombloo.model.googleplus.circle.js(raw)]  
   [Google+で指定のサークルにポストできるようにするTomblooパッチ | 圧縮電子どうのこうの][tombloo.model.googleplus.circle.js]

*  **tombloo.extension.update.patches.js**  
   [raw: tombloo.extension.update.patches.js][tombloo.extension.update.patches.js(raw)]  
   インストール済みのパッチすべてを一括でアップデートできるパッチ。  
   [インストールされてる全てのパッチを一括でアップデートできるTomblooパッチ | 圧縮電子どうのこうの][tombloo.extension.update.patches.js]

*  **tombloo.service.tinami.js**  
   [raw: tombloo.service.tinami.js][tombloo.service.tinami.js(raw)]  
   TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるパッチ。  
   [TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.tinami.js]

*  **tombloo.service.actions.urlshortener.js**  
   [raw: tombloo.service.actions.urlshortener.js][tombloo.service.actions.urlshortener.js(raw)]  
   リンクやページの短縮URLをクリップボードにコピーできるパッチ。  
   [ページやリンクの短縮URLをクリップボードにコピーできるTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.actions.urlshortener.js]

*  **tombloo.extractor.googleplus.js**  
   [raw: tombloo.extractor.googleplus.js][tombloo.extractor.googleplus.js(raw)]  
   Google+ストリーム上の画像を原寸大でポストできるパッチ。  
   [Google+ストリーム上の画像を原寸大でポストできるTomblooパッチ | 圧縮電子どうのこうの][tombloo.extractor.googleplus.js]

*  **tombloo.service.actions.changeacount.resize.js**  
   [raw: tombloo.service.actions.changeacount.resize.js][tombloo.service.actions.changeacount.resize.js(raw)]  
   「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするパッチ。  
   [「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.actions.changeacount.resize.js]

*  **tombloo.extractor.tumblr.reblog.tags.js**  
   [raw: tombloo.extractor.tumblr.reblog.tags.js][tombloo.extractor.tumblr.reblog.tags.js(raw)]  
   Tumblrでリブログ時にタグも一緒にポストできるパッチ。  
   [Tumblrでリブログ時にタグの継承を可能にするTomblooパッチ | 圧縮電子どうのこうの][tombloo.extractor.tumblr.reblog.tags.js]

*  **tombloo.service.actions.copytitle.js**  
   [raw: tombloo.service.actions.copytitle.js][tombloo.service.actions.copytitle.js(raw)]  
   ページのタイトルやURLをクリップボードにコピーするだけのパッチ。  
   [ページのタイトルや(非圧縮の)URLをクリップボードにコピーするだけのTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.actions.copytitle.js]

*  **tombloo.service.actions.element.js**  
   [raw: tombloo.service.actions.element.js][tombloo.service.actions.element.js(raw)]  
   ページ内のDOM要素を削除したり操作できるパッチ。  
   [ページ内のDOM要素を削除したり操作できるTomblooパッチ | 圧縮電子どうのこうの][tombloo.service.actions.element.js]

*  **tombloo.service.soundcloud.changeaccount.js**  
   [raw: tombloo.service.soundcloud.changeaccount.js][tombloo.service.soundcloud.changeaccount.js(raw)]  
   Tomblooの「アカウントの切り替え」にSoundCloudを追加するパッチ。  
   [Tomblooの「アカウントの切り替え」にSoundCloudを追加するパッチ | 圧縮電子どうのこうの][tombloo.service.soundcloud.changeaccount.js]

*  **tombloo.model.tumblr.postlimit.message.js**  
   [raw: tombloo.model.tumblr.postlimit.message.js][tombloo.model.tumblr.postlimit.message.js(raw)]  
   Tumblrのリブログ/ポストのリミット残数が確認できるTomblooパッチ。  
   [Tumblrのリブログ/ポストのリミット残数が確認できるTomblooパッチ | 圧縮電子どうのこうの][tombloo.model.tumblr.postlimit.message.js]

*  **tombloo.extractor.diet.gif.js**  
   [raw: tombloo.extractor.diet.gif.js][tombloo.extractor.diet.gif.js(raw)]  
   Tumblrにポストすると動かなくなるgifアニメを減色して動かすTomblooパッチ。  
   [Tumblrにポストすると動かなくなるgifアニメを減色して動かすTomblooパッチ | 圧縮電子どうのこうの][tombloo.extractor.diet.gif.js]









[tombloo.extension.twitter.enclose.js]: http://polygon-planet-log.blogspot.com/2011/06/twitterposttombloo_02.html "TwitterにPOSTするとき先頭に“見てる”を付けてタイトルを括弧で囲うTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.extension.twitter.enclose.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.twitter.enclose.js "tombloo.extension.twitter.enclose.js(raw)"


[tombloo.model.evernote.relogin.js]: http://polygon-planet-log.blogspot.com/2011/07/evernotetombloo_02.html "Evernoteのログイン切れてたら自動で再ログインするTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.model.evernote.relogin.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.evernote.relogin.js "tombloo.model.evernote.relogin.js(raw)"


[tombloo.model.googlereader.quickadd.js]: http://polygon-planet-log.blogspot.com/2011/07/googletombloo_4862.html "Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.model.googlereader.quickadd.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.googlereader.quickadd.js "tombloo.model.googlereader.quickadd.js(raw)"


[tombloo.poster.bookmark.pot.assort.js]: http://polygon-planet-log.blogspot.com/2011/06/audiobookmarktombloo_19.html "「Audio」と「Bookmark」をポスト一覧に追加するTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.poster.bookmark.pot.assort.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.poster.bookmark.pot.assort.js "tombloo.poster.bookmark.pot.assort.js(raw)"


[tombloo.service.actions.installpatch.fix.js]: http://polygon-planet-log.blogspot.com/2011/05/tombloo_04.html "Tomblooパッチのインストールに失敗しなくなるパッチ | 圧縮電子どうのこうの"
[tombloo.service.actions.installpatch.fix.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.installpatch.fix.js "tombloo.service.actions.installpatch.fix.js"


[tombloo.service.pixiv.js]: http://polygon-planet-log.blogspot.com/2011/04/pixivposttombloo_14.html "pixivからブックマークと同時にPOSTできるTomblooパッチがサムネイル対応 | 圧縮電子どうのこうの"
[tombloo.service.pixiv.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.pixiv.js "tombloo.service.pixiv.js(raw)"


[tombloo.service.post.notify.js]: http://polygon-planet-log.blogspot.com/2011/05/posttombloo_19.html "POST完了時に通知メッセージを表示するTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.post.notify.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.post.notify.js "tombloo.service.post.notify.js(raw)"


[model.gplus.js]: https://github.com/YungSang/Scripts-for-Tombloo "YungSang/Scripts-for-Tombloo - GitHub"

[tombloo.model.googleplus.circle.js]: http://polygon-planet-log.blogspot.com/2011/07/googletombloo_17.html "Google+で指定のサークルにポストできるようにするTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.model.googleplus.circle.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.googleplus.circle.js "tombloo.model.googleplus.circle.js(raw)"


[tombloo.extension.update.patches.js]: http://polygon-planet-log.blogspot.com/2011/07/tombloo_29.html "インストールされてる全てのパッチを一括でアップデートできるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.extension.update.patches.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.update.patches.js "tombloo.extension.update.patches.js(raw)"


[tombloo.service.tinami.js]: http://polygon-planet-log.blogspot.com/2011/07/tinamitombloo_30.html "TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.tinami.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.tinami.js "tombloo.service.tinami.js(raw)"


[tombloo.service.actions.urlshortener.js]: http://polygon-planet-log.blogspot.com/2011/08/urltombloo_05.html "ページやリンクの短縮URLをクリップボードにコピーできるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.actions.urlshortener.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.urlshortener.js "tombloo.service.actions.urlshortener.js(raw)"


[tombloo.extractor.googleplus.js]: http://polygon-planet-log.blogspot.com/2011/08/googletombloo_06.html "Google+ストリーム上の画像を原寸大でポストできるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.extractor.googleplus.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.googleplus.js "tombloo.extractor.googleplus.js(raw)"


[tombloo.service.actions.changeacount.resize.js]: http://polygon-planet-log.blogspot.com/2011/08/tombloo_06.html "「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.actions.changeacount.resize.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.changeacount.resize.js "tombloo.service.actions.changeacount.resize.js(raw)"


[tombloo.extractor.tumblr.reblog.tags.js]: http://polygon-planet-log.blogspot.com/2011/08/tumblrtombloo_10.html "Tumblrでリブログ時にタグの継承を可能にするTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.extractor.tumblr.reblog.tags.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.reblog.tags.js "tombloo.extractor.tumblr.reblog.tags.js(raw)"


[tombloo.service.actions.copytitle.js]: http://polygon-planet-log.blogspot.com/2011/10/urltombloo_20.html "ページのタイトルや(非圧縮の)URLをクリップボードにコピーするだけのTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.actions.copytitle.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.copytitle.js "tombloo.service.actions.copytitle.js(raw)"


[tombloo.service.actions.element.js]: http://polygon-planet-log.blogspot.com/2011/11/domtombloo_03.html "ページ内のDOM要素を削除したり操作できるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.service.actions.element.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.element.js "tombloo.service.actions.element.js(raw)"


[tombloo.service.soundcloud.changeaccount.js]: http://polygon-planet-log.blogspot.com/2012/01/tombloosoundcloud_11.html "Tomblooの「アカウントの切り替え」にSoundCloudを追加するパッチ | 圧縮電子どうのこうの"
[tombloo.service.soundcloud.changeaccount.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.soundcloud.changeaccount.js "tombloo.service.soundcloud.changeaccount.js(raw)"


[tombloo.model.tumblr.postlimit.message.js]: http://polygon-planet-log.blogspot.com/2012/02/tumblrtombloo_18.html "Tumblrのリブログ/ポストのリミット残数が確認できるTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.model.tumblr.postlimit.message.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.postlimit.message.js "tombloo.model.tumblr.postlimit.message.js(raw)"


[tombloo.extractor.diet.gif.js]: http://polygon-planet-log.blogspot.com/2012/04/tumblrgiftombloo.html "Tumblrにポストすると動かなくなるgifアニメを減色して動かすTomblooパッチ | 圧縮電子どうのこうの"
[tombloo.extractor.diet.gif.js(raw)]: https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.diet.gif.js "tombloo.extractor.diet.gif.js(raw)"





