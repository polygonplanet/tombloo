/**
 * Tombloo.Model.Tumblr.CahngeAccount.HTTPS - Tombloo patches
 *
 * Tumblrのアカウント切り替えでhttpsも可能にするTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Tombloo Model Tumblr ChangeAccount HTTPS patch]
 *
 * - Tumblr のアカウント切り替えで https も可能にする
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.02
 * @date       2012-02-17
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.changeaccount.https.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */

update(Tumblr, {
    getPasswords : function() {
        let ok = true, infos = getPasswords('http://www.tumblr.com');
        if (!infos || !infos.length) {
            ok = false;
        } else {
            infos.forEach(function(info) {
                if (!info || !info.user || !info.password) {
                    ok = false;
                }
            });
        }
        return ok ? infos : getPasswords('https://www.tumblr.com');
    }
});

