/*
 * Tombloo - Service.action.installPatch patches
 *
 * 「パッチのインストール」を簡単に行えるようにするパッチ
 *
 * Version 1.02, 2011-07-20 polygon planet <http://polygonplanet.tumblr.com/>
 */
(function(undefined) {


update(Tombloo.Service.actions[getMessage('label.action.installPatch')], {
    check: function(ctx) {
        // 簡単にインストールできるように
        // GitHubじゃなくてもJavaScriptなら許可する
        var filename, url = ctx.linkURL;
        filename = String(url).replace(/[!?#].*$/g, '');
        return ctx.onLink &&
            (filename.split('.').pop().toLowerCase() === 'js' ||
            String(createURI(url).fileExtension).toLowerCase() === 'js');
    },
    execute: function(ctx) {
        var self = this, url = ctx.linkURL;
        
        // ファイルタイプを取得しチェックする
        // HEADの場合text/htmlで返ってきちゃうのでGETにする
        return request(url).addCallback(function(res) {
            var result, type, ok = false, invalid, text;
            try {
                text = res.responseText;
                type = String(res.channel && res.channel.contentType);
                
                // 条件を緩くする
                if (/script|plain/i.test(type) || !/^\s*<[^>]*>/.test(text)) {
                    ok = true;
                }
            } catch (e) {
                ok = false;
            }
            invalid = true;
            try {
                if (!ok) {
                    alert(getMessage('message.install.invalid'));
                    throw 'failure';
                }
                result = input({
                    'message.install.warning': null,
                    'label.install.agree': false
                }, 'message.install.warning');
                if (!result || !result['label.install.agree']) {
                    throw 'failure';
                }
                invalid = false;
            } catch (e) {
                invalid = true;
            }
            return invalid ? false : download(url, getPatchDir()).
                addCallback(function(file) {
                    // 異常なスクリプトが含まれているとここで停止する
                    reload();
                    notify(
                        self.name,
                        getMessage('message.install.success'),
                        notify.ICON_INFO
                    );
                });
        });
    }
});


})();

