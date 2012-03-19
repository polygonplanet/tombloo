/**
 * Service.Actions.ChangeAccount.Tumblr.Fix - Tombloo patches
 *
 * Tumblrの「アカウントの切り替え」を直すパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Service Actions ChangeAccount Tumblr Fix patch]
 *
 * - Tumblrの「アカウントの切り替え」暫定Fix
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2012-03-19
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.changeacount.tumblr.fix.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

update(Tumblr, {
    login : function(user, password) {
        const LOGIN_FORM_URL = 'https://www.tumblr.com/login';
        const LOGIN_EXEC_URL = 'https://www.tumblr.com/svc/account/register';
        let that = this;
        return Tumblr.logout().addCallback(function() {
            return request(LOGIN_FORM_URL).addCallback(function(res) {
                let doc = convertToHTMLDocument(res.responseText),
                    form = doc.getElementById('signup_form');
                return request(LOGIN_EXEC_URL, {
                    sendContent : update(formContents(form), {
                        'action'         : 'signup_login',
                        'user[email]'    : user,
                        'user[password]' : password
                    })
                });
            }).addCallback(function() {
                that.updateSession();
                that.user = user;
            });
        });
    }
});

}());

