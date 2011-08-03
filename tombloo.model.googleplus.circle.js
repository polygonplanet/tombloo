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
 * @version    1.09
 * @date       2011-08-04
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.googleplus.circle.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 * Special thanks to base Model: YungSang (http://topl.us/yungsang)
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
    uploadCheck : {
        ja : '画像をGooglePhotos(Picasa)にアップロード',
        en : 'Upload the image to GooglePhotos(Picasa).'
    }
};


// Bookmark対応 + file
addAround(models[GOOGLE_PLUS_NAME], 'check', function(proceed, args) {
    let ps = args[0], result = proceed(args);
    if (!result && ps) {
        result = /(?:regular|photo|quote|link|video|bookmark)/.test(ps.type);
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
            let prev, hash, draw, done;
            // アイコンデザインが変わった場合おかしなことになるのを防ぐ
            hash = stringify(uri).md5();
            draw = hash === GOOGLE_PLUS_ICON_HASH;
            prev = GOOGLE_PLUS_NAME;
            circles.forEach(function(circle) {
                let model = generateModel(circle);
                if (!done) {
                    update(models[GOOGLE_PLUS_NAME], {
                        createLinkSpar : model.createLinkSpar,
                        paramize       : model.paramize,
                        post           : model.post,
                        _post          : model._post,
                        download       : model.download,
                        upload         : model.upload,
                        doUpload       : model.doUpload
                    });
                    done = true;
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


// QuickPostFormに入力フィールドを追加
(function(globals) {

if (QuickPostForm.extended) {
    let (qe = QuickPostForm.extended) {
        qe.addProcedure(procedure);
    }
} else {
    addAround(QuickPostForm, 'show', function(proceed, args) {
        const QUICKPOSTFORM_XUL_PATH = 'chrome://tombloo/content/quickPostForm.xul';
        let [ps, position, message] = args, win, result, orgOpenDialog;
        orgOpenDialog = globals.openDialog;
        win = orgOpenDialog(
            QUICKPOSTFORM_XUL_PATH,
            'chrome,alwaysRaised=yes,resizable=yes,dependent=yes,titlebar=no',
            ps, position, message
        );
        try {
            // 他のパッチが利用してる可能性があるため一旦ダミーを作る
            update(globals, {
                openDialog : function() {
                    return win;
                }
            });
            procedure(win, ps);
            if (QuickPostForm.extended) {
                QuickPostForm.extended.callProcedure();
            }
            result = proceed(args);
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            }
        } finally {
            // 元の関数に戻す
            update(globals, {
                openDialog : orgOpenDialog
            });
            // 拡張用のメソッド
            if (!QuickPostForm.extended) {
                update(QuickPostForm, {
                    extended : {
                        args         : [win, ps],
                        procedures   : [],
                        addProcedure : function(procedure) {
                            let pcs = this.procedures;
                            pcs = pcs || [];
                            pcs.push(procedure);
                            return this;
                        },
                        callProcedure : function() {
                            let args = this.args;
                            (this.procedures || []).forEach(function(p) {
                                p && p.apply(null, args);
                            });
                        }
                    }
                });
            }
        }
        return result;
    });
}


function procedure(win, ps) {
    win.addEventListener('load', function() {
        let doc, formPanel, elmForm, uploadCheck, quoteTextBox, wrapper, make;
        if (!models[GOOGLE_PLUS_NAME].check(ps) || ps.type !== 'photo') {
            return;
        }
        doc = win.document;
        formPanel = win.dialogPanel.formPanel;
        make = {};
        'vbox checkbox textbox'.split(' ').forEach(function(tag) {
            make[tag.toUpperCase()] = bind(E, null, tag);
        });
        withDocument(doc, function() {
            elmForm = doc.getElementById('form');
            
            // チェックボックスを配置
            wrapper = elmForm.appendChild(make.VBOX({
                flex  : 1,
                style : 'max-height: 3em;'
            }));
            uploadCheck = wrapper.appendChild(make.CHECKBOX({
                name      : 'googlePlusUseUpload',
                value     : 'checked',
                label     : LABELS.translate('uploadCheck'),
                checked   : true,
                style     : [
                    'margin-top: 0.7em',
                    'margin-bottom: 0.5em',
                    'cursor: default'
                ].join(';')
            }));
            quoteTextBox = wrapper.appendChild(make.TEXTBOX({
                name      : 'googlePlusQuoteText',
                emptytext : 'Quote Text (' + GOOGLE_PLUS_NAME + ')',
                value     : trim(ps.body),
                multiline : true,
                rows      : 4,
                flex      : 1,
                style     : [
                    'min-height: 4em',
                    'margin-top: 0.5em'
                ].join(';')
            }));
            {
                let toggleQuoteBox = function() {
                    if (uploadCheck.checked) {
                        quoteTextBox.style.display = 'none';
                        wrapper.style.maxHeight    = '3em';
                    } else {
                        quoteTextBox.style.display = '';
                        wrapper.style.maxHeight    = '';
                    }
                    callLater(0, function() {
                        try {
                            formPanel.dialogPanel.sizeToContent();
                        } catch (er) {}
                    });
                };
                callLater(0, function() {
                    toggleQuoteBox();
                });
                uploadCheck.addEventListener('command', function() {
                    callLater(75 / 1000, toggleQuoteBox);
                }, true);
            }
            if (formPanel.descriptionBox) {
                addAround(formPanel.descriptionBox, 'replaceSelection', function(func, params) {
                    let [text] = params, result, value, start, end, qb;
                    try {
                        result = func(params);
                    } finally {
                        qb = quoteTextBox;
                        callLater(0, function() {
                            value = qb.value;
                            start = qb.selectionStart || 0;
                            end   = qb.selectionEnd;
                            qb.value = [
                                stringify(value.substr(0, start)),
                                stringify(text),
                                stringify(end !== undefined && value.substr(end) || '')
                            ].join('');
                            qb.selectionStart = qb.selectionEnd = start + stringify(text).length;
                        });
                    }
                    return result;
                });
            }
            update(formPanel.fields, {
                googlePlusUseUpload : {
                    get value() {
                        return uploadCheck.checked ? 'checked' : '';
                    },
                    set value(v) {
                        return (uploadCheck.checked = !!v) ? 'checked' : '';
                    },
                    get name() {
                        return uploadCheck.getAttribute('name');
                    },
                    set name(v) {
                        return uploadCheck.setAttribute('name', v);
                    }
                },
                googlePlusQuoteText : {
                    get value() {
                        return quoteTextBox.value;
                    },
                    set value(v) {
                        return quoteTextBox.value = v;
                    },
                    get name() {
                        return quoteTextBox.getAttribute('name');
                    },
                    set name(v) {
                        return quoteTextBox.setAttribute('name', v);
                    },
                    get tagName() {
                        return 'textbox';
                    },
                    getElementObject : function() {
                        return quoteTextBox;
                    }
                }
            });
            {
                let toggleFields = function(resize) {
                    let posters, prev, curr;
                    posters = formPanel.postersPanel.checked.filter(function(poster) {
                        return poster && stringify(poster.name).indexOf(GOOGLE_PLUS_NAME) === 0;
                    });
                    prev = wrapper.style.display == 'none'  ? 'none' : '';
                    curr = (posters && posters.length) ? '' : 'none';
                    if (prev !== curr) {
                        wrapper.style.display = curr;
                        if (resize) {
                            try {
                                formPanel.dialogPanel.sizeToContent();
                            } catch (er) {}
                        }
                    }
                };
                update(toggleFields, {
                    delay : function(resize, time) {
                        callLater(time === 0 ? 0 : (time || 0.3), function() {
                            toggleFields(!!resize);
                        });
                    }
                });
                toggleFields();
                
                // アイコンがONの時のみ表示する
                callLater(0.275, function() {
                    if (formPanel.postersPanel.setDisabled.extended) {
                        let (fpse = formPanel.postersPanel.setDisabled.extended) {
                            fpse.addProcedure(function() {
                                toggleFields.delay(true);
                            });
                        }
                    } else {
                        addAround(formPanel.postersPanel, 'setDisabled', function(func, params) {
                            let res = func(params);
                            // サイズが変わることで他のPosterもONになってしまうためディレイを設定
                            toggleFields.delay(true);
                            if (!formPanel.postersPanel.setDisabled.extended) {
                                update(formPanel.postersPanel.setDisabled, {
                                    extended : {
                                        procedures   : [],
                                        addProcedure : function(p) {
                                            this.procedures.push(p);
                                        },
                                        callProcedure : function() {
                                            this.procedures.forEach(function(p) {
                                                p && p();
                                            });
                                        }
                                    }
                                });
                            }
                            formPanel.postersPanel.setDisabled.extended.callProcedure();
                            return res;
                        });
                    }
                    toggleFields(true);
                });
                // フォームのサイズを調整
                toggleFields.delay(true, 0.5);
            }
        });
    }, true);
}

})(typeof grobal !== 'undefined' && grobal || {});


// YouTube - 動画ポスト時のキャプションFix暫定
//FIXME: 中途半端にしか直してない (G+ 専用としてのみ)
addAround(Tombloo.Service.extractors['Video - YouTube'], 'extract', function(proceed, args) {
    let ctx, result;
    ctx = args[0];
    result = proceed(args);
    if (ctx && result) {
        update(result, {
            item              : trim(ctx.title).replace(/[\s\u3000]+/g, ' ').trim(),
            authorDescription : $x('//*[@id="eow-description"]/text()', ctx.document)
        });
    }
    return result;
});


/**
 * HTMLテキストをプレーンテキストに変換 (一部のタグは残す)
 *
 * ポスト時に殆どのタグは除去されるため改行を合わせる
 *
 * @param  {String}   text   対象のテキスト
 * @return {String}          変換したテキスト
 */
function toPlainText(text) {
    let s, p, tags, restores, re, br, indent;
    s = stringify(text);
    if (s) {
        re = {
            nl    : /(\r\n|\r|\n)/g,
            bold  : /<strong\b([^>]*)>([\s\S]*?)<\/strong>/gi,
            space : /^[\u0009\u0020]+/gm,
            split : /\s+/
        };
        br = function(a) {
            return a.trim().replace(re.nl, '<br />$1');
        };
        indent = function(a) {
            return a.trim().replace(re.space, function(m) {
                return new Array(m.length + 1).join('&nbsp;');
            });
        };
        // <strong>は無視されるため <b> に変換
        s = indent(s).replace(re.bold, '<b$1>$2</b>');
        tags = stringify(<>
            a b strong s strike kbd em acronym
            q blockquote ins del sub sup u dfn
            i abbr cite font img ruby rb rt rp
        </>).trim().split(re.split);
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
        s = br(indent(s));
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
        },
        createLinkSpar : function(ps) {
            let isYoutube, uris, link, title, body;
            if (ps.type === 'regular') {
                return JSON.stringify([]);
            }
            isYoutube = !!(ps.type === 'video' && ps.itemUrl.match(this.YOUTUBE_REGEX));
            title = stringify(stringify(ps.item).length > stringify(ps.page).length ? ps.item : ps.page);
            body = '';
            if (ps.body) {
                // Quoteテキストを引用符で囲い除去される改行やタグの差をできるだけ抑える
                body = toPlainText(ps.body).wrap('&quot;');
            } else {
                if (isYoutube) {
                    body = stringify(ps.authorDescription || ps.author || '');
                }
            }
            if (isYoutube) {
                {
                    let from = this.YOUTUBE_REGEX, uri = stringify(ps.itemUrl), re = {
                        video : {
                            from : from,
                            to   : 'http://www.youtube.com/v/$1&hl=en&fs=1&autoplay=1'
                        },
                        image : {
                            from : from,
                            to   : 'https://ytimg.googleusercontent.com/vi/$1/hqdefault.jpg'
                        }
                    };
                    uris = {
                        video : uri.replace(re.video.from, re.video.to),
                        image : uri.replace(re.image.from, re.image.to)
                    };
                }
            } else {
                uris = {
                    video : '',
                    image : '//s2.googleusercontent.com/s2/favicons?domain=' + createURI(ps.pageUrl).host
                };
            }
            if (ps.upload && ps.upload.url) {
                uris.image = ps.upload.url;
            }
            link = [
                null, null, null,
                ps.upload ? '' : title,
                null,
                    isYoutube ? [null, uris.video] : 
                    ps.upload ? [null, ps.upload.url, ps.upload.height, ps.upload.width] : null,
                null, null, null,
                [],
                null, null, null, null, null,
                null, null, null, null, null, null,
                body,
                null, null
            ];
            link.push((function() {
                switch (ps.type) {
                    case 'video':
                        return [null, ps.pageUrl, null, 'application/x-shockwave-flash', 'video'];
                    case 'photo':
                        return ps.upload ? [null, ps.upload.photoPageUrl, null, ps.upload.mimeType, 'image']
                                         : [null, ps.pageUrl, null, 'text/html', 'document'];
                    default:
                        return [null, ps.itemUrl || ps.pageUrl, null, 'text/html', 'document'];
                }
            })());
            link.push(
                null, null, null, null, null,
                null, null, null, null, null,
                null, null, null, null, null, null,
                [
                    [null, uris.image, 120, 160],
                    [null, uris.image, 120, 160]
                ],
                null, null, null, null, null
            );
            if (ps.upload) {
                link.push([
                    [null, 'picasa', 'http://google.com/profiles/media/provider'],
                    [
                        null,
                        queryString({
                            albumid : ps.upload.albumid,
                            photoid : ps.upload.photoid
                        }),
                        'http://google.com/profiles/media/onepick_media_id'
                    ]
                ]);
            } else {
                link.push([
                    [null, isYoutube ? 'youtube' : '', 'http://google.com/profiles/media/provider']
                ]);
            }
            return JSON.stringify(link);
        },
        // パラメータを調整
        paramize : function(ps) {
            if (ps && ps.googlePlusQuoteText) {
                if (!ps.googlePlusUseUpload) {
                    if (trim(ps.googlePlusQuoteText) === trim(ps.description)) {
                        ps.description = '';
                    }
                    ps.body = joinText([
                        trim(ps.body),
                        trim(ps.googlePlusQuoteText)
                    ], '\n');
                }
                delete ps.googlePlusQuoteText;
            }
        },
        post : function(ps) {
            let self = this, psc = update({}, ps);
            if (!this.getAuthCookie()) {
                throw new Error(getMessage('error.notLoggedin'));
            }
            return this.getOZData().addCallback(function(oz) {
                return self._post(psc, oz);
            });
        },
        _post : function(ps, oz) {
            let self = this, spar, link, description;
            return this.upload(ps, oz).addCallback(function() {
                if (ps.type === 'regular') {
                    description = joinText([ps.item, ps.description], '\n\n');
                } else {
                    description = stringify(ps.description);
                }
                spar = [
                    description,
                    self.getToken(oz),
                    null,
                    ps.upload && ps.upload.albumid || null,
                    null, null
                ];
                link = self.createLinkSpar(ps);
                if (!ps.upload && ps.type === 'photo') {
                    let (photo = self.craetePhotoSpar(ps)) {
                        spar.push(JSON.stringify([link, photo]));
                    }
                } else {
                    spar.push(JSON.stringify([link]));
                }
                spar.push(null);
                spar.push(self.createScopeSpar(oz)),
                spar.push(true, [], true, true, null, [], false, false);
                if (ps.upload) {
                    spar.push(null, null, oz[2][0]);
                }
                spar = JSON.stringify(spar);
                return request(self.POST_URL + '?' + queryString({
                    _reqid : self.getReqid(),
                    rt     : 'j'
                }), {
                    method : 'POST',
                    redirectionLimit : 0,
                    sendContent : {
                        spar : spar,
                        at   : oz[1][15]
                    },
                    headers : {
                        Origin : self.HOME_URL
                    }
                });
            });
        },
        download : function(ps) {
            const UPLOAD_AUTH_URI = 'https://plus.google.com/_/upload/photos/resumable?authuser=0';
            return (ps.file ? succeed(ps.file) : download(ps.itemUrl, getTempDir())).addCallback(function(file) {
                let sendContent = JSON.stringify({
                    protocolVersion : '0.8',
                    createSessionRequest : {
                        fields : [{
                            external : {
                                name     : 'file',
                                filename : file.leafName,
                                formPost : {},
                                size     : file.fileSize
                            }
                        }, {
                            inlined : {
                                name        : 'batchid',
                                content     : (new Date()).getTime().toString(),
                                contentType : 'text/plain'
                            }
                        }, {
                            inlined : {
                                name         : 'disable_asbe_notification',
                                content      : 'true',
                                contentType  : 'text/plain'
                            }
                        }, {
                            inlined : {
                                name         : 'streamid',
                                content      : 'updates',
                                contentType  : 'text/plain'
                            }
                        }, {
                            inlined : {
                                name         : 'use_upload_size_pref',
                                content      : 'true',
                                contentType  : 'text/plain'
                            }
                        }]
                    }
                });
                return request(UPLOAD_AUTH_URI, {
                    sendContent : sendContent
                }).addCallback(function(res) {
                    return {
                        res  : res,
                        file : file
                    };
                });
            });
        },
        // Picasa(GooglePhoto)にアップロードしてから表示しないと小さくなる
        upload : function(ps, oz) {
            let d;
            if (ps && ps.type === 'photo' && ps.googlePlusUseUpload) {
                d = this.doUpload(ps, oz);
            } else {
                d = succeed();
            }
            return maybeDeferred(d);
        },
        doUpload : function(ps, oz) {
            let d;
            d = this.download(ps);
            d.addCallback(function(res) {
                let json, uri, type, ext, file;
                file = res.file;
                json = JSON.parse(res.res.responseText);
                ext  = json.sessionStatus.externalFieldTransfers;
                if (ext[0]) {
                    ext = ext[0];
                }
                uri  = ext.formPostInfo.url;
                type = ext.content_type;
                return upload(uri, {
                    redirectionLimit : 0,
                    headers : {
                        'Content-Type' : type
                    },
                    sendContent : {
                        file : file
                    }
                }).addCallback(function(res) {
                    let info, json = JSON.parse(res.responseText);
                    if (json && json.errorMessage) {
                        // サイズが大きいとエラー (キャプチャで発生しやすい)
                        error(json);
                        {
                            let errmsg;
                            try {
                                errmsg = json.errorMessage
                                    .additionalInfo['uploader_service.GoogleRupioAdditionalInfo']
                                    .completionInfo.customerSpecificInfo.message;
                                if (!errmsg) {
                                    throw errmsg;
                                }
                            } catch (e) {
                                errmsg = json.errorMessage.reason || json;
                            }
                            throw new Error(errmsg);
                        }
                    } else {
                        info = json.sessionStatus
                                .additionalInfo['uploader_service.GoogleRupioAdditionalInfo']
                                .completionInfo.customerSpecificInfo;
                        if (info) {
                            ps.upload = info;
                        }
                    }
                    return true;
                }).addBoth(function(res) {
                    try {
                        // テンポラリファイルを削除
                        file.remove(false);
                    } catch (e) {}
                    
                    if (res instanceof Error) {
                        error(res);
                        throw res;
                    }
                    return succeed();
                });
            });
            return d;
        }
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


/**
 * 全角スペースも含めたtrim
 *
 * @param  {String}   s   対象の文字列
 * @return {String}       結果の文字列
 */
function trim(s) {
    return stringify(s).replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '');
}


/**
 * アップロード (request関数をGoogle+ Photo用に少し変更)
 *
 * @param  {String}    url      リクエストURL
 * @param  {Object}    options  オプション
 * @return {Deferred}
 */
function upload(url, options) {
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
        channel.setUploadStream(
            // nsIFileInputStreamを利用してアップロード
            (file && new FileInputStream(file, -1, 0, false)) || new StringInputStream(contents),
            contentType || 'application/x-www-form-urlencoded',
            -1
        );
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


});

