/**
 * Service.Post.Notify - Tombloo/Tombfix patches
 *
 * ポスト完了時に通知メッセージを表示するパッチ
 *
 * また、ポスト時のエラーで再試行できる場合は再度実行する
 * これによりエラー減少が期待できる(かも…)
 *
 * @version    1.09
 * @date       2014-11-11
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.post.notify.js
 */
(function() {
'use strict';


// 特定のエラーは再試行によってポストに成功するので回数を決めて再度ポストする
var retryErrors = [
    {
        // 「xpconnect wrapped ns*」エラーの場合
        pattern: toSimpleRegExp([
            'Tumblr: ',
              'channel : [xpconnect wrapped (__NS__)]',
              'responseText : ',
              'message : '
            ].join('\n'), 'i', function(s) {
                return s.replace(/__NS__/, '(?: \\w+ ,? )+');
            }),
        limit: 3,
        defaultLimit: 3
    },
    {
        // 「src is null」エラーの場合
        pattern: toSimpleRegExp([
                'Tumblr: ',
                  'message : src is null'
            ].join('\n')),
        limit: 2,
        defaultLimit: 2
    }
];


update(Tombloo.Service, {

    /**
     * 対象のポスト先に一括でポストする
     *
     * @param  {Object}   ps        ポスト内容
     * @param  {Array}    posters   ポスト対象サービスのリスト
     * @param  {Boolean}  recursive 再試行かどうか (internal)
     * @return {Deferred}           ポスト完了後に呼び出される
     */
    post: function post_service(ps, posters, recursive) {
        var self = this, ds = {}, args = arguments, isTumblr;
        var postCancel = false;

        // 最初に呼ばれたときはリセットする
        if (args.length === 2 && recursive === void 0) {
            retryErrors.forEach(function(retry) {
                retry.limit = retry.defaultLimit;
            });
        }

        var isFavorite = function(name) {
            return ps.favorite &&
                (new RegExp('^' + ps.favorite.name + '(\\s|$)')).test(name);
        };

        [].concat(posters).forEach(function(p) {
            try {
                ds[p.name] = isFavorite(p.name) ? p.favor(ps) : p.post(ps);
            } catch (e) {
                ds[p.name] = fail(e);
            }
        });

        return new DeferredHash(ds).addCallback(function(ress) {
            var errs, ignoreError, name, success, res,
                msg, errmsg, retryName, doRetry, called,
                doneNames, failNames, allLen;

            // Tumblrのみ再試行する
            retryName = 'tumblr';

            errs = [];
            ignoreError = getPref('ignoreError');

            try {
                ignoreError = ignoreError && new RegExp(ignoreError, 'i');
            } catch (e) {
                // 正規表現が間違えてたら通知する
                alert('Missing pattern: ' + ignoreError.toString() + '\n' + e);
                ignoreError = null;
            }

            allLen = 0;
            doneNames = [];
            failNames = [];
            doRetry = false;

            for (name in ress) {
                allLen++;
                [success, res] = ress[name];

                if (~name.toLowerCase().indexOf(retryName)) {
                    isTumblr = true;
                }

                if (success) {
                    doneNames.push(name);
                } else {
                    failNames.push(name);
                    errmsg = self.reprError(res);
                    msg = format('%s: %s',
                        name,
                        res.message.status ?
                            format('HTTP Status Code %s', res.message.status) :
                            format('\n%s', errmsg.indent(4))
                    );

                    if (!ignoreError || !msg.match(ignoreError)) {
                        errs.push(msg);
                    }

                    if (name.toLowerCase().indexOf(retryName) !== -1) {
                        retryName = name;
                        doRetry = true;
                    }
                }
            }

            postCancel = false;
            called = false;

            if (errs.length) {
                if (doRetry && retryName) {
                    errmsg = errs.join('\n');
                    retryErrors.forEach(function(retry, i) {
                        if (retryErrors[i].limit < 0) {
                            retryErrors[i].limit = retryErrors[i].defaultLimit;
                        }

                        if (!called && retry.pattern.test(errmsg) &&
                            --retryErrors[i].limit >= 0
                        ) {
                            called = true;

                            // 遅延呼び出しで再試行
                            callLater(1, function() {
                                var reps;
                                reps = [].concat(posters).filter(function(p) {
                                    return p.name === retryName;
                                });
                                // かならず第三引数を渡す
                                post_service.call(self, ps, reps, true);
                            });
                        }
                    });
                }

                if (!called) {
                    self.alertError(errmsg, ps.page, ps.pageUrl, ps);
                    postCancel = true;
                }
            }

            return {
                doneNames   : doneNames,
                failNames   : failNames,
                retry       : called && retryName || null,
                postSuccess : !postCancel
            };
        }).addErrback(function(err) {
            self.alertError(err, ps.page, ps.pageUrl, ps);
        }).addCallback(function(postedInfo) {
            var title, sep, message, info, retryMsg;

            info = postedInfo || {};
            if (info && info.postSuccess) {
                sep = '';
                title = '';

                if (info.retry) {
                    retryMsg = format('[RETRY]: %s',
                        info.retry
                    );
                }

                // リトライ通知だけの場合は doneNames で判断
                if (info.doneNames && info.doneNames.length) {
                    title += format('[%s] POST Completed.',
                        String(ps.type).capitalize()
                    );
                    sep = ' \n';
                }

                if (info.retry) {
                    title += format('%s%s',
                        sep,
                        retryMsg
                    );
                }

                message = format('%s \n%s',
                    ps.item || ps.page,
                    ps.itemUrl || ps.pageUrl
                );

                // POST先サービス名一覧を追加
                title += ' (' + [].concat(posters).map(function(p) {
                    return p.name;
                }).join(', ') + ')';

                // 通知メッセージ 
                // 「Tumblrのリブログ/ポスト残量を表示するTomblooパッチ」が有効の場合は表示
                // https://github.com/polygonplanet/tombloo/blob/master/tombloo.model.tumblr.postlimit.message.js
                if (isTumblr && Tumblr.ReblogPostLimit) {
                    Tumblr.ReblogPostLimit.post.getCount().addCallback(function(postCount) {
                        return Tumblr.ReblogPostLimit.reblog.getCount().addCallback(function(reblogCount) {
                            title += format(' [Post]: %s/%s, [Reblog]: %s/%s',
                                postCount,   Tumblr.ReblogPostLimit.post.LIMIT,
                                reblogCount, Tumblr.ReblogPostLimit.reblog.LIMIT
                            );
                            notify(title, message, notify.ICON_INFO);
                        });
                    }).addErrback(function() {}); // ここでのエラーはスルー
                } else {
                    notify(title, message, notify.ICON_INFO);
                }
            }
        });
    }
});


// Helper functions
function toSimpleRegExp(s, flags, callback) {
    var cb = callback || (function(a) { return a });
    return new RegExp(
        cb(escapeRegExp(s.toString())).replace(/[\s\u00A0\u3000]+/g, '\\s*'),
        flags || 'i'
    );
}


function escapeRegExp(s) {
    return String(s || '').replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
}


function isNumeric(n) {
    return (n == null || n === '' ||
                  typeof n === 'object') ? false : !isNaN(n - 0);
}


function stringify(x) {
    let result = '', c;
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


function format(base) {
    var re, rep, args = Array.prototype.slice.call(arguments, 0).slice(1);
    re = /%([%ns])/g;
    rep = function(m0, m1) {
        var result, arg = stringify(args.shift());
        switch (m1) {
            case 's':
                result = arg;
                break;
            case 'n':
                result = isNumeric(arg) ? arg : 0;
                break;
            case '%':
                args.unshift(arg);
                result = m1;
                break;
            default:
                result = '';
                break;
        }
        return String(result.toString && result.toString() || result);
    };
    return stringify(base).replace(re, rep);
}

})();
