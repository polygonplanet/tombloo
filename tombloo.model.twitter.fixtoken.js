/**
 * Model.Twitetr.FixToken - Tombloo patches
 *
 * Twitterのトークン取得URLを新しいものに変えるTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 *
 * - Twitterのトークン取得URLをFix
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2012-08-30
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.twitter.fixtoken.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

var orgGetToken = Twitter.getToken;

update(Twitter, {
    getToken : function() {
        return request(this.URL + '/settings/account').addCallback(function(res) {
            let html = res.responseText;
            if (~html.indexOf('class="signin"')) {
                throw new Error(getMessage('error.notLoggedin'));
            }
            return {
                authenticity_token : html.extract(/authenticity_token.+value="(.+?)"/),
                siv                : html.extract(/logout\?siv=(.+?)"/)
            };
        }).addErrback(function() {
            return orgGetToken();
        });
    }
});

}());
