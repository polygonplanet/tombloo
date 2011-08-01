/**
 * Service.TINAMI - Tombloo patches
 *
 * TINAMIの画像をオリジナルサイズでサムネイルからでもポストできるパッチ
 * http://www.tinami.com/
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Service TINAMI patch]
 *
 * - TINAMIの作品/イラストなどの画像をオリジナルサイズで取得する
 * - ポストと同時にクリエイターを「お気に入りに追加」できるモデル
 * - ポストと同時に作品を「コレクションに追加」できるモデル
 * - サムネイルからオリジナルサイズの画像を取得しポスト可能
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.03
 * @date       2011-08-01
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.tinami.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {

// Basic URLs
const BASE_URL    = 'http://www.tinami.com/';
const FAVICON_URL = 'http://www.tinami.com/favicon.ico';


// TINAMIを登録 (extractor)
Tombloo.Service.extractors.register({
    name  : 'Photo - TINAMI',
    ICON  : FAVICON_URL,
    check : function(ctx) {
        let valid = false, expr;
        if (ctx && ctx.target && /^(?:\w+[.])*?tinami[.]com$/.test(ctx.host)) {
            expr = 'img[contains(@class,"capt") or contains(@rel,"capt")]';
            if ($x(expr, ctx.target)) {
                valid = true;
            } else if (ctx.target.parentNode && $x('//' + expr, ctx.target.parentNode)) {
                valid = true;
            } else if (~ctx.href.indexOf('/view/') &&
                        ctx.onImage && this.getOriginalUrlByAttr(ctx)) {
                valid = true;
            } else if (this.getViewLinkByThumbnail(ctx)) {
                valid = true;
            }
        }
        return valid;
    },
    // original属性がある場合それが画像URLかどうかチェックして適正なら返す
    getOriginalUrlByAttr : function(ctx) {
        let url;
        try {
            url = ctx.target.getAttribute('original');
            if (!/^https?:.*[.](?:jpe?g|png|gif|ico|svg|bmp)$/.test(url)) {
                throw url;
            }
        } catch (e) {
            url = null;
        }
        return url;
    },
    // サムネイルからviewページURLを取得
    getViewLinkByThumbnail : function(ctx) {
        let result, part, link;
        if (ctx && ctx.target && ctx.onLink) {
            part = '/img.tinami.com/illust/';
            if (~String(ctx.target.src).indexOf(part) ||
                ctx.target.querySelector('img[src*="' + part + '"]')
            ) {
                link = ctx.target;
                if (tagName(link) === 'img') {
                    let (limit = 5) {
                        while (--limit >= 0) {
                            link = link.parentNode;
                            if (tagName(link) === 'a') {
                                break;
                            }
                        }
                    }
                }
                if (link && ~String(link.href).indexOf('/view/')) {
                    // 小説は省く
                    //TODO: 小説のQuoteモデル実装
                    if (!link.querySelector('.title .nv')) {
                        result = link.href;
                    }
                }
            }
        }
        return result || '';
    },
    // 画像キャッシュを生成
    createImageCache : function(ctx, src) {
        const LOADING_TIMEOUT = 15;
        const REMOVE_DELAY = 1;
        let that = this, d, doc, img, remback, timer;
        d = new Deferred();
        doc = getMostRecentWindow().content.document;
        img = doc.createElement('img');
        remback = function() {
            callLater(REMOVE_DELAY, function() {
                removeElement(img);
                d.callback();
            });
        };
        timer = callLater(LOADING_TIMEOUT, function() {
            try {
                d.callback();
            } catch (e) {}
        });
        img.addEventListener('load', function(event) {
            try {
                timer.cancel();
            } catch (e) {}
            remback();
        }, true);
        img.setAttribute('style', <>
            width    : 1px;
            height   : 1px;
            display  : inline;
            position : absolute;
            left     : -99999px;
            top      : -99999px;
        </>.toString());
        doc.body.appendChild(img);
        img.setAttribute('src', src);
        return d;
    },
    // 画像をダウンロード
    download : function(ctx, src, tags) {
        return this.createImageCache(ctx, src).addCallback(function() {
            return download(createURI(src), getTempDir()).addCallback(function(file) {
                return {
                    type    : 'photo',
                    item    : ctx.title,
                    itemUrl : src,
                    tags    : tags || [],
                    file    : file
                };
            });
        });
    },
    // 作品のコンテナを取得
    selectViewNode : function(ctx) {
        let org, node, re;
        re = /\bviewbody\b/
        org = ctx.target || ctx.document;
        try {
            node = org;
            if (re.test(node.className)) {
                throw node;
            }
            if (node.nodeType == 1) {
                do {
                    node = node.parentNode;
                } while (node && !re.test(node.className));
            }
            if (!node) {
                throw node;
            }
        } catch (e) {
            node = org;
        }
        return node;
    },
    // 作品に付けられたタグを抽出
    extractTags : function(ctx) {
        let results = [], tags, exprs, patterns, context;
        patterns = {
            ignore : /[\s\u3000,[\]]+/g,
            remove : /[\u0000-\u0020*\/-]+/g
        };
        // AutoPagerize/AutoPager対応として最初のSiblingを選択
        exprs = [
            '.[@class="viewbody"]/..//*[@class="tag"]//a/text()',
            '.[contains(@class,"viewbody")]/..//*[contains(@class,"tag")]//a/text()',
            '//*[@class="comment"]/parent::node()[not(preceding-sibling::*)]//*[@class="tag"]//a/text()',
            '//*[contains(@class,"comment")]/parent::node()[not(preceding-sibling::*)]//*[contains(@class,"tag")]//a/text()',
            '//*[*[@class="tag"]]/parent::node()[not(preceding-sibling::*)]//*[@class="tag"]//a/text()',
            '//*[*[contains(@class,"tag")]]/parent::node()[not(preceding-sibling::*)]//*[contains(@class,"tag")]//a/text()'
        ];
        context = this.selectViewNode(ctx);
        exprs.forEach(function(expr) {
            if (!tags) {
                tags = $x(expr, context, true);
            }
        });
        if (tags && tags.length) {
            tags.forEach(function(tag) {
                tag = tag.replace(patterns.remove, '').replace(patterns.ignore, '');
                if (tag) {
                    results.push(tag);
                }
            });
        }
        return results || [];
    },
    // 漫画
    extractManga : function(ctx) {
        let tags, src;
        tags = this.extractTags(ctx);
        src  = this.getOriginalUrlByAttr(ctx);
        return this.download(ctx, src, tags);
    },
    // イラスト
    extractIllust : function(ctx) {
        let that = this, src, url, form, sendContent, tags, exprs, context;
        exprs = [
            '.[@class="viewbody"]//img[@rel="caption"][@class="captify"]/@src',
            '.[contains(@class,"viewbody")]//img[@rel="caption"][contains(@class,"captify")]/@src',
            '.[contains(@class,"viewbody")]//img[@rel="caption"]/@src',
            '//*[@class="viewbody"]//img[@rel="caption"][@class="captify"]/@src',
            '//img[@rel="caption"][@class="captify"]/@src',
            '//img[@rel="caption"][contains(@class,"capt")]/@src',
            '//img[@rel="caption"]/@src',
            '//img[@class="captify"]/@src',
            '//a//img/@src'
        ];
        context = this.selectViewNode(ctx);
        exprs.forEach(function(expr) {
            if (!src) {
                src = $x(expr, context);
            }
        });
        ctx.target = context;
        tags = this.extractTags(ctx);
        return this.download(ctx, src, tags);
    },
    extract : function(ctx) {
        let that = this, d, url = this.getViewLinkByThumbnail(ctx);
        if (url) {
            // サムネイルから
            d = request(url).addCallback(function(res) {
                let img, doc = convertToHTMLDocument(res.responseText);
                img = $x('//*[@class="viewbody"]//img', doc);
                ctx.href = url;
                ctx.title = doc.title || $x('//title/text()', doc) || ctx.title;
                ctx.target = img;
                ctx.document = doc;
                if (ctx.target.getAttribute('rel') === 'caption') {
                    return that.extractIllust(ctx);
                } else {
                    if (!/^https?:/.test(ctx.target.getAttribute('original'))) {
                        ctx.target.setAttribute('original', ctx.target.getAttribute('src'));
                    }
                    return that.extractManga(ctx);
                }
            });
        } else if (this.getOriginalUrlByAttr(ctx)) {
            // 漫画
            d = this.extractManga(ctx);
        } else {
            // イラスト/モデル/コスプレ
            d = this.extractIllust(ctx);
        }
        return maybeDeferred(d);
    }
}, 'Photo', false);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// モデルに登録 (クリエイターをお気に入りに追加)
models.register({
    name  : 'TINAMI Bookmark Creator',
    ICON  : FAVICON_URL,
    check : function(ps) {
        let valid = false, re = {
            type : /(?:regular|photo|quote|link|conversation|video|audio|bookmark)/,
            host : /^(?:https?:\/+|)(\w+[.])*?tinami[.]com/
        };
        try {
            // 設定画面を開いたときは pageUrl.match が true を返す
            if (ps.pageUrl.match() === true) {
                valid = true;
            }
        } catch (e) {}
        if (re.type.test(ps.type) &&
            re.host.test(ps.pageUrl || ps.itemUrl)
        ) {
            valid = true;
        }
        return valid;
    },
    getAuthCookie : function() {
        return getCookieString('www.tinami.com', 'Tinami2SESSID');
    },
    getToken : function(ps) {
        if (!this.getAuthCookie()) {
            throw new Error(getMessage('error.notLoggedin'));
        }
        if (ps && ps.pageUrl) {
            return request(ps.pageUrl).addCallback(function(res) {
                let doc, href;
                doc = convertToHTMLDocument(res.responseText);
                href = $x('//*[@class="prof"]//a/@href', doc);
                return href && href.split('/').filter(function(a) {
                    return a && a.length;
                }).pop();
            });
        } else {
            throw new Error('Cannot get token');
        }
    },
    updatePanel : function() {
        let doc, panel;
        doc = getMostRecentWindow().content.document;
        panel = $x('//*[@class="prof"]//a[contains(@href,"/bookmark/add/")]', doc);
        if (panel) {
            removeElement(panel);
        }
    },
    post : function(ps) {
        const ADD_URL = BASE_URL + 'bookmark/add/';
        let that = this;
        if (!this.getAuthCookie()) {
            throw new Error(getMessage('error.notLoggedin'));
        }
        return this.getToken(ps).addCallback(function(token) {
            let url;
            if (!token) {
                throw new Error('Cannot get token');
            }
            url = ADD_URL + token;
            return request(url, {
                redirectionLimit : 0
            }).addCallback(function(res) {
                that.updatePanel();
            });
        });
    }
});

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// モデルに登録 (コレクションに追加)
models.register(update(update({}, models['TINAMI Bookmark Creator']), {
    name : 'TINAMI Add Collection',
    post : function(ps) {
        const ADD_URL = BASE_URL;
        if (!this.getAuthCookie()) {
            throw new Error(getMessage('error.notLoggedin'));
        }
        return request(ps.pageUrl).addCallback(function(res) {
            let doc, form, sendContent, folder;
            doc = convertToHTMLDocument(res.responseText);
            folder = $x('//select[@id="collection_folder_dialog_select"]/option/@value', doc);
            form = doc.getElementById('collection_add');
            sendContent = update(update({}, formContents(form)), {
                folder : folder || 'デフォルト'
            });
            return request(ADD_URL, {
                redirectionLimit : 0,
                sendContent      : sendContent,
                referrer         : ps.pageUrl
            });
        });
    }
}));


})();

