/**
 * Service ReadItLater Fix - Tombloo patches
 *
 * Pocket (Read It Later) の修正パッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 *
 * - Pocket (Read It Later) にポストできてないのを修正
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.03
 * @date       2012-07-05
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.readitlater.fix.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(ReadItLater, {
    post : function(ps) {
        const API_URI      = 'http://getpocket.com/v2/r.gif';
        const SUCCESS      = 1;
        const NOT_LOGGEDIN = 2;
        const ERROR_SAVING = 3;

        let that = this;
        let send = function(p) {
            return loadImage(API_URI + '?' + queryString(p)).addCallback(function(img) {
                let res = img.width;
                if (res !== SUCCESS) {
                    if (res === NOT_LOGGEDIN) {
                        throw new Error(getMessage('error.notLoggedin'));
                    } else if (res === ERROR_SAVING) {
                        throw new Error(that.name + ': Error saving');
                    }
                }
                return true;
            });
        };
        let createParams = function(p) {
            return update({
                v    : 1,
                h    : '29d8',
                rand : Math.random()
            }, p);
        };

        return send(createParams({
            u : ps.itemUrl,
            t : ps.item
        })).addCallback(function(res) {
            if (ps.tags && ps.tags.length) {
                return send(createParams({
                    u    : ps.itemUrl,
                    tags : JSON.stringify(ps.tags)
                }));
            } else {
                return res;
            }
        });
    }
});


}());
