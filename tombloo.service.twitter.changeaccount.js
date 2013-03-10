/**
 * Service Twitter Change Account - Tombloo patches
 *
 * 「アカウントの切り替え」にTwitterを追加するパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 *
 * - 「アカウントの切り替え」ダイアログにTwitterを追加する
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2013-03-11
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.twitter.changeaccount.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(Twitter, {
    login : function(user, password) {
        var LOGIN_URL = this.URL + '/sessions';
        var that = this;
        return (this.getCurrentUser() ? this.logout() : succeed()).addCallback(function() {
            return request(that.URL).addCallback(function(res) {
                var doc = convertToHTMLDocument(res.responseText),
                    form = $x('//form[contains(@class,"signin")]', doc);
                return request(LOGIN_URL, {
                    redirectionLimit : 0,
                    sendContent : update(formContents(form), {
                        'session[username_or_email]' : user,
                        'session[password]'          : password,
                        remember_me                  : 1,
                        return_to_ssl                : true
                    })
                });
            });
        }).addCallback(function() {
            that.updateSession();
            that.user = user;
        });
    },
    logout : function() {
        var FORM_URL   = this.URL + '/settings/account';
        var LOGOUT_URL = this.URL + '/logout';
        return request(FORM_URL).addCallback(function(res) {
            var doc = convertToHTMLDocument(res.responseText),
                form = $x('//form[@id="signout-form"]', doc);
            return request(LOGOUT_URL, {
                sendContent : formContents(form)
            });
        });
    },
    getAuthCookie : function() {
        return getCookieString('twitter.com', 'auth_token') ||
               getCookieString('.twitter.com', 'auth_token');
    },
    getUserLoginId : function() {
        var URL = this.URL + '/settings/account';
        var that = this;
        return request(URL).addCallback(function(res) {
            var user, doc = convertToHTMLDocument(res.responseText);
            user = $x('//input[@id="user_screen_name"]/@value', doc);
            if (!/[^\w]/.test(user)) {
                that.user = user;
            }
            return user;
        });
    },
    getCurrentUser : function() {
        return this.getUserLoginId();
    },
    getPasswords : function() {
        var results = [];
        [
            'http://twitter.com',
            'https://twitter.com',
            'twitter.com',
            '.twitter.com',
            'http://twitter.com/',
            'https://twitter.com/'
        ].forEach(function(url) {
            var p = getPasswords(url);
            if (p && p.length) {
                p.forEach(function(t) {
                    results.push(t);
                });
            }
        });
        return results;
    }
});


}());
