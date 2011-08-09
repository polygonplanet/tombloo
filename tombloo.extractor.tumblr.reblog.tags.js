/**
 * Extractor.Tumblr.Reblog.Tags - Tombloo patches
 *
 * Tumblrでリブログ時にタグの継承を可能にするTomblooパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Extractor Tumblr Reblog Tags patch]
 *
 * - リブログ時のタグも一緒にポストする
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2011-08-10
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.reblog.tags.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
callLater(2, function() {

// リブログ時のタグ継承対応
addAround(Tombloo.Service.extractors['ReBlog'], 'convertToParams', function(proceed, args) {
    let form = args[0] || {}, result = proceed(args) || {};
    update(result, {
        tags : result.tags || (form['post[tags]'] || '').trim()
    });
    return result;
});


});

