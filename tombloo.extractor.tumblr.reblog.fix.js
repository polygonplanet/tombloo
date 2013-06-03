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
 * @version    1.13
 * @date       2013-06-03
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extractor.tumblr.reblog.fix.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

addAround(Tombloo.Service.extractors['ReBlog'], 'getFrameUrl', function(proceed, args) {
    var doc = args[0];
    var re = /(?:<|\\x3c)iframe\b[\s\S]*?src\s*=\s*(["']|\\x22)(http:\/\/assets\.tumblr\.com\/.*?iframe.*?)\1/i;
    var url = proceed(args) || doc.documentElement.innerHTML.extract(re, 2);
    return (url || '').replace(/\\x22/g, '"').replace(/\\x26/g, '&');
});


update(Tumblr, {
    getForm : function(url) {
        var self = this;
        return request(url).addCallback(function(res) {
            var doc = convertToHTMLDocument(res.responseText);
            var form = formContents(doc);
            if (!form['post[type]']) {
                form['post[type]'] = $x('//*[@id="header"]//select/option[@selected]/text()', doc).trim().toLowerCase();
            }
            delete form.preview_post;
            form.redirect_to = Tumblr.TUMBLR_URL+'dashboard';
            if(form.reblog_post_id){
                self.trimReblogInfo(form);
            }
            // Tumblrから他サービスへポストするため画像URLを取得しておく
            if (form['post[type]'] == 'photo') {
                form.image = $x(
                    '//*[contains(@class, "media_post_external_url")]' +
                    '//img[contains(@src, "media.tumblr.com/") or contains(@src, "data.tumblr.com/")]/@src', doc);
            }
            return form;
        });
    },
});


}());

