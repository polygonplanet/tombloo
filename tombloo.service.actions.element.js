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
 * @version    1.02
 * @date       2013-03-24
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.element.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


// Define language
var LANG = function(n) {
    return ((n && (n.language || n.userLanguage     ||
            n.browserLanguage || n.systemLanguage)) ||
            'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);


// UI labels
var LABELS = {
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
    },
    MENU_REMOVE_ELEMENT : {
        ja : '要素を指定して削除',
        en : 'Remove by specify element'
    },
    MENU_REMOVE_REGION : {
        ja : '選択範囲を指定して要素を削除',
        en : 'Remove by specify region'
    }
};


// メニューを登録
Tombloo.Service.actions.register({
    name : LABELS.translate('MENU_TOP'),
    type : 'context',
    // icon: tag.png : http://www.famfamfam.com/
    icon : strip([
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEXSURBVDjLY/j//z8DJZhhmBpg2POQn2wD',
        'DDof8HvOe3osYtXzDzCxuM2vP3gvfn4MJIfXAP22e0Ies58eK9r2+r//3Kf3YOIhq17eK9v95j9I',
        'Trv2jhBWA/Ra7kVEr375vXDrq/9+s57eUy+4IY0kJx2w6Nk9kFzE0uffgXIRKAboNtxlC1/+/GPl',
        'jjdABc9+q+ZcM0Z3qmb5LWOQXOmml/8DZz7+qJB0hQ3FBerFNyNC5z/9nrXqxX+Pvgf35OMuSSPJ',
        'SXtPfXQPJBc089F3oFwE1jBQTLkiZNtw51jq4qf/XVvuwsPAa9Kjexkrnv8HyclFXxTCGwsyERf4',
        'LctvHvPuvAePBf8pDz/Y1N45BpIbKUmZFAwAR3nW32nUrY0AAAAASUVORK5CYII='
    ].join('\n')),
    children : [{
        name  : LABELS.translate('MENU_REMOVE_THIS'),
        type  : 'context',
        check : function(ctx) {
            if (ctx && ctx.target && ctx.target.parentNode) {
                this.name = [
                    LABELS.translate('MENU_REMOVE_THIS'),
                    '<' + tagName(ctx.target) + '.../>'
                ].join(' ');
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
            var sel;
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
    }, {
        name  : '----',
        type  : 'context',
        check : function(ctx) {
            return true;
        }
    }, {
        name  : LABELS.translate('MENU_REMOVE_ELEMENT'),
        type  : 'context',
        check : function(ctx) {
            return true;
        },
        execute : function(ctx) {
            return selectElement(ctx.document).addCallback(function(elem) {
                var pos, rect, mark, orgDisplay;
                pos = getElementPosition(elem);
                orgDisplay = elem.style.display;
                elem.style.display = 'inline-block';
                rect = {
                    x : pos.x,
                    y : pos.y,
                    w : elem.clientWidth,
                    h : elem.clientHeight
                };
                elem.style.display = orgDisplay;
                mark = highlightElement(elem);
                showButton(ctx.document, rect, function() {
                    removeElement(elem);
                }, function() {
                    try {
                        mark.clear();
                    } catch (e) {}
                }, true);
            });
        }
    }, {
        name  : LABELS.translate('MENU_REMOVE_REGION'),
        type  : 'context',
        check : function(ctx) {
            return true;
        },
        execute : function(ctx) {
            return selectRegion(ctx.document).addCallback(function(region) {
                var elems, styles = [], rect;
                rect = {
                    x : region.position.x,
                    y : region.position.y,
                    w : region.dimensions.w,
                    h : region.dimensions.h
                };
                elems = getElementsInRect(rect, ctx.document);
                if (elems && elems.length) {
                    elems.forEach(function(elem, i) {
                        styles[i] = highlightElement(elem);
                    });
                    showButton(ctx.document, rect, function() {
                        elems.forEach(function(elem, i) {
                            removeElement(elem);
                        });
                    }, function() {
                        elems.forEach(function(elem, i) {
                            try {
                                styles[i].clear();
                            } catch (e) {}
                        });
                    });
                }
            });
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


function getElementsInRect(rect, doc) {
    var results = [];
    Array.prototype.slice.call(doc.body.getElementsByTagName('*')).forEach(function(elem) {
        var pos;
        try {
            pos = getElementPosition(elem);
            if (!pos || pos.x == null) {
                throw pos;
            }
            if (pos.x * 1.12 >= rect.x &&
                pos.y * 1.12 >= rect.y &&
                elem.clientWidth  / 3 <= rect.w &&
                pos.y + elem.clientHeight / 2 <= rect.y + rect.h
            ) {
                results.push(elem);
            }
        } catch (e) {}
    });
    return results;
}


function highlightElement(elem) {
    var cssText, style;
    style = elem.style;
    cssText = style.cssText;
    style.border       = '2px solid #fece33';
    style.borderRadius = '3px';
    style.boxShadow    = '1px 1px 5px #333';
    return {
        clear : function(delay) {
            callLater(delay || 0, function() {
                try {
                    style.cssText = cssText;
                } catch (e) {}
            });
        }
    };
}


function showButton(doc, rect, remove, cancel, center) {
    var buttons, button = doc.createElement('div');
    button.setAttribute('style', [
        'display            : inline-block;',
        'position           : absolute;',
        'left               : ' + Math.floor(rect.x + (rect.w * (center ? 0.492 : 0.875))) + 'px;',
        'top                : ' + Math.floor(rect.y + rect.h + 22) + 'px;',
        'z-index            : 99999998;',
        'border             : 2px solid #555;',
        'border-radius      : 3px;',
        'box-shadow         : 1px 1px 3px #333;',
        'color              : #555;',
        'font-size          : 12px;',
        'font-family        : verdana, sans-serif;',
        'padding            : 2px 4px;',
        'cursor             : pointer;',
        'background         : #f6f6ff;',
        'user-select        : none;'
    ].join('\n'));
    buttons = {
        remove : button,
        cancel : button.cloneNode(false)
    };
    buttons.remove.textContent  = 'Delete';
    buttons.cancel.textContent  = 'Cancel';
    buttons.remove.style.top    = (rect.y + rect.h) + 'px';
    buttons.remove.style.zIndex = 99999999;
    
    buttons.remove.addEventListener('click', function() {
        try {
            remove();
        } finally {
            removeElement(buttons.remove);
            removeElement(buttons.cancel);
        }
    }, false);
    buttons.cancel.addEventListener('click', function() {
        try {
            cancel();
        } finally {
            removeElement(buttons.remove);
            removeElement(buttons.cancel);
        }
    }, false);
    
    buttons.remove.addEventListener('mouseover', function() {
        buttons.remove.style.background = '#c2c2ff';
    }, false);
    buttons.remove.addEventListener('mouseout', function() {
        buttons.remove.style.background   = '#f6f6ff';
        buttons.remove.style.MozBoxShadow = '1px 1px 3px #333';
    }, false);
    buttons.remove.addEventListener('mousedown', function() {
        buttons.remove.style.MozBoxShadow = 'none';
    }, false);
    buttons.remove.addEventListener('mouseup', function() {
        buttons.remove.style.MozBoxShadow = '1px 1px 3px #333';
    }, false);
    
    buttons.cancel.addEventListener('mouseover', function() {
        buttons.cancel.style.background   = '#ffc2c2';
    }, false);
    buttons.cancel.addEventListener('mouseout', function() {
        buttons.cancel.style.background   = '#f6f6ff';
        buttons.cancel.style.MozBoxShadow = '1px 1px 3px #333';
    }, false);
    buttons.cancel.addEventListener('mousedown', function() {
        buttons.cancel.style.MozBoxShadow = 'none';
    }, false);
    buttons.cancel.addEventListener('mouseup', function() {
        buttons.cancel.style.MozBoxShadow = '1px 1px 3px #333';
    }, false);
    doc.body.appendChild(buttons.cancel);
    doc.body.appendChild(buttons.remove);
}


})();

