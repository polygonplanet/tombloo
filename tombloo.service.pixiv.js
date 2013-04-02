/**
 * pixiv Service - Tombloo patches
 *
 * ピクシブ用のTomblooパッチ : http://www.pixiv.net/
 *
 * - pixiv Extractor patch
 * - pixiv Bookmark patch
 * - pixiv Thumbs Expander patch
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [pixiv Extractor patch]
 *
 * - pixiv用のコンテキストメニューを追加
 * - pixivからのフルサイズ画像POSTをサポート
 * - イラストに付けられたタグを自動的に付加(切り替え可)
 * - サムネイル一覧ページからフルサイズのイラストをPOSTできる
 * - 漫画は 1コマ目の画像を取得
 * - 漫画ページから各コマをフルサイズでPOSTできる
 *
 * [pixiv Bookmark patch]
 *
 * - pixivで作品の自動ブックマークを可能にする
 * - 同時に「お気に入りユーザーに追加」もできる(切り替え可)
 * - Tombloo設定ダイアログのサービス一覧にpixivが追加される
 * - イラストのサムネイルからブックマークができる
 *
 * [pixiv Thumbs Expander patch]
 *
 * - サムネイルのイラスト画像を拡大表示するコンテキストメニューを追加
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.40
 * @date       2013-04-03
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Blog    : http://polygon-planet-log.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.pixiv.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
//-----------------------------------------------------------------------------
(function(undefined) {
//-----------------------------------------------------------------------------
var LANG = function(n) {
    return ((n && (n.language || n.userLanguage     ||
            n.browserLanguage || n.systemLanguage)) ||
            'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);

/**
 * pixiv Extractor
 */
(function() {
var pixivProto = {
    name: 'Photo - pixiv',
    ICON: 'http://www.pixiv.net/favicon.ico',
    BASE_URL: 'http://www.pixiv.net/',
    
    // タグを自動挿入するかどうか
    APPEND_TAGS: true,
    
    // すべてのタグを挿入する or '*'で始まるタグのみ挿入
    GET_ALL_TAGS: false,
    
    ILLUST_PAGE_REGEXP : /^https?:\/\/(?:www\.)?pixiv\.net\/member_illust/i,
    MANGA_PAGE_REGEXP  : /\b(?:mode=manga)\b/,
    PIXIV_HOST_REGEXP  : /^(?:[\w-]+\.)*?pixiv\.net(?:\b|$)/,
    
    XPATH_NEXT_PAGE_HREF: '//*[contains(@class,"works_display")]//a/@href',
    
    pixivDocKey: 0,
    pixivDocuments: {},
    check: function(ctx) {
        var result = false, checkUrl;
        if (ctx.onImage && this.PIXIV_HOST_REGEXP.test(ctx.host)) {
            checkUrl = this.getNextPageURL(ctx);
            if (checkUrl && checkUrl.length > 21) {
                result = true;
            }
        }
        return result;
    },
    isThumbnailPage: function(ctx) {
        var result = false, img, link, re, src, i, href;
        try {
            img = ctx.target;
            link = img.parentNode;
            i = 0;
            while (link && i < 3) {
                if (link.href) {
                    break;
                }
                link = link.parentNode;
                i++;
            }
            if (img && link && img.src && link.href) {
                src = stringify(img.src);
                href = stringify(link.href);
                re = {
                    host   : /\bpixiv[.]net/,
                    ext    : /\.(?:jpe?g|png|gif|ico|svg)(?:[!?#].*)?$/i,
                    illust : /\b(?:member_illust)/i,
                    mode   : /\b(?:mode=medium)\b/i,
                    id     : /\b(?:illust_?id)=\d+/i
                };
                result = false;
                if (re.host.test(src) && re.ext.test(src) &&
                    re.illust.test(href) &&
                    re.mode.test(href) && re.id.test(href)) {
                    result = true;
                }
            }
        } catch (e) {
            result = false;
        }
        return result;
    },
    isMangaPage: function(url) {
        return this.ILLUST_PAGE_REGEXP.test(url) &&
               this.MANGA_PAGE_REGEXP.test(url);
    },
    checkNextPageURL: function(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('Cannot get URL:\n' + url + '\n');
        }
    },
    getNextPageURL: function(ctx) {
        var url, xpath, doc, base, type, node, i, patterns = {
            illust: {
                by: /\b(?:(mode=)(?:medium|[a-z]+))\b/i,
                to: '$1big'
            },
            manga: {
                by: /\b(?:(mode=)(?:medium|[a-z]+))\b/i,
                to: '$1manga'
            },
            thumbnail: {
                by: /^\/?(?=(?!\w+:\/+)\w+)/,
                to: this.BASE_URL
            }
        };
        base = this.BASE_URL.replace(/\/+$/g, '');
        doc = this.getDocument(false, ctx);
        if (this.isThumbnailPage(ctx)) {
            try {
                node = ctx.target.parentNode;
                for (i = 0; i < 3; i++) {
                    if (node.href) {
                        break;
                    }
                    node = node.parentNode;
                }
                url = node.href;
            } catch (e) {}
        } else if (ctx && ctx.href && this.isMangaPage(ctx.href)) {
            url = ctx.href;
        } else {
            xpath = this.XPATH_NEXT_PAGE_HREF;
            url = $x(xpath, doc);
        }
        if (!url || typeof url !== 'string') {
            url = null;
        } else {
            url = url.replace(/^\/+/g, '');
            if (url.indexOf(base) === -1) {
                url = [base, url].join('/');
            }
            if (this.isMangaPage(url)) {
                type = 'manga';
            } else if (this.isThumbnailPage(ctx)) {
                type = 'thumbnail';
            } else {
                type = 'illust';
            }
            url = url.replace(patterns[type].by, patterns[type].to);
        }
        return url;
    },
    getMangaPageNumber: function(ctx) {
        var page, re;
        try {
            re = /_p(\d+)[.](?:jpe?g|png|gif|ico|svg)(?:[#?].*|)$/i;
            page = ctx.target.src.match(re)[1];
        } catch (e) {
            page = 0;
        }
        return page;
    },
    getMangaFirstImage: function(text) {
        var url, re;
        re = /\b(https?:\/+.*?pixiv\.net\/[\w#!?=&;:.\/+-]*?\d+_p0\.\w+)\b/i;
        try {
            url = text.match(re)[1];
        } catch (e) {}
        return url;
    },
    getMangaFullSizePageURL: function(url, pageNumber) {
        var uri, patterns, page;
        page = pageNumber - 0;
        patterns = [
            {
                by: /\b(mode=manga)\b/i,
                to: '$1_big'
            },
            {
                by: /&*(?:#.*|&*)?$/,
                to: '&page=' + String(isNaN(page) ? 0 : page)
            }
        ];
        uri = stringify(url);
        if (this.isMangaPage(uri)) {
            patterns.forEach(function(re) {
                uri = uri.replace(re.by, re.to);
            });
        }
        return uri;
    },
    getFullSizeImageURL: function(isManga, res) {
        var url, text;
        text = res && res.responseText || '';
        if (isManga) {
            url = this.getMangaFirstImage(text);
        } else {
            url = this.parseFullSizePage(text);
        }
        return url;
    },
    parseFullSizePage: function(text) {
        var url, xpath;
        xpath = '//img/@src';
        url = $x(xpath, convertToHTMLDocument(text));
        return url;
    },
    getTagsPageURL: function(url) {
        var result, re;
        if (this.isMangaPage(url)) {
            re = /\b(?:mode=(?:manga|[a-z]+))\b/i;
        } else {
            re = /\b(?:mode=(?:[a-z]+))\b/i;
        }
        result = stringify(url).replace(re, 'mode=medium');
        return result;
    },
    getTags: function(ctx) {
        var self = this, tags = [], xpath, re, text, push;
        if (this.APPEND_TAGS) {
            re = {
                trim  : /^[\s\u3000]+|[\s\u3000]+$/g,
                space : /[\s\u3000]+/g,
                clean : /[\x00-\x20*\/-]+/g,
                fix   : /([*]+)[\s\u3000]*(\S)/g,
                ast   : /^[*]+/
            };
            push = function(s) {
                tags.push(
                    s.trim().replace(re.ast, '').replace(re.clean, '')
                );
            };
            xpath = '//*[contains(@class,"work-tags")]' +
                    '//*[contains(@class,"tags-container")]' +
                    '//ul[contains(@class,"tags")]//li//text()';
            text = $x(xpath, ctx.target, true);
            if (text) {
                String(text.join ? text.join(' ') : (text || '')).
                  replace(re.fix, '$1$2').replace(re.trim, '').
                  split(re.space).forEach(function(tag) {
                    tag = tag.replace(re.trim, '');
                    if (tag.length && tag !== '*' &&
                        (self.GET_ALL_TAGS || re.ast.test(tag))) {
                        push(tag);
                    }
                });
            }
        }
        return tags;
    },
    getDocument: function(write, ctx) {
        var doc;
        try {
            try {
                if (!write && ctx && ctx.pixivDocKey &&
                    (ctx.pixivDocKey in this.pixivDocuments)) {
                    doc = this.pixivDocuments[ctx.pixivDocKey];
                } else {
                    throw doc;
                }
            } catch (e) {
                doc = getMostRecentWindow().content.document;
            }
            doc = doc || (typeof currentDocument !== 'undefined' &&
                    currentDocument()) || document;
        } catch (e) {
            doc = null;
        }
        return doc;
    },
    removeImageElement: function(image) {
        var img = image, attr = function(elem, name) {
            return stringify(elem.getAttribute(name)).toLowerCase();
        };
        callLater(7.5, function() {
            try {
                if (attr(img, 'loaded') !== 'true' ||
                    attr(img, 'downloaded') !== 'true') {
                    throw 'continue';
                }
                try {
                    removeElement(img);
                } catch (e) {
                    try {
                        img.removeAttribute('loaded');
                        img.removeAttribute('downloaded');
                        img.style.display = 'none';
                        img.parentNode.removeChild(img);
                    } catch (e) {}
                }
            } catch (e) {
                callLater(0.2, arguments.callee);
                return;
            }
        });
    },
    appendImageElement: function(src) {
        var self = this, img, doc;
        doc = this.getDocument(true);
        img = doc.createElement('img');
        img.addEventListener('load', function() {
            try {
                img.setAttribute('loaded', 'true');
            } catch (e) {}
        }, true);
        img.setAttribute('src', src);
        img.setAttribute('style', [
            'width    : 1px;',
            'height   : 1px;',
            'border   : 0 none;',
            'padding  : 0;',
            'margin   : 0;',
            'display  : inline;',
            'position : absolute;',
            'left     : 0px;',
            'top      : 0px;'
        ].join('\n'));
        doc.body.appendChild(img);
        return img;
    },
    normalizeContext: function(ctx) {
        try {
            if (ctx.document.contentType.match(/^image/i)) {
                ctx.title = ctx.href.split('/').pop();
            }
            if (!/pixiv/i.test(ctx.title) && /pixiv/.test(ctx.href)) {
                ctx.title = stringify(ctx.title).trim() + '[pixiv]';
            }
            if ((!ctx.pixivDocKey ||
                 !(ctx.pixivDocKey in this.pixivDocuments)) &&
                ctx.document.location.href &&
                ctx.document.location.href !== ctx.href) {
                
                ctx.href = ctx.document.location.href;
            }
        } catch (e) {}
    },
    // ログインチェック
    resolveLogin: function(res) {
        var expr, doc;
        doc = convertToHTMLDocument(res.responseText);
        expr = '//form[@name="loginForm"]';
        if ($x(expr, doc)) {
            throw new Error(getMessage('error.notLoggedin'));
        }
    },
    // イラストページ
    extractIllust: function(ctx, url) {
        var self = this, src, uri;
        
        // 一度キャッシュしないと取得できない (Firefox4)
        return request(url, {
            referrer: ctx.href
        }).addCallback(function(res) {
            
            self.resolveLogin(res);
            
            // download() は referrer を設定できない(と思う)ので
            // request() でバイナリデータ(キャッシュ)を取得
            src = self.getFullSizeImageURL(false, res);
            return request(src, {
                referrer: url
            }).addCallback(function(data) {
                return {
                    data: data,
                    src: src
                };
            });
        });
    },
    // 漫画ページ
    extractManga: function(ctx, url) {
        var self = this, src, uri;
        return request(url, {
            referrer: ctx.href
        }).addCallback(function(res) {
            
            self.resolveLogin(res);
            
            src = self.getFullSizeImageURL(true, res);
            uri = self.getMangaFullSizePageURL(url);
            return request(uri, {
                referrer: url
            }).addCallback(function(response) {
                src = self.parseFullSizePage(response.responseText) || src;
                return request(src, {
                    referrer: uri
                }).addCallback(function(data) {
                    return {
                        data: data,
                        src: src
                    };
                });
            });
        });
    },
    // 漫画閲覧ページ
    extractMangaView: function(ctx, url) {
        var self = this, page, src, uri, tagPage, doc, tags;
        page = this.getMangaPageNumber(ctx);
        uri = this.getMangaFullSizePageURL(url, page);
        tagPage = this.getTagsPageURL(url);
        return request(tagPage, {
            referrer: url
        }).addCallback(function(res) {
            
            self.resolveLogin(res);
            
            doc = convertToHTMLDocument(res.responseText);
            ctx.title = doc.title || $x('//title/text()', doc) || ctx.title;
            ctx.href = url;
            ctx.target = doc;
            self.normalizeContext(ctx);
            tags = self.getTags(ctx);
            return request(uri, {
                referrer: url
            }).addCallback(function(response) {
                src = self.parseFullSizePage(response.responseText);
                return request(src, {
                    referrer: uri
                }).addCallback(function(data) {
                    return {
                        data: data,
                        src: src,
                        tags: tags || []
                    };
                });
            });
        });
    },
    // サムネイルページ
    extractThumbnail: function(ctx, url) {
        var self = this;
        try {
            // 外部から参照する場合は pixivExternal を使う
            if (ctx.pixivDocKey && !ctx.pixivExternal) {
                // 再帰呼び出しが起きたら永久ループするので止める
                this.pixivDocuments[ctx.pixivDocKey] = null;
                delete this.pixivDocuments[ctx.pixivDocKey];
                ctx.pixivDocKey = null;
                delete ctx.pixivDocKey;
                throw new Error('Unexpected recursive call');
            }
        } catch (e) {
            throw e;
        }
        return request(url, {
            referrer: ctx.href
        }).addCallback(function(res) {
            var d, uri, doc, tags, extractor;
            
            self.resolveLogin(res);
            
            doc = convertToHTMLDocument(res.responseText);
            
            // document を置換してイラストページにいることにする
            ctx.title = doc.title || $x('//title/text()', doc) || ctx.title;
            ctx.href = url;
            ctx.target = doc;
            self.pixivDocuments[++self.pixivDocKey] = doc;
            ctx.pixivDocKey = self.pixivDocKey;
            self.normalizeContext(ctx);
            uri = self.getNextPageURL(ctx);
            self.checkNextPageURL(uri);
            tags = self.getTags(ctx);
            extractor = self.getEachExtractor(ctx);
            try {
                d = extractor.call(self, ctx, uri).addCallback(function(data) {
                    try {
                        self.pixivDocuments[ctx.pixivDocKey] = null;
                        delete self.pixivDocuments[ctx.pixivDocKey];
                    } catch (e) {}
                    return {
                        data: data.data,
                        src: data.src,
                        tags: tags || []
                    };
                });
            } catch (e) {
                // かならず消去する
                self.pixivDocuments[ctx.pixivDocKey] = null;
                delete self.pixivDocuments[ctx.pixivDocKey];
                throw e;
            }
            return maybeDeferred(d);
        });
    },
    getEachExtractor: function(ctx) {
        var isManga, isMangaView, isThumbnail, extractor;
        isThumbnail = this.isThumbnailPage(ctx);
        isMangaView = this.isMangaPage(ctx.href);
        isManga = this.isMangaPage(this.getNextPageURL(ctx));
        if (isThumbnail) {
            extractor = this.extractThumbnail;
        } else if (isMangaView) {
            extractor = this.extractMangaView;
        } else if (isManga) {
            extractor = this.extractManga;
        } else {
            extractor = this.extractIllust;
        }
        return extractor;
    },
    extract: function(ctx) {
        var self = this, tags, url, extractor;
        this.normalizeContext(ctx);
        url = this.getNextPageURL(ctx);
        this.checkNextPageURL(url);
        tags = this.getTags(ctx);
        extractor = this.getEachExtractor(ctx);
        return extractor.call(this, ctx, url).addCallback(function(res) {
            var data, src, img;
            // dataをdataURIに変換すると403, 500等のエラーが減る(検討中)
            //data = res.data;
            res.data = null;
            src = res.src;
            tags = res.tags || tags || [];
            
            // documentに埋め込んでブラウザキャッシュとして利用する
            img = self.appendImageElement(src);
            return download(src, getTempDir()).addCallback(function(file) {
                img.setAttribute('downloaded', 'true');
                self.removeImageElement(img);
                try {
                    self.pixivDocuments[ctx.pixivDocKey] = null;
                    delete self.pixivDocuments[ctx.pixivDocKey];
                } catch (e) {}
                return {
                    type    : 'photo',
                    item    : ctx.title,
                    itemUrl : src,
                    file    : file,
                    tags    : tags,
                    pretends : {
                        href  : ctx.href,
                        doc   : ctx.target,
                        title : ctx.title
                    }
                };
            });
        });
    }
};
//-----------------------------------------------------------------------------
// コンテキストメニューに登録 (順序を変えるとメインメニュー(J)にできる)
Tombloo.Service.extractors.register([
    update(update({}, pixivProto), {
        name: 'Photo - pixiv (with *Tags)',
        APPEND_TAGS: true,
        GET_ALL_TAGS: false
    }),
    update(update({}, pixivProto), {
        name: 'Photo - pixiv (with all Tags)',
        APPEND_TAGS: true,
        GET_ALL_TAGS: true
    }),
    update(update({}, pixivProto), {
        name: 'Photo - pixiv (No Tags)',
        APPEND_TAGS: false,
        GET_ALL_TAGS: false
    })
], 'Photo');
})();
//-----------------------------------------------------------------------------
/**
 * pixiv Bookmark
 *
 * Based: http://gist.github.com/318137
 */
(function() {

// 同じ表現を避けるため pixiv extractor を参照する
var pixivService = Tombloo.Service.extractors['Photo - pixiv (with *Tags)'];

// pixiv Bookmark + user (model)
var pixivBookmark = update({
    name: 'pixiv Bookmark',
    
    // ブックマーク
    PIXIV_BOOKMARK: true,
    
    // お気に入り追加 (ユーザー)
    PIXIV_BOOKMARK_USER: false,
    
    ICON: pixivService.ICON,
    BASE_URL: pixivService.BASE_URL,
    
    ILLUST_PAGE_REGEXP : pixivService.ILLUST_PAGE_REGEXP,
    MANGA_PAGE_REGEXP  : pixivService.MANGA_PAGE_REGEXP,
    PIXIV_HOST_REGEXP  : pixivService.PIXIV_HOST_REGEXP,
    ILLUST_ID_REGEXP   : /\b(?:illust_?id)=(\d+)/i,
    USER_ID_REGEXP     : /(?:(?=\buser_?).*|\b)id=(\d+)/i,
    
    XPATH_BOOKMARK: [
        '(',
        '//*[contains(@class, "works_illusticonsBlock")]',
        '//div[last()]/span/a[last() = 1][contains(@href, "bookmark_add")]',
        ')',
            'or',
        '(',
        '//*[@id = "contents"]//*[contains(@class, "works_illusticonsBlock")]',
        '//a[contains(@href, "bookmark_add")]',
        ')',
            'or',
        '(',
        '//*[@id = "bookmark"]//form[contains(@action, "bookmark_add")]',
        ')'
    ].join(''),
    XPATH_BOOKMARK_ILLUST_ID: '//*[@name="illust_id" or @id="illust_id"]/@value',
    XPATH_BOOKMARK_ILLUST_ID_BY_FORM: '//input[@name = "illust_id"]/@value',
    XPATH_BOOKMARK_USER: '//*[@id="favorite-preference"]//form[contains(@action, "bookmark_add")]',
    XPATH_BOOKMARK_USER_ID: '//*[@id="favorite-preference"]//input[@type="hidden"][@name="user_id"]/@value',
    check: function(ps) {
        var result = false, isPrefs = false, re;
        try {
            // 設定画面を開いたときは pageUrl.match が true を返す
            if (ps && ps.pageUrl && ps.pageUrl.match() === true) {
                isPrefs = true;
            }
        } catch (e) {}
        re = /(?:regular|photo|quote|link|conversation|video|bookmark)/;
        result = re.test(ps.type);
        if (!isPrefs) {
            if (result && ps && ps.pageUrl &&
                stringify(ps.pageUrl).indexOf(this.BASE_URL) === 0 &&
                (this.canBookmark(ps) || this.canBookmarkUser(ps))) {
                result = true;
            } else {
                result = false;
            }
        }
        return result;
    },
    canBookmark: function(ps) {
        return ps && ps.pageUrl &&
               (this.ILLUST_ID_REGEXP.test(ps.pageUrl) ||
               !!$x(this.XPATH_BOOKMARK, this.getDocument(ps)));
    },
    canBookmarkUser: function(ps) {
        return ps && ps.pageUrl &&
               (this.USER_ID_REGEXP.test(ps.pageUrl) ||
               !!$x(this.XPATH_BOOKMARK_USER, this.getDocument(ps)));
    },
    isMangaPage: function(url) {
        return this.ILLUST_PAGE_REGEXP.test(url) &&
               this.MANGA_PAGE_REGEXP.test(url);
    },
    getIllustId: function(ps, doc) {
        var self = this, illustId, xpaths, xpath, re, elem, value;
        re = /[()]\s*or\s*[()]/gi;
        xpaths = this.XPATH_BOOKMARK.split(re).map(function(x) {
            return x.replace(/^\s*[(]|[)]\s*$/g, '');
        });
        re = this.ILLUST_ID_REGEXP;
        if (ps && ps.pretends) {
            try {
                illustId = ps.pretends.href && ps.pretends.href.match(re)[1];
            } catch (e) {
                illustId = null;
            }
            doc = ps.pretends.doc;
        }
        doc = doc || this.getDocument(ps);
        if (!illustId) {
            if (ps && ps.pageUrl && re.test(ps.pageUrl)) {
                illustId = ps.pageUrl.match(re)[1];
            } else {
                try {
                    xpaths.forEach(function(x) {
                        if (!value) {
                            elem = $x(x, doc);
                            if (elem) {
                                if (tagName(elem) === 'a') {
                                    value = elem.getAttribute('href');
                                } else if (tagName(elem) === 'form') {
                                    value = $x(
                                        self.XPATH_BOOKMARK_ILLUST_ID_BY_FORM,
                                        elem
                                    );
                                }
                            }
                        }
                    });
                    if (value) {
                        illustId = stringify(value);
                        if (re.test(illustId)) {
                            illustId = illustId.match(re)[1];
                        }
                    }
                } catch (e) {}
            }
            if (!illustId) {
                xpath = this.XPATH_BOOKMARK_ILLUST_ID;
                illustId = $x(xpath, doc);
            }
        }
        return illustId;
    },
    getUserId: function(ps, doc) {
        var userId, xpath, re;
        xpath = this.XPATH_BOOKMARK_USER_ID;
        re = this.USER_ID_REGEXP;
        if (ps && ps.pretends) {
            try {
                userId = ps.pretends.href && ps.pretends.href.match(re)[1];
            } catch (e) {
                userId = null;
            }
            doc = ps.pretends.doc;
        }
        doc = doc || this.getDocument(ps);
        if (!userId) {
            if (ps && ps.pageUrl && re.test(ps.pageUrl)) {
                userId = ps.pageUrl.match(re)[1];
            } else {
                userId = $x(xpath, doc);
            }
        }
        return userId;
    },
    getToken: function() {
        var self = this, result, url, status = this.updateSession();
        switch (status) {
            case 'none':
                throw new Error(getMessage('error.notLoggedin'));
            case 'same':
                if (this.token) {
                    result = succeed(this.token);
                    break;
                }
                // FALLTHROUGH
            case 'changed':
                url = this.BASE_URL + 'bookmark.php?type=user';
                result = request(url).addCallback(function(res) {
                    var expr, doc = convertToHTMLDocument(res.responseText);
                    if ($x('//form[@name="login-form"]', doc)) {
                        throw new Error(getMessage('error.notLoggedin'));
                    }
                    expr = '//form[@id="f"]/input[@name="tt"]/@value';
                    self.token = $x(expr, doc);
                    return self.token;
                });
                break;
            default:
                throw new Error('Bug: Invalid token');
        }
        return result;
    },
    getAuthCookie: function() {
        //FIXME: ログイン状態の判別が出来てないかも(?)
        return getCookieString('pixiv.net', 'PHPSESSID') ||
               getCookieString('.pixiv.net', 'PHPSESSID');
    },
    getDocument: function(ps, write) {
        var doc = null;
        try {
            if (!write && ps && ps.pretends && ps.pretends.doc) {
                doc = ps.pretends.doc;
            } else {
                doc = getMostRecentWindow().content.document;
                if (!doc) {
                    doc = currentDocument && currentDocument() || document;
                }
                if (this.BASE_URL.indexOf(doc.domain) === -1) {
                    throw doc;
                }
            }
        } catch (e) {
            doc = null;
        }
        return doc;
    },
    fixBookmarkPageLabel: function(node) {
        var r, i, s, v, c, a;
        try {
            a = node.getElementsByTagName('a');
            for (i = 0; i < a.length; i++) {
                try {
                    s = v = a[i].innerHTML;
                    c = s.charCodeAt(0);
                    if (c !== 0x30d6 && c <= 0xff) {
                        v = decodeURIComponent(escape(s));
                    }
                } catch (er) {
                    v = s;
                }
                a[i].innerHTML = v;
            }
            r = node && node.innerHTML;
        } catch (e) {}
        return r;
    },
    /**
     * ブックマークに追加
     */
    addBookmarkPage: function(ps, doc, addUrl) {
        var self, token, psc;
        if (!this.PIXIV_BOOKMARK) {
            return succeed();
        }
        self = this;
        token = this.getToken();
        psc = update({}, ps);
        return token.addCallback(function(token) {
            return request(addUrl, {
                sendContent: {
                    mode     : 'add',
                    tt       : token,
                    id       : self.getIllustId(psc, doc),
                    type     : 'illust',
                    restrict : 0, // 1 = 非公開, 0 = 公開
                    tag      : joinText(psc.tags || [], ' '),
                    comment  : joinText([psc.body, psc.description], ' ', true)
                }
            }).addCallback(function(res) {
                var uri = psc.pageUrl, curDoc = self.getDocument(psc, true);
                return request(uri, {
                    referrer: psc.referUrl || addUrl
                }).addCallback(function(response) {
                    var oldNode, newNode, html, label, found, selectors = [
                        [0, '.works_illusticonsBlock div:last-child span'],
                        [0, '#bookmark'],
                        [1, 'a[href*="bookmark_add"][href*="type=illust"]'],
                        [1, '.action .bookmark a[href*="type=illust"]'],
                        [1, '.bookmark a[href*="type=illust"]']
                    ], select = function(context, [level, selector]) {
                        var node = context.querySelector(selector);
                        while (node && --level >= 0) {
                            node = node.parentNode;
                        }
                        return node;
                    };
                    try {
                        html = convertToHTMLDocument(response.responseText);
                        found = false;
                        selectors.forEach(function(sels) {
                            if (!found) {
                                newNode = select(html, sels);
                                oldNode = select(curDoc, sels);
                                if (newNode && oldNode) {
                                    found = true;
                                }
                            }
                        });
                        if (found) {
                            //FIXME: まれにデコード未処理で返ってくる
                            label = self.fixBookmarkPageLabel(newNode);
                            oldNode.innerHTML = label || newNode.innerHTML;
                            if (!/bookmark/.test(oldNode.className)) {
                                oldNode.removeAttribute('class');
                            }
                        }
                    } catch (e) {
                        // この時すでにPOST完了してるので例外は投げない
                        //throw new Error(
                        //    '[addBookmarkPage] Update failed: ' + e
                        //);
                    }
                    return true;
                });
            });
        });
    },
    /**
     * お気に入り追加 (ユーザー)
     */
    addBookmarkUser: function(ps, doc, addUrl) {
        var self, token, psc;
        if (!this.PIXIV_BOOKMARK_USER) {
            return succeed();
        }
        self = this;
        token = this.getToken();
        psc = update({}, ps);
        return token.addCallback(function(token) {
            return request(addUrl, {
                sendContent : {
                    mode        : 'add',
                    tt          : token,
                    type        : 'user',
                    user_id     : self.getUserId(psc, doc),
                    restrict    : 0, // 1 = 非公開, 0 = 公開
                    left_column : 'OK'
                }
            }).addCallback(function(res) {
                var uri = psc.pageUrl, curDoc = self.getDocument(psc, true);
                return request(uri).addCallback(function(response) {
                    var oldNode, newNode, html, label, found, selectors = [
                        [0, '#favorite-container'],
                        [1, 'a[href*="bookmark"][href*="type=user"]']
                    ], select = function(context, [level, selector]) {
                        var node = context.querySelector(selector);
                        while (node && --level >= 0) {
                            node = node.parentNode;
                        }
                        return node;
                    };
                    try {
                        html = convertToHTMLDocument(response.responseText);
                        found = false;
                        selectors.forEach(function(sels) {
                            if (!found) {
                                newNode = select(html, sels);
                                oldNode = select(curDoc, sels);
                                if (newNode && oldNode) {
                                    found = true;
                                }
                            }
                        });
                        if (found) {
                            // イベントはコピーしないので見た目だけ
                            label = self.fixBookmarkPageLabel(newNode);
                            oldNode.innerHTML = label || newNode.innerHTML;
                        }
                    } catch (e) {
                        // この時すでにPOST完了してるので例外は投げない
                        //throw new Error(
                        //    '[addBookmarkUser] Update failed: ' + e
                        //);
                    }
                    return true;
                });
            });
        });
    },
    post: function(ps) {
        var result, doc, psc, addUrl;
        psc = update({}, ps);
        doc = this.getDocument(ps);
        addUrl = this.BASE_URL + 'bookmark_add.php';
        if (doc) {
            if (this.isMangaPage(doc.URL) && doc.URL !== psc.pageUrl) {
                psc.referUrl = psc.pageUrl;
                psc.pageUrl = doc.URL;
            }
            // ブックマーク
            if (this.PIXIV_BOOKMARK && this.canBookmark(psc)) {
                result = this.addBookmarkPage(psc, doc, addUrl);
            }
            // お気に入り追加 (ユーザー)
            if (this.PIXIV_BOOKMARK_USER && this.canBookmarkUser(psc)) {
                result = this.addBookmarkUser(psc, doc, addUrl);
            }
        }
        return maybeDeferred(result);
    }
}, AbstractSessionService);

//-----------------------------------------------------------------------------
// 登録: ブックマーク
models.register(update(update({}, pixivBookmark), {
    name: 'pixiv Bookmark',
    PIXIV_BOOKMARK: true,
    PIXIV_BOOKMARK_USER: false
}));

// 登録: お気に入り追加 (ユーザー)
models.register(update(update({}, pixivBookmark), {
    name: 'pixiv Bookmark User',
    PIXIV_BOOKMARK: false,
    PIXIV_BOOKMARK_USER: true
}));
})();
//-----------------------------------------------------------------------------
/**
 * pixivThumbsExpander
 *
 * サムネイルイラスト画像を拡大表示できるようにするメニューを追加
 *
 * (無駄にソース量あるし便利とは言い難いので機能削除 or シンプル化に検討中...)
 */
(function() {

var 
// pixiv extractor
pixivService = Tombloo.Service.extractors['Photo - pixiv (with *Tags)'],

// pixiv サムネイル拡張オブジェクト
pixivThumbsExpander = (function(id) {
    return {
        id: id,
        nopId: id + 'Nop',
        errorId: id + 'Error',
        imageId: id + 'Image',
        loadedId: id + 'Loaded',
        loadingId: id + 'Loading'
    };
})('TomblooPixivThumbsExpander');

update(pixivThumbsExpander, {
    
    // サムネイル拡大表示が有効かどうか
    expanding: false,
    
    // サムネイルのサイズ
    viewSize: {
        s: {
            width: 150,
            height: 150
        },
        m: {
            width: 448,
            height: 448
        }
    },
    // デフォルトの検索(<p><img/><p>となっている)ページのCSS
    wrappedPageDefaultLayout: {
        li: {
            height: '250px',
            overflow: 'auto'
        }
    },
    // 画像読み込みエラー秒数
    loadTimeLimit: 10,
    debugMode: false,
    loadingCanvas: defineLoadingCanvas(),
    fadings: [],
    isRankingPage: false,
    isStaccfeedPage: false,
    isSearchPage: false,
    isWrappedImagePage: false,
    inited: false,
    init: function() {
        var self = this, cwin, browser;
        if (this.inited) {
            if (this.expanding) {
                this.clearProps();
                callLater(0, function() {
                    self.initLoadingCanvas();
                    self.searchImageNodes();
                });
            }
        } else {
            this.inited = true;
            try {
                cwin = this.getChromeWindow();
                browser = cwin.gBrowser || cwin.getBrowser();
                
                //
                // タブの読み込み状況から各ウィンドウをチェックする
                // あらゆるwindowの読み込みに適応されるので最低限の処理にする
                // (TomblooのTabWatcherを使いたかったけどコールバック無理(?))
                //
                browser.addEventListener('DOMContentLoaded', function(event) {
                    var doc, uri;
                    try {
                        if (!self.expanding) {
                            throw 'disabled';
                        }
                        doc = self.getDocumentFromLoadEvent(event);
                        if (doc) {
                            uri = (doc.location && doc.location.host) ||
                                   doc.documentURI || doc.URL || doc.domain;
                            if (uri && self.check(uri)) {
                                callLater(0, function() {
                                    if (self.expanding) {
                                        self.onPageLoaded.call(self);
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        self.debug(e);
                    }
                }, true);
                
                // メニューがクリックされたとき pixiv 内ならその場で実行
                if (this.check()) {
                    callLater(0, function() {
                        if (self.expanding) {
                            self.onPageLoaded.call(self);
                        }
                    });
                }
            } catch (e) {
                this.debug(e);
            }
        }
    },
    initLoadingCanvas: function() {
        var doc, margin, loading, size;
        doc = this.getDocument();
        if (!('canvas' in this.loadingCanvas) &&
            !doc.querySelector('.' + this.loadingId)) {
            try {
                this.loadingCanvas = this.loadingCanvas({
                    target: doc.body,
                    size: 16,
                    interval: 120,
                    doc: doc,
                    hidden: true
                });
                size = this.viewSize.s;
                loading = this.loadingCanvas;
                margin = [
                    Math.floor(
                        Math.max(10, (size.height / 2) - (loading.size / 2))
                    ),
                    Math.floor(
                        Math.max(10, (size.width / 2) - (loading.size / 2))
                    )
                ].map(function(m) {
                    return m + 'px';
                }).join(' ');
                
                attr(this.loadingCanvas.canvas, {
                    className: this.loadingId,
                    style: {
                        margin: margin,
                        display: 'none',
                        background: 'transparent',
                        verticalAlign: 'middle',
                        MozUserSelect: 'none',
                        userSelect: 'none'
                    }
                });
            } catch (e) {
                this.debug(e);
                
                // loadingCanvas のためだけに動作しなくなるのを防止
                this.loadingCanvas = {
                    draw: function() {},
                    stop: function() {},
                    canvas: doc.createElement('span')
                };
                this.loadingCanvas.canvas.innerHTML = 'Loading...';
            }
        }
    },
    clearProps: function(clearAll) {
        this.fadings = [];
        this.isRankingPage = false;
        this.isStaccfeedPage = false;
        if (clearAll) {
            this.setStoragePoint(true);
        }
    },
    check: function(uri) {
        var result = false, hostName;
        try {
            hostName = uri || this.getLocation().host;
            if (hostName &&
                (hostName.indexOf(pixivService.BASE_URL) === 0 ||
                 pixivService.PIXIV_HOST_REGEXP.test(hostName))) {
                result = true;
            }
        } catch (e) {
            this.debug(e);
            result = false;
        }
        return result;
    },
    getWindow: function() {
        return getMostRecentWindow() || this.getDocument().defaultView;
    },
    getDocument: function() {
        return pixivService.getDocument();
    },
    // load event から content documentを返す
    getDocumentFromLoadEvent: function(event) {
        var result = null, target, org, doc, view, check;
        check = function(o) {
            var r = false, props;
            if (o) {
                // URIを含むかチェックする(HTMLDocumentかどうか)
                props = 'URL location domain documentURI';
                props.split(' ').forEach(function(p) {
                    if (!r && (p in o)) {
                        r = true;
                    }
                });
             }
             return r;
        };
        try {
            if (!event) {
                throw event;
            }
            target = event.target;
            org = event.originalTarget;
            if (target && org) {
                if (target.defaultView) {
                    view = target.defaultView;
                    doc = view.document;
                    if (!check(doc) && view.content) {
                        doc = view.content.document;
                    }
                    if (!check(doc)) {
                        doc = view.contentDocument;
                    }
                }
                if (!check(doc)) {
                    doc = target.contentDocument;
                }
                if (!check(doc) && org.defaultView) {
                    view = org.defaultView;
                    doc = view.document;
                    if (!check(doc) && view.content) {
                        doc = view.content.document;
                    }
                    if (!check(doc)) {
                        doc = view.contentDocument;
                    }
                }
                if (!check(doc) && target.content) {
                    doc = target.content.document;
                }
                if (!check(doc)) {
                    throw doc;
                }
                result = doc;
            }
        } catch (e) {
            this.debug(e);
            result = null;
        }
        return result;
    },
    // 指定のXULWindowを取得 (指定なしはブラウザウィンドウ)
    getChromeWindow: function(uri) {
        var result, win, wins, pref;
        pref = uri || 'chrome://browser/content/browser.xul';
        wins = WindowMediator.getXULWindowEnumerator(null);
        while (wins.hasMoreElements()) {
            try {
                win = wins.getNext()
                    .QueryInterface(Ci.nsIXULWindow).docShell
                    .QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIDOMWindow);
                if (win.location &&
                    win.location.href == pref || win.location == pref) {
                    result = win;
                    break;
                }
            } catch (e) {
                this.debug(e);
            }
        }
        return result;
    },
    getLocation: function() {
        var win, doc, result;
        win = this.getWindow();
        doc = this.getDocument();
        try {
            if (doc.location && doc.location.host) {
                result = doc.location;
            } else if (doc.defaultView && doc.defaultView.location) {
                result = doc.defaultView.location;
            } else if (win.location && win.location.host) {
                result = win.location;
            } else if (win.content && win.content.document &&
                       win.content.document.location) {
                result = win.content.document.location;
            } else if (win.document && win.document.location) {
                result = win.document.location;
            } else if (win.contentDocument && win.contentDocument.location) {
                result = win.contentDocument.location;
            } else {
                throw result;
            }
        } catch (e) {
            result = null;
        }
        return result || {};
    },
    // ページ読み込み時の処理
    onPageLoaded: function() {
        var self = this, win, doc, target;
        if (!this.expanding) {
            return;
        }
        try {
            win = this.getWindow();
            doc = this.getDocument();
            // body が操作できる状態になるまで待機
            if (!doc.body) {
                throw 'continue';
            }
        } catch (e) {
            callLater(1, arguments.callee);
            return;
        }
        // ここで重複を遮断
        if (this.setStoragePoint()) {
            
            target = doc.defaultView || win;
            
            // タブが閉じられるとき各プロパティを開放
            target.addEventListener('beforeunload', function() {
                var lee = arguments.callee;
                target.removeEventListener('beforeunload', lee, true);
                self.clearProps(true);
            }, true);
            
            callLater(0, function() {
                if (self.expanding) {
                    self.initLoadingCanvas();
                    self.registerNodeInserted();
                    self.searchImageNodes();
                    
                    // AutoPagerize/AutoPager用 (ページ下部で遷移して戻った時)
                    callLater(5, function() {
                        if (self.expanding) {
                            self.searchImageNodes();
                        }
                    });
                }
            });
        }
    },
    // 多重ロード防止のため現在のタブの window にプロパティを設定
    setStoragePoint: function(restore) {
        var result, doc, dd, de, id;
        doc = this.getDocument();
        result = false;
        id = this.loadedId;
        try {
            dd = doc.defaultView;
            if (!dd) {
                throw dd;
            }
            if (restore) {
                try {
                    dd[id] = null;
                    delete dd[id];
                    result = true;
                } catch (e) {
                    result = false;
                }
            } else {
                if (!(id in dd) || dd[id] !== true) {
                    dd[id] = true;
                    result = true;
                }
            }
        } catch (e) {
            try {
                de = doc.documentElement || doc.body;
                if (restore) {
                    try {
                        de.removeAttribute(id);
                        result = true;
                    } catch (e) {
                        result = false;
                    }
                } else {
                    if (de.getAttribute(id).toLowerCase() !== 'true') {
                        de.setAttribute(id, 'true');
                        result = true;
                    }
                }
            } catch (e) {
                throw new Error('The storage object is not found: ' + e);
            }
        }
        return result;
    },
    // AutoPagerize系ライブラリ対応のためのイベント
    registerNodeInserted: function() {
        var self = this, win, doc, target, uri;
        if (!this.expanding) {
            return;
        }
        win = this.getWindow();
        doc = this.getDocument();
        try {
            if (doc.defaultView && doc.defaultView.document) {
                target = doc.defaultView.document;
                uri = (target.location && target.location.host) ||
                        target.documentURI || target.URL || target.domain;
                if (uri && this.check(uri)) {
                    target = target.body || target;
                } else {
                    throw target;
                }
            } else {
                throw doc;
            }
        } catch (e) {
            this.debug(e);
            target = doc.body || doc;
        }
        callLater(0, function() {
            try {
                if (!self.expanding) {
                    throw 'disabled';
                }
                //
                // AutoPagerize: AutoPagerize_DOMNodeInserted
                // AutoPager: AutoPagerAfterInsert
                //
                // 他のライブラリを考慮して DOMNodeInserted で統一
                //
                target.addEventListener('DOMNodeInserted', function(event) {
                    if (self.expanding) {
                        callLater(0, function() {
                            if (self.expanding) {
                                self.searchImageNodes.call(self, event.target);
                            }
                        });
                    }
                }, true);
            } catch (e) {
                self.debug(e);
            }
        });
    },
    getImageSource: function(url) {
        var self = this, win, doc, xpath, src, re;
        if (!this.expanding) {
            return;
        }
        win = this.getWindow();
        doc = this.getDocument();
        re = {by: /@href[\s\S]*$/gi, to: 'img/@src'};
        xpath = pixivService.XPATH_NEXT_PAGE_HREF.replace(re.by, re.to);
        return request(url, {
            referrer: doc.URL || doc.location && doc.location.href
        }).addCallback(function(res) {
            src = $x(xpath, convertToHTMLDocument(res.responseText));
            return succeed(src);
        });
    },
    onNodeInserted: function(event) {
        var elem;
        if (this.expanding) {
            elem = event.target;
            if (this.expanding && elem && tagName(elem) === 'img' &&
                pixivService.isThumbnailPage(event)
            ) {
                this.setImageEvent(elem);
            }
        }
    },
    searchImageNodes: function(context) {
        var self = this, doc, images;
        if (this.expanding) {
            doc = this.getDocument();
            images = (context || doc).getElementsByTagName('img');
            toArray(images).forEach(function(image) {
                callLater(0, function() {
                    self.onNodeInserted.call(self, {target: image});
                });
            });
        }
    },
    // エレメントのサイズと座標を取得 (表示サイズ)
    getSizePos: function(elem) {
        var x, y, w, h, org, p;
        if ((elem.offsetParent === null ||
            (elem.offsetWidth === 0 && elem.offsetHeight === 0)) &&
            tagName(elem) !== 'body'
        ) {
            // 非表示の場合サイズが取得できないのでvisibilityを使う
            org = {
                display: elem.style.display,
                position: elem.style.position,
                visibility: elem.style.visibility
            };
            css(elem, {
                display: 'block',
                position: 'absolute',
                visibility: 'hidden'
            });
        }
        x = elem.offsetLeft   || elem.style.pixelLeft   || 0;
        y = elem.offsetTop    || elem.style.pixelTop    || 0;
        w = elem.offsetWidth  || elem.style.pixelWidth  || 0;
        h = elem.offsetHeight || elem.style.pixelHeight || 0;
        if (org) {
            // スタイルを元に戻す
            for (p in org) {
                elem.style[p] = org[p];
            }
        }
        return {
            x: x - 0,
            y: y - 0,
            width: w - 0,
            height: h - 0
        };
    },
    getResizeSize: function(orgWidth, orgHeight, maxWidth, maxHeight) {
        var result, percent, ratioX, ratioY, orgw, orgh, maxw, maxh;
        orgw = orgWidth  - 0;
        orgh = orgHeight - 0;
        maxw = maxWidth  - 0;
        maxh = maxHeight - 0;
        if (orgw > maxw) {
            ratioX = maxw / orgw * 100;
        } else {
            ratioX = 100;
        }
        if (orgh > maxh) {
            ratioY = maxh / orgh * 100;
        } else {
            ratioY = 100;
        }
        if (ratioX < ratioY) {
            percent = ratioX;
        } else if (ratioX > ratioY) {
            percent = ratioY;
        } else {
            percent = 0;
        }
        if (percent === 0) {
            result = {
                width  : orgw,
                height : orgh
            };
        } else {
            result = {
                width  : Math.round(orgw * percent / 100),
                height : Math.round(orgh * percent / 100)
            };
        }
        return result;
    },
    isVisible: function(elem) {
        return elem.style.display !== 'none';
    },
    // サムネイル用のイージング (easing animation) を実行
    toggleFadeTo: function(opts) {
        var self = this, params, before, after, li, nop;
        if (!this.expanding) {
            return;
        }
        opts = opts || {};
        before = opts.before || (function() {});
        after = opts.after || (function() {});
        opts.before = function() {
            before();
            show(opts.hide, 'block');
        };
        opts.after = function() {
            after();
            hide(opts.hide);
            show(opts.show, 'block');
            
            // サムネイル上の <li> すべての width を消すと表示がガタガタになる
            // なのでその時の対象の要素だけ設定
            nop = opts.show.parentNode;
            while (nop && tagName(nop) !== 'a') {
                nop = nop.parentNode;
            }
            li = nop.parentNode;
            if (!self.isParentNode(li)) {
                throw new Error('Illegal type of the parent node: ' + li);
            }
            try {
                if (self.isRankingPage) {
                    css(li, { width: 'auto' });
                } else {
                    css(li, { width: opts.fromSize.width + 6 });
                }
            } catch (e) {}
        };
        params = this.getFadeParams(opts);
        //callLater(0, function() {
            self.fadeTo.apply(self, params);
        //});
    },
    getFadeParams: function(opts) {
        var self, size, from, to, before, after, nop, li, simg, mimg, params;
        if (!this.expanding) {
            return;
        }
        self = this;
        opts.before = opts.before || (function() {});
        opts.after = opts.after || (function() {});
        if (stringify(opts.hide.className).indexOf(this.imageId) === -1) {
            simg = opts.hide;
            mimg = opts.show;
        } else {
            simg = opts.show;
            mimg = opts.hide;
        }
        nop = simg.parentNode;
        while (nop && tagName(nop) !== 'a') {
            nop = nop.parentNode;
        }
        li = nop.parentNode;
        if (!this.isParentNode(li)) {
            throw new Error('Illegal type of the parent node: ' + li);
        }
        if (this.isRankingPage) {
            css(li, { width: 'auto' });
        }
        
        var limit = 2000;
        // lazyloadが使われてる場合は表示が完了するまで待つ
        till(function() {
            var stop, sz;
            if (--limit <= 0) {
                stop = true;
            } else {
                sz = self.getSizePos(mimg);
                if (sz.width === 0 && sz.width === 0) {
                    stop = false;
                } else {
                    stop = true;
                }
            }
            return stop;
        });
        opts.orgSize = size = {
            s: this.getSizePos(simg),
            m: this.getSizePos(mimg)
        };
        from = {
            width: size.s.width || this.viewSize.s.width,
            height: size.s.height || this.viewSize.s.height
        };
        to = {
            width: size.m.width || this.viewSize.m.width,
            height: size.m.height || this.viewSize.m.height
        };
        if (to.width < from.width || to.height < from.height) {
            // 遅延読み込みの影響で正確に計れない時がある
            var resize = this.getResizeSize(
                mimg.naturalWidth,
                mimg.naturalHeight,
                this.viewSize.m.width,
                this.viewSize.m.height
            );
            to.width  = resize.width;
            to.height = resize.height;
            opts.orgSize.m.width  = size.m.width  = to.width;
            opts.orgSize.m.height = size.m.height = to.height;
        }
        before = function() {
            css(li, {
                width: 'auto',
                textAlign: 'left',
                position: 'relative'
            });
            if (opts.show === mimg && self.isWrappedImagePage) {
                self.fixWrappedPageLayoutBefore(li);
            }
            removeStyle(li, 'width');
            css(nop, {
                display: 'block',
                textAlign: 'left'
            });
            opts.before();
        };
        if (opts.show === simg) {
            opts.fromSize = from;
            opts.toSize = to;
            after = function() {
                css(simg, {
                    width: 'auto',
                    height: 'auto',
                    maxWidth: 'auto',
                    maxHeight: 'auto'
                });
                css(mimg, { display: 'none' });
                opts.after();
                css(mimg, {
                    width: 'auto',
                    height: 'auto',
                    maxWidth: self.viewSize.m.width,
                    maxHeight: self.viewSize.m.width
                });
                css(nop, {
                    display: 'inline',
                    textAlign: 'center'
                });
                css(li, { position: 'static' });
                removeStyle(li, 'textAlign');
                removeStyle(li, 'position');
                removeStyle(li, 'width');
                if (self.isWrappedImagePage) {
                    self.fixWrappedPageLayoutAfter(li);
                } else if (self.isStaccfeedPage) {
                    if (li.parentNode && li.parentNode.className) {
                        li.parentNode.className =
                          li.parentNode.className.replace(/_(stacc_ref_thumb_left)_/, '$1');
                    }
                    css(nop, {
                        position: ''
                    });
                }
            };
            params = [mimg, to, from, before, after];
        } else {
            opts.fromSize = to;
            opts.toSize = from;
            after = function() {
                css(mimg, {
                    width: 'auto',
                    height: 'auto',
                    maxWidth: self.viewSize.m.width,
                    maxHeight: self.viewSize.m.width
                });
                css(simg, { display: 'none' });
                opts.after();
                css(simg, {
                    width: 'auto',
                    height: 'auto',
                    maxWidth: 'auto',
                    maxHeight: 'auto'
                });
                css(nop, {
                    display: 'inline',
                    textAlign: 'center'
                });
                css(li, { position: 'static' });
                removeStyle(li, 'textAlign');
                removeStyle(li, 'position');
                if (self.isRankingPage) {
                    css(li, { width: 'auto' });
                } else if (self.isStaccfeedPage) {
                    if (li.parentNode && li.parentNode.className) {
                        li.parentNode.className =
                          li.parentNode.className.replace(/(stacc_ref_thumb_left)/, '_$1_');
                    }
                    css(nop, {
                        position: 'relative'
                    });
                }
            };
            params = [simg, from, to, before, after];
        }
        return params;
    },
    // easing fadeIn/Out
    fadeTo: function(elem, from, to, before, after) {
        var self, size, props, parse, p, t, easing,
            times, count, interval, duration, now;
        if (!this.expanding) {
            return;
        }
        self = this;
        try {
            if (inArray(this.fadings, elem) !== -1) {
                throw 'blocked';
            }
            this.fadings.push(elem);
            
            interval = 13;
            duration = 600;
            
            before = before || (function() {});
            after = after || (function() {});
            now = function() {
                return (new Date()).getTime();
            };
            parse = function(v) {
                if (v.toString().indexOf('.') === -1) {
                    t = parseInt(v);
                } else {
                    t = parseFloat(v);
                }
                return isNaN(t) ? 0 : t;
            };
            // easing sin-in-out (pos, valu-of-beginning, value-of-ending)
            easing = function(p, b, d) {
                return ((-Math.cos(p * Math.PI) / 2) + 0.5) * (d - b) + b;
            };
            emit = function(o) {
                css(elem, o.key, Math.floor(easing(o.cur, o.org, o.end)));
                return parseFloat(css(elem, o.key)) || 0;
            };
            size = {
                org: {},
                end: {},
                mov: {},
                cur: {},
                dir: {}
            };
            times = {
                pos: 0,
                now: 0,
                start: 0,
                finish: 0
            };
            prevs = {};
            props = {};
            for (p in from) {
                props[p] = false;
                size.org[p] = parse(from[p]);
                size.end[p] = parse(to[p]);
                size.cur[p] = size.org[p];
                if (size.org[p] < size.end[p]) {
                    size.dir[p] = 1;
                    size.mov[p] = size.end[p] - size.org[p];
                } else if (size.org[p] > size.end[p]) {
                    size.dir[p] = -1;
                    size.mov[p] = size.org[p] - size.end[p];
                } else {
                    size.dir[p] = 0;
                    size.mov[p] = 0;
                }
                prevs[p] = size.cur[p];
                size.mov[p] = Math.floor(
                    Math.max(1, (size.mov[p] || 1) / 20) * size.dir[p]
                );
            }
            times.start = now();
            times.finish = times.start + duration;
            count = 0;
            fade = function() {
                times.now = now();
                if (times.now > times.finish) {
                    times.pos = 1;
                } else {
                    times.pos = (times.now - times.start) / duration;
                }
                for (p in props) {
                    size.cur[p] = emit({
                        key: p,
                        cur: times.pos,
                        org: size.org[p],
                        end: size.end[p],
                        dir: duration
                    });
                }
                if (++count < 65535 && times.now <= times.finish) {
                    callLater(interval / 1000, arguments.callee);
                } else {
                    try {
                        self.fadings.splice(
                            inArray(self.fadings, elem), 1);
                    } catch (e) {}
                    after.call(self, elem);
                }
            };
            callLater(0, function() {
                before.call(self);
                fade.call(self);
            });
        } catch (e) {
            try {
                this.fadings.splice(inArray(this.fadings, elem), 1);
            } catch (e) {
                this.fadings = [];
            }
        }
    },
    createImage: function(simg) {
        var img, attrs;
        if (!this.expanding) {
            return;
        }
        // 'ui-lazy-image' を除去
        simg.removeAttribute('class');
        
        /*
        // クローンした要素を使う (やっぱやめた)
        img = simg.cloneNode(false);
        attrs = [];
        forEach(img.attributes, function(attr) {
            attrs.push(attr);
        });
        attrs.forEach(function(attr) {
            img.removeAttribute(attr.name);
        });
        */
        
        img = this.getDocument().createElement('img');
        
        
        attr(img, {
            className: this.imageId,
            style: {
                display: 'none',
                maxWidth: this.viewSize.m.width,
                maxHeight: this.viewSize.m.height
            }
        });
        this.setImageStyle(img);
        return img;
    },
    setImageStyle: function(img) {
        if (!this.expanding) {
            return;
        }
        css(img, {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#568fd9',
            MozBorderRadius: 3,
            borderRadius: 3,
            padding: 2,
            verticalAlign: 'middle',
            //cursor: 'zoom-in',
            cursor: '-moz-zoom-in'
        });
        try {
            img.style.setProperty('border-color', '#568fd9', 'important');
        } catch (e) {}
        return img;
    },
    setNopStyle: function(nop) {
        if (!this.expanding) {
            return;
        }
        css(nop, {
            //cursor: 'zoom-in',
            cursor: '-moz-zoom-in'
        });
        return nop;
    },
    onErrorLoadImage: function(loading, nop, simg, mimg) {
        var self = this, doc, errmsg;
        if (!this.expanding) {
            return;
        }
        doc = this.getDocument();
        try {
            this.loadingCanvas.stop();
            hide(loading);
            removeNode(loading);
        } catch (e) {}
        removeNode(mimg);
        css(nop, { display: 'inline' });
        errmsg = doc.createElement('div');
        attr(errmsg, {
            className: this.errorId,
            style: {
                color: '#ff6677',
                fontSize: 13,
                fontWeight: 'bold',
                padding: 10
            }
        });
        errmsg.appendChild(doc.createTextNode('Connection error!!'));
        hide(simg);
        nop.appendChild(errmsg);
        callLater(2.5, function() {
            fadeOut(errmsg, function() {
                removeNode(errmsg);
                fadeIn(simg, function() {
                    show(simg, 'block');
                });
            });
        });
    },
    startLoadingImage: function(nop, simg) {
        var self = this, doc, loading;
        if (!this.expanding) {
            return;
        }
        doc = this.getDocument();
        try {
            this.loadingCanvas.canvas.parentNode.removeChild(this.loadingCanvas.canvas);
        } catch (e) {
            // ignore
        } finally {
            this.loadingCanvas = defineLoadingCanvas();
        }
        this.initLoadingCanvas();
        loading = this.loadingCanvas.canvas;
        hide(simg);
        nop.appendChild(loading);
        show(loading);
        css(nop, { display: 'block' });
        this.loadingCanvas.draw();
        return succeed(loading);
    },
    insertImage: function(src, nop, simg, mimg, callback) {
        var self = this, doc, loading, loaded, raise, failed, d;
        var limit, onError, onLoad, onTimeLimit;
        if (!this.expanding) {
            return;
        }
        limit = 3;
        doc = this.getDocument();
        callback = callback || (function() {});
        try {
            loading = this.loadingCanvas.canvas;
            failed = false;
            loaded = false;
            raise = function() {
                failed = true;
                self.onErrorLoadImage.call(self, loading, nop, simg, mimg);
            };
            // 画像キャッシュが残ってる場合 onload の信頼性が薄いので
            // 規定秒以上経っても onload が呼ばれない場合エラーとみなす
            onTimeLimit = function() {
                if (!loaded) {
                    raise();
                }
            };
            d = callLater(this.loadTimeLimit, onTimeLimit);
            onError = function() {
                if (!self.expanding) {
                    return;
                }
                if (loaded) {
                    return;
                }
                try {
                    mimg.removeEventListener('load', onLoad, true);
                    //FIXME: about:config のキャッシュ設定値によって onerror が暴走する
                    //mimg.removeEventListener('error', onError, false);
                    d.cancel();
                } catch (er) {}
                
                if (--limit >= 0) {
                    // エラーが起きても数回は再試行する
                    mimg.removeAttribute('src');
                    removeNode(mimg);
                    
                    loaded = false;
                    failed = false;
                    d = callLater(this.loadTimeLimit, onTimeLimit);
                    
                    mimg.addEventListener('load', onLoad, true);
                    //FIXME: about:config のキャッシュ設定値によって onerror が暴走する
                    //mimg.addEventListener('error', onError, false);
                    
                    nop.insertBefore(mimg, simg);
                    callLater(0.1, function() {
                        attr(mimg, {src: src});
                    });
                } else {
                    raise();
                }
            };
            onLoad = function() {
                loaded = true;
                failed = false;
                d.cancel();
                
                // 規定秒間経ってから onload が呼ばれた場合は遅延させる
                callLater(failed ? 3.5 : 0.075, function() {
                    try {
                        self.loadingCanvas.stop();
                        hide(loading);
                        removeNode(loading);
                    } catch (e) {}
                    css(nop, { display: 'inline' });
                    show(simg, 'block');
                    callback.call(self);
                });
            };
            mimg.addEventListener('load', onLoad, true);
            //FIXME: about:config のキャッシュ設定値によって onerror が暴走する
            //mimg.addEventListener('error', onError, false);
            nop.insertBefore(mimg, simg);
            callLater(0.1, function() {
                attr(mimg, {src: src});
            });
        } catch (e) {
            this.debug(e);
        }
    },
    toggleImage: function(nop) {
        var self = this, simg, mimg, width, cn;
        if (!this.expanding) {
            return;
        }
        images = nop.getElementsByTagName('img');
        if (images.length > 1) {
            toArray(images).forEach(function(img) {
                // タイミングによって画像が重複するので除去する
                if (simg && mimg) {
                    removeNode(img);
                } else {
                    cn = img.className;
                    if (stringify(cn).indexOf(self.imageId) === -1) {
                        simg = img;
                    } else {
                        mimg = img;
                    }
                }
            });
            if (simg && mimg) {
                // まれに両方表示される時の対処 (lazyLoadの影響)
                if (this.isVisible(simg) && this.isVisible(mimg)) {
                    this.toggleFadeTo({ hide: mimg, show: simg });
                } else if (!this.isVisible(simg) && !this.isVisible(mimg)) {
                    this.toggleFadeTo({ hide: mimg, show: simg });
                } else {
                    if (this.isVisible(simg)) {
                        this.toggleFadeTo({ hide: simg, show: mimg });
                    } else {
                        this.toggleFadeTo({ hide: mimg, show: simg });
                    }
                }
            }
        }
    },
    emitImage: function(a, nop, simg) {
        var self = this, mimg, url;
        try {
            if (!this.expanding) {
                throw 'disabled';
            }
            url = pixivService.getNextPageURL({target: simg});
            if (!url) {
                throw new Error('Error: pixivService.getNextPageURL: ' + url);
            }
            if (!nop.querySelector('.' + this.imageId) &&
                !nop.querySelector('.' + this.loadingId)) {
                this.startLoadingImage(nop, simg).addCallback(function() {
                    self.getImageSource(url).addCallback(function(src) {
                        mimg = self.createImage(simg);
                        self.insertImage(src, nop, simg, mimg, function() {
                            self.toggleImage(nop);
                        });
                        return true;
                    });
                });
            } else {
                this.toggleImage(nop);
            }
        } catch (e) {
            debug(e);
            throw e;
        }
    },
    ensureBasicPageEvent: function(li, a, simg) {
        var self = this, doc, nop;
        if (!this.expanding) {
            return;
        }
        doc = this.getDocument();
        if (li && this.isParentNode(li) &&
            !li.querySelector('.' + this.nopId) &&
            !/\brank-detail\b/.test(li.className)) {

            nop = doc.createElement('a');
            attr(nop, {
                className: this.nopId,
                href: attr(a, 'href')
            });
            a.parentNode.insertBefore(nop, a);
            a.removeChild(simg);
            if (this.isBasicPage()) {
                callLater(0, function() {
                    if (self.expanding) {
                        if (trim(String(a.innerHTML)).length === 0 &&
                            trim(String(li.textContent)).length === 0) {
                            a.appendChild(doc.createTextNode('...'));
                        }
                    }
                });
            }
            nop.appendChild(simg);
            nop.addEventListener('click', function(event) {
                try {
                    event.preventDefault();
                    event.stopPropagation();
                } catch (e) {}
                callLater(0, function() {
                    if (self.expanding) {
                        self.emitImage.call(self, a, nop, simg);
                    }
                });
            }, false);
            this.setImageStyle(simg);
            this.setNopStyle(nop);
            //XXX: スクロール出すか出さないか
            css(li, {overflow : 'visible'});
            show(li, this.isStaccfeedPage ? 'inline-block' : 'inline-table');
        }
    },
    // スタックフィードページ用レイアウト調整
    fixStaccfeedPageLayoutBefore: function(first) {
        var self = this, actions;
        if (!this.expanding) {
            return;
        }
        actions = [
        {
            selector: 'post-img',
            action: function(elem) {
                css(elem, {
                    width: 'auto'
                });
            }
        }];
        actions.forEach(function(methods) {
            var node, target;
            try {
                node = first;
                while (node) {
                    target = node.querySelector(methods.selector);
                    if (target) {
                        methods.action(target);
                        break;
                    }
                    node = node.parentNode;
                }
            } catch (e) {
                self.debug(e);
            }
        });
    },
    // ランキングページ用
    // 拡大表示すると崩れるので調節
    fixRankingPageLayoutBefore: function(first) {
        var self = this, actions;
        if (!this.expanding) {
            return;
        }
        actions = [
        {
            selector: '.rank',
            action: function(elem) {
                css(elem, {
                    float: 'left',
                    position: 'static'
                });
            }
        },
        {
            selector: '.' + this.nopId,
            action: function(elem) {
                var a;
                css(elem, {
                    float: 'left',
                    position: 'static'
                });
                try {
                    a = elem.nextSibling;
                    while (a && a.nodeType != 1) {
                        a = a.nextSibling;
                    }
                    if (!a || !/image-thumbnail/.test(a.className)) {
                        a = elem.parentNode.querySelector('.image-thumbnail');
                    }
                    if (a) {
                        a.parentNode.removeChild(a);
                    }
                } catch (e) {}
            }
        },
        {
            selector: '.data',
            action: function(elem) {
                css(elem, {
                    float: 'left',
                    position: 'static',
                    marginLeft: '20px'
                });
            }
        }];
        actions.forEach(function(methods) {
            var node, target;
            try {
                node = first;
                while (node) {
                    target = node.querySelector(methods.selector);
                    if (target) {
                        methods.action(target);
                        break;
                    }
                    node = node.parentNode;
                }
            } catch (e) {
                self.debug(e);
            }
        });
    },
    // 検索系ページ用
    // <p><img/></p> となっているのを整形する
    // レイアウト調整
    fixWrappedPage: function(simg) {
        var p, pc, parent, remove = false;
        if (!this.expanding) {
            return;
        }
        if (this.isWrappedPage(simg)) {
            p = simg.parentNode;
            pc = p.cloneNode(false);
            pc.removeAttribute('style');
            if (!pc.attributes || !pc.attributes.length) {
                remove = true;
            }
            pc = null;
            if (remove) {
                parent = p.parentNode;
                p.removeChild(simg);
                parent.removeChild(p);
                parent.appendChild(simg);
            }
        }
    },
    fixWrappedPageLayoutBefore: function(li) {
        var self = this;
        if (!this.expanding) {
            return;
        }
        ['height', 'overflow'].forEach(function(prop) {
            self.wrappedPageDefaultLayout.li[prop] = li.style[prop];
        });
        css(li, {
            height: 'auto',
            overflow: 'visible'
        });
    },
    fixWrappedPageLayoutAfter: function(li) {
        if (!this.expanding) {
            return;
        }
        forEach(this.wrappedPageDefaultLayout.li, function([key, val]) {
            css(li, key, val);
        });
    },
    setImageEvent: function(simg) {
        var self = this, doc, a, parent, uri;
        if (!this.expanding) {
            return;
        }
        doc = this.getDocument();
        a = simg.parentNode;
        while (a && tagName(a) !== 'a') {
            a = a.parentNode;
        }
        if (a && a.href) {
            try {
                uri = stringify(this.getLocation().href).toLowerCase();
            } catch (e) {
                uri = '';
            }
            if (uri.indexOf('/stacc') >= 15) {
                // Staccfeed
                // http://www.pixiv.net/stacc/*
                //
                this.isStaccfeedPage = true;
                this.fixStaccfeedPageLayoutBefore(simg);
            } else if (uri.indexOf('/ranking') >= 15) {
                // Ranking
                // http://www.pixiv.net/ranking*
                //
                this.isRankingPage = true;
                this.fixRankingPageLayoutBefore(simg);
            }
            if (this.isWrappedPage(simg)) {
                //
                // <p><img/></p> となっているページ
                //
                this.isWrappedImagePage = true;
                this.fixWrappedPage(simg);
            }
            parent = a.parentNode;
            if (this.isParentNode(parent)) {
                callLater(0, function() {
                    if (self.expanding) {
                        self.ensureBasicPageEvent(parent, a, simg);
                    }
                });
            }
        }
    },
    isBasicPage: function() {
        return !this.isRankingPage && !this.isStaccfeedPage;
    },
    isWrappedPage: function(simg) {
        return simg && simg.parentNode && tagName(simg.parentNode) === 'p';
    },
    isParentNode: function(node) {
        var parents = {
            li: true,
            div: true,
            article: true
        };
        return node && (tagName(node) in parents);
    },
    debug: function(object, title) {
        if (this.debugMode) {
            setPref('debug', true);
            debug(title || arguments.callee.caller);
            debug(object);
        }
    }
});

//-----------------------------------------------------------------------------
// コンテキストメニューに登録
(function() {

var PIXIV_MENU_LABEL = ({
    ja: 'pixivサムネイルの拡大表示',
    en: 'Expand pixiv thumbnail image'
})[LANG === 'ja' && LANG || 'en'];


Tombloo.Service.actions.register({
    name: PIXIV_MENU_LABEL,
    type: 'context',
    icon: pixivService.ICON,
    
    // setPref/getPref で使うキー名
    //
    // 状態を保存/キャッシュする
    //
    // 接頭語を patches にしておく (その先頭に 'extensions.tombloo.' が付く)
    // 他のパッチと同じにならないようidをつけとく
    PREF_KEY: 'patches.polygonplanet.service.pixiv.expandthumbnail',
    
    iconCache: {
        color: null,
        gray: null
    },
    inited: false,
    init: function() {
        var self = this, pte = pixivThumbsExpander;
        if (!this.inited) {
            this.inited = true;
            pte.expanding = getPref(this.PREF_KEY) || false;
            if (pte.expanding) {
                callLater(0, function() {
                    pte.init();
                });
            }
            this.iconCache.color = new String(this.icon);
            toGrayScale(this.iconCache.color).addCallback(function(icon) {
                self.iconCache.gray = icon;
                self.changeIcon();
                return true;
            });
        }
    },
    check: function(ctx) {
        return ctx.host && ctx.host.match(pixivService.PIXIV_HOST_REGEXP);
    },
    changeIcon: function() {
        if (pixivThumbsExpander.expanding) {
            this.icon = this.iconCache.color;
        } else {
            this.icon = this.iconCache.gray;
        }
    },
    execute: function(ctx) {
        var pte = pixivThumbsExpander;
        pte.expanding = !pte.expanding;
        setPref(this.PREF_KEY, pte.expanding);
        if (pte.expanding) {
            callLater(0, function() {
                pte.init();
            });
        }
        this.changeIcon();
    }
}, '----');

// プロパティを初期化
Tombloo.Service.actions[PIXIV_MENU_LABEL].init();


})();


})();
//-----------------------------------------------------------------------------
//
// Helper functions
//
function escapeRegExp(s) {
    return stringify(s).replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
}


function trim(s) {
    return stringify(s).replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '');
}


function stringify(x) {
    var result = '';
    if (x !== null) {
        switch (typeof x) {
            case 'string':
                result = x;
                break;
            case 'xml':
            case 'number':
                result = x.toString();
                break;
            case 'boolean':
                result = x ? 1 : '';
                break;
            default:
                break;
        }
    }
    return String(result);
}


function camelize(s) {
    return stringify(s).replace(/[_-](\w)/g, function(m0, m1) {
        return m1.toUpperCase();
    });
}


// hyphen-delimited syntax
function hyphenize(s) {
    return stringify(s).replace(/([A-Z])/g, '-$1').toLowerCase();
}


function underscore(s) {
    return stringify(s).replace(/([A-Z])/g, '_$1').toLowerCase();
}


function toArray(o) {
    return Array.prototype.slice.call(o, 0);
}


function inArray(array, value, loose) {
    var exists, i = 0, len = array.length;
    do {
        exists = (loose && array[i] == value) || array[i] === value;
    } while (++i < len && !exists);
    return exists ? i - 1 : -1;
}


function pack(s, all) {
    var text = (s && s.toString && s.toString() || String(s));
    return all ? text.replace(/[\s\u3000]+/g, '') :
        text.split(/[\r\n]+/).map(function(c) {
            return c.replace(/[\u3000]/g, ' ').
                     replace(/^\s+|\s+$/g, '').
                     replace(/^(\w)/g, ' $1').
                     replace(/(\w)$/g, '$1 ');
        }).filter(function(c) {
            return c && c.length > 0;
        }).join('').replace(/\s{2,}/g, ' ');
}


function attr(elem, name, value) {
    var result, key, val, optAttr, attrs, p, y, r, css, notpx, optStyle, maps;
    notpx = /^(?:zIndex|fontWeight|opacity|zoom|lineHeight)$/;
    maps = {
        css: {
            'float': 'cssFloat',
            alpha: 'opacity'
        },
        attr: {
            'for': 'htmlFor',
            'class': 'className',
            readonly: 'readOnly',
            maxlength: 'maxLength',
            cellspacing: 'cellSpacing',
            rowspan: 'rowSpan',
            colspan: 'colSpan',
            tabindex: 'tabIndex',
            usemap: 'useMap',
            frameborder: 'frameBorder'
        }
    };
    optAttr = function(k, v) {
        r = null;
        y = k;
        if (k in maps.attr) {
            k = maps.attr[k];
        }
        if (v === undefined) {
            try {
                r = ((k in elem) && elem[k]) || elem.getAttribute(k);
            } catch (e) {}
        } else {
            try {
                elem[k] = v;
            } catch (e) {
                try {
                    elem.setAttribute(y, v);
                } catch (e) {}
            }
            r = elem;
        }
        return r;
    };
    optStyle = function(k, v) {
        r = null;
        if (k.indexOf('-') !== -1) {
            k = camelize(k);
        }
        if (k in maps.css) {
            k = maps.css[k];
        }
        if (v === undefined) {
            try {
                r = elem.style[k];
            } catch (e) {}
        } else {
            if (typeof v === 'number' && !notpx.test(k)) {
                v = v + 'px';
            }
            try {
                elem.style[k] = v;
            } catch (e) {}
            r = elem;
        }
        return r;
    };
    result = null;
    if (elem && elem.nodeType == 1) {
        if (String(name).toLowerCase() === 'style' &&
            typeof value === 'string' && isNaN(value - 0)) {
            result = optStyle(value);
        } else if (typeof name === 'string' && value === undefined) {
            result = optAttr(name);
        } else {
            if (typeof name === 'object') {
                attrs = name;
            } else {
                attrs = {};
                attrs[name] = value;
            }
            for (key in attrs) {
                val = attrs[key];
                if (typeof val === 'object' &&
                    String(key).toLowerCase() === 'style') {
                    for (p in val) {
                        optStyle(p, val[p]);
                    }
                } else {
                    optAttr(key, val);
                }
            }
            result = elem;
        }
    }
    return result;
}


function css(elem, name, value) {
    var result = null, style = {};
    if (typeof name === 'object') {
        style = name;
    } else {
        style[String(name)] = value;
    }
    if (value === undefined) {
        result = attr(elem, 'style', name);
    } else {
        result = attr(elem, {
            style: style
        });
    }
    return result;
}

// 指定のスタイルを消去(初期化)する
//FIXME: なんかうまく消せてない
function removeStyle(elem, name) {
    var c, h, p, maps = {
        'float': 'cssFloat',
        alpha: 'opacity'
    };
    if (elem && elem.nodeType == 1) {
        try {
            if (name) {
                h = hyphenize(name);
                c = camelize(name);
                [h, c, name].forEach(function(m) {
                    try {
                        elem.style.removeProperty(m);
                    } catch (e) {
                        try {
                            elem.style.removeAttribute(m);
                        } catch (e) {}
                    }
                });
                [h, c, name].forEach(function(m) {
                    try {
                        if (m in elem.style) {
                            elem.style[m] = '';
                            delete elem.style[m];
                            elem.style.removeAttribute(m);
                        }
                    } catch (e) {}
                });
            } else {
                try {
                    if (elem.style.cssText) {
                        elem.style.cssText = '';
                    }
                    elem.removeAttribute('style');
                } catch (e) {}
                
                if (elem.style) {
                    try {
                        for (p in elem.style) {
                            if (p) {
                                arguments.callee.call(this, elem, p);
                            }
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }
    return elem;
}


function hide(elem) {
    return css(elem, { display: 'none' });
}


function show(elem, type) {
    return css(elem, { display: type || '' });
}


function fadeIn(elem, speed, callback) {
    var speedMaps, fade, step;
    speedMaps = {
        slow: 0.015,
        normal: 0.025,
        fast: 0.05
    };
    fade = function(alpha) {
        alpha += step;
        css(elem, { opacity: alpha });
        if (alpha >= 0.99) {
            css(elem, { opacity: 1 });
            callback.call(elem, elem);
        } else {
            callLater(0, function() { fade(alpha) });
        }
    };
    if (typeof speed === 'function') {
        callback = speed;
        step = speedMaps.normal;
    } else if (!speed || speed <= 0) {
        step = speedMaps.normal;
    } else if (typeof speed === 'number') {
        step = speed;
    } else if (speed in speedMaps) {
        step = speedMaps[speed];
    }
    callback = callback || (function() {});
    step = Math.max(0.001, step || 0);
    css(elem, { opacity: 0 });
    show(elem);
    callLater(0, function() { fade(0) });
    return elem;
}


function fadeOut(elem, speed, callback) {
    var speedMaps, fade, step;
    speedMaps = {
        slow: 0.015,
        normal: 0.025,
        fast: 0.125
    };
    fade = function(alpha) {
        alpha -= step;
        css(elem, { opacity: alpha });
        if (alpha <= 0) {
            css(elem, { opacity: 0 });
            hide(elem);
            callback.call(elem, elem);
        } else {
            callLater(0, function() { fade(alpha) });
        }
    };
    if (typeof speed === 'function') {
        callback = speed;
        step = speedMaps.normal; 
    } else if (!speed || speed <= 0) {
        step = speedMaps.normal;
    } else if (typeof speed === 'number') {
        step = speed;
    } else if (speed in speedMaps) {
        step = speedMaps[speed];
    }
    callback = callback || (function() {});
    step = Math.max(0.001, step || 0);
    css(elem, { opacity: 1 });
    show(elem);
    callLater(0, function() { fade(1) });
    return elem;
}


function removeNode(elem) {
    try {
        removeElement(elem);
        elem.parentNode.removeChild(elem);
    } catch (e) {}
    return elem;
}


// Loading circle animation by Canvas
function defineLoadingCanvas() {

    function loadingCanvas(options) {
        return new loadingCanvas.prototype.init(options);
    }
    
    loadingCanvas.prototype = {
        constructor: loadingCanvas,
        defaultOpts: {
            target: null,
            size: 30,
            interval: 80,
            doc: document,
            hidden: false
        },
        target: null,
        size: null,
        interval: null,
        color: {
            r: 128,
            g: 128,
            b: 128,
            rgb: null
        },
        alphas: [],
        timer: null,
        canvas: null,
        ctx: null,
        sz: {},
        init: function(options) {
            var opts, doc;
            if (typeof options !== 'object') {
                options = {target: String(options)};
            }
            opts = this.extend(this.defaultOpts, options || {});
            if (opts.target) {
                if (opts.target.nodeType == 1) {
                    this.target = opts.target;
                } else if (opts.target.substring) {
                    this.target = opts.doc.querySelector(opts.target);
                }
            }
            this.size = opts.size;
            this.interval = opts.interval;
            if (!this.target || !this.size || !this.interval) {
                throw new Error('Invalid parameters on init');
            }
            this.canvas = opts.doc.createElement('canvas');
            if (opts.hidden) {
                this.canvas.style.display = 'none';
            }
            this.target.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.setSize();
            return this;
        },
        draw: function(interval) {
            var self = this, time, callback;
            time = (interval || this.interval) / 1000;
            callback = function() {
                self.drawImage();
                if (self.timer) {
                    callLater(time, callback);
                }
            };
            this.timer = true;
            callLater(time, callback);
            return this;
        },
        setSize: function () {
            this.canvas.width = this.size;
            this.canvas.height = this.size;
            this.sz = {
                r: this.size / 2,
                w: Math.round(this.size * 0.1),
                h: Math.round(this.size * 0.25)
            };
            this.ctx.setTransform(1, 0, 0, 1, this.sz.r, this.sz.r);
            return this;
        },
        drawImage: function() {
            var i, color, r, w, h;
            r = this.sz.r;
            w = this.sz.w;
            h = this.sz.h;
            this.ctx.clearRect(-r, -r, r * 2, r * 2);
            for (i = 0; i < 12; i++) {
                if (this.alphas.length < 12) {
                    this.alphas.push(i / 12);
                }
                color = [
                    'rgba(',
                    [
                        this.color.r,
                        this.color.g,
                        this.color.b,
                        this.alphas[i]
                    ].join(','),
                    ')'
                ].join('');
                this.ctx.fillStyle = color;
                this.ctx.strokeStyle = 'transparent';
                this.ctx.beginPath();
                this.ctx.moveTo(0 - w / 4, r - h);
                this.ctx.quadraticCurveTo(0, r - h - w / 2, 0 + w / 4, r - h);
                this.ctx.lineTo(0 + w / 2, r - w / 3);
                this.ctx.quadraticCurveTo(0, r + w / 3, 0 - w / 2, r - w / 3);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.rotate(30 * Math.PI / 180);
            }
            this.alphas.splice(0, 0, this.alphas[11]).pop();
            return this;
        },
        stop: function() {
            this.timer = false;
            return this;
        },
        extend: function(a, b) {
            for (var p in b) {
                a[p] = b[p];
            }
            return a;
        }
    };
    loadingCanvas.prototype.init.prototype = loadingCanvas.prototype;
    
    return loadingCanvas;
}


//-----------------------------------------------------------------------------
})();

