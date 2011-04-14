/**
 * pixiv Service - Tombloo patches
 *
 * ピクシブ用のTomblooパッチ : http://www.pixiv.net/
 *
 * - pixiv Extractor patch
 * - pixiv Bookmark patch
 *
 * 機能:
 * -------------------------------------------------------------
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
 * -------------------------------------------------------------
 *
 * @version  1.11
 * @date     2011-04-14
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
//-----------------------------------------------------------------------------
//
// ブックマークと同時に「お気に入りユーザーに追加」する場合は
// 下↓の 「PIXIV_BOOKMARK_USER」 定義を false から true に変更する
//
(function(undefined) {

// お気に入り (ユーザー) 追加の ON / OFF
const PIXIV_BOOKMARK_USER = false;

//-----------------------------------------------------------------------------
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
    
    ILLUST_PAGE_REGEXP: /^https?:\/\/(?:www\.)?pixiv\.net\/member_illust/i,
    MANGA_PAGE_REGEXP: /\b(?:mode=manga)\b/,
    PIXIV_HOST_REGEXP: /^(?:[\w-]+\.)*?pixiv\.net(?:\b|$)/,
    
    thumbnailDocument: null,
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
        var result = false, img, link, re, src, href;
        try {
            img = ctx.target;
            link = img.parentNode;
            if (img && link && img.src && link.href) {
                src = stringify(img.src);
                href = stringify(link.href);
                re = {
                    host: /\bpixiv[.]net/,
                    ext: /\.(?:jpe?g|png|gif|svg)(?:[!?#].*)?$/i,
                    illust: /\b(?:member_illust)/i,
                    mode: /\b(?:mode=medium)\b/i,
                    id: /\b(?:illust_?id)=\d+/i
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
            throw new Error('Cannot get URL');
        }
    },
    getNextPageURL: function(ctx) {
        var url, xpath, doc, base, type, patterns = {
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
        doc = this.getDocument();
        if (this.isThumbnailPage(ctx)) {
            try {
                url = ctx.target.parentNode.href;
            } catch (e) {}
        } else if (ctx && ctx.href && this.isMangaPage(ctx.href)) {
            url = ctx.href;
        } else {
            xpath = '//*[contains(@class,"works_display")]//a/@href';
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
        var page;
        try {
            page = ctx.target.src.match(/_p(\d+)[.](?:jpe?g|png|gif)$/i)[1];
        } catch (e) {
            page = 0;
        }
        return page;
    },
    getMangaFirstImage: function(text) {
        var url, re;
        re = /\b(https?:\/+.*?pixiv\.net\/[\w#!=.\/+-]*?\d+_p0\.\w+)\b/i;
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
        var url, xpath, text, re, match;
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
        xpath = '//a//img//@src';
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
                trim: /^[\s\u3000]+|[\s\u3000]+$/g,
                space: /[\s\u3000]+/g,
                clean: /[\x00-\x20*\/-]+/g,
                fix: /([*]+)[\s\u3000]*(\S)/g,
                ast: /^[*]+/
            };
            push = function(s) {
                tags.push(
                    s.trim().replace(re.ast, '').replace(re.clean, '')
                );
            };
            xpath = 'id("tag_area")//*[@id="tags"]//text()';
            text = $x(xpath, ctx.target, true);
            if (text) {
                String(text.join ? text.join('') : text || '').
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
    getDocument: function(write) {
        var doc;
        try {
            try {
                if (!write && pixivProto.thumbnailDocument) {
                    doc = pixivProto.thumbnailDocument;
                } else {
                    throw doc;
                }
            } catch (e) {
                doc = getMostRecentWindow().content.document;
            }
            doc = doc || currentDocument && currentDocument() || document;
        } catch (e) {
            doc = null;
        }
        return doc;
    },
    removeImageElement: function(image) {
        var img = image, attr = function(elem, name) {
            return stringify(elem.getAttribute(name)).toLowerCase();
        };
        setTimeout(function() {
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
                setTimeout(arguments.callee, 200);
                return;
            }
        }, 7500);
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
        img.setAttribute('style', pack(<><![CDATA[
            width: 1px;
            height: 1px;
            border: 0 none;
            padding: 0;
            margin: 0;
            display: inline;
        ]]></>));
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
            if (!pixivProto.thumbnailDocument &&
                ctx.document.location.href &&
                ctx.document.location.href !== ctx.href) {
                ctx.href = ctx.document.location.href;
            }
        } catch (e) {}
    },
    // イラストページ
    extractIllust: function(ctx, url) {
        var self = this, src, uri;
        
        // 一度キャッシュしないと取得できない (Firefox4)
        return request(url, {
            referrer: ctx.href
        }).addCallback(function(res) {
            
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
            if (pixivProto.thumbnailDocument) {
                pixivProto.thumbnailDocument = null;
                throw new Error('Unexpected recursive call');
            }
        } catch (e) {
            throw e;
        }
        return request(url, {
            referrer: ctx.href
        }).addCallback(function(res) {
            var d, uri, doc, tags, extractor;
            doc = convertToHTMLDocument(res.responseText);
            // document を置換してイラストページにいることにする
            ctx.title = doc.title || $x('//title/text()', doc) || ctx.title;
            ctx.href = url;
            ctx.target = doc;
            pixivProto.thumbnailDocument = doc;
            self.normalizeContext(ctx);
            uri = self.getNextPageURL(ctx);
            self.checkNextPageURL(uri);
            tags = self.getTags(ctx);
            extractor = self.getEachExtractor(ctx);
            try {
                d = extractor.call(self, ctx, uri).addCallback(function(data) {
                    pixivProto.thumbnailDocument = null;
                    return {
                        data: data.data,
                        src: data.src,
                        tags: tags || []
                    };
                });
            } catch (e) {
                // かならず null に戻す
                pixivProto.thumbnailDocument = null;
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
                    pixivProto.thumbnailDocument = null;
                } catch (e) {}
                return {
                    type: 'photo',
                    item: ctx.title,
                    itemUrl: src,
                    file: file,
                    tags: tags,
                    pretends: {
                        href: ctx.href,
                        doc: ctx.target,
                        title: ctx.title
                    }
                };
            });
        });
    }
};

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

/**
 * pixiv Bookmark
 *
 * Based: http://gist.github.com/318137
 */
(function() {

var pixivService = Tombloo.Service.extractors['Photo - pixiv (with *Tags)'];


models.register(update({
    name: 'pixiv Bookmark',
    ICON: pixivService.ICON,
    BASE_URL: pixivService.BASE_URL,
    ILLUST_PAGE_REGEXP: pixivService.ILLUST_PAGE_REGEXP,
    MANGA_PAGE_REGEXP: pixivService.MANGA_PAGE_REGEXP,
    PIXIV_HOST_REGEXP: pixivService.PIXIV_HOST_REGEXP,
    ILLUST_ID_REGEXP: /\b(?:illust_?id)=(\d+)/i,
    USER_ID_REGEXP: /(?:(?=\buser_?).*|\b)id=(\d+)/i,
    XPATH_BOOKMARK: pack(<><![CDATA[
        (
        //*[contains(@class, "works_illusticonsBlock")]
        //div[last()]/span/a[last() = 1][contains(@href, "bookmark_add")]
        )
            or
        (
        //*[@id = "contents"]//*[contains(@class, "works_illusticonsBlock")]
        //a[contains(@href, "bookmark_add")]
        )
            or
        (
        //*[@id = "bookmark"]//form[contains(@action, "bookmark_add")]
        )
    ]]></>),
    XPATH_BOOKMARK_ILLUST_ID: pack(<><![CDATA[
        //*[@name="illust_id" or @id="illust_id"]/@value
    ]]></>),
    XPATH_BOOKMARK_ILLUST_ID_BY_FORM: pack(<><![CDATA[
        //input[@name = "illust_id"]/@value
    ]]></>),
    XPATH_BOOKMARK_USER: pack(<><![CDATA[
        //*[@id="favorite-preference"]//form[contains(@action, "bookmark_add")]
    ]]></>),
    XPATH_BOOKMARK_USER_ID: pack(<><![CDATA[
        //*[@id="favorite-preference"]
        //input[@type="hidden"][@name="user_id"]/@value
    ]]></>),
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
                url = this.BASE_URL + 'bookmark.php';
                result = request(url).addCallback(function(res) {
                    return self.token = $x(
                        '//form[@id="f"]/input[@name="tt"]/@value',
                        convertToHTMLDocument(res.responseText)
                    );
                });
                break;
            default:
                throw new Error('Bug: Invalid token')
        }
        return result;
    },
    getAuthCookie: function() {
        //FIXME: ログイン状態の判別が出来てないかも(?)
        return getCookieString('pixiv.net', 'PHPSESSID');
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
        var i, s, v, c, a = node.getElementsByTagName('a');
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
        return node.innerHTML;
    },
    /**
     * ブックマークに追加
     */
    addBookmarkPage: function(ps, doc, addUrl) {
        var self = this, token = this.getToken(), psc = update({}, ps);
        return token.addCallback(function(token) {
            return request(addUrl, {
                sendContent: {
                    mode: 'add',
                    tt: token,
                    id: self.getIllustId(psc, doc),
                    type: 'illust',
                    restrict: 0, // 1 = 非公開, 0 = 公開
                    tag: joinText(psc.tags || [], ' '),
                    comment: joinText([psc.body, psc.description], ' ', true)
                }
            }).addCallback(function(res) {
                var uri = psc.pageUrl, curDoc = self.getDocument(psc, true);
                return request(uri, {
                    referrer: psc.referUrl || addUrl
                }).addCallback(function(response) {
                    var oldNode, newNode, html, selectors, label, found;
                    selectors = [
                        '.works_illusticonsBlock div:last-child span',
                        '#bookmark'
                    ];
                    try {
                        html = convertToHTMLDocument(response.responseText);
                        found = false;
                        selectors.forEach(function(selector) {
                            if (!found) {
                                newNode = html.querySelector(selector);
                                oldNode = curDoc.querySelector(selector);
                                if (newNode && oldNode) {
                                    found = selector;
                                }
                            }
                        });
                        if (found) {
                            //FIXME: まれにデコード未処理で返ってくる
                            label = self.fixBookmarkPageLabel(newNode);
                            oldNode.innerHTML = label || newNode.innerHTML;
                            oldNode.removeAttribute('class');
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
        if (!PIXIV_BOOKMARK_USER) {
            return succeed();
        }
        var self = this, token, psc;
        token = this.getToken();
        psc = update({}, ps);
        return token.addCallback(function(token) {
            return request(addUrl, {
                sendContent: {
                    mode: 'add',
                    tt: token,
                    type: 'user',
                    user_id: self.getUserId(psc, doc),
                    restrict: 0, // 1 = 非公開, 0 = 公開
                    left_column: 'OK'
                }
            }).addCallback(function(res) {
                var uri = psc.pageUrl, curDoc = self.getDocument(psc, true);
                return request(uri).addCallback(function(response) {
                    var oldNode, newNode, html, selector;
                    selector = '#favorite-container';
                    try {
                        html = convertToHTMLDocument(response.responseText);
                        newNode = html.querySelector(selector);
                        oldNode = curDoc.querySelector(selector);
                        if (newNode && oldNode) {
                            // イベントはコピーしないので見た目だけ
                            oldNode.innerHTML = newNode.innerHTML;
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
        doc = this.getDocument(ps),
        addUrl = this.BASE_URL + 'bookmark_add.php';
        if (doc) {
            if (this.isMangaPage(doc.URL) && doc.URL !== psc.pageUrl) {
                psc.referUrl = psc.pageUrl;
                psc.pageUrl = doc.URL;
            }
            // ブックマーク
            if (this.canBookmark(psc)) {
                result = this.addBookmarkPage(psc, doc, addUrl);
            }
            // お気に入り追加 (ユーザー)
            if (PIXIV_BOOKMARK_USER) {
                if (this.canBookmarkUser(psc)) {
                    this.addBookmarkUser(psc, doc, addUrl);
                }
            }
        }
        return maybeDeferred(result);
    }
}, AbstractSessionService));
})();

//
// Helper functions
//
function escapeRegExp(s) {
    return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
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


})();

