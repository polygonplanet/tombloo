/**
 * yaplog! large photo extractor - Tombloo patches
 *
 * yaplog!で大きいサイズの画像をポストできるようにするパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 *
 * - 大きいサイズの画像をポストできるようにする
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2012-04-21
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.yaplog.photo.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
!function() {

Tombloo.Service.extractors.register([{
    name  : 'Photo - yaplog!',
    ICON  : 'http://www.yaplog.jp/img/common/favicon.ico',
    check : function(ctx) {
        return ctx.onImage && ctx.target &&
               /\/(?:image|img)\//.test(ctx.target.src) &&
               /^(?:\w+[.])*?yaplog[.]jp$/.test(ctx.host);
    },
    extract : function(ctx) {
        ctx.target = {
            src : ctx.target.src.replace(/([.][^.]+)$/, '_large$1')
        };
        return Tombloo.Service.extractors['Photo'].extract(ctx);
    }
}], 'Photo', false);

}();
