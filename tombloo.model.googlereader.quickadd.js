/**
 * Model.GoogleReader.QuickAdd - Tombloo patches
 *
 * Googleリーダーにポストしたサイトのフィードを登録するTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Model GoogleReader QuickAdd patch]
 *
 * - ポスト時にサイトのFeedがあればGoogleリーダーに登録する
 *
 * --------------------------------------------------------------------------
 *
 * @version  1.00
 * @date     2011-07-12
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {
//-----------------------------------------------------------------------------
// Definition - Google Reader (Feed)
//-----------------------------------------------------------------------------
// Google リーダーを登録
models.register({
    name: 'GoogleReader',
    ICON: 'http://www.google.com/reader/ui/favicon.ico',
    check: function(ps) {
        let re = /(?:photo|quote|link|conversation|video|audio|bookmark)/;
        return re.test(ps.type) && !ps.file && !!this.getFeeds();
    },
    getAuthCookie: function() {
        return getCookieString('www.google.com', 'SID');
    },
    getToken: function() {
        const TOKEN_URL = 'http://www.google.com/reader/api/0/token';
        if (!this.getAuthCookie()) {
            throw new Error(getMessage('error.notLoggedin'));
        }
        return request(TOKEN_URL).addCallback(function(res) {
            return String(res.responseText).trim();
        });
    },
    getFeeds: function(once) {
        let result = [], cwin, browser, feeds, feed;
        try {
            cwin = this.getChromeWindow();
            browser = cwin.gBrowser || ((cwin.getBrowser) && cwin.getBrowser());
            feeds = browser.mCurrentBrowser && browser.mCurrentBrowser.feeds;
            if (!feeds) {
                feeds = browser.feeds;
                if (!feeds) {
                    throw feeds;
                }
            }
        } catch (e) {
            feeds = [];
        }
        if (feeds && feeds.length) {
            if (once) {
                if (feeds[0]) {
                    feed = feeds[0];
                } else if (feeds.shift) {
                    feed = feeds.shift();
                }
                result = feed && feed.href;
            } else {
                result = feeds || [];
            }
        } else {
            result = once ? '' : [];
        }
        return result;
    },
    getChromeWindow: function(uri) {
        const BROWSER_URI = 'chrome://browser/content/browser.xul';
        let result, win, wins, pref;
        pref = uri || BROWSER_URI;
        wins = WindowMediator.getXULWindowEnumerator(null);
        while (wins.hasMoreElements()) {
            try {
                win = wins.getNext()
                   .QueryInterface(Ci.nsIXULWindow).docShell
                   .QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIDOMWindow);
                if (win && win.location &&
                    (win.location.href == pref || win.location == pref)) {
                    result = win;
                    break;
                }
            } catch (e) {}
        }
        return result;
    },
    post: function(ps) {
        const SUBSCRIPTION_URL = 'http://www.google.com/reader/api/0/subscription/quickadd';
        let url, feed;
        if (!this.getAuthCookie()) {
            throw new Error(getMessage('error.notLoggedin'));
        }
        url = SUBSCRIPTION_URL + '?ck=' + (new Date()).getTime() + '&client=tombloo';
        feed = this.getFeeds(true);
        return this.getToken().addCallback(function(token) {
            return request(url, {
                redirectionLimit : 0,
                sendContent : {
                    quickadd : (ps && (ps.pageUrl || ps.itemUrl)) || feed,
                    ac       : 'subscribe', // or 'unsubscribe'
                    T        : token
                }
            });
        });
    }
});


})();

