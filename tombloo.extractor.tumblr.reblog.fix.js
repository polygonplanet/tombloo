/**
 * Extractor Tumblr Reblog Fix - Tombloo patches
 *
 * Tumblrでリブログできないのを修正するTomblooパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 *
 * - リブログ時のエラー修正
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.03
 * @date       2012-09-21
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.reblog.fix.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

var orgMethod = Tombloo.Service.extractors.ReBlog.getFrameUrl;

update(Tombloo.Service.extractors.ReBlog, {
    getFrameUrl : function(doc) {
        return $x(
            '//iframe[(starts-with(@src, "http://www.tumblr.com/iframe") or ' +
                      'starts-with(@src, "http://assets.tumblr.com/iframe")) and ' +
                      'contains(@src, "pid=")]/@src',
            doc
        ) || orgMethod(doc);
    }
});

}());
