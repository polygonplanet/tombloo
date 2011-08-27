/**
 * Google+.Extractor - Tombloo patches
 *
 * Google+ストリーム上の画像を原寸大でポストできるパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Google+ Extractor patch]
 *
 * - いまのところ画像のみ
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2011-08-27
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.googleplus.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


Tombloo.Service.extractors.register([{
    name  : 'Photo - Google+',
    ICON  : 'http://ssl.gstatic.com/s2/oz/images/favicon.ico',
    HOME  : 'https://plus.google.com/',
    check : function(ctx) {
        return ctx.onImage && /^(?:\w+[.])*?plus[.]google[.]com$/.test(ctx.host);
    },
    // 画像の原寸大URIを抽出
    extractImageURI : function(url) {
        let uri = '', patterns;
        patterns = {
            proxy  : /^(?:https?:|)\/+(?:\w+?-)*?opensocial[.]googleusercontent[.]com\//,
            image  : /[?].*url=([^&]+)(?:[&]|$)/i,
            photo  : /^(?:https?:|)\/+(?:\w+[.])*?googleusercontent[.]com\//,
            resize : /\/[a-z][0-9]{1,6}\//i,
            icon   : /[?]\w+=\d+.*$|\/[a-z]\d+(?:-[a-z])*(?=\/photo[.](?:jpe?g|png|gif)$)/i
        };
        if (url) {
            url = String(url);
            if (patterns.proxy.test(url) && patterns.image.test(url)) {
                uri = url.match(patterns.image)[1];
            } else if (patterns.photo.test(url)) {
                if (patterns.resize.test(url)) {
                    uri = url.replace(patterns.resize, '/');
                } else if (patterns.icon.test(url)) {
                    uri = url.replace(patterns.icon, '');
                }
            }
        }
        return uri || url;
    },
    extract : function(ctx) {
        let src, name, patterns, limit;
        patterns = {
            sep   : /[\/\\]+/g,
            image : /^image/i,
            space : /[\s\u00A0\u3000]+/g,
            video : /\/ytimg[.]googleusercontent[.]com\/\w+\/(\w+)\/(?:hq|)default/i,
            uri   : /%[0-9a-f]{2}/i
        };
        ctx.title = String(ctx.title).trim();
        try {
            if (patterns.image.test(ctx.document.contentType)) {
                ctx.title = ctx.href.split(patterns.sep).pop();
            }
        } catch (e) {}
        src = tagName(ctx.target) === 'object' ? ctx.target.data : ctx.target.src;
        ctx.itemUrl = this.extractImageURI(src);
        if (patterns.video.test(ctx.itemUrl)) {
            name = ctx.itemUrl.match(patterns.video)[1];
        }
        if (!name) {
            try {
                name = unescapeHTML(ctx.itemUrl.split(patterns.sep).pop());
                limit = 5;
                while (--limit >= 0 && patterns.uri.test(name)) {
                    name = decodeURIComponent(name);
                }
            } catch (e) {
                name = Math.random().toString(36);
            }
        }
        ctx.title = joinText([
            String(ctx.title || (+new Date)).trim(),
            name
        ], ' - ').replace(patterns.space, ' ').trim();
        ctx.target = {
            src : ctx.itemUrl
        };
        return Tombloo.Service.extractors['Photo'].extract(ctx).addErrback(function() {
            return download(ctx.itemUrl, getTempDir()).addCallback(function(file) {
                return {
                    type    : 'photo',
                    item    : ctx.title,
                    itemUrl : ctx.itemUrl,
                    file    : file
                };
            });
        });
    }
}], 'Photo', false);


})();

