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
 * @version    1.04
 * @date       2012-04-01
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.changeaccount.https.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(Tumblr, {
    getPasswords : function() {
        let results = [];
        ['http://www.tumblr.com', 'https://www.tumblr.com'].forEach(function(url) {
            let users = getPasswords(url);
            if (!users || !users.length) {
                users = [];
            }
            try {
                users.forEach(function(info) {
                    let add = false;
                    if (info && info.user != null && info.password != null) {
                        if (results.length === 0) {
                            add = true;
                        } else {
                            add = !results.some(function(o) {
                                return o.user === info.user && o.password === info.password;
                            });
                        }
                        if (add) {
                            results[results.length] = info;
                        }
                    }
                });
            } catch (e) {}
        });
        return alphanumSort(results);
    }
});

// http://www.davekoelle.com/alphanum.html
var alphanumSort = (function() {
    function chunkify(t) {
        var tz = [], x = 0, y = -1, n = 0, i, j, m;
        while ((i = (j = t.charAt(x++)).charCodeAt(0))) {
            m = (i == 46 || (i >= 48 && i <= 57));
            if (m !== n) {
                tz[++y] = '';
                n = m;
            }
            tz[y] += j;
        }
        return tz;
    }

    function alphanumCase(a, b) {
        var aa, bb, c, d, i;
        aa = chunkify(a.user.toLowerCase());
        bb = chunkify(b.user.toLowerCase());
        for (i = 0; (aa[i] && bb[i]); i++) {
            if (aa[i] !== bb[i]) {
                c = +aa[i];
                d = +bb[i];
                if (c == aa[i] && d == bb[i]) {
                    return c - d;
                } else {
                    return (aa[i] > bb[i]) ? 1 : -1;
                }
            }
        }
        return aa.length - bb.length;
    }

    return function(array) {
      array.sort(alphanumCase);
      return array;
    };
}());

}());
