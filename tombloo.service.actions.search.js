/**
 * Service.Actions.Search - Tombloo patches
 *
 * 対象の画像やテキストを各サーチエンジンで検索するTomblooパッチ
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Service Actions Search patch]
 *
 * - 対象の画像をGoogle画像検索
 * - 対象の画像を二次画像詳細検索
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2013-03-16
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.search.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


var LANG = function(n) {
    return ((n && (n.language || n.userLanguage     ||
            n.browserLanguage || n.systemLanguage)) ||
            'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);


var LABELS = {
    translate : function(name) {
        return LABELS[name][LANG === 'en' && LANG || 'ja'];
    },
    MENU_TOP : {
        ja : '検索',
        en : 'Search'
    },
    MENU_SEARCH_GOOGLE_IMAGE : {
        ja : 'この画像をGoogle画像検索',
        en : 'Search this image on Google Image Search'
    },
    MENU_SEARCH_ASCII2D_IMAGE : {
        ja : 'この画像を二次元画像詳細検索',
        en : 'Search this image on ASCII 2D Image Search'
    }
};


// メニューを登録
Tombloo.Service.actions.register({
    name : LABELS.translate('MENU_TOP'),
    type : 'context',
    // icon: magnifier.png : http://www.famfamfam.com/
    icon : strip([
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH5SURBVDjLpZK/a5NhEMe/748kRqypmqQQ',
        'gz/oUPUPECpCoEVwyNStIA6COFR33boIjg6mg4uL0k0EO1RFISKImkHQxlbQRAsx0dgKJm/e53nu',
        'nnOwViR5leJnuZs+973jHBHB/+D/ah7X2LXWloilyMw5YgtD3CDiBWN4Zno8bQcJHBFBucauZfso',
        'lZDCru0OfFcAAUISrLZDfPzSKxuiibOT+T6JCwDMtrQzYQvZHQ5Cw2h3GK0OI9AWBzJJZFOxgtJU',
        'GpTABQAiLu5OOviuGIEWkBUwC7pasNZj7N2ThNJUjBQY4pznAoEWsBWwxU+JFXSVRTzmQWvKRR5R',
        'G4KVGMgKrAVYflexAAugDCEygdbUCI2F7zobk7FZY76DIDQgrT9HCwwt1FsBhhIu4p4D3kiS8B0M',
        'Jz28ftfGSPfl8MPLxbGBAqVpptbslJc+fEPMA7JDPrIpH3FX8LzaROdrE5O51jalgid3Lh4b6/sD',
        'ALh6971riErGcFET58gwDPGndG9JT6ReHcwfPorGygu8rdxvGxMeP3XtzcofgigWZ0/EtQ7n0/sO',
        'Te0/Mo7V5WeoVu61z1yvZzZX+BsnZx9opYLpevXp7eXKIrL5UWit0n0r/Isb50bjRGreiyWmgs76',
        'lfM31y5tSQAAc6czHjONXLi13thygih+AEq4N6GqMsuhAAAAAElFTkSuQmCC'
    ].join('')),
    check    : function(ctx) {
        return validImageURL(ctx);
    },
    children : [{
        // Google 画像検索
        name  : LABELS.translate('MENU_SEARCH_GOOGLE_IMAGE'),
        icon  : models.Google.ICON,
        type  : 'context',
        check : function(ctx) {
            return validImageURL(ctx);
        },
        execute : function(ctx) {
            var SEARCH_URL = 'http://www.google.co.jp/searchbyimage';
            var url = SEARCH_URL + '?' + queryString({
                image_url : stringify(extractMediaURL(ctx))
            });
            addTab(url);
        }
    }, {
        // 二次画像詳細検索
        name  : LABELS.translate('MENU_SEARCH_ASCII2D_IMAGE'),
        icon  : 'http://www.ascii2d.net/favicon.ico',
        type  : 'context',
        check : function(ctx) {
            return validImageURL(ctx);
        },
        execute : function(ctx) {
            var SEARCH_URL = 'http://www.ascii2d.net/imagesearch/search/';
            var data = queryString({
                uri : stringify(extractMediaURL(ctx))
            });
            addTabPost(SEARCH_URL, data);
        }
    }]
}, '----');


// -- Helper functions --

function validImageURL(ctx) {
    return !!(ctx && ctx.onImage &&
        ctx.target && ctx.target.tagName &&
        /^(?:http|ftp)s?:/.test(extractMediaURL(ctx)));
}


function extractMediaURL(ctx) {
    return ctx.mediaURL || ctx.imageURL ||
           (ctx.target && (ctx.target.src || ctx.target.href));
}


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


function addTabPost(url, data, background) {
    var d, win, tabbrowser, tab, browser, referrer, postData, contents;
    d = new Deferred();
    win = getMostRecentWindow();
    tabbrowser = win.getBrowser();
    referrer = createURI(
        (win.location && win.location.href) ||
        (win.content && win.content.location && win.content.location.href)
    );
    contents = [
        'Content-Type: application/x-www-form-urlencoded',
        'Content-Length: ' + data.length,
        '',
        data
    ].join('\n');
    postData = new StringInputStream(contents);
    tab = tabbrowser.addTab(url, referrer, null, postData);
    browser = tab.linkedBrowser;
    if (!background) {
        tabbrowser.selectedTab = tab;
    }
    browser.addEventListener('DOMContentLoaded', function(event) {
        browser.removeEventListener('DOMContentLoaded', arguments.callee, true);
        d.callback(wrappedObject(event.originalTarget.defaultView));
    }, true);
    return d;
}


})();

