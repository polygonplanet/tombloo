/**
 * Tombfix patch
 *
 * TumblrでPhotosetをローカル保存する時、全画像を取得するTombfixパッチ
 *
 * @version    1.00
 * @date       2013-09-19
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 * @link       http://twitter.com/polygon_planet
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombfix.model.tumblr.photoset.local.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(Tumblr, {
    getForm : function(url) {
        var self = this;
        return request(url).addCallback(function(res) {
            var doc = convertToHTMLDocument(res.responseText);
            var form = formContents(doc);
            delete form.preview_post;
            form.redirect_to = Tumblr.TUMBLR_URL+'dashboard';

            if (form.reblog_post_id) {
                self.trimReblogInfo(form);

                // Tumblrから他サービスへポストするため画像URLを取得しておく
                if (form['post[type]']=='photo') {
                    form.image = $x('id("edit_post")//img[contains(@src, "media.tumblr.com/") or contains(@src, "data.tumblr.com/")]/@src', doc);
                }
            }

            // Photoset
            var iframe = $x('//iframe[starts-with(@id, "photoset_iframe_")]/@src', doc);
            if (iframe) {
                return request(iframe).addCallback(function(res) {
                    var doc = convertToHTMLDocument(res.responseText);
                    var images = $x('//a[contains(@class, "photoset_photo")]//img/@src', doc, true);
                    if (images && images.length) {
                        form.image = form.image || images[0];
                        // Photoset URLが入った配列を保持
                        form.images = images;
                    }
                    return form;
                });
            }
            return form;
        });
    }
});

// Local
(function() {
    var limit = 3;
    setTimeout(function observe() {
        // Bookmarkパッチ用
        if (!Models.Local.Audio && --limit >= 0) {
            return setTimeout(observe, 1000);
        }
        // Local post アップデート
        Models.Local.Photo.post = function() {
            var post_ = Models.Local.Photo.post;
            return function(ps) {
                if (ps.favorite && ps.favorite.form &&
                    Array.isArray(ps.favorite.form.images) && ps.favorite.form.images.length
                ) {
                    // 画像が複数 (Photoset)
                    return deferredForEach(ps.favorite.form.images, function(image) {
                        return wait(0).addCallback(function() {
                            return post_(update({}, ps, { itemUrl : image }));
                        });
                    });
                }
                return post_(ps);
            };
        }();
    }, 1000);
}());


}());
