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
 * @version    1.11
 * @date       2013-05-10
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
    var re = /(?:<|\\x3c)iframe\b[\s\S]*?src\s*=\s*(["']|\\x22)(http:\/\/assets\.tumblr\.com\/.*?iframe.*?)\1/i;
    var url = proceed(args) || doc.documentElement.innerHTML.extract(re, 2);
    return (url || '').replace(/\\x22/g, '"').replace(/\\x26/g, '&');
});
