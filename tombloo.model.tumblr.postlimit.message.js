/**
 * Tombloo.Model.Tumblr.PostLimit.Message - Tombloo patches
 *
 * Tumblrのリブログ/ポストのリミット残数が確認できるTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Tombloo Model Tumblr PostLimit Message patch]
 *
 * - ポスト上限に達した時のエラーメッセージを確実に表示する
 * - ポスト/リブログ残りの可能数をメニューに表示
 * - (残り残量は Tombloo 以外でポストすると狂う)
 * - クリックするとログイン中のアカウントも表示
 * - サマータイム対応(?)
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.11
 * @date       2012-04-01
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.postlimit.message.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

// リセットされる時間 (日本時間 GMT+900)
//XXX: 日本以外だとずれる。。
const RESET_TIME = {
    // 14:00 - DST
    HOURS   : 14 - (isDstInNY() ? 1 : 0),
    MINUTES :  0
};

// ポストの最大数
//XXX: Photoだけ
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
            let url = res.channel.URI.asciiSpec.replace(/[?#].*/, ''),
                msg, text, doc, err, isReblog,
                resetCount = function() {
                    let key = isReblog ? 'reblog' : 'post';
                    return Tumblr.ReblogPostLimit[key].isMax().addCallback(function(isMax) {
                        if (isMax) {
                            Tumblr.ReblogPostLimit[key].reset();
                        }
                    }).addErrback(function() {});
                };

            if (/\/login/.test(url)) {
                throw new Error(getMessage('error.notLoggedin'));
            }

            text = res.responseText;
            doc = convertToHTMLDocument(text);
            msg = "You've exceeded your daily post limit.";
            isReblog = !!$x(
                '//li[starts-with(@id,"post_")' +
                        ' and contains(@class,"is_reblog")' +
                        ' and contains(@class,"post")]' +
                    '//form[@action="/delete"]',
                doc
            );

            if (/\/dashboard/.test(url)) {
                resetCount();
                return;
            }

            // このチェックをするためリダイレクトを追う必要がある
            // You've used 100% of your daily photo uploads. You can upload more tomorrow.
            if (~text.indexOf('more tomorrow') ||
                /exceeded.*?upload.*?limit/i.test(text)
            ) {
                if (isReblog) {
                    Tumblr.ReblogPostLimit.reblog.setMax();
                } else {
                    Tumblr.ReblogPostLimit.post.setMax();
                }
                throw new Error(msg);
            }

            err = doc.getElementById('errors') || $x('//*[starts-with(@class,"error")]', doc);
            msg = err && convertToPlainText(err.textContent);
            if (msg) {
                throw new Error(msg);
            }
            resetCount();
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
            getResetTime = function() {
                let last = env.getPref(KEY_COUNT.LAST),
                    d, hours, add, result;
                if (last && new Date(last - 0).getHours() === RESET_TIME.HOURS) {
                    d = new Date(+last);
                    hours = d.getHours();
                    add = (hours >= 0 && hours < RESET_TIME.HOURS) ? 0 : 1;
                    result = new Date(
                        d.getFullYear(), d.getMonth(), d.getDate() + add,
                        RESET_TIME.HOURS, RESET_TIME.MINUTES, 0
                    ).getTime();
                } else {
                    d = new Date;
                    result = new Date(
                        d.getFullYear(), d.getMonth(), d.getDate() - 1,
                        RESET_TIME.HOURS, RESET_TIME.MINUTES, 0
                    ).getTime();
                    env.setPref(KEY_COUNT.LAST, '' + result);
                }
                return result;
            },
            getNow = function() {
                return '' + (+new Date);
            },
            getRemainder = function() {
                let next = getResetTime(),
                    now = (getNow() - 0),
                    diff = next - now;
                return parseInt(diff / (60 * 1000));
            },
            isResetable = function() {
                let rem = getRemainder();
                return rem <= 0 && getLastTime() < getNow() - 0;
            },
            getLastTime = function() {
                let last = env.getPref(KEY_COUNT.LAST);
                if (!last || new Date(last - 0).getHours() !== RESET_TIME.HOURS) {
                    env.setPref(KEY_COUNT.LAST, '' + getResetTime());
                }
                return +last;
            },
            setLastTime = function(d) {
                env.setPref(KEY_COUNT.LAST, '' + (d || getNow()));
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
            };

        return {
            post : {
                LIMIT : POST_LIMIT,
                getCount : function() {
                    let counter = getCounter(KEY_COUNT.POST);

                    return (Tumblr.user ? succeed(Tumblr.user) : Tumblr.getCurrentUser()).addCallback(function(user) {
                        if (isResetable()) {
                            counter[user] = 0;
                            setLastTime(getResetTime());
                            resetAll();
                        } else {
                            if (counter[user] == null) {
                                counter[user] = 0;
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
                            setLastTime(getResetTime());
                            resetAll();
                        } else {
                            if (counter[user] == null) {
                                counter[user] = 0;
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
            return Tumblr.ReblogPostLimit.post.isMax().addCallback(function(isMaxPost) {
                return Tumblr.ReblogPostLimit.reblog.isMax().addCallback(function(isMaxReblog) {
                    if (isMaxPost || isMaxReblog || Tumblr.ReblogPostLimit.post.isResetable()) {
                        Tumblr.ReblogPostLimit.post.reset();
                    }
                    Tumblr.ReblogPostLimit.post.add();
                });
            });
        }).addErrback(function() {}); // ここでのエラーは無視
    });
});


addAround(Tumblr, 'favor', function(proceed, args) {
    return proceed(args).addCallback(function() {
        Tumblr.ReblogPostLimit.post.checkInForm().addCallback(function(res) {
            return Tumblr.ReblogPostLimit.post.isMax().addCallback(function(isMaxPost) {
                return Tumblr.ReblogPostLimit.reblog.isMax().addCallback(function(isMaxReblog) {
                    if (isMaxPost || isMaxReblog || Tumblr.ReblogPostLimit.post.isResetable()) {
                        Tumblr.ReblogPostLimit.reblog.reset();
                    }
                    Tumblr.ReblogPostLimit.reblog.add();
                });
            });
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
                // アカウント名が表示されるので注意!
                alert(that.name + '\nLogin: ' + Tumblr.user);
            });
        }
    }, '----');

    Tombloo.Service.actions.register({
        name : '----',
        type : 'context'
    }, LABEL);
}

// サマータイム(Daylight Saving Time)チェック
function isDstInNY(date) {
    let dst = {}, tz = {},
        i, j, start, end, pos, year;

    date || (date = new Date);
    year = date.getFullYear();

    start = new Date(year, 3 - 1, 1, 2, 0, 0);
    for (i = 1, j = 0; i <= 14; i++) {
        start.setDate(i);
        if (start.getDay() === 0) {
            if (++j === 2) {
                break;
            }
        }
    }
    dst.start = +start;

    end = new Date(year, 11 - 1, 1, 1, 0, 0);
    for (i = 1; i <= 7; i++) {
        end.setDate(i);
        if (end.getDay() === 0) {
            break;
        }
    }
    dst.end = +end;

    tz.offset = date.getTimezoneOffset();
    tz.ny = -5 * 60; // GMT-0500
    pos = +date + (tz.offset + tz.ny) * 60 * 1000;
    return dst.start <= pos && dst.end > pos;
}

// pref
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

