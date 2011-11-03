/**
 * Service.Actions.Element - Tombloo patches
 *
 * ページ内のDOM要素を削除したり操作するTomblooパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Service Actions Element patch]
 *
 * - ページ内のDOM要素を削除したりと操作する
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.00
 * @date       2011-11-03
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.element.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


// Define language
const LANG = (function(n) {
    return ((n && (n.language || n.userLanguage     ||
            n.browserLanguage || n.systemLanguage)) ||
            'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
})(navigator);


// UI labels
const LABELS = {
    translate : function(name) {
        return LABELS[name][LANG === 'en' && LANG || 'ja'];
    },
    MENU_TOP : {
        ja : '要素を削除',
        en : 'Remove Element'
    },
    MENU_REMOVE_THIS : {
        ja : 'この要素を削除',
        en : 'Remove this element'
    },
    MENU_REMOVE_SELECTION : {
        ja : '選択範囲の要素を削除',
        en : 'Remove selection elements'
    }
};


// メニューを登録
Tombloo.Service.actions.register({
    name : LABELS.translate('MENU_TOP'),
    type : 'context',
    // icon: tag.png : http://www.famfamfam.com/
    icon : strip(<>
        data:image/png;base64,
        iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
        U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEXSURBVDjLY/j//z8DJZhhmBpg2POQn2wD
        DDof8HvOe3osYtXzDzCxuM2vP3gvfn4MJIfXAP22e0Ies58eK9r2+r//3Kf3YOIhq17eK9v95j9I
        Trv2jhBWA/Ra7kVEr375vXDrq/9+s57eUy+4IY0kJx2w6Nk9kFzE0uffgXIRKAboNtxlC1/+/GPl
        jjdABc9+q+ZcM0Z3qmb5LWOQXOmml/8DZz7+qJB0hQ3FBerFNyNC5z/9nrXqxX+Pvgf35OMuSSPJ
        SXtPfXQPJBc089F3oFwE1jBQTLkiZNtw51jq4qf/XVvuwsPAa9Kjexkrnv8HyclFXxTCGwsyERf4
        LctvHvPuvAePBf8pDz/Y1N45BpIbKUmZFAwAR3nW32nUrY0AAAAASUVORK5CYII=
    </>),
    children : [{
        name  : LABELS.translate('MENU_REMOVE_THIS'),
        type  : 'context',
        check : function(ctx) {
            if (ctx && ctx.target && ctx.target.parentNode) {
                this.name = [
                    LABELS.translate('MENU_REMOVE_THIS'),
                    '<' + tagName(ctx.target) + '.../>'
                ].join(' ');
                /*
                // サブメニューアイテムが選択されてる時のイベントはない!? (保留!)
                let (cssText = ctx.target.style.cssText, style = ctx.target.style) {
                    style.border = '3px solid #fece33';
                    style.MozBoxShadow = '1px 1px 5px #333';
                    callLater(5, function() {
                        try {
                            style.cssText = cssText;
                        } catch (e) {}
                    });
                }
                */
                return true;
            } else {
                return false;
            }
        },
        execute : function(ctx) {
            try {
                removeElement(ctx.target);
            } catch (e) {}
        }
    }, {
        name  : LABELS.translate('MENU_REMOVE_SELECTION'),
        type  : 'context',
        check : function(ctx) {
            let sel;
            try {
                sel = ctx.window.getSelection().toString();
            } catch (e) {}
            if (ctx && ctx.target && sel) {
                target = ctx.target;
                this.name = [
                    LABELS.translate('MENU_REMOVE_SELECTION'),
                    '(' +
                        (sel.trim().slice(0, 5) ||
                        ('<' + tagName(ctx.target) + '.../>')) +
                    '...)'
                ].join(' ');
                return true;
            } else {
                return false;
            }
        },
        execute : function(ctx) {
            try {
                ctx.window.getSelection().deleteFromDocument();
            } catch (e) {}
        }
    }]
}, '----');


// -- Helper functions --

function stringify(x, ignoreBoolean) {
  var result = '', c, len = arguments.length;
  if (x !== null) {
    switch (typeof x) {
      case 'string':
      case 'number':
      case 'xml':
          result = x;
          break;
      case 'boolean':
          if (len >= 2 && !ignoreBoolean) {
            result = x;
          } else if (!ignoreBoolean) {
            result = x ? 1 : '';
          }
          break;
      case 'object':
          if (x) {
            // Fixed object valueOf. e.g. new String('hoge');
            c = x.constructor;
            if (c === String || c === Number ||
                (typeof XML !== 'undefined' && c === XML) ||
                (typeof Buffer !== 'undefined' && c === Buffer)) {
              result = x;
            } else if (c === Boolean) {
              if (len >= 2 && !ignoreBoolean) {
                result = x;
              } else if (!ignoreBoolean) {
                result = (x == true) ? 1 : '';
              }
            }
          }
          break;
      default:
          break;
    }
  }
  return result.toString();
}


function strip(s) {
    return stringify(s).replace(/[\s\u00A0\u3000]+/g, '');
}


})();

