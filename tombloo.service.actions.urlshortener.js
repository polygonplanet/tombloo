/**
 * Service.Actions.URLShortener - Tombloo patches
 *
 * リンクやページの短縮URLをクリップボードにコピーできるパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Service Actions URL Shortener patch]
 *
 * - リンクやページの短縮URLをクリップボードにコピーする
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2011-08-04
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.urlshortener.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 *
 * Based: http://efcl.info/2009/0831/res1276/
 */
(function(undefined) {


// Define language
const LANG = (function(n) {
    return ((n && (n.language  || n.userLanguage || n.browserLanguage ||
            n.systemLanguage)) || 'en').split('-').shift().toLowerCase();
})(navigator);

// UI labels
const LABELS = {
    translate : function(name) {
        return LABELS[name][LANG === 'en' && LANG || 'ja'];
    },
    topMenu : {
        ja : 'URL短縮サービス',
        en : 'URL Shortener'
    },
    linkMenu : {
        ja : 'リンクの短縮URLをコピー',
        en : 'Copy the shortened link'
    },
    pageMenu : {
        ja : 'このページの短縮URLをコピー',
        en : 'Copy the shortened URL'
    },
    expandMenu : {
        ja : '短縮URLを展開',
        en : 'Expand Short URL'
    },
    '{TITLE}' : {
        ja : '短縮URLを展開',
        en : 'Expand Short URL'
    },
    '{SHORT_URL_DESC}' : {
        ja : '短縮URL：',
        en : 'Short URL:'
    },
    '{LONG_URL_DESC}' : {
        ja : '展開したURL：',
        en : 'Long URL:'
    },
    '{EXPAND_BUTTON}' : {
        ja : '展開',
        en : 'Expand'
    },
    '{EXPAND_BUTTON_TIP}' : {
        ja : '短縮URLを展開します',
        en : 'Expand the shortened URL'
    },
    '{CLOSE_TIP}' : {
        ja : '閉じる',
        en : 'Close'
    }
};


models.register({
    name : 'goo.gl',
    ICON : 'http://goo.gl/favicon.ico',
    API_URL : 'https://www.googleapis.com/urlshortener/v1/url',
    API_KEY : 'AIzaSyBZP91BYnkZKQ0uHFH-i0N10AmTVRmCs40',
    shorten : function(url) {
        let that = this;
        if (String(url).indexOf('//goo.gl/') !== -1) {
            return succeed(url);
        }
        return sendRequest(this.API_URL + '?' + queryString({
            key : that.API_KEY
        }), {
            method : 'POST',
            redirectionLimit : 0,
            sendContent : JSON.stringify({
                longUrl : url
            }),
            headers : {
                'Content-Type' : 'application/json'
            }
        }).addCallback(function(res) {
            return JSON.parse(res.responseText).id;
        });
    },
    expand : function(url) {
        return request(url, {
            redirectionLimit : 0
        }).addCallback(function(res) {
            return res.channel.URI.spec;
        });
    }
});





// メニューを登録
Tombloo.Service.actions.register({
    name : LABELS.translate('topMenu'),
    type : 'context',
    // icon: world_link.png : http://www.famfamfam.com/
    icon : strip(<>
        data:image/png;base64,
        iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
        U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAANPSURBVBgZBcHdT1tlAMDh3zltORT6Ob4m
        tWDGMpgiU8LcEooJyiaEGbNkCkaNCVfeGP4Dr7zBG42J3hiVZInTeTMvFAPBYRhmGDBjEYaAMhht
        VzraUjin5+M95/V5FCklAAAA4wtjfcCHwHmgAfADh8Ci9OSXn/d9+ysAAIAipQRgfGHMD0wC115P
        DmjxYANloxbDBuGaCHLMZqeEK9wZIdy3vh76/hhAkVIyvjAWAG731D/XeznZT9nUsLDZKitUSY0D
        w0MKmyAGWWuepczSfeGIl79789ahCgBMdted6U0191BwbRxVQQiViqjCoIqCpbFvBtk7DNASeome
        k+1dtuXcAPAVL+2mgE/eOXPF97erk6VCxRMcmyEKVoCyCZvpIw51HS1+gBLd5GJ9B7Nrf566vji5
        4rsw9uKnrzVf6FR8QbKqANnIU26I5ZyPiqmylj7Gqy6itf6DFdkk7xXxF10665Lq8sP1E37gfDKS
        4J6RIV+t8qyvDQ/Bzr6NaVaInpSUT0yz5ZXAksSExmbeYuCZbhxLPO8H6mr8tewYGfYtg3DNKUp2
        mGLRI9pg0hg3yLsvULZW0OQRR08OKJRqCAXDOLaI+aWUiiLBtspIkvgDLlN3HZRgiOyWQJURmhsq
        hI/6KKcdTJZw7G2QEiGE4neFVyjb5USdL0a4+hw7aQ9lZ502nvB0Yx3rd7LcpwNHFZzzVuloaSOT
        q2Zx/gGeJct+4Yi/HhZ2E6drksyk59H/OKY7mGBk5D10Xadtbw///CK6A++PXqO6KkA2m2V5eZlo
        Nm75ukbOHqzub789fDql3p6ZJb4f4sobV/nos6+4deM629v/0daSwDrM89vsLDd/vEnRyNLfd4ni
        bimgfjP8w7RtOb9Mr/1O+CBINBwFIHZxCMO0GB0dJZVKMTQ0xODgIKZVwdduAhCLxlQ/gGM5785t
        3rtTT6SLfA4A4+5PKNJjYmKC2tpaAHRdR3qwMvXIGP6AmnQ6bSpSSgAGv3glbKTNnyP/xlOv9g4o
        iUSSgOojl8uxsbGBpmm0trbS1NSEI5zS3qM95ubmHitSSgAA2tvbfY399eOhx5GPmxubq7UqTVFQ
        eKCsllyfu90pus4qKFiW5WYymbyu61f/B/q4pKqmYKY6AAAAAElFTkSuQmCC
    </>),
    children : [
        createMenuItem({
            label   : 'link',
            type    : 'context',
            service : 'bit.ly'
        }),
        createMenuItem({
            label   : 'link',
            type    : 'context',
            service : 'j.mp'
        }),
        createMenuItem({
            label   : 'link',
            type    : 'context',
            service : 'is.gd'
        }),
        createMenuItem({
            label   : 'link',
            type    : 'context',
            service : 'goo.gl'
        }),
        createMenuItem({
            label   : '----',
            type    : 'context',
            link    : true
        }),
        createMenuItem({
            label   : 'page',
            type    : 'context',
            service : 'bit.ly'
        }),
        createMenuItem({
            label   : 'page',
            type    : 'context',
            service : 'j.mp'
        }),
        createMenuItem({
            label   : 'page',
            type    : 'context',
            service : 'is.gd'
        }),
        createMenuItem({
            label   : 'page',
            type    : 'context',
            service : 'goo.gl'
        }),
        createMenuItem({
            label   : '----',
            type    : 'context',
            page    : true
        }),
        {
            name  : LABELS.translate('expandMenu'),
            type  : 'context',
            // icon: world_go.png : http://www.famfamfam.com/
            icon  : strip(<>
                data:image/png;base64,
                iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
                U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAANCSURBVBgZBcHbT1t1AMDx72lPKS29UCiz
                0BUMQxwwJptMSIAZzRgu6oOJ+jKjkQdjTAx/gI9mezAmJkb3ppKYqHsxe9oMOh0ZODd3xYVtFOLK
                1dG0pYWensvv4udjaK0BAACYmp8cAz4GjgEtgAmUgeta6XNfjn33CwAAgKG1BmBqftIEpoE3X8+c
                CCZCLVSsBiwXhLQRPOHy1iUhhfxVCPn2N6d+2gMwtNZMzU8GgD8Gk30jJzMvUbGDOLgsVwzqdJCC
                pdDCJYTFlnOVm5s3F4Qnjv/w1oWyDwCYPtrcPTLaNkhRung+AyF81EQdFnUUnSDbdoj1coD2yAsM
                pp497DrejwD+0vjqKPDZ6e7X/PdllS1q1JRgz45QdAJUbMhu7FKuVgkmChjxLMPJg1xevNH5/fXp
                e/6hySNfTLQNHTL8IbZ8AvQ+WmWEW0/81Gwfixt7qPoSwY5HOLEseVXCLEkONWd8tx4/bDKBY5lY
                mrvWJvl6H73+AygEuW0X264RT2kqTTMsqx1wNI0iSDbvcOLpo3iO6DeB5rDZQM7aZNuxiIY72XGj
                lEqKeIvNvoRFXg6QvnMOaVfJZw5S3AkTCUXxXNHo01obhgbXqaCtVkxPcukvD6M+xNayydpqjDYn
                hPA0+5M9BJfv4Nk10BohhGFKoYoVt5Ju9jcSrX+O9byJ7QVoVR8RD0ucDY/dnCDd1EVPaohdu8rC
                +u8UqxNIocqm8MTtx8XVdFc4w2//zdMY7qLOn0Eol/G+95BaIZVEodksr9G/f4Q9t8YnFz4Euh/4
                PFd89fPDWdERacG0NigX/iSRcLCFi9SKXCHLv4UlVvKL7NQK5IorDGTGeCb1PLuBe6O+b189P+M6
                3sWZxVleTA8Q9zeQiChsYSOk4KlYO6lYB63xTgL+EC3RNLfX5rm2csOyXGImgOd471zJ3p1zau7h
                iSPHebRt8o9wmL72Oa5ysYXLgWQvw50n+Ts3x5WlWScs23uWz2ZrhtYagFe+fjkqPHFeeHL83ZH3
                TWQKrcMYPoNkvMKnF0/T1zrM1aW53Qbd3rtwZmkdwNBaAwAAMHJm6A0p5AdSqn4lVQIAKO/47yeF
                IlBTMrB9VgsAgP8BON24AjtZfcoAAAAASUVORK5CYII=
            </>),
            check : function(ctx) {
                return true;
            },
            execute : function(ctx) {
                openDialog(
                    generateExpandXUL(),
                    'chrome,resizable,centerscreen,minimizable',
                    {}
                );
            }
        }
    ]
}, '----');


// メニューアイテムを生成
function createMenuItem(params) {
    const RE = /^https?:\/\/[-_.!~*'()a-z0-9;\/?:@&=+$,%#]+/i;
    let item, link;
    if (/^-{4,}/.test(params.label)) {
        item = {
            name  : '----',
            type  : params.type,
            check : (function(re) {
                if (params.link) {
                    return function(ctx) {
                        return ctx && ctx.onLink && re.test(ctx.linkURL);
                    };
                } else {
                    return function(ctx) {
                        return ctx && re.test(ctx.href);
                    };
                }
            })(RE)
        };
    } else {
        link = params.label === 'link';
        item = {
            name  : joinText([
                LABELS.translate(link ? 'linkMenu' : 'pageMenu'),
                '()'.split('').join(params.service)
            ], ' '),
            icon  : models[params.service].ICON,
            type  : params.type,
            check : (function(re) {
                if (link) {
                    return function(ctx) {
                        return ctx && ctx.onLink && re.test(ctx.linkURL);
                    };
                } else {
                    return function(ctx) {
                        return ctx && re.test(ctx.href);
                    };
                }
            })(RE),
            execute : (function(model) {
                if (link) {
                    return function(ctx) {
                        shortenUrls(ctx.linkURL, model).addCallback(function(res) {
                            copyString(res);
                        });
                    };
                } else {
                    return function(ctx) {
                        shortenUrls(ctx.href, model).addCallback(function(res) {
                            copyString(res);
                        });
                    };
                }
            })(models[params.service])
        };
    }
    return item;
}


// XULを動的生成 (キャッシュはしない)
function generateExpandXUL() {
    let head, template, script, code, labels;
    labels = [
        '{TITLE}', '{SHORT_URL_DESC}', '{LONG_URL_DESC}',
        '{EXPAND_BUTTON}', '{EXPAND_BUTTON_TIP}', '{CLOSE_TIP}'
    ];
    head = 'data:application/vnd.mozilla.xul+xml;charset=utf-8,';
    template = trim(<><![CDATA[
        <?xml version="1.0" encoding="utf-8"?>
        <?xml-stylesheet type="text/css" href="chrome://global/skin/"?>
        <?xml-stylesheet type="text/css" href="data:text/css,
        window, dialog {
            margin: 0.7em 0.5em;
            min-width: 360px;
        }
        button {
            cursor: pointer;
            padding: 0.5em 0;
        }
        textbox {
            margin: 0 0.5em 0.5em 0.7em;
        }
        label {
            padding: 0.5em 1em;
        }
        .button-icon {
            margin-right: 0.5em;
        }
        #length {
            opacity: 0.75;
        }
        #close-button {
            font-weight: bold;
            padding: 0.5em 0.7em 0.5em 0.4em;
        }
        "?>
        <dialog id="expand-dialog" title="{TITLE}" buttons="cancel"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:html="http://www.w3.org/1999/xhtml">
            <hbox flex="1">
                <vbox flex="1">
                    <label value="{SHORT_URL_DESC}"/>
                    <spacer height="2"/>
                    <textbox id="short-url" rows="5" multiline="true" flex="1" value=""/>
                    <spacer height="5"/>
                    <button id="expand" label="{EXPAND_BUTTON}" flex="1"
                            tooltiptext="{EXPAND_BUTTON_TIP}"/>
                    <spacer height="10"/>
                    <label value="{LONG_URL_DESC}"/>
                    <spacer height="2"/>
                    <textbox id="long-url" rows="5" multiline="true" flex="1" value=""/>
                    <spacer height="10"/>
                    <button id="close-button" dlgtype="cancel" label="Close" flex="1"
                            tooltiptext="{CLOSE_TIP}"/>
                </vbox>
            </hbox>
            <script type="application/javascript;version=1.7">{SCRIPT}</script>
        </dialog>
    ]]></>);
    
    script = stringify(<><![CDATA[
        var args = arguments[0], env, expandDialog, shortUrl, longUrl, expandButton;
        env = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
        env.extend(this, env, false);
        
        window.addEventListener('load', init, true);
        
        function init() {
            expandDialog = byId('expand-dialog');
            shortUrl     = byId('short-url');
            longUrl      = byId('long-url');
            expandButton = byId('expand');
            expandButton.addEventListener('click', function() {
                callLater(0, function() {
                    let d = new Deferred();
                    d.addCallback(function() {
                        expandDialog.style.cursor = 'wait';
                    }).addCallback(function() {
                        longUrl.value = expandUrls(shortUrl.value);
                    }).addBoth(function() {
                        expandDialog.style.cursor = '';
                    });
                    callLater(0, function() { d.callback(); });
                });
            }, true);
        }
        
        function expandUrls(text) {
            let re = /\bhttps?:\/+[-_.!~*'()a-zA-Z0-9;\/?:@&=+$,%#^]+/g;
            return String(text).replace(re, function(m) {
                let result, waiting = true;
                models['goo.gl'].expand(m).addCallback(function(url) {
                    result = url;
                }).addBoth(function() {
                    waiting = false;
                });
                if (waiting) {
                    till(function() {
                        return waiting !== true;
                    });
                }
                return result || '{{Error!}}';
            });
        }
        
        function byId(id) {
            return document.getElementById(id);
        }
    ]]></>);
    
    labels.forEach(function(label) {
        template = template.split(label).join(LABELS.translate(label));
    });
    code = template.split('{SCRIPT}').join(['<![CDATA[', script, ']]>'].join(' '));
    return [head, encodeURIComponent(trim(code))].join('').trim();
}


/**
 * スカラー型となりうる値のみ文字列として評価する
 *
 * @param  {Mixed}   x   任意の値
 * @return {String}      文字列としての値
 */
function stringify(x) {
    var result = '', c;
    if (x !== null) {
        switch (typeof x) {
            case 'string':
            case 'number':
            case 'xml':
                result = x;
                break;
            case 'boolean':
                result = x ? 1 : '';
                break;
            case 'object':
                if (x) {
                    c = x.constructor;
                    if (c === String || c === Number) {
                        result = x;
                    } else if (c === Boolean) {
                        result = x ? 1 : '';
                    }
                }
                break;
            default:
                break;
        }
    }
    return result.toString();
}

// 全角ホワイトスペースも含めたtrim
function trim(s) {
    return stringify(s).replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '');
}


function strip(s) {
    return stringify(s).replace(/[\s\u00A0\u3000]+/g, '');
}


/**
 * リクエストを発行 (request関数をgoo.gl用に少し変更)
 *
 * @param  {String}    url      リクエストURL
 * @param  {Object}    options  オプション
 * @return {Deferred}
 */
function sendRequest(url, options) {
    let d, opts, uri, contents, channel, contentType, file;
    d = new Deferred()
    opts = options || {};
    uri = createURI(joinText([url, queryString(opts.queryString)], '?'));
    channel = broad(IOService.newChannelFromURI(uri), [Ci.nsIUploadChannel, IHttpChannel]);
    if (opts.referrer) {
        channel.referrer = createURI(opts.referrer);
    }
    if (opts.headers) {
        items(opts.headers).forEach(function([key, value]) {
            if (/^Content-?Type$/i.test(key)) {
                channel.contentType = contentType = value;
            }
            channel.setRequestHeader(key, value, true);
        });
    }
    setCookie(channel);
    if (opts.sendContent) {
        contents = opts.sendContent;
        if (typeof contents === 'object') {
            let (name, value) {
                for (name in contents) {
                    value = contents[name];
                    if (value instanceof IInputStream || value instanceof IFile) {
                        file = value;
                        value = contents[name] = {file : value};
                    }
                }
            }
        }
        if (!file && typeof contents !== 'string') {
            contents = queryString(contents);
        }
        channel.setUploadStream(new StringInputStream(contents),
            contentType || 'application/x-www-form-urlencoded', -1);
    }
    {
        let redirectionCount = 0, listener = {
            QueryInterface : createQueryInterface([
                'nsIStreamListener',
                'nsIProgressEventSink',
                'nsIHttpEventSink',
                'nsIInterfaceRequestor',
                'nsIChannelEventSink'
            ]),
            isAppOfType : function(val) {
                return val == 0;
            },
            onProgress   : function(req, ctx, progress, progressMax) {},
            onStatus     : function(req, ctx, status, statusArg) {},
            getInterface : function(iid) {
                try {
                    return this.QueryInterface(iid);
                } catch (e) {
                    throw Cr.NS_NOINTERFACE;
                }
            },
            onRedirect             : function(oldChannel, newChannel) {},
            onRedirectResult       : function() {},
            asyncOnChannelRedirect : function(oldChannel, newChannel, flags, redirectCallback) {
                this.onChannelRedirect(oldChannel, newChannel, flags);
                redirectCallback.onRedirectVerifyCallback(0);
            },
            onChannelRedirect : function(oldChannel, newChannel, flags) {
                let res;
                redirectionCount++;
                if (opts.redirectionLimit != null && redirectionCount > opts.redirectionLimit) {
                    newChannel.cancel(2152398879);
                    res = {
                        channel      : newChannel,
                        responseText : '',
                        status       : oldChannel.responseStatus,
                        statusText   : oldChannel.responseStatusText
                    };
                    d.callback(res);
                    return;
                }
                broad(oldChannel);
                setCookie(newChannel);
            },
            onStartRequest : function(req, ctx) {
                this.data = [];
            },
            onDataAvailable : function(req, ctx, stream, sourceOffset, length) {
                this.data.push(new InputStream(stream).read(length));
            },
            onStopRequest : function(req, ctx, status) {
                let text, charset, res;
                if (opts.redirectionLimit != null && redirectionCount > opts.redirectionLimit) {
                    return;
                }
                broad(req);
                text = this.data.join('');
                try {
                    charset = opts.charset || req.contentCharset ||
                        text.extract(/content=["'].*charset=(.+?)[;"']/i);
                    text = charset ? text.convertToUnicode(charset) : text;
                    res = {
                        channel      : req,
                        responseText : text,
                        status       : req.responseStatus,
                        statusText   : req.responseStatusText
                    };
                } catch (e) {
                    res = {
                        channel      : req,
                        responseText : text,
                        status       : null,
                        statusText   : null
                    };
                }
                if (Components.isSuccessCode(status) && res.status < 400) {
                    d.callback(res);
                } else {
                    error(res);
                    res.message = getMessage('error.http.' + res.status);
                    d.errback(res);
                }
            }
        };
        channel.requestMethod = opts.method ? opts.method :
                                opts.sendContent ? 'POST' : 'GET';
        channel.notificationCallbacks = listener;
        channel.asyncOpen(listener, null);
        broad(channel);
        listener = channel = null;
    }
    return d;
}


})();

