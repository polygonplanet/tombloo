/**
 * 2ch Extractor - Tombloo patches
 *
 *
 * 2ch用のTomblooパッチ : http://www.2ch.net/
 *
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [2ch Extractor patch]
 *
 * - user.jsとあわせて使う用
 *    http://userscripts.org/scripts/show/117405
 *    で画像スレ抽出して
 *    http://userscripts.org/scripts/show/102543
 *    でスレ全部から画像抽出してこのパッチでポスト
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.02
 * @date       2012-04-07
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter: http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.2ch.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
//-----------------------------------------------------------------------------
(function() {

var extractor2ch = {
    name : 'Photo - 2ch',
    ICON : 'http://www2.2ch.net/favicon.ico',
    HOST_PATTERNS : [
        {
            include : /(?:\w+[.])*?2ch[.]net(?:\b|$)/
        },
        {
            include : /(?:\w+[.])*?bbspink[.]com(?:\b|$)/
        },
        {
            include : /(?:^|\b)cha2[.]net(?:\b|$)/
        },
        {
            include : /(?:\w+[.])*?machi[.]to(?:\b|$)/
        },
        {
            include : /(?:\w+[.])*?vip2ch[.]com(?:\b|$)/
        },
        {
            exclude : /(?:^|\b)find[.]2ch[.]net(?:\b|$)/
        },
        {
            exclude : /(?:^|\b)p2[.]2ch[.]net(?:\b|$)/
        }
    ],
    check : function(ctx) {
        var result = false;
        if (ctx && ctx.onImage) {
            this.HOST_PATTERNS.forEach(function(re) {
                if (!result && re.include && re.include.test(ctx.host)) {
                    result = true;
                } else if (result && re.exclude && re.exclude.test(ctx.host)) {
                    result = false;
                }
            });
        }
        return result;
    },
    extract : function(ctx) {
        var title, target, itemUrl;
        if (ctx.document.contentType.match(/^image/i)) {
            ctx.href.split('/').pop();
        }
        title = ctx.title;
        target = ctx.target;
        itemUrl = tagName(target) === 'object' ? target.data : target.src;
        return download(itemUrl, getTempDir()).addCallback(function(file) {
            return {
                type    : 'photo',
                item    : title,
                itemUrl : itemUrl,
                file    : file
            };
        });
    }
};


Tombloo.Service.extractors.register([
    update(update({}, extractor2ch), {
        name  : 'Photo - 2ch - Data URI',
        check : function(ctx) {
            return Tombloo.Service.extractors['Photo - Data URI'].check(ctx) &&
                    extractor2ch.check(ctx);
        },
        extract : function(ctx) {
            return Tombloo.Service.extractors['Photo - Data URI'].extract(ctx);
        }
    }),
    update({}, extractor2ch)
], 'Photo - image link');


}());
