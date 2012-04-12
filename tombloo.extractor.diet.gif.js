/**
 * Diet.gif.Extractor - Tombloo patches
 *
 * Tumblrにポストすると動かなくなるgifアニメを減色して動かすパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Diet gif Extractor patch]
 *
 * - Tumblrにポストすると動かなくなるgifアニメを減色とかして動かす
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2012-04-12
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.diet.gif.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 *
 * Special Thanks to: cxx
 *    - http://diet-gif.herokuapp.com/
 *    - http://give-me-money.g.hatena.ne.jp/cxx/20111205/1323019169
 */
!function() {

const DIET_GIF_API_URL = 'http://diet-gif.herokuapp.com/';

Tombloo.Service.extractors.register([{
    name  : 'Photo - Diet gif animation',
    ICON  : 'chrome://tombloo/skin/photo.png',
    check : function(ctx) {
        return /[.]gif$/i.test(this.getMediaURI(ctx));
    },
    getMediaURI : function(ctx) {
        return (ctx.onImage && ctx.target && ctx.target.src) ||
                (ctx.onLink && ctx.link && ctx.link.href);
    },
    extract : function(ctx) {
        ctx.target = {
            src : DIET_GIF_API_URL + this.getMediaURI(ctx)
        };
        return Tombloo.Service.extractors['Photo'].extract(ctx);
    }
}], 'Photo - Upload from Cache', true);

}();
