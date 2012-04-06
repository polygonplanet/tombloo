/**
 * dotup.org Extractor - Tombloo patches
 *
 *
 * どっとうｐろだ.org用のTomblooパッチ : http://www.dotup.org/
 *
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [dotup.org Extractor patch]
 *
 * - どっとうｐろだ.orgの画像のポスト用
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2012-04-07
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter: http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.dotup.org.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
//-----------------------------------------------------------------------------
(function() {

// dotup.org Extractor
Tombloo.Service.extractors.register([{
    name: 'Photo - dotup.org',
    ICON: 'chrome://tombloo/skin/photo.png',
    RE_HOST: /(?:\w+[.])*?dotup[.]org/,
    check: function(ctx) {
        return ctx.onImage && this.RE_HOST.test(ctx.host);
    },
    extract: function(ctx) {
        var title, target, itemUrl;
        if (ctx.document.contentType.match(/^image/i)) {
            ctx.href.split('/').pop();
        }
        target = ctx.target;
        itemUrl = tagName(target) === 'object' ? target.data : target.src;
        try {
            title = itemUrl.split('/').pop().split('.').slice(0, -1).join('.');
        } catch (e) {
            title = ctx.title;
        }
        return download(itemUrl, getTempDir()).addCallback(function(file) {
            return {
                type: 'photo',
                item: title,
                itemUrl: itemUrl,
                file: file
            };
        });
    }
}], 'Photo - image link');


}());
