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
 * @version    1.10
 * @date       2013-05-08
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.reblog.fix.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
addAround(Tombloo.Service.extractors['ReBlog'], 'getFrameUrl', function(proceed, args) {
    var doc = args[0];
    var re = /<iframe\s+src\s*=\s*(["']|)(http:\/\/assets\.tumblr\.com\/iframe.*?)\1/;
    return proceed(args) || doc.documentElement.innerHTML.extract(re, 2);
});
