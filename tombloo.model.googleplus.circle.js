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
 * @version  1.00
 * @date     2011-07-17
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {


// モデル名
const GOOGLE_PLUS_NAME = 'Google+';


// Google+ model が読み込まれるまで待つ (定義されてなければエラー)
let (limit = 5 * 60 * 1000, time = +new Date) {
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
    return update(update({}, models[GOOGLE_PLUS_NAME]), {
        name : formatName(ops),
        // aclEntries を変更するためだけにメソッドまるごと定義...
        _post : function(ps, oz) {
            const YOUTUBE_REGEXP = /^[^\/]+\/+(?:\w+[.])*?youtube[.]com(?:\/|$)/;
            let self = this, spar = [], link, isYoutube;
            isYoutube = ps.type == 'video' && YOUTUBE_REGEXP.test(ps.itemUrl);
            {
                let description;
                if (ps.type == 'regular') {
                    description = joinText([ps.item, ps.description], '\n\n');
                } else {
                    description = ps.description;
                }
                spar.push(
                    description,
                    this.getToken(oz),
                    null, null, null, null
                );
            }
            if (ps.type == 'regular') {
                link = [];
            } else {
                link.push(
                    null, null, null,
                    ps.item || ps.page,
                    null
                );
                if (isYoutube) {
                    let (videoUrl = ps.itemUrl.replace(this.YOUTUBE_REGEX,
                        'http://www.youtube.com/v/$1&hl=en&fs=1&autoplay=1')
                    ) {
                        link.push([null, videoUrl, 385, 640]);
                    }
                } else {
                    link.push(null);
                }
                link.push(null, null, null);
                if (isYoutube) {
                    link.push([[null, ps.author, 'uploader']]);
                } else {
                    link.push([]);
                }
                link.push(
                    null, null, null, null, null,
                    null, null, null, null, null, null,
                    ps.body,
                    null, null
                );
                link.push((function() {
                    switch (ps.type) {
                        case 'video':
                            return [null, ps.pageUrl, null, 'application/x-shockwave-flash', 'video'];
                        case 'photo':
                            return [null, ps.pageUrl, null, 'text/html', 'document'];
                        default:
                            return [null, ps.itemUrl || ps.pageUrl, null, 'text/html', 'document'];
                    }
                })());
                link.push(
                    null, null, null, null, null,
                    null, null, null, null, null,
                    null, null, null, null, null, null
                );
                if (isYoutube) {
                    let (imageUrl = ps.itemUrl.replace(this.YOUTUBE_REGEX,
                        'http://ytimg.googleusercontent.com/vi/$1/default.jpg')
                    ) {
                        link.push([
                            [null, imageUrl, null, null],
                            [null, imageUrl, null, null]
                        ]);
                    }
                } else {
                    let (imageUrl = '//s2.googleusercontent.com/s2/favicons?domain=' +
                        createURI(ps.pageUrl).host
                    ) {
                        link.push([
                            [null, imageUrl, null, null],
                            [null, imageUrl, null, null]
                        ]);
                    }
                }
                link.push(null, null, null, null, null);
                if (isYoutube) {
                    link.push([
                        [null, 'youtube', 'http://google.com/profiles/media/provider']
                    ]);
                } else {
                    link.push([
                        [null, '', 'http://google.com/profiles/media/provider']
                    ]);
                }
            }
            link = JSON.stringify(link);
            if (ps.type == 'photo') {
                {
                    let mime = this.getMIMEType(ps.itemUrl), photo = [
                        null, null, null, null, null,
                        [null, ps.itemUrl],
                        null, null, null,
                        [],
                        null, null, null, null, null,
                        null, null, null, null, null,
                        null, null, null, null,
                        [
                            null, ps.pageUrl, null, mime, 'photo',
                            null, null, null, null, null, null, null, null, null
                        ],
                        null, null, null, null, null,
                        null, null, null, null, null,
                        null, null, null, null, null, null,
                        [
                            [null, ps.itemUrl, null, null],
                            [null, ps.itemUrl, null, null]
                        ],
                        null, null, null, null, null,
                        [
                            [null, 'images', 'http://google.com/profiles/media/provider']
                        ]
                    ];
                    photo = JSON.stringify(photo);
                    spar.push(JSON.stringify([link, photo]));
                }
            } else {
                spar.push(JSON.stringify([link]));
            }
            spar.push(null);
            {
                let aclEntries = {
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
                };
                spar.push(JSON.stringify(aclEntries));
            }
            spar.push(true, [], true, true, null, [], false, false);
            spar = JSON.stringify(spar);
            return request(this.POST_URL + '?_reqid=' + this.getReqid() + '&rt=j', {
                method : 'POST',
                redirectionLimit : 0,
                sendContent : {
                    spar : spar,
                    at   : oz[1][15]
                },
                headers : {
                    Origin : self.HOME_URL
                }
            }).addCallback(function(res) {
                return res.responseText;
            });
        }
    });
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


})();

