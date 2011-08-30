/**
 * Model.Faves.Disable.Icon - Tombloo patches
 *
 * FavesのSSL証明書警告を出さないようにするTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Model Faves Disable Icon patch]
 *
 * - Favesのアイコンを変えて警告ダイアログが出ないようにする
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2011-08-30
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.faves.disable.icon.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


update(models.Faves, {
    ICON : 'chrome://tombloo/skin/item.ico'
});


})();

