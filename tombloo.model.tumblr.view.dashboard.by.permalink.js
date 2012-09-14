/**
 * Tombloo Model Tumblr View Dashboard by Permalink - Tombloo patches
 *
 * TumblrのPostなどからその位置のDashboardを表示するTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 *
 * - Dashboard上などで右クリック→「Tombloo」→「View Tumblr DashBoard」
 *   その時のDashboardを新しいタブで開く
 *   (Dashboard上, Permalink, Tumblelogなどで有効)
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2012-09-15
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.view.dashboard.by.permalink.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

const LABEL = 'View Tumblr Dashboard';

let patterns = {
    post   : new RegExp('^https?://[^.]+[.]tumblr[.]com/post/([0-9]+)'),
    iframe : new RegExp('^https?://assets[.]tumblr[.]com/iframe.*&pid=([0-9]+)')
};

Tombloo.Service.actions.register({
    name  : LABEL,
    type  : 'context',
    icon  : Tumblr.ICON,
    check : function(ctx) {
        let url = (ctx.onLink && patterns.post.test(ctx.linkURL) && ctx.linkURL) ||
                  Tombloo.Service.extractors['ReBlog - Tumblr'].check(ctx) ||
                  Tombloo.Service.extractors['ReBlog - Dashboard'].check(ctx);
        return (url.extract(patterns.post) || url.extract(patterns.iframe)) - 0;
    },
    execute : function(ctx) {
        addTab('http://www.tumblr.com/dashboard/999/' + (this.check(ctx) + 1));
    }
}, '----');

Tombloo.Service.actions.register({
    name : '----',
    type : 'context'
}, LABEL);


}());
