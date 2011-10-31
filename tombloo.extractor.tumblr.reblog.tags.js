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
 * @version    1.01
 * @date       2011-11-01
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
    let result, node, tags, wrapper;
    node = ctx && ctx.target;
    while (node) {
        // タグっぽいものを探す (ページの場合カスタマイズしてるかもなので間違える可能性アリ)
        wrapper = $x('./ancestor-or-self::li[starts-with(normalize-space(@class),"post")]', node);
        if (wrapper) {
            tags = $x('./*[starts-with(@id,"post_tags_")]', wrapper) ||
                   $x('./*[contains(@class,"tags")]', wrapper);
        } else {
            tags = $x('./*[contains(@class,"tag") or contains(@class,"label") or contains(@id,"tag") or contains(@id,"label")]', node);
        }
        if (wrapper || tags) {
            // 確実に間違えてる場合は無効にする
            if (tags && (tagName(tags) === 'body' ||
                         /tumblr.com\/archive/.test(ctx.href) ||
                         /\b(?:container|wrapper|main)\b/.test(tags.className))) {
                tags = null;
            }
            break;
        }
        node = node.parentNode;
    }
    if (tags) {
        tags = convertToPlainText(tags).replace(/<\/?\w[^>]*>|\s[ox\d]\s|[\x00-\x19*\/]/gi, '');
        //FIXME: スペースの扱いが曖昧
        tags = tags.split(~tags.indexOf('#') ? /[#,]+/ : /[\s,]+/).map(function(tag) {
            return tag.replace(/^#+|^\s+|\s+$|,/g, '').replace(/\s+/g, '-').trim();
        }).filter(function(tag) {
            return tag && tag.length;
        }).join(',').replace(/^Source:[\w.-]+,?/i, '');
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

