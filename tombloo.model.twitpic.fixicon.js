/**
 * Model.Twitpic.FixIcon - Tombloo patches
 *
 * Twitpicが動かないのでとりあえずFixのTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Model Twitpic FixIcon patch]
 *
 * - TwitPicとりあえずなんとか
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2012-01-22
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.twitpic.fixicon.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function () {

update(models.Twitpic, {
    ICON     : 'https://twitpic.com/favicon.ico',
    POST_URL : 'https://twitpic.com/upload',
    check : function(ps) {
        return ps.type == 'photo';
    },
    post : function(ps) {
        let that = this;
        return (ps.file ? succeed(ps.file) :
            download(ps.itemUrl, getTempFile(createURI(ps.itemUrl).fileExtension))
        ).addCallback(function(file) {
            return that.upload({
                media         : file,
                message       : ps.description,
                post_photo    : 1, // Twitterへクロスポスト
                save_location : ''
            });
        });
    },
    upload : function(ps) {
        let that = this;
        return this.getToken().addCallback(function(token) {
            return request(that.POST_URL + '/process', {
                sendContent : update(token, ps)
            });
        });
    },
    getToken : function() {
        const RE = /<input\b[\s\S]*?type=["\\]*hidden["\\]*[\s\S]*?name=["\\]*form_auth["\\]*[\s\S]*?value=["\\]*([^"\\]+)["\\]*[^>]*>/i;
        return request(this.POST_URL).addCallback(function(res) {
            // 未ログインの場合トップにリダイレクトされる(クッキー判別より安全と判断)
            if (/\/twitpic[.]co[^\/]+\/$/.test(res.channel.URI.asciiSpec)) {
                throw new Error(getMessage('error.notLoggedin'));
            }
            let html = res.responseText,
                doc = convertToHTMLDocument(html),
                auth = $x('//input[@name="form_auth"]/@value', doc) || (RE.test(html) && html.extract(RE));
            return {
                form_auth : auth
            };
        });
    }
});

}());
