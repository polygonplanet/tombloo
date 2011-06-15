/**
 * Poster.Bookmark.Pot.Assort.QuickPostForm - Tombloo patches
 *
 * Postersに「Bookmark」を追加するパッチ (for QuickPostForm)
 *
 * [注意!]
 *   このスクリプトは tombloo.poster.bookmark.pot.assort.js とセットで動き
 *   tombloo/chrome/content に置かないと動作しません。
 *   このスクリプトは自動で取り込まれるため手動でDLする必要はありません。
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Poster Bookmark Pot Assort patch]
 *
 * - (機能は tombloo.poster.bookmark.pot.assort.js 参照)
 *
 * --------------------------------------------------------------------------
 *
 * @version  1.07
 * @date     2011-06-16
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
//-----------------------------------------------------------------------------
(function(global, undefined) {

// Check for Pot object
try {
    if (!Pot.isFunction(FormPanel)) {
        throw new Error('Illegal flow, this script must run in content directory');
    }
} catch (e) {
    return;
}

//-----------------------------------------------------------------------------
// Audio/Bookmarkを追加
//-----------------------------------------------------------------------------
update(FormPanel.prototype.types, {
    audio: {
        item: {
            type: 'label'
        },
        itemUrl: {
            toggle: true
        },
        tags: {
            toggle: true
        },
        description: {
            toggle: true
        }
    },
    // toggle=false で最初から編集できる状態に
    bookmark: {
        item: {
            toggle: false
        },
        itemUrl: {
            toggle: false
        },
        tags: {
            toggle: false
        },
        description: {
            toggle: false
        }
    }
});

//-----------------------------------------------------------------------------
// Replace - Object の中のコードを一部置換
//-----------------------------------------------------------------------------
(function(global) {
    // ----- TagsPanel -----
    (function() {
        override('TagsPanel', function(code) {
            var re = [
                {
                    // bookmark を対応させるため 条件文の中に入れる
                    by: bySp(<><![CDATA[
                            ( this \. suggest = \(? [\s\S]+? && )
                            ( ps \. type ===? ['"]link["'] )( \)? ;? )
                        ]]></>),
                    to: toSp(<><![CDATA[
                            $1 ($2 || ps.type === 'bookmark')$3;
                        ]]></>)
                },
                {
                    // コンテキストメニュー用のイベントを設定
                    by: bySp(<><![CDATA[
                            (
                                [{}] [()] [.] addBoth [(] function [(] [)] [{]
                                    self [.] finishLoading [()]+ ;?
                            )
                            (
                                [}] [)] ;?
                                [{}] [{}] , false [()] ;?
                            )
                            (
                                connect [()]
                            )
                        ]]></>),
                    to: toSp(<><![CDATA[
                            $1;
                            window.addEventListener('DOMContentLoaded', bind('potOnLoad', self), true);
                            $2;
                            setTimeout(function() { self.potOnLoad.call(self); }, 100);
                            $3
                        ]]></>)
                }
            ];
            re.forEach(function(item) {
                code = code.replace(item.by, item.to);
            });
            return code;
        }, {
            // おすすめタグのボタン押したとき大文字小文字を自分のタグに合わせる(ある場合)
            toggleTag: function(elmTag) {
                var used, word, tag, i, len, cand, cands;
                used = hasElementClass(elmTag, 'used');
                word = elmTag.value;
                cands = QuickPostForm.candidates ||
                        (this.elmCompletion && this.elmCompletion.candidates) || [];
                tag = word;
                len = cands.length;
                for (i = 0; i < len; i++) {
                    cand = cands[i];
                    if (cand && String(cand.value).toLowerCase() === String(word).toLowerCase()) {
                        tag = cand.value;
                        break;
                    }
                }
                if (used) {
                    removeElementClass(elmTag, 'used');
                    this.elmTextbox.removeWord(tag);
                } else {
                    addElementClass(elmTag, 'used');
                    this.elmTextbox.injectCandidate(tag, true, false);
                }
            },
            // 大文字小文字の違いでチェックボタンが切り替わらないのを防ぐ
            refreshCheck: function() {
                var self = this, tags;
                // 増えたタグを処理する
                tags = {};
                this.value.forEach(function(tag) {
                    var elmTag = self.elmTags[tag];
                    if (elmTag) {
                        addElementClass(elmTag, 'used');
                    } else {
                        items(self.elmTags).forEach(function([etag, elmTag]) {
                            if (String(tag).toLowerCase() === String(etag).toLowerCase()) {
                                addElementClass(elmTag, 'used');
                            }
                        });
                    }
                    tags[tag] = tags[String(tag).toLowerCase()] = null;
                });
                // 減ったタグを処理する
                items(self.elmTags).forEach(function([tag, elmTag]) {
                    if (!(tag in tags) && !(String(tag).toLowerCase() in tags)) {
                        removeElementClass(elmTag, 'used');
                    }
                });
            },
            // コンテキストメニューを拡張
            potMenuLoaded: false,
            potOnLoad: function() {
                var self = this, limit, start, closing, register, interval;
                if (!this.potMenuLoaded) {
                    this.potMenuLoaded = true;
                    register = function() {
                        if (self.elmTextbox) {
                            self.elmInput = document.getAnonymousElementByAttribute(self.elmTextbox, 'anonid', 'input');
                            if (self.elmInput) {
                                // コンテキストメニュー
                                self.elmContext = document.getAnonymousElementByAttribute(
                                    self.elmInput.parentNode, 'anonid', 'input-box-contextmenu');
                                self.elmContext.addEventListener('popupshowing', bind('potOnPopupShowing', self), true);
                            }
                        }
                    };
                    // XBLロード後でないと取得できない
                    if (this.elmTextbox) {
                        setTimeout(function() { register(); }, 0);
                    } else if (!this.elmTextbox && this.elmCompletion) {
                        
                        // ある程度待っても変化ない場合は処理をぬける
                        limit = 60 * 10;
                        interval = 500;
                        closing = false;
                        
                        // windowが閉じられたら待機から抜ける
                        window.addEventListener('beforeunload', function() {
                            closing = true;
                            window.removeEventListener('beforeunload', arguments.callee, true);
                        }, true);
                        
                        start = Pot.time();
                        callLater(0, function() {
                            var end = false;
                            try {
                                if (closing || Pot.time() - start > limit) {
                                    end = true;
                                } else {
                                    self.elmTextbox = self.elmCompletion.textbox;
                                    if (self.elmTextbox) {
                                        end = true;
                                    }
                                }
                             } catch (e) {
                                end = true;
                             }
                             if (end) {
                                setTimeout(function() { register(); }, 0);
                             } else {
                                setTimeout(arguments.callee, interval);
                             }
                        });
                    }
                }
            },
            // コンテキストメニューを拡張する
            potOnPopupShowing: function(event) {
                var self = this, df, desc, type = 'tags';
                desc = {
                    set value(v) {
                        return self.elmCompletion.value = Pot.StringUtil.stringify(v);
                    },
                    get value() {
                        return self.elmCompletion.value;
                    }
                };
                if (event.eventPhase == Event.AT_TARGET) {
                    if (this.customMenus) {
                        forEach(this.customMenus, removeElement);
                    }
                    this.customMenus = [];
                    df = document.createDocumentFragment();
                    (function(menus, parent) {
                        var me = arguments.callee;
                        menus.forEach(function(menu) {
                            var elmItem;
                            // checkがあれば実行結果がtrueなら通す
                            if (menu.check && !menu.check(ps, type)) {
                                return;
                            }
                            elmItem = appendMenuItem(parent, menu.name, menu.icon, !!menu.children);
                            self.customMenus.push(elmItem);
                            if (menu.execute) {
                                elmItem.addEventListener('command', function() {
                                    var d = menu.execute(self.elmCompletion, desc, self, ps, type);
                                    // 非同期処理の場合、カーソルを砂時計にする
                                    if (d instanceof Deferred) {
                                        self.elmInput.style.cursor = 'wait';
                                        d.addBoth(function() {
                                            self.elmInput.style.cursor = '';
                                        });
                                    }
                                }, true);
                            }
                            // サブメニューがあれば展開
                            if (menu.children) {
                                me(menu.children, elmItem.appendChild(document.createElement('menupopup')));
                            }
                        });
                    })(QuickPostForm.descriptionContextMenus, df);
                    self.customMenus.push(appendMenuItem(df, '----'));
                    this.elmContext.insertBefore(df, this.elmContext.firstChild);
                }
            }
        });
    })();
    // ----- EditableLabel -----
    (function() {
        override('EditableLabel', function(code) {
            var re = [
                {
                    by: bySp(<><![CDATA[
                            (window \. addEventListener [()] .*? ['"]onLoad["'] .*?)\b(?:false)\b([\s\S]*)$
                        ]]></>),
                    to: toSp(<><![CDATA[
                            $1true$2
                        ]]></>)
                }
            ];
            re.forEach(function(item) {
                code = code.replace(item.by, item.to);
            });
            return code;
        }, {
            onLoad: function() {
                // XBLロード後でないと取得できない
                this.elmInput = document.getAnonymousElementByAttribute(this.elmTextbox, 'anonid', 'input');
                // textboxはblurの発生が異常
                this.elmInput.addEventListener('blur', bind('onBlur', this), true);
                
                // コンテキストメニュー
                this.elmContext = document.getAnonymousElementByAttribute(
                    this.elmInput.parentNode, 'anonid', 'input-box-contextmenu');
                this.elmContext.addEventListener('popupshowing', bind('potOnPopupShowing', this), true);
            },
            // コンテキストメニューを拡張する
            potOnPopupShowing: function(event) {
                var self = this, df, type = 'itemUrl';
                if (event.eventPhase == Event.AT_TARGET) {
                    if (this.customMenus) {
                        forEach(this.customMenus, removeElement);
                    }
                    this.customMenus = [];
                    df = document.createDocumentFragment();
                    (function(menus, parent) {
                        var me = arguments.callee;
                        menus.forEach(function(menu) {
                            var elmItem;
                            // checkがあれば実行結果がtrueなら通す
                            if (menu.check && !menu.check(ps, type)) {
                                return;
                            }
                            elmItem = appendMenuItem(parent, menu.name, menu.icon, !!menu.children);
                            self.customMenus.push(elmItem);
                            if (menu.execute) {
                                elmItem.addEventListener('command', function() {
                                    var d = menu.execute(self.elmDescription || self.elmTextbox, self, self, ps, type);
                                    // 非同期処理の場合、カーソルを砂時計にする
                                    if (d instanceof Deferred) {
                                        self.elmInput.style.cursor = 'wait';
                                        d.addBoth(function() {
                                            self.elmInput.style.cursor = '';
                                        });
                                    }
                                }, true);
                            }
                            // サブメニューがあれば展開
                            if (menu.children) {
                                me(menu.children, elmItem.appendChild(document.createElement('menupopup')));
                            }
                        });
                    })(QuickPostForm.descriptionContextMenus, df);
                    self.customMenus.push(appendMenuItem(df, '----'));
                    this.elmContext.insertBefore(df, this.elmContext.firstChild);
                }
            }
        });
    })();
    // ----- FlexImage -----
    (function() {
        var flexImageMaxWidth = 320;
        
        override('FlexImage', function(code) {
            var re = [
                {
                    // 画像が見えないままの状態を回避
                    by: bySp(<><![CDATA[
                            (loadImage \( \w+ \) \. addCallback\b[^{}]+[{}])
                        ]]></>),
                    to: toSp(<><![CDATA[
                            $1
                            self.potFixFlexImageViewSize(self.elmImage);
                        ]]></>)
                }
            ];
            re.forEach(function(item) {
                code = code.replace(item.by, item.to);
            });
            return code;
        }, {
            // 画像が縮小されたままになるのを修正 (ぬるぬると大きくなる...)
            potFixFlexImageViewSize: function(elmImage) {
                var imageBox, max, win, prev, curHeight, orgWidth, resize, stop, dupCount, delay;
                try {
                    win = getMostRecentWindow();
                    imageBox = (elmImage || dialogPanel.formPanel.fields.itemUrl.elmImage).boxObject;
                    try {
                        max = window.screen.availHeight || window.screen.height;
                    } catch (e) {
                        max = win.screenY + win.outerHeight;
                    }
                    max = Math.floor(Math.max(600, max) * 0.85);
                    orgWidth = window.innerWidth;
                    curHeight = window.innerHeight;
                    
                    //FIXME: 完全に直ってない (ダイアログがチカチカしちゃう…)
                    flexImageMaxWidth = Math.max(flexImageMaxWidth, orgWidth);
                    if (flexImageMaxWidth > orgWidth) {
                        orgWidth = flexImageMaxWidth;
                    }
                    
                    stop = false;
                    dupCount = 0;
                    resize = function() {
                        stop = true;
                        if (curHeight < max) {
                            if (!prev || (prev && prev < imageBox.height)) {
                                stop = false;
                                prev = imageBox.height;
                                if (orgWidth !== window.innerWidth) {
                                    curHeight -= 10;
                                    window.resizeTo(orgWidth, curHeight);
                                    stop = true;
                                }
                            } else {
                                if (++dupCount < 10) {
                                    stop = false;
                                    prev = 0;
                                } else {
                                    stop = true;
                                }
                            }
                        }
                        if (!stop) {
                            curHeight += 10;
                            window.resizeTo(orgWidth, curHeight);
                            setTimeout(resize, 0);
                        }
                    };
                    // 稀にダイアログ自体が中途半端な描画で残るのを直す(たぶん環境依存)
                    // ダイアログがガクガクして気持ち悪いかもしれない…
                    delay = 1 / 100;
                    callLater(delay * 10, function() {
                        (new Deferred()).addCallback(function() {
                            window.resizeTo(orgWidth + 10, curHeight + 10);
                            return wait(delay);
                        }).addCallback(function() {
                            window.resizeTo(orgWidth, curHeight);
                            return wait(delay);
                        }).addCallback(function() {
                            window.resizeTo(orgWidth + 5, curHeight + 5);
                            return wait(delay);
                        }).addCallback(function() {
                            window.resizeTo(orgWidth, curHeight);
                            return wait(delay);
                        }).addCallback(function() {
                            if (imageBox.height < 150) {
                                callLater(delay, resize);
                            }
                        }).callback();
                    });
                } catch (e) {}
            }
        });
    })();
    // ----- DescriptionBox -----
    (function() {
        override('DescriptionBox', function(code) {
            var re = [
                {
                    by: bySp(<><![CDATA[
                            ([{({({]?[}] , true [)] ;?)( [}] [)] ;? [}]+ )$
                        ]]></>),
                    to: toSp(<><![CDATA[
                            $1;
                            self.potInitBookmarkDescriptionBox(ps);
                            $2
                        ]]></>)
                }
            ];
            re.forEach(function(item) {
                code = code.replace(item.by, item.to);
            });
            return code;
        }, {
            // ブックマークダイアログ用メソッド
            potInitBookmarkDescriptionBox: function(ps) {
                var self = this, orgHeight, i, limit = 200, interval = 50, init = function() {
                    if (typeof self.elmInput === 'undefined') {
                        if (--limit >= 0) {
                            setTimeout(init, interval);
                        }
                        return;
                    }
                    try {
                        self.onInput.call(self);
                        // スクロールバーがでない場合の対処 (リサイズで表示させる)
                        orgHeight = window.innerHeight;
                        try {
                            for (i = 0; i < 100; i += 10) {
                                window.resizeTo(window.innerWidth, orgHeight + i);
                            }
                            do {
                                window.resizeTo(window.innerWidth, orgHeight + i);
                            } while ((i -= 10) > 0);
                        } finally {
                            window.resizeTo(window.innerWidth, orgHeight);
                        }
                    } catch (e) {}
                };
                if (ps && ps.type === 'bookmark') {
                    // Bookmark はテキストボックスを固定サイズにする
                    this.maxHeight = Math.floor(QuickPostForm.dialog.bookmark.size.height * 0.3125); // 125 (400)
                    setTimeout(init, interval);
                }
            },
            // コンテキストメニューのポップアップイベントをオーバーライド
            onPopupShowing: function(event) {
                var self = this, df, type = 'description';
                if (event.eventPhase == Event.AT_TARGET) {
                    if (this.customMenus) {
                        forEach(this.customMenus, removeElement);
                    }
                    this.customMenus = [];
                    df = document.createDocumentFragment();
                    (function(menus, parent) {
                        var me = arguments.callee;
                        menus.forEach(function(menu) {
                            var elmItem;
                            // checkがあれば実行結果がtrueなら通す
                            if (menu.check && !menu.check(ps, type)) {
                                return;
                            }
                            elmItem = appendMenuItem(parent, menu.name, menu.icon, !!menu.children);
                            self.customMenus.push(elmItem);
                            if (menu.execute) {
                                elmItem.addEventListener('command', function() {
                                    var d = menu.execute(self.elmDescription, self, self, ps, type);
                                    // 非同期処理の場合、カーソルを砂時計にする
                                    if (d instanceof Deferred) {
                                        self.elmInput.style.cursor = 'wait';
                                        d.addBoth(function() {
                                            self.elmInput.style.cursor = '';
                                        });
                                    }
                                }, true);
                            }
                            // サブメニューがある場合展開
                            if (menu.children) {
                                me(menu.children, elmItem.appendChild(document.createElement('menupopup')));
                            }
                        });
                    })(QuickPostForm.descriptionContextMenus, df);
                    self.customMenus.push(appendMenuItem(df, '----'));
                    this.elmContext.insertBefore(df, this.elmContext.firstChild);
                }
            }
        });
    })();
    
    function bySp(s, p) {
        return new RegExp(s.toString().trim().replace(/\s+/g, '\\s*'), p || 'i');
    }
    
    function toSp(s) {
        return s.toString().trim();
    }
    
    function override(name, callback, extra) {
        var orgProto, orgSource, source;
        try {
            callback = callback || (function(a) { return a });
            orgProto = global[name].prototype;
            orgSource = global[name].toString();
            source = callback(orgSource);
            eval.call(global, source);
            global[name].prototype = orgProto;
            if (extra) {
                update(global[name].prototype, extra);
            }
        } catch (e) {
            throw e;
        }
    }
})(global);

// ダイアログを中央に表示 (Bookmark のみ適応)
(function() {
    window.addEventListener('load', function() {
        if (ps && ps.type === 'bookmark') {
            setTimeout(function() {
                var sw, sh, win;
                try {
                    try {
                        win = getMostRecentWindow();
                    } catch (e) {
                        win = window;
                    }
                    try {
                        sw = win.screen.availWidth  || win.screen.width;
                        sh = win.screen.availHeight || win.screen.height;
                    } catch (e) {
                        try {
                            sw = win.content.screen.availWidth  || win.content.screen.width;
                            sh = win.content.screen.availHeight || win.content.screen.height;
                        } catch (e) {}
                    }
                    sw = sw || 1200;
                    sh = sh || 900;
                    window.moveTo(
                        Math.floor((sw - (window.outerWidth  || window.innerWidth  || 400)) / 2),
                        Math.floor((sh - (window.outerHeight || window.innerHeight || 600)) / 2)
                    );
                } catch (e) {}
            }, 75);
        }
        (function() {
            // テキストボックスを拡張
            function TextBoxTrapper() {
                return this;
            }
            TextBoxTrapper.prototype = {
                loaded: false,
                type: null,
                extendContextMenu: function(type) {
                    var self = this;
                    try {
                        this.type = type;
                        this.elmTextBox = dialogPanel.formPanel.fields[type];
                    } catch (e) {}
                    if (this.elmTextBox) {
                        setTimeout(function() {
                            try {
                                setTimeout(function() {
                                    self.onLoad.call(self);
                                }, 0);
                                self.elmTextBox.addEventListener('DOMContentLoaded', bind('onLoad', self), true);
                            } catch (e) {}
                        }, 0);
                    }
                },
                onLoad: function() {
                    if (!this.loaded) {
                        this.loaded = true;
                        this.elmInput = document.getAnonymousElementByAttribute(this.elmTextBox, 'anonid', 'input');
                        if (this.elmInput) {
                            this.elmContext = document.getAnonymousElementByAttribute(
                                                this.elmInput.parentNode, 'anonid', 'input-box-contextmenu');
                            this.elmContext.addEventListener('popupshowing', bind('onPopupShowing', this), true);
                        }
                    }
                },
                // コンテキストメニューを拡張
                onPopupShowing: function(event) {
                    var self = this, df;
                    if (event.eventPhase == Event.AT_TARGET) {
                        if (this.customMenus) {
                            forEach(this.customMenus, removeElement);
                        }
                        this.customMenus = [];
                        df = document.createDocumentFragment();
                        (function(menus, parent) {
                            var me = arguments.callee;
                            menus.forEach(function(menu) {
                                var elmItem;
                                // checkがあれば実行結果がtrueなら通す
                                if (menu.check && !menu.check(ps, self.type)) {
                                    return;
                                }
                                elmItem = appendMenuItem(parent, menu.name, menu.icon, !!menu.children);
                                self.customMenus.push(elmItem);
                                if (menu.execute) {
                                    elmItem.addEventListener('command', function() {
                                        var d = menu.execute(self.elmTextBox, self.elmTextBox, self, ps, self.type);
                                        // 非同期処理の場合、カーソルを砂時計にする
                                        if (d instanceof Deferred) {
                                            self.elmInput.style.cursor = 'wait';
                                            d.addBoth(function() {
                                               self.elmInput.style.cursor = '';
                                            });
                                        }
                                    }, true);
                                }
                                // サブメニューがあれば展開
                                if (menu.children) {
                                    me(menu.children, elmItem.appendChild(document.createElement('menupopup')));
                                }
                            });
                        })(QuickPostForm.descriptionContextMenus, df);
                        self.customMenus.push(appendMenuItem(df, '----'));
                        this.elmContext.insertBefore(df, this.elmContext.firstChild);
                    }
                }
            };
            // 各要素に適応
            setTimeout(function() {
                try {
                    'item itemUrl body tags description'.split(' ').forEach(function(type) {
                        var trapper = new TextBoxTrapper();
                        trapper.extendContextMenu(type);
                    });
                } catch (e) {}
            }, 75);
        })();
    }, true);
})();


})(this);

