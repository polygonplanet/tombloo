/**
 * Extractor Tumblr HighRes - Tombfix patch
 *
 * TumblrでhighRes画像を取得するTombfixパッチ
 *
 * @version    1.01
 * @date       2013-09-19
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 * @link       http://twitter.com/polygon_planet
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.highres.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

addAround(Tombloo.Service.extractors['ReBlog'], 'extractByEndpoint', function(proceed, args) {

    function getHighRes(ps) {
        var itemUrl = ps.itemUrl;

        if (ps.type !== 'photo' || !/tumblr.*_\d+\.\w+$/.test(itemUrl)) {
            return succeed(ps);
        }
        var highRes = itemUrl.replace(/^(.*)_\d+\.(\w+)$/, '$1_1280.$2');

        if (highRes === itemUrl) {
            return succeed(ps);
        }
        return request(highRes).addErrback(function(err) {
            return ps;
        }).addCallback(function(res) {
            if (res.status == 200) {
                update(ps, {
                    itemUrl : highRes,
                    form    : {
                        image : highRes
                    }
                });
            }
            return ps;
        });
    }

    return proceed(args).addCallback(function(ps) {
        if (ps.favorite && ps.favorite.form &&
            Array.isArray(ps.favorite.form.images) && ps.favorite.form.images.length
        ) {
            // 画像が複数 (Photoset)
            return deferredForEach(ps.favorite.form.images, function(image, i) {
                return wait(0).addCallback(function() {
                    return getHighRes(update({}, ps, { itemUrl : image })).addCallback(function(nps) {
                        ps.favorite.form.images[i] = nps.itemUrl;
                        return ps;
                    });
                });
            });
        }
        return getHighRes(ps);
    });
});

}());
