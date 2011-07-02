/**
 * Model.Evernote.Relogin - Tombloo patches
 *
 * Evernoteのログイン切れてたら自動で再ログインするパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Model Evernote Relogin patch]
 *
 * - Evernoteのログインセッションがきれてたら自動で再ログインする
 *
 * --------------------------------------------------------------------------
 *
 * @version  1.01
 * @date     2011-07-02
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {

const BASE_URI  = 'https://www.evernote.com';
const LOGIN_URI = 'https://www.evernote.com/Login.action';

// POSTの実行直前にログインチェック(Relogin)
addAround(Evernote, 'post', function(proceed, args, self) {
    let d = new Deferred();
    d.addCallback(function() {
        return self.getAuthCookie() ? succeed() :
            request(LOGIN_URI).addCallback(function(res) 
        {
            let expr, doc, form;
            doc = convertToHTMLDocument(res.responseText);
            expr = '//form[@id="login_form"]';
            form = $x(expr, doc);
            return form;
        });
    }).addCallback(function(form) {
        let users, df, de;
        df = new Deferred();
        de = new Deferred();
        users = getPasswords(BASE_URI);
        if (users && users.shift) {
            users = users.shift();
        }
        // ログインフォームが表示されてる場合 (セッション切れてる)
        if (form && users && users.user && users.password) {
            df.addCallback(function() {
                return request(LOGIN_URI, {
                    redirectionLimit: 0,
                    sendContent: update(formContents(form) || {}, {
                        username: users.user,
                        password: users.password
                    })
                }).addCallback(function(res) {
                    // ここに来たら再ログイン成功
                    users = null;
                    return wait(0);
                }).addBoth(function(err) {
                    de.callback();
                });
            });
        } else {
            df.addCallback(function() {
                de.callback();
            });
        }
        df.callback();
        return de;
    }).addCallback(function() {
        // 本来の処理に引き継ぎ
        return proceed(args);
    }).callback();
    return d;
});


})();

