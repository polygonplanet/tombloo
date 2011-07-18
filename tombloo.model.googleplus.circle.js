/**
 * Model.Google+.Circle - Tombloo patches
 *
 * Google+で指定のサークルにポストできるようにするパッチ
 *
 * --------------------------------------------------------------------------
 *
 * このスクリプトは YungSangさん製の Google+ モデルが必要です
 * あらかじめインストールしてからご使用ください
 *
 * https://github.com/YungSang/Scripts-for-Tombloo
 *
 * --------------------------------------------------------------------------
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Model Google+ Circle patch]
 *
 * - Google+で指定のサークルにポストできるようにする
 *
 * --------------------------------------------------------------------------
 *
 * @version  1.02
 * @date     2011-07-18
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
callLater(0, function() {


// モデル名
const GOOGLE_PLUS_NAME = 'Google+';


// Google+ model が読み込まれるまで待つ (定義されてなければエラー)
let (limit = 8 * 1000, time = +new Date) {
    till(function() {
        let end = false;
        if (models[GOOGLE_PLUS_NAME]) {
            end = true;
        } else if (+new Date - time > limit) {
            throw new Error(GOOGLE_PLUS_NAME + ' model is undefined');
        }
        return end;
    });
}

// Bookmark対応
addAround(models[GOOGLE_PLUS_NAME], 'check', function(proceed, args) {
    let ps = args[0], result = proceed(args);
    if (!result && ps) {
        result = /bookmark/.test(ps.type) && !ps.file;
    }
    return result;
});

// ログインしてない場合スルー
try {
    // 各サークルを登録
    models[GOOGLE_PLUS_NAME].getOZData().addCallback(function(data) {
        let circles = [];
        data[12][0].forEach(function(circle) {
            let code, name, desc, has;
            code = stringify(circle[0][0]);
            if (code) {
                has = false;
                circles.forEach(function(c) {
                    if (!has && c.code === code) {
                        has = true;
                    }
                });
                if (!has) {
                    name = stringify(circle[1][0]);
                    desc = stringify(circle[1][2]);
                    if (name) {
                        circles[circles.length] = {
                            code : code,
                            name : name,
                            desc : desc
                        };
                    }
                }
            }
        });
        return circles;
    }).addCallback(function(circles) {
        const GOOGLE_PLUS_ICON_HASH = 'f1212ee736a41ae21b56dff60b53fe35';
        return convertToDataURL(models[GOOGLE_PLUS_NAME].ICON).addCallback(function(uri) {
            let prev, hash, draw;
            // アイコンデザインが変わった場合おかしなことになるのを防ぐ
            hash = stringify(uri).md5();
            draw = hash === GOOGLE_PLUS_ICON_HASH;
            prev = GOOGLE_PLUS_NAME;
            circles.forEach(function(circle) {
                let model = generateModel(circle);
                if (prev === GOOGLE_PLUS_NAME) {
                    update(models[GOOGLE_PLUS_NAME], {
                        _post : model._post
                    });
                }
                if (draw) {
                    callLater(0, function() {
                        drawIcon(model.ICON, circle.name).addCallback(function(uri) {
                            model.ICON = uri;
                            return true;
                        });
                    });
                }
                models.register(model, prev, true);
                prev = model.name;
            });
            return true;
        });
    });
} catch (e) {}


/**
 * HTMLテキストをプレーンテキストに変換 (一部のタグは残す)
 *
 * ポスト時に殆どのタグは除去されるため改行を合わせる
 *
 * @param  {String}   text   対象のテキスト
 * @return {String}          変換したテキスト
 */
function toPlainText(text) {
    let s, p, tags, restores;
    s = stringify(text);
    if (s) {
        tags = stringify(<>
            a b strong i font u s strike blockquote
            q ins del sub sup em acronym abbr cite
            dfn code kbd img pre ruby rb rt rp
        </>).trim().split(/\s+/);
        p = '';
        do {
            p += '~' + Math.random().toString(36).slice(-1);
        } while (~s.indexOf(p));
        restores = [];
        tags.forEach(function(tag) {
            let re;
            if (~s.indexOf(tag)) {
                re = new RegExp('</?' + tag + '\\b[^>]*>', 'gi');
                s = s.replace(re, function(match) {
                    let len = restores.length, from = p + len + p;
                    restores[len] = {
                        from : from,
                        to   : match
                    };
                    return from;
                });
            }
        });
        // リスト(<li>)などを整形するためconvertToPlainTextを使用する
        s = convertToPlainText(s);
        // 保持したタグを元に戻す
        if (restores && restores.length) {
            restores.forEach(function(o) {
                s = s.split(o.from).join(o.to);
            });
        }
        s = s.trim().replace(/^[\u0009\u0020]+/gm, function(m) {
            return new Array(m.length + 1).join('&nbsp;');
        }).replace(/(\r\n|\r|\n)/g, '<br />$1');
    }
    return s;
}


/**
 * アイコンに各サークル別で色をつける
 *
 * @param  {String}    src   画像のURI
 * @param  {String}    text  サークル名
 * @return {Deferred}        Deferred
 */
function drawIcon(src, text) {
    return loadImage(src).addCallback(function(img) {
        let canvas, ctx, color;
        canvas = document.createElementNS(HTML_NS, 'canvas');
        ctx = canvas.getContext('2d');
        canvas.width  = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        color = generateColor(text);
        ctx.fillStyle = 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        ctx.fillRect(7, 5, 2, 8);
        ctx.fillRect(4, 8, 8, 2);
        return canvas.toDataURL();
    });
}


/**
 * テキストのハッシュから色を生成
 */
//FIXME: 16 ^ 6 短いハッシュを使う
function generateColor(text) {
    let hash, color;
    hash = stringify(text).md5().slice(-6);
    color = {
        r : parseInt(hash.slice(0, 2), 16) | 0x80,
        g : parseInt(hash.slice(2, 4), 16) | 0x80,
        b : parseInt(hash.slice(4, 6), 16) | 0x80
    };
    return color;
}


/**
 * 各サークル用の名前を作成
 *
 * @param  {String}  circle  サークル情報
 * @return {String}          フォーマットされた名前
 */
function formatName(circle) {
    return [GOOGLE_PLUS_NAME, circle.name].join(' ');
}


/**
 * 各サークル用のモデルを生成
 *
 * @param  {Object}  ops  サークル情報
 * @return {Object}       モデル
 */
function generateModel(ops) {
    let model = update(update({}, models[GOOGLE_PLUS_NAME]), {
        name : formatName(ops),
        // fix
        OZDATA_REGEX : /<script\b[^>]*>[\s\S]*?\btick\b[\s\S]*?\bvar\s+OZ_initData\s*=\s*([{]+(?:(?:(?![}]\s*;[\s\S]{0,24}\btick\b[\s\S]{0,12}<\/script>)[\s\S])*)*[}])\s*;[\s\S]{0,24}\btick\b[\s\S]{0,12}<\/script>/i,
        getOZData : function() {
            let self = this;
            return request(this.HOME_URL).addCallback(function(res) {
                let OZ_initData = res.responseText.match(self.OZDATA_REGEX)[1];
                return evalInSandbox('(' + OZ_initData + ')', self.HOME_URL);
            });
        },
        createScopeSpar : function(oz) {
            return JSON.stringify({
                aclEntries : [{
                    scope : {
                        scopeType   : 'focusGroup',
                        name        : ops.name,
                        id          : [oz[2][0], ops.code].join('.'),
                        me          : false,
                        requiresKey : false,
                        groupType   : 'p'
                    },
                    role : 20
                }, {
                    scope : {
                        scopeType   : 'focusGroup',
                        name        : ops.name,
                        id          : [oz[2][0], ops.code].join('.'),
                        me          : false,
                        requiresKey : false,
                        groupType   : 'p'
                    },
                    role : 60
                }]
            });
        }
    });
    // Quoteテキストを引用符で囲い除去される改行やタグの差をできるだけ抑える
    addAround(model, 'createLinkSpar', function(proceed, args) {
        let ps = args[0];
        if (ps && ps.body) {
            ps.body = toPlainText(ps.body).wrap('&quot;');
        }
        return proceed(args);
    });
    return model;
}


// ----- Helper functions -----
/**
 * スカラー型となりうる値のみ文字列として評価する
 *
 * @param  {Mixed}   x   任意の値
 * @return {String}      文字列としての値
 */
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


});

