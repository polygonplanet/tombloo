/**
 * Tombloo.Model.Tumblr.PostLimit.Message - Tombloo patches
 *
 * Tumblrのリブログ/ポスト残量を表示するTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Tombloo Model Tumblr PostLimit Message patch]
 *
 * - ポスト上限に達した時のエラーメッセージを確実に表示する
 * - ポスト/リブログ残りの可能数をメニューに表示
 * - (残り残量は Tombloo 以外でポストすると狂う)
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.05
 * @date       2012-02-18
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.postlimit.message.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

// リセットされる時間 (日本時間 GMT+900)
//TODO: 正確な時間がいつまでたっても不明 => 14:00 or 14:15 ぽい
const RESET_TIME = {
    HOURS   : 14, // 時
    MINUTES :  0  // 分
};

// ポストの最大数
const POST_LIMIT   = 75;

// リブログの最大数
const REBLOG_LIMIT = 250;


update(Tumblr, {
    // リミットメッセージを確実に表示するようにする
    /**
     * フォームをポストする
     * 新規エントリーとreblogのエラー処理をまとめる
     *
     * @param  {Function}  fn
     * @return {Deferred}
     */
    postForm : function(fn) {
        return succeed().addCallback(fn).addCallback(function(res) {
            let url = res.channel.URI.asciiSpec.replace(/\?.*/, '');

            switch (true) {
                case /dashboard/.test(url):
                    return;
                case /login/.test(url):
                    throw new Error(getMessage('error.notLoggedin'));
                default: {
                    let msg, text, doc, err;

                    // このチェックをするためリダイレクトを追う必要がある
                    // You've used 100% of your daily photo uploads. You can upload more tomorrow.
                    text = res.responseText;
                    msg = "You've exceeded your daily post limit.";
                    if (text.indexOf('more tomorrow') !== -1 ||
                        /exceeded.*?upload.*?limit/i.test(text)
                    ) {
                        Tumblr.ReblogPostLimit.post.setMax().addCallback(function() {
                            Tumblr.ReblogPostLimit.reblog.setMax();
                        });
                        throw new Error(msg);
                    }

                    // 確実にエラーメッセージが表示されるよう修正
                    doc = convertToHTMLDocument(text);
                    err = doc.getElementById('errors') ||
                        $x('//*[starts-with(@class,"error")]', doc);
                    if (err) {
                        throw new Error(convertToPlainText(err.textContent) || msg);
                    }
                }
            }
        });
    },
    // Tumblr model 拡張
    /**
     * リミットを取得/設定
     *
     *  - post   : {Object}
     *  - reblog : {Object}
     *
     */
    ReblogPostLimit : (function() {

        const KEY_COUNT = {
            POST   : 'postCount',
            REBLOG : 'reblogCount',
            LAST   : 'lastTime'
        };

        let env = defineTumblrLimitEnv(),
            getNextResetTime = function() {
                let d = new Date, hours = d.getHours(), min = d.getMinutes(), add = 1;

                if (hours >= 0 &&
                    (hours < RESET_TIME.HOURS ||
                        (hours === RESET_TIME.HOURS && min < RESET_TIME.MINUTES)
                    )
                ) {
                    add = 0;
                }
                return new Date(
                    d.getFullYear(), d.getMonth(), d.getDate() + add,
                    RESET_TIME.HOURS, RESET_TIME.MINUTES, 0
                ).getTime();
            },
            getNow = function() {
                return '' + (+new Date);
            },
            getRemainder = function(d) {
                let diff = getNextResetTime() - (d || (getNow() - 0));
                return parseInt(diff / (60 * 60 * 1000));
            },
            isResetable = function() {
                return getRemainder(getLastTime()) <= 0;
            },
            getLastTime = function() {
                let last = env.getPref(KEY_COUNT.LAST);
                if (!last) {
                    last = getNow();
                    env.setPref(KEY_COUNT.LAST, last);
                }
                return +last;
            },
            setLastTime = function() {
                env.setPref(KEY_COUNT.LAST, getNow());
            },
            getCounter = function(key) {
                let counter = env.getPref(key);
                return (counter ? JSON.parse(counter) : {}) || {};
            },
            resetAll = function(type) {
                'POST REBLOG'.split(' ').forEach(function(key) {
                    if (!type || type === key) {
                        let (counter = env.getPref(KEY_COUNT[key])) {
                            counter = (counter ? JSON.parse(counter) : {}) || {};
                            keys(counter).forEach(function(k) {
                                counter[k] = 0;
                            });
                            env.setPref(KEY_COUNT[key], JSON.stringify(counter));
                        }
                    }
                });
                setLastTime();
            };

        return {
            post : {
                LIMIT : POST_LIMIT,
                getCount : function() {
                    let counter = getCounter(KEY_COUNT.POST);

                    return (Tumblr.user ? succeed(Tumblr.user) : Tumblr.getCurrentUser()).addCallback(function(user) {
                        if (isResetable()) {
                            counter[user] = 0;
                            resetAll();
                        } else {
                            if (counter[user] == null) {
                                counter[user] = 0;
                                setLastTime();
                            }
                        }
                        return counter[user];
                    });
                },
                setCount : function(n) {
                    let counter = getCounter(KEY_COUNT.POST),
                        value = Math.max(0, Math.min(POST_LIMIT, n || 0));

                    return (Tumblr.user ? succeed(Tumblr.user) : Tumblr.getCurrentUser()).addCallback(function(user) {
                        counter[user] = value;
                        setLastTime();
                        env.setPref(KEY_COUNT.POST, JSON.stringify(counter));
                        if (value >= POST_LIMIT) {
                            let (reblogCounter = getCounter(KEY_COUNT.REBLOG)) {
                                reblogCounter[user] = REBLOG_LIMIT;
                                env.setPref(KEY_COUNT.REBLOG, JSON.stringify(reblogCounter));
                            }
                        }
                        return value;
                    });
                },
                reset : function() {
                    resetAll();
                },
                isResetable : function() {
                    return isResetable();
                },
                setMax : function() {
                    return this.setCount(POST_LIMIT);
                },
                isMax : function() {
                    return this.getCount().addCallback(function(c) {
                        return c >= POST_LIMIT;
                    });
                },
                add : function() {
                    let that = this;
                    return this.getCount().addCallback(function(c) {
                        that.setCount((c || 0) + 1);
                    });
                },
                checkInForm : function() {
                    let that = this, expr = {
                        b      : '//*[@id="left_column"]//div/div/b/text()',
                        strong : '//*[@id="left_column"]//div/div/strong/text()'
                    };

                    return request('http://www.tumblr.com/new/photo').addCallback(function(res) {
                        let d, result = false,
                            doc = convertToHTMLDocument(res.responseText),
                            per = $x(expr.b, doc) || $x(expr.strong, doc),
                            re = /^\s*(\d+)(?:[.]\d*|)\s*%\s*/;

                        if (per && re.test(per)) {
                            per = per.extract(re) - 0;
                            if (per > 0 && per <= 100) {
                                d = that.setCount(
                                    Math.max(0, Math.min(POST_LIMIT,
                                        Math.round(per / 100 * POST_LIMIT)
                                    ))
                                );
                                result = true;
                            }
                        }
                        return maybeDeferred(d).addCallback(function() {
                            return result;
                        });
                    });
                }
            },
            reblog : {
                LIMIT : REBLOG_LIMIT,
                getCount : function() {
                    let counter = getCounter(KEY_COUNT.REBLOG);

                    return (Tumblr.user ? succeed(Tumblr.user) : Tumblr.getCurrentUser()).addCallback(function(user) {
                        if (isResetable()) {
                            counter[user] = 0;
                            resetAll();
                        } else {
                            if (counter[user] == null) {
                                counter[user] = 0;
                                setLastTime();
                            }
                        }
                        return counter[user];
                    });
                },
                setCount : function(n) {
                    let counter = getCounter(KEY_COUNT.REBLOG),
                        value = Math.max(0, Math.min(REBLOG_LIMIT, n || 0));

                    return (Tumblr.user ? succeed(Tumblr.user) : Tumblr.getCurrentUser()).addCallback(function(user) {
                        counter[user] = value;
                        setLastTime();
                        env.setPref(KEY_COUNT.REBLOG, JSON.stringify(counter));
                        if (value >= REBLOG_LIMIT) {
                            let (postCounter = getCounter(KEY_COUNT.POST)) {
                                postCounter[user] = POST_LIMIT;
                                env.setPref(KEY_COUNT.POST, JSON.stringify(postCounter));
                            }
                        }
                        return value;
                    });
                },
                reset : function() {
                    resetAll();
                },
                isResetable : function() {
                    return isResetable();
                },
                setMax : function() {
                    return this.setCount(REBLOG_LIMIT);
                },
                isMax : function() {
                    return this.getCount().addCallback(function(c) {
                        return c >= REBLOG_LIMIT;
                    });
                },
                add : function() {
                    let that = this;
                    return this.getCount().addCallback(function(c) {
                        that.setCount((c || 0) + 1);
                    });
                }
            }
        };
    }())
});


addAround(Tumblr, 'post', function(proceed, args) {
    return proceed(args).addCallback(function() {
        // http://www.tumblr.com/new/photo
        //  から
        // 「You've used <b>76%</b> of your daily photo uploads. You can upload more tomorrow.」
        //  があればそこから設定
        Tumblr.ReblogPostLimit.post.checkInForm().addCallback(function(res) {
            if (!res) {
                if (Tumblr.ReblogPostLimit.post.isResetable()) {
                    Tumblr.ReblogPostLimit.post.reset();
                }
                Tumblr.ReblogPostLimit.post.add();
            }
        }).addErrback(function() {}); // ここでのエラーは無視
    });
});


addAround(Tumblr, 'favor', function(proceed, args) {
    return proceed(args).addCallback(function() {
        Tumblr.ReblogPostLimit.post.checkInForm().addCallback(function(res) {
            if (!res) {
                if (Tumblr.ReblogPostLimit.reblog.isResetable()) {
                    Tumblr.ReblogPostLimit.reblog.reset();
                }
                Tumblr.ReblogPostLimit.reblog.add();
            }
        }).addErrback(function() {});
    });
});


// メニューを登録
let (LABEL = 'Tumblr Post/Reblog Limit') {
    Tombloo.Service.actions.register({
        name  : LABEL,
        type  : 'context,menu',
        icon  : Tumblr.ICON,
        check : function(ctx) {
            let that = this;
            // 遅延するため 1 つ前の状態が表示される
            return Tumblr.ReblogPostLimit.post.getCount().addCallback(function(postCount) {
                return Tumblr.ReblogPostLimit.reblog.getCount().addCallback(function(reblogCount) {
                    that.name = 'Post: ' + postCount + '/' + POST_LIMIT +
                                ', Reblog: ' + reblogCount + '/' + REBLOG_LIMIT;
                    return true;
                });
            });
        },
        execute : function(ctx) {
            let that = this;
            this.check().addCallback(function() {
                // alert以外に何かないかな…
                alert(that.name);
            });
        }
    }, '----');

    Tombloo.Service.actions.register({
        name : '----',
        type : 'context'
    }, LABEL);
}


function defineTumblrLimitEnv() {
    /**
     * setPref/getPref で使うキー名 (キャッシュに使用)
     *
     * 接頭語を patches にしておく (その先頭に 'extensions.tombloo.' が付く)
     * 他のパッチと同じにならないようidをつけておく
     *
     * @const  {String}  PREF_PREFIX
     */
    const PREF_PREFIX = 'patches.polygonplanet.model.tumblr.postlimit.message.';
    return {
        getPref : function(key, def) {
            let value = getPref(PREF_PREFIX + key);
            if (value === void 0) {
                value = def;
            }
            return value;
        },
        setPref : function(key, val) {
            return setPref(PREF_PREFIX + key, val);
        }
    };
}

}());

