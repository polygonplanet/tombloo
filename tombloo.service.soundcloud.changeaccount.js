/**
 * Service SoundCloud Change Account - Tombloo patches
 *
 * 「アカウントの切り替え」にSoundCloudを追加するパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Service SoundCloud Change Account patch]
 *
 * - 「アカウントの切り替え」ダイアログにSoundCloudを追加する
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2012-01-09
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.soundcloud.changeaccount.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(Soundcloud, {
    login : function(user, password) {
        let that = this;
        return (this.getCurrentUser() ? this.logout() : succeed()).addCallback(function() {
            return request('https://soundcloud.com/session', {
                sendContent : {
                    username            : user,
                    password            : password,
                    remember_me         : 1,
                    login_submitted_via : 'zoom',
                    commit              : 'Log in'
                }
            });
        }).addCallback(function() {
            that.updateSession();
            that.user = user;
        });
    },
    logout : function() {
        return request('http://soundcloud.com/logout');
    },
    getAuthCookie : function() {
        return getCookieString('soundcloud.com', 'auth_token') ||
               getCookieString('.soundcloud.com', 'auth_token');
    },
    getUserLoginId : function() {
        const URL = 'http://soundcloud.com/settings/email';
        let that = this;
        return (!this.getAuthCookie()) ? succeed() : request(URL).addCallback(function(res) {
            let user, doc = convertToHTMLDocument(res.responseText);
            user = $x('//*[@id="user-email-list"]//span[contains(@class,"email-uri")]/text()', doc);
            if (/.+@[^.]+[.][^.]+/.test(user)) {
                that.user = user;
            }
            return user;
        });
    },
    getCurrentUser : function(isName) {
        return (!isName) ? this.getUserLoginId() : succeed().addCallback(function() {
            let re = /p=(.+)$/, user, s = getCookieString('.soundcloud.com', 'p');
            if (re.test(s)) {
                user = s.match(re)[1];
            }
            return user;
        });
    },
    getPasswords : function() {
        let results = [];
        [
            'http://soundcloud.com',
            'https://soundcloud.com',
            'soundcloud.com',
            '.soundcloud.com',
            'http://soundcloud.com/',
            'https://soundcloud.com/'
        ].forEach(function(url) {
            let p = getPasswords(url);
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
