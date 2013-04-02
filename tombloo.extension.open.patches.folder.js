/**
 * Extension Open Patches Folder - Tombloo patches
 *
 * 「パッチフォルダを開く」メニューを追加するパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 *
 * - 「パッチフォルダを開く」メニューを追加する
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2013-04-03
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.open.patches.folder.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

var LANG = function(n) {
    return ((n && (n.language  || n.userLanguage || n.browserLanguage ||
            n.systemLanguage)) || 'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);

var LABELS = {
    translate : function(name) {
        var r, o, p, args = Array.prototype.slice.call(arguments);
        p = args.shift();
        o = LABELS[p];
        while (o && args.length) {
            p = args.shift();
            o = o[p];
        }
        return o && o[LANG === 'en' && LANG || 'ja'];
    },
    OPEN_SCRIPT_FOLDER : {
        ja : 'パッチフォルダを開く',
        en : 'Open Script Folder'
    }
};

Tombloo.Service.actions.register({
    name : LABELS.translate('OPEN_SCRIPT_FOLDER'),
    type : 'context,menu',
    // icon: folder.png : http://www.famfamfam.com/
    icon : [
        'data:image/png;base64',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLxZO7ihRBFIa/6u0ZW7GHBUV0',
        'UQQTZzd3QdhMQxOfwMRXEANBMNQX0MzAzFAwEzHwARbNFDdwEd31Mj3X7a6uOr9BtzNjYjKBJ6ni',
        'cP7v3KqcJFaxhBVtZUAK8OHlld2st7Xl3DJPVONP+zEUV4HqL5UDYHr5xvuQAjgl/Qs7TzvOOVAj',
        'xjlC+ePSwe6DfbVegLVuT4r14eTr6zvA8xSAoBLzx6pvj4l+DZIezuVkG9fY2H7YRQIMZIBwycmz',
        'H1/s3F8AapfIPNF3kQk7+kw9PWBy+IZOdg5Ug3mkAATy/t0usovzGeCUWTjCz0B+Sj0ekfdvkZ3a',
        'bBv+U4GaCtJ1iEm6ANQJ6fEzrG/engcKw/wXQvEKxSEKQxRGKE7Izt+DSiwBJMUSm71rguMYhQKr',
        'BygOIRStf4TiFFRBvbRGKiQLWP29yRSHKBTtfdBmHs0BUpgvtgF4yRFR+NUKi0XZcYjCeCG2smkz',
        'LAHkbRBmP0/Uk26O5YnUActBp1GsAI+S5nRJJJal5K1aAMrq0d6Tm9uI6zjyf75dAe6tx/SsWeD/',
        '/o2/Ab6IH3/h25pOAAAAAElFTkSuQmCC'
    ].join(''),
    check : function(ctx) {
        return true;
    },
    execute : function(ctx) {
        try {
            getPatchDir().launch();
        } catch (e) {
            alert('Error! ' + (e && e.message || e));
        }
    }
}, '----');


}());
