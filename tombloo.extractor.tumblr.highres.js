/**
 * Extractor Tumblr HighRes - Tombloo patch
 *
 * TumblrでhighRes画像を取得するTomblooパッチ
 *
 * @version    1.00
 * @date       2013-06-13
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter: http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.highres.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

addAround(Tombloo.Service.extractors['ReBlog'], 'extractByEndpoint', function(proceed, args) {
    return proceed(args).addCallback(function(ps) {
        var itemUrl = ps.itemUrl;

        if (ps.type !== 'photo' || !/tumblr.*_\d+\.\w+$/.test(itemUrl)) {
            return ps;
        }

        var highRes = itemUrl.replace(/^(.*)_\d+\.(\w+)$/, '$1_1280.$2');

        if (highRes === itemUrl) {
            return ps;
        }

        return request(highRes).addCallback(function(res) {
            if (res.status == 200) {
                itemUrl = highRes;
                update(ps, {
                    itemUrl : itemUrl,
                    form    : {
                        image : itemUrl
                    }
                });
            }
            return ps;
        });
    });
});

}());
