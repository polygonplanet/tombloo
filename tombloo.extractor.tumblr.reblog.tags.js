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
 * @version    1.03
 * @date       2012-05-13
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
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
    let form = args[0] || {},
        result = proceed(args) || {},
        tags = result.tags || (form['post[tags]'] || '').trim();
    if (tags) {
        update(result, {
            tags : tags
        });
    }
    return result;
});

// ダッシュボードからタグを取得 + ページから取得(可能な限り)
addAround(Tombloo.Service.extractors['ReBlog'], 'extractByEndpoint', function(proceed, args) {
    let [ctx, endpoint] = args;
    let result, node, tags, wrapper, limit = 3, expr;
    node = ctx && ctx.target;
    // ダッシュボード
    if (/^https?:\/\/(?:www[.]|)tumblr[.]com\//.test(ctx.document.documentURI)) {
        expr = './ancestor-or-self::li[starts-with(normalize-space(@class),"post")]//*[contains(@class,"tags")]/a/text()';
        tags = $x(expr, node, true);
    } else {
        // ページ内
        while (node) {
            if (/tumblr.com\/archive/.test(ctx.href) ||
                /\b(?:container|wrapper|main)\b/.test(node.className + ' ' + node.id)) {
                tags = '';
                break;
            }
            expr = './/*[contains(@class,"tag") or contains(@class,"label") or contains(@id,"tag") or contains(@id,"label")]/*/text()';
            tags = $x(expr, node, true);
            if (--limit < 0 || (tags && tags.length)) {
                break;
            }
            node = node.parentNode;
        }
    }
    if (!tags || !tags.length) {
        tags = '';
    } else {
        tags = (tags || []).map(function(tag) {
            return tag.replace(/^\s+|\s+$|[\x00-\x19,#*\/]/g, '').replace(/\s+/g, '-').trim();
        }).filter(function(tag) {
            return tag && tag.length && !/^Tags:$|tag.?[(]['"]?\d+["']?[)];?$/i.test(tag);
        }).join(',').replace(/^(?:Source|[^:]+):[\w.-]+,?/i, '');
    }
    if (tags) {
        return proceed(args).addCallback(function(res) {
            return update({
                tags : tags || ''
            }, res || {});
        });
    } else {
        return proceed(args);
    }
});

});

