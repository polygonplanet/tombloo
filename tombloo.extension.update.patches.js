/**
 * Extension.Update.Patches - Tombloo patches
 *
 * インストール済みのパッチすべてを一括でアップデートできるパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Extension Update Patches patch]
 *
 * - インストールされている各パッチを一括でアップデートする
 *
 * --------------------------------------------------------------------------
 * ↓のように updateURL を記述すると自動認識される
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.update.patches.js
 *
 *
 * @version    1.01
 * @date       2011-07-29
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {

// コメントエリアを取得する最大サイズ
const SCRIPT_DOCCOMMENT_SIZE = 1024 * 5;

// アップデート用のメタ(updateURL)正規表現パターン (Scriptish準拠)
const UPDATE_PATTERNS = {
    uri     : /@(?:update(?:UR[IL]|)|ur[il])[\u0009\u0020]+(https?:\/+[-_.!~*'()a-z0-9;\/?:@&=+$,%#]+)/i,
    uris    : [
        /(?:@updateUR[IL]\b|\bupdateUR[IL][\u0009\u0020]*:)[\u0009\u0020]+(https?:\/+[-_.!~*'()a-z0-9;\/?:@&=+$,%#]+)/i,
        /(?:@(?:update|raw|ur[il])(?:ur[il]|)\b|\b(?:update|raw|ur[il])(?:ur[il]|)[\u0009\u0020]*:)[\u0009\u0020]+(https?:\/+[-_.!~*'()a-z0-9;\/?:@&=+$,%#]+)/i
    ],
    version : /(?:@version\b|\bversion[\u0009\u0020]*:)[\u0009\u0020]+(\S+)/i
};

// あらかじめ設定できそうなupdateURL (初期起動時のみ適応)
const BASE_UPDATE_URLS = {
    'model.gplus.js'                              : 'https://github.com/YungSang/Scripts-for-Tombloo/raw/master/model.gplus.js',
    'tombloo.extension.twitter.enclose.js'        : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.twitter.enclose.js',
    'tombloo.extension.update.patches.js'         : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.update.patches.js',
    'tombloo.model.evernote.relogin.js'           : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.evernote.relogin.js',
    'tombloo.model.googleplus.circle.js'          : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.googleplus.circle.js',
    'tombloo.model.googlereader.quickadd.js'      : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.googlereader.quickadd.js',
    'tombloo.poster.bookmark.pot.assort.js'       : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.poster.bookmark.pot.assort.js',
    'tombloo.service.actions.installpatch.fix.js' : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.installpatch.fix.js',
    'tombloo.service.pixiv.js'                    : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.pixiv.js',
    'tombloo.service.post.notify.js'              : 'https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.post.notify.js'
};

// 自分のファイル名など (ソート用)
const MOVE_TO_ENDS = {
    'tombloo.poster.bookmark.pot.assort.js' : -1,
    'tombloo.extension.update.patches.js'   :  0
};

// 特殊なパッチ
var SPECIAL_PATCHES = {
    'tombloo.poster.bookmark.pot.assort.js' : {
        name : 'bookmark.pot.assort',
        update : function(item) {
            if (typeof Pot !== 'undefined' && Pot.SetupUtil) {
                Pot.callLazy(function() {
                    Pot.SetupUtil.autoUpdaterUserCanceled = false;
                    Pot.SetupUtil.isUpdatable(true);
                });
            }
        },
        canceled : function() {
            return !!(Pot.SetupUtil.setupCanceled);
        },
        completed : function() {
            return !!(Pot.SetupUtil.setupCompleted);
        }
    }
};


// Define language
const LANG = (function(n) {
    return ((n && (n.language || n.userLanguage || n.browserLanguage ||
           n.systemLanguage)) || 'en').split('-').shift().toLowerCase();
})(navigator);


// メニューのラベル
const MENU_LABEL = ({
    ja: 'パッチの一括アップデート',
    en: 'Update all of the patches'
})[LANG === 'ja' && LANG || 'en'];


// コンテキストメニューに登録
Tombloo.Service.actions.register({
    name: MENU_LABEL,
    type: 'context,menu',
    // icon: http://www.famfamfam.com/
    icon: strip(<>
        data:image/png;base64,
        iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
        U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAALtSURBVBgZTcFLaFxVAIDh/5577jwzj0wS
        UmqMtKIiBltbbJ1FUCxVoQu3FrHGVRU3BVcKrkTcKOhCUOtOAyJ23WIQtFawpoooZWKJpnbsNJN5
        PzP3PO5xArPo93nOOfasXCgfAz48mE8UhzpiqCN0FLFrog7QA+qABVpAA/gC+FYyERlz/NC+qeIb
        T85xt4GKckMV5Voju6A09ELLzXqfi38PTgLnJBORMfPZmMeectsSeB7SA19CPBAsxgW+EAQ+PLaQ
        ZH8uXTj/S+UDwYTVOitxmAh6yqOjoR1CZwSdETR2Yadv2fPm6i2KB9IszQZzkgkVmvnLZcuP21Ve
        O1rgs+tdAu1YOZxlKiHw8fA9iADPdvn5nxa/3epUBGOH39sqjETu2UJG4oUwDB2RcmRSHuevdtjp
        WgZhxEBH4KDaDflobbNrlVoRh97demHpgfTth+5J5ZpNw5kjWQxw6mCa7aYlk4bPr7X54XqfkfGI
        HNjAYpQ6cOH1x9fEw/cnP13M+Ik7bc3ZYxniMR9PQCElObmYptox7E97XK0MscbhHJgwxKrQMiZ+
        v9Y9u3knHBUCn08ut6m2DQJHe6C5WOqQl4KbVcXR2QSxwENbS38wNEapLmNi4/0Hv/r3zxvHN0p1
        YnGP1e/r4ODr9TbZlKBTU7xSnKG4lCUZQKMfYkJVvfT2c44xyVjKr6lpEUI3g3UOPIE1lu6O5aUT
        cyRjPjhISUGttYtVYYUJuXxudRZ4p/jIvZx+eoHvSopmz/Ly8jyJwBFIkD7EfMimYLM8xChVZUJa
        pU4Ap34tbdHalfRDh7aOUHsoE2FsROQchVyOV5/Zx3ZjiFWqxoS0Wh95/qlHk2+9+AR3sw60dSgD
        OPj4UoVUAL3+EKt1gwlptd7arnf4cq1EfipJPpsgn46TS8fJpGLEY4K4FJxenicuodbsYbX+jwkZ
        GfPNlfWNhSvrG/cBM8AMMA1MA7lELAgSiYBsOkk+m+KPv8o3gJ+Y+B9yFXCQeyJWrQAAAABJRU5E
        rkJggg==
    </>),
    check: function(ctx) {
        return true;
    },
    execute: function(ctx) {
        let params = {
            SCRIPT_DOCCOMMENT_SIZE : SCRIPT_DOCCOMMENT_SIZE,
            UPDATE_PATTERNS        : UPDATE_PATTERNS,
            MOVE_TO_ENDS           : MOVE_TO_ENDS,
            SPECIAL_PATCHES        : SPECIAL_PATCHES,
            extendUpdateURL        : extendUpdateURL,
            potUpdatePatchUtil     : definePotUpdatePatchUtil()
        };
        openDialog(
            generateXUL(),
            'chrome,resizable,centerscreen,minimizable',
            params
        );
    }
}, '----');

// 区切り線を登録
Tombloo.Service.actions.register({
    name: '----',
    type: 'context,menu'
}, MENU_LABEL);


// XULを動的生成 (キャッシュはしない)
function generateXUL() {
    let head, template, script, code, labels;
    labels = {
        template : {
            '{TITLE}' : {
                ja : 'Tombloo - ' + MENU_LABEL,
                en : 'Tombloo - ' + MENU_LABEL
            },
            '{DESCRIPTION}' : {
                ja : '列をダブルクリックすることでアップデートURLを編集できます',
                en : 'You can edit the URL for update by double-clicking the column.'
            },
            '{BUTTON_UPDATE_CONFIRM}' : {
                ja : '更新を確認',
                en : 'Confirm update'
            },
            '{TIP_BUTTON_UPDATE}' : {
                ja : '更新を確認',
                en : 'Confirm update'
            },
            '{BUTTON_UPDATE_FINISH}' : {
                ja : 'アップデートを実行',
                en : 'Update'
            },
            '{TIP_BUTTON_UPDATE_FINISH}' : {
                ja : 'アップデートを実行',
                en : 'Update'
            },
            '{BUTTON_UPDATE_END}' : {
                ja : '閉じる',
                en : 'Close'
            },
            '{TIP_BUTTON_UPDATE_END}' : {
                ja : '閉じる',
                en : 'Close'
            }
        },
        script : {
            '{TIP_OPEN_IN_EDITOR}' : {
                ja : 'エディタで開く(ローカル)',
                en : 'Open in editor (Local)'
            },
            '{TIP_VIEW_IN_EDITOR}' : {
                ja : '最新のパッチを見る(リモート)',
                en : 'View latest source of the patch (Remote)'
            },
            '{TIP_SEARCH_GOOGLE}' : {
                ja : 'パッチのアップデート(raw)URLをGoogleで検索',
                en : 'Search the update(raw) URL by Google'
            },
            '{UPDATE_PROCESS_SKIP}' : {
                ja : '-- スキップ: ソースコードが取得できないかURIが不正です',
                en : '-- Skip: Unknown protocol, or it cannot get source code.'
            },
            '{UPDATE_PROCESS_SKIP_LATEST}' : {
                ja : '-- スキップ: 最新です',
                en : '-- Skip: The latest one.'
            },
            '{UPDATE_PROCESS_SUCCESS}' : {
                ja : '-- アップデート: 最新バージョンに更新できます',
                en : '-- Update: It can update to the latest version.'
            },
            '{UPDATE_PROCESS_SUCCESS_MAYBE}' : {
                ja : '-- アップデート: 最新ぽいものに更新できます(要確認)',
                en : '-- Update: It is maybe the latest version. Check script source.'
            },
            '{UPDATE_PROCESS_SUCCESS_SHOULD_CHECK}' : {
                ja : '-- アップデート: 更新できます(不明なバージョンなので要確認)',
                en : '-- Update: It is unknown different version. Should check script source.'
            },
            '{UPDATE_PROCESS_ERROR_SOURCE}' : {
                ja : '-- エラー: 不正なソースコードです',
                en : '-- Error: Illegal script source.'
            },
            '{UPDATE_PROCESS_ERROR_EXTENSION}' : {
                ja : '-- エラー: 不正な拡張子です',
                en : '-- Error: Invalid file extension.'
            },
            '{UPDATE_PROCESS_ERROR_UNKNOWN}' : {
                ja : '-- エラー: 不明なエラー',
                en : '-- Error: Unknown error.'
            },
            '{NOTES_UPDATES_FOUND}' : {
                ja : '個の更新が見つかりました',
                en : 'updates were found.'
            },
            '{NOTES_UPDATE_NOT_FOUND}' : {
                ja : '更新は見つかりませんでした',
                en : 'The update was not found.'
            },
            '{NOTES_UPDATES_FOUND_SUB}' : {
                ja : 'チェックしたパッチが適応されます',
                en : 'Check to update patches.'
            },
            '{NOTES_UPDATE_FINISH}' : {
                ja : 'すべてのアップデートが完了しました',
                en : 'Completed all updates.'
            },
            '{NOTES_UPDATED COUNT}' : {
                ja : '個の更新',
                en : 'updates'
            },
            '{EXTRA_UPDATE_END}' : {
                ja : '閉じる',
                en : 'Close'
            }
        }
    };
    head = 'data:application/vnd.mozilla.xul+xml;charset=utf-8,';
    template = trim(<><![CDATA[
        <?xml version="1.0" encoding="utf-8"?>
        <?xml-stylesheet type="text/css" href="chrome://global/skin/"?>
        <?xml-stylesheet type="text/css" href="data:text/css,
        window, dialog {
            margin: 0.7em 0.5em;
            max-height: 580px;
        }
        button {
            cursor: pointer;
            margin-top: 0.7em;
            padding: 0.5em 0;
        }
        richlistitem {
            border: 1px dotted #666;
            border-width: 0 0 1px 0;
            padding: 0.4em 0.6em;
        }
        richlistitem:last-child {
            border-color: transparent;
        }
        .button-icon {
            margin-right: 0.5em;
        }
        #submit-button {
            font-weight: bold;
            padding: 0.5em 0.7em 0.5em 0.4em;
        }
        .loading-image {
            max-width: 16px;
            max-height: 16px;
        }
        .open-in-editor, .view-in-editor, .search-by-google {
            cursor: pointer;
            max-width: 16px;
            max-height: 16px;
            margin-top: 0.2em;
            margin-bottom: 0.2em;
            opacity: 0.75;
        }
        .open-in-editor:hover, .view-in-editor:hover, .search-by-google:hover {
            opacity: 1;
        }
        .open-in-editor-box {
            margin-left: 0.5em;
            margin-right: 0.5em;
        }
        .search-by-google-box {
            margin-right: 0.5em;
        }
        .url-input-box {
            min-width: 300px;
            min-height: 13px;
        }
        #scripts {
            min-width: 400px;
        }
        .update-status {
            font-weight: bold;
            color: #669966;
        }
        .update-error {
            color: #ff6688;
        }
        .update-success {
            color: #8866ff;
        }
        #x-update-status {
            display: none;
        }
        #update-finish-notes, #update-finish-button {
            font-weight: bold;
        }
        "?>
        <dialog id="update-patches-dialog" title="{TITLE}" buttons=","
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:html="http://www.w3.org/1999/xhtml">
            <hbox flex="1">
                <vbox flex="1">
                    <label id="x-update-status" value="init" style="display: none;"/>
                    <vbox id="richlist-box" flex="1">
                        <label id="richlist-description" value="{DESCRIPTION}"/>
                        <spacer height="5"/>
                        <richlistbox id="scripts" seltype="single" rows="6" flex="1"/>
                    </vbox>
                    <vbox id="progress-box" flex="1" style="display: none;">
                        <progressmeter id="progress-bar" mode="determined" value="0"/>
                        <spacer height="5"/>
                        <label id="progress-status" value="..."/>
                    </vbox>
                    <spacer height="5"/>
                    <button id="update-button" label="{BUTTON_UPDATE_CONFIRM}" flex="1"
                            tooltiptext="{TIP_BUTTON_UPDATE}"/>
                    <box id="update-finish-box" flex="1" style="display: none;">
                        <vbox flex="1">
                            <spacer height="5"/>
                            <hbox flex="1" align="start">
                                <label id="update-finish-notes"/>
                            </hbox>
                            <hbox flex="1" align="end">
                                <label id="update-finish-notes-sub"/>
                            </hbox>
                        </vbox>
                        <vbox flex="1">
                            <spacer height="5"/>
                            <button id="update-finish-button"
                                    label="{BUTTON_UPDATE_FINISH}" flex="1"
                                    tooltiptext="{TIP_BUTTON_UPDATE_FINISH}"/>
                        </vbox>
                    </box>
                    <box id="update-end-box" flex="1" style="display: none;">
                        <vbox flex="1">
                            <spacer height="5"/>
                            <hbox flex="1" align="start">
                                <label id="update-end-notes"/>
                            </hbox>
                            <hbox flex="1" align="end">
                                <label id="update-end-notes-count"/>
                            </hbox>
                        </vbox>
                        <vbox flex="1">
                            <spacer height="5"/>
                            <button id="update-end-button"
                                    label="{BUTTON_UPDATE_END}" flex="1"
                                    tooltiptext="{TIP_BUTTON_UPDATE_END}"/>
                        </vbox>
                    </box>
                </vbox>
            </hbox>
            <script type="application/javascript;version=1.7">{SCRIPT}</script>
        </dialog>
    ]]></>.toString());
    
    script = <><![CDATA[
        let env, args, updateUrls, patches, listScripts, icons, updateItems = [];
        args = arguments[0];
        env = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
        env.extend(this, env, false);
        'checkbox label textbox image richlistitem box hbox vbox'.split(' ').forEach(function(tag) {
            this[tag.toUpperCase()] = bind(E, null, tag);
        });
        (function() {
            try {
                updateUrls = JSON.parse(args.potUpdatePatchUtil.getPref('urls'));
            } catch (e) {
                updateUrls = {};
            }
            args.extendUpdateURL(updateUrls);
        })();
        patches = (function() {
            const ENDS = args.MOVE_TO_ENDS;
            let r = [], b = [], p, pts = getScriptFiles(getPatchDir()), i, len = pts.length;
            for (i = 0; i < len; i++) {
                p = pts[i];
                if (p && p.leafName) {
                    if (p.leafName in ENDS) {
                        b.push(p);
                    } else {
                        r.push(p);
                    }
                }
            }
            if (b && b.length) {
                b.sort(function(x, o) {
                    return  ENDS[x] > ENDS[o] ? -1 :
                            ENDS[x] < ENDS[o] ?  1 : 0;
                });
                r = r.concat(b);
            }
            return r;
        })();
        icons = {
            loading : '{ICON_LOADING}',
            edit    : '{ICON_EDIT}',
            view    : '{ICON_VIEW}',
            search  : '{ICON_SEARCH}',
            empty   : 'chrome://tombloo/skin/empty.png',
            pass    : 'chrome://tombloo/skin/enabled.png',
            checked : 'chrome://tombloo/skin/default.png',
            failed  : 'chrome://tombloo/skin/cross.png'
        };
        window.addEventListener('load', init, true);
        window.addEventListener('beforeunload', save, true);
        
        function init() {
            // パッチ一覧となるリストアイテムを作成
            listScripts = byId('scripts');
            withDocument(document, function() {
                patches.forEach(function(patch) {
                    let item, check, icon, name, vbox1, vbox2, vbox3, vbox4, vbox5;
                    let edit, view, search, url, hbox1, hbox2, hbox3, hbox4, input;
                    let trappers = {
                        dblclick: function(event) {
                            let triggers;
                            if (byId('x-update-status').value !== 'init') {
                                return;
                            }
                            triggers = {
                                blur: function() {
                                    url.value = input.value;
                                    url.style.display = '';
                                    input.parentNode.removeChild(input);
                                    input = null;
                                    view.style.display = url.value ? '' : 'none';
                                },
                                keypress: function(ev) {
                                    if (ev.keyCode == KeyEvent.DOM_VK_RETURN) {
                                        cancel(ev);
                                        triggers.blur();
                                    }
                                }
                            };
                            withDocument(document, function() {
                                input = TEXTBOX({
                                    flex      : 1,
                                    class     : 'url-input-box',
                                    value     : url.value,
                                    multiline : false,
                                    style     : ['width: ', 'px'].join(parseInt(
                                        listScripts.boxObject && listScripts.boxObject.width ||
                                        listScripts.clientWidth || 500) - 140
                                    )
                                });
                                url.parentNode.insertBefore(input, url);
                                url.style.display = 'none';
                                view.style.display = 'none';
                                input.addEventListener('blur', triggers.blur, true);
                                input.addEventListener('keypress', triggers.keypress, true);
                                input.focus();
                            });
                        }
                    };
                    item = RICHLISTITEM({
                        value : patch.path
                    });
                    check = CHECKBOX({
                        class   : 'update-check',
                        checked : false
                    });
                    icon = IMAGE({
                        src    : icons.empty,
                        class  : 'loading-image',
                        pack   : 'center',
                        align  : 'center'
                    });
                    edit = IMAGE({
                        src         : icons.edit,
                        tooltiptext : '{TIP_OPEN_IN_EDITOR}',
                        class       : 'open-in-editor',
                        pack        : 'center',
                        align       : 'center'
                    });
                    view = IMAGE({
                        src         : icons.view,
                        tooltiptext : '{TIP_VIEW_IN_EDITOR}',
                        class       : 'view-in-editor',
                        pack        : 'center',
                        align       : 'center'
                    });
                    search = IMAGE({
                        src         : icons.search,
                        tooltiptext : '{TIP_SEARCH_GOOGLE}',
                        class       : 'search-by-google',
                        pack        : 'center',
                        align       : 'center'
                    });
                    edit.addEventListener('click', function(event) {
                        openInEditor(item.value);
                    }, true);
                    view.addEventListener('click', function(event) {
                        if (url && url.value) {
                            openRemoteFileInEditor(url.value, listScripts);
                        }
                    }, true);
                    search.addEventListener('click', function(event) {
                        addTab([
                            'http://www.google.co.jp/search?q=',
                            '&ie=utf-8&oe=utf-8&aq=t&rls=firefox.tombloo&hl=ja'
                        ].join(encodeURIComponent(name.value)));
                    }, true);
                    name = LABEL({
                        value : patch.leafName
                    });
                    url = LABEL({
                        class : 'update-url-static',
                        value : getUpdateURL(patch.path)
                    });
                    status = LABEL({
                        class : 'update-status',
                        style : 'display: none'
                    });
                    hbox1 = HBOX({});
                    hbox2 = HBOX({});
                    hbox3 = HBOX({});
                    hbox4 = HBOX({
                        class : 'update-status-box',
                        style : 'display: none'
                    });
                    vbox1 = VBOX({
                        pack  : 'center',
                        align : 'center',
                        class : 'update-check-box',
                        style : 'display: none'
                    });
                    vbox2 = VBOX({
                        pack  : 'center',
                        align : 'center'
                    });
                    vbox3 = VBOX({
                        pack  : 'center',
                        align : 'center',
                        class : 'open-in-editor-box'
                    });
                    vbox4 = VBOX({
                        pack  : 'center',
                        align : 'center',
                        class : 'search-by-google-box'
                    });
                    vbox5 = VBOX({
                        flex : 1
                    });
                    [[vbox1, check  ], [ hbox1, vbox1  ], [ vbox2, icon   ],
                    [ hbox1, vbox2  ], [ vbox3, edit   ], [ vbox3, view   ],
                    [ hbox1, vbox3  ], [ vbox4, search ], [ hbox1, vbox4  ],
                    [ hbox2, name   ], [ hbox3, url    ], [ hbox4, status ],
                    [ vbox5, hbox2  ], [ vbox5, hbox3  ], [ vbox5, hbox4  ],
                    [ hbox1, vbox5  ], [ item,  hbox1  ]].forEach(function(a) {
                        a[0].appendChild(a[1]);
                    });
                    item.addEventListener('dblclick', trappers.dblclick, true);
                    listScripts.appendChild(item);
                    callLater(0.5, function() {
                        view.style.display = url.value ? '' : 'none';
                    });
                });
            });
            // F2, Enter で編集できるようにする
            listScripts.addEventListener('keypress', function(event) {
                let target = event.target;
                if (byId('x-update-status').value === 'init' && tagName(target) === 'richlistbox') {
                    switch (event.keyCode) {
                        case KeyEvent.DOM_VK_F2:
                        case KeyEvent.DOM_VK_RETURN:
                        case KeyEvent.DOM_VK_BACK_SPACE:
                            if (!target.querySelector('.url-input-box')) {
                                cancel(event);
                                fireMouseEvent(target.selectedItem, 'dblclick');
                            }
                            break;
                        default:
                            break;
                    }
                }
            }, true);
            
            ['update-button', 'update-finish-button'].forEach(function(id) {
                byId(id).addEventListener('click', function() {
                    callLater(0, function() { updateScripts(); });
                }, true);
            });
            
            byId('update-end-button').addEventListener('click', function() {
                saveAndClose();
            }, true);
        }
        
        function updateScripts() {
            let result;
            switch (byId('x-update-status').value) {
                case 'init':
                    result = updateScriptsAll();
                    break;
                case 'finish':
                    result = updateScriptsAllFinish();
                    break;
                case 'close':
                    saveAndClose();
                    break;
                default:
                    break;
            }
            return result;
        }
        
        function updateScriptsAll() {
            let d, expr, isURI, updateCount = 0;
            if (byId('x-update-status').value !== 'init') {
                return;
            }
            expr = 'richlistitem[value]';
            isURI = /^https?:\/+[-_.!~*'()a-z0-9;\/?:@&=+$,%#]+$/i;
            updateItems = [];
            d = new Deferred();
            d.addCallback(function() {
                byId('update-button').style.display = 'none';
                byId('richlist-description').style.display = 'none';
            });
            toArray(listScripts.querySelectorAll(expr)).forEach(function(item, index) {
                let icon, org, updateUrl, status, statusBox, setStatus;
                try {
                    updateUrl = item.querySelector('.update-url-static').value ||
                                item.querySelector('.url-input-box').value;
                } catch (e) {}
                icon = item.querySelector('.loading-image');
                org = {
                    path    : item.value,
                    source  : getContents(item.value),
                    version : getCurrentVersion(item.value)
                };
                setStatus = function(msg) {
                    icon.src = icons.pass;
                    if (msg) {
                        status.value = msg;
                    }
                };
                update(setStatus, {
                    error: function(msg) {
                        icon.src = icons.failed;
                        if (msg) {
                            status.value = msg;
                        }
                        if (!/\bupdate-error\b/.test(status.className)) {
                            status.className = [
                                String(status.className || '').trim(),
                                'update-error'
                            ].join(' ').trim();
                        }
                    },
                    success: function(msg, version) {
                        let check;
                        updateCount++;
                        updateItems.push({
                            index : index,
                            item  : item,
                            org: {
                                uri     : org.path,
                                version : org.version
                            },
                            cur: {
                                uri     : updateUrl,
                                version : version
                            }
                        });
                        icon.src = icons.checked;
                        check = item.querySelector('.update-check');
                        check.style.display = '';
                        check.className = [
                            String(check.className || '').trim(),
                            'x-check-' + index
                        ].join(' ').trim();
                        check.setAttribute('checked', false);
                        if (msg) {
                            status.value = msg;
                        }
                        if (!/\bupdate-success\b/.test(status.className)) {
                            status.className = [
                                String(status.className || '').trim(),
                                'update-success'
                            ].join(' ').trim();
                        }
                    },
                    isSuccess: function() {
                        return /\bupdate-success\b/.test(status.className);
                    }
                });
                statusBox = item.querySelector('.update-status-box');
                status = item.querySelector('.update-status');
                d.addCallback(function() {
                    icon.src = icons.loading;
                    statusBox.style.display = '';
                    status.style.display = '';
                    return wait(0.15);
                }).addCallback(function() {
                    let dd, fileName;
                    if (!isURI.test(updateUrl)) {
                        setStatus('{UPDATE_PROCESS_SKIP}');
                        dd = succeed();
                    } else {
                        fileName = String(updateUrl).replace(/[#?].*$/g, '');
                        if (fileName.split('.').pop().toLowerCase() === 'js' ||
                            String(createURI(updateUrl).fileExtension).toLowerCase() === 'js'
                        ) {
                            dd = request(updateUrl).addCallbacks(function(res) {
                                let version, text, type, head, ok = false;
                                try {
                                    text = String(res.responseText || '');
                                    type = String(res.channel && res.channel.contentType || '');
                                    try {
                                        text = text.convertToUnicode();
                                    } catch (er) {}
                                    if (!text) {
                                        throw text;
                                    }
                                    if (type && /script|plain/i.test(type) || !/^\s*<[^>]*>/.test(text)) {
                                        ok = true;
                                    }
                                } catch (e) {
                                    ok = false;
                                }
                                if (ok) {
                                    head = text.slice(0, args.SCRIPT_DOCCOMMENT_SIZE);
                                    if (org.version && args.UPDATE_PATTERNS.version.test(head) &&
                                        (version = head.match(args.UPDATE_PATTERNS.version)[1]) &&
                                        compareVersions(version, org.version) > 0
                                    ) {
                                        setStatus.success('{UPDATE_PROCESS_SUCCESS}', version);
                                    } else if (org.source !== text) {
                                        if (org.source.length < text.length ||
                                            countChars(org.source) < countChars(text)
                                        ) {
                                            // ファイルサイズ/使われてる文字のByteコード数で比較
                                            //XXX: Last-Modified, Date, Expires などのヘッダを信頼するかどうか
                                            setStatus.success('{UPDATE_PROCESS_SUCCESS_MAYBE}', version);
                                        } else {
                                            // あいまいでバージョン不明だけど中身が違う
                                            setStatus.success('{UPDATE_PROCESS_SUCCESS_SHOULD_CHECK}', version);
                                        }
                                    } else {
                                        setStatus('{UPDATE_PROCESS_SKIP_LATEST}');
                                    }
                                } else {
                                    setStatus.error('{UPDATE_PROCESS_ERROR_SOURCE}');
                                }
                            }, function(err) {
                                setStatus.error([
                                    '{UPDATE_PROCESS_ERROR_UNKNOWN}',
                                    String(extractErrorMessage(err))
                                ].join('/'));
                            });
                        } else {
                            setStatus.error('{UPDATE_PROCESS_ERROR_EXTENSION}');
                            dd = succeed();
                        }
                    }
                    return maybeDeferred(dd);
                }).addCallback(function() {
                    org = null;
                    if (setStatus.isSuccess()) {
                        item.querySelector('.update-check-box').style.display = '';
                    }
                    return wait(0);
                });
            });
            d.addErrback(function(err) {
                error(err);
                alert('Error! ' + extractErrorMessage(err));
                throw (err instanceof Error) ? err : new Error(err);
            }).addCallback(function() {
                let notes, sub, upBtn, curStatus;
                notes = byId('update-finish-notes'),
                sub = byId('update-finish-notes-sub');
                upBtn = byId('update-finish-button');
                curStatus = byId('x-update-status');
                if (updateCount) {
                    curStatus.value = 'finish';
                    notes.value = [updateCount, '{NOTES_UPDATES_FOUND}'].join(' ');
                    sub.value = '{NOTES_UPDATES_FOUND_SUB}';
                } else {
                    curStatus.value = 'close';
                    notes.value = '{NOTES_UPDATE_NOT_FOUND}';
                    sub.value = '';
                    upBtn.label = '{EXTRA_UPDATE_END}';
                    upBtn.setAttribute('tooltiptext', '{EXTRA_UPDATE_END}');
                }
                byId('update-button').style.display = 'none';
                byId('update-finish-box').style.display = '';
            });
            callLater(0, function() { d.callback(); });
        }
        
        function updateScriptsAllFinish() {
            let d, updateCount, progressBar, progressStatus, updateProgress, updateStatus, max;
            if (byId('x-update-status').value !== 'finish' || !updateItems || !updateItems.length) {
                return;
            }
            updateCount = 0;
            max = updateItems.length;
            updateProgress = function(v) {
                progressBar.value = Math.max(0, Math.min(100, Math.floor(Number(v) / max * 100)));
            };
            updateStatus = function(v) {
                progressStatus.value = v;
            };
            progressBar = byId('progress-bar');
            progressStatus = byId('progress-status');
            byId('progress-box').style.display = '';
            byId('richlist-box').style.display = 'none';
            d = new Deferred();
            d.addCallback(function() {
                let dd = new Deferred(), width, height;
                width  = 460;
                height = 184;
                dd.addCallback(function() {
                    updateProgress(0);
                    updateStatus('');
                    byId('update-finish-button').style.display = 'none';
                    byId('update-finish-box').style.display = 'none';
                }).addCallback(function() {
                    window.resizeTo(width, height);
                    return wait(0);
                }).addCallback(function() {
                    try {
                        byId('update-patches-dialog').centerWindowOnScreen();
                    } catch (e) {}
                    return wait(0);
                }).addCallback(function() {
                    window.resizeTo(width, height);
                    return wait(0);
                }).addCallback(function() {
                    window.resizeTo(width - 5, height - 5);
                    return wait(0);
                }).addCallback(function() {
                    window.resizeTo(width, height);
                    return wait(0);
                }).addCallback(function() {
                    window.resizeTo(width + 5, height + 5);
                    return wait(0);
                }).addCallback(function() {
                    window.resizeTo(width, height);
                    return wait(0);
                });
                dd.callback();
                return dd;
            });
            
            let (specials = [], newItems = [], item, name) {
                while (updateItems && updateItems.length) {
                    item = updateItems.shift();
                    if (item) {
                        name = getFileName(item.org && item.org.uri);
                        if (name) {
                            if (name in args.SPECIAL_PATCHES) {
                                specials.push(item);
                            } else {
                                newItems.push(item);
                            }
                        }
                    }
                }
                updateItems = [].concat(newItems).concat(specials);
            }
            
            // ソート済みが条件
            updateItems.forEach(function(item, index) {
                let className, check, name, updateUrl, icon;
                name = getFileName(item.org && item.org.uri);
                updateUrl = item.cur && item.cur.uri;
                icon = item.item && item.item.querySelector('.loading-image') || {};
                className = 'x-check-' + item.index;
                check = listScripts.querySelector('.' + className);
                if (check && check.checked && updateUrl) {
                    if (name in args.SPECIAL_PATCHES) {
                        // インストールが特殊なパッチ
                        d.addCallback(function() {
                            return wait(1.5);
                        }).addCallback(function() {
                            let result, special, timeout, startTime;
                            updateStatus('Updating... ' + name);
                            try {
                                timeout = 5 * 60 * 1000;
                                startTime = (new Date()).getTime();
                                special = args.SPECIAL_PATCHES[name];
                                try {
                                    window.blur();
                                } catch (er) {}
                                result = special.update(item);
                                if (result instanceof Error) {
                                    throw result;
                                }
                                if (special.completed) {
                                    till(function() {
                                        let end = false;
                                        if (special.completed()) {
                                            updateCount++;
                                            end = true;
                                        } else if (special.canceled()) {
                                            end = true;
                                        } else if (startTime - (new Date()).getTime() > timeout) {
                                            end = true;
                                        }
                                        return end;
                                    });
                                }
                                try {
                                    byId('update-patches-dialog').centerWindowOnScreen();
                                    window.focus();
                                } catch (er) {}
                            } catch (e) {
                                throw e;
                            }
                            return wait(0.1);
                        }).addErrback(function(err) {
                            try {
                                byId('update-patches-dialog').centerWindowOnScreen();
                                window.focus();
                            } catch (er) {}
                            icon.src = icons.failed;
                            alert('Error! ' + extractErrorMessage(err));
                            throw (err instanceof Error) ? err : new Error(err);
                        }).addCallback(function() {
                            icon.src = icons.checked;
                            return wait(0.525);
                        }).addBoth(function(err) {
                            updateProgress(index + 1);
                            if (err instanceof Error) {
                                updateStatus('Failed: ' + name);
                                throw err;
                            } else {
                                updateStatus('Updated: ' + name);
                            }
                            return wait(1.25);
                        });
                    } else {
                        d.addCallback(function() {
                            updateStatus('Updating... ' + name);
                            return wait(2.275);
                        }).addCallback(function() {
                            return download(updateUrl, getPatchDir()).addCallback(function(file) {
                                reload();
                                updateCount++;
                                notify(
                                    name,
                                    getMessage('message.install.success'),
                                    notify.ICON_INFO
                                );
                            });
                        }).addErrback(function(err) {
                            icon.src = icons.failed;
                            alert('Error! ' + extractErrorMessage(err));
                            throw (err instanceof Error) ? err : new Error(err);
                        }).addCallback(function() {
                            icon.src = icons.checked;
                            return wait(0.525);
                        }).addBoth(function(err) {
                            updateProgress(index + 1);
                            if (err instanceof Error) {
                                updateStatus('Failed: ' + name);
                                throw err;
                            } else {
                                updateStatus('Updated: ' + name);
                            }
                            return wait(1.25);
                        });
                    }
                }
            });
            d.addErrback(function(err) {
                error(err);
                alert('Error! ' + extractErrorMessage(err));
                throw (err instanceof Error) ? err : new Error(err);
            }).addBoth(function(err) {
                updateProgress(100);
                updateStatus('');
                byId('update-end-box').style.display = '';
                byId('update-end-notes').value = '{NOTES_UPDATE_FINISH}';
                byId('update-end-notes-count').value = [updateCount, '{NOTES_UPDATED COUNT}'].join(' ');
                if (err instanceof Error) {
                    throw err;
                }
            });
            callLater(0, function() { d.callback(); });
        }
        
        function save(event) {
            let urls = updateUrls || {}, expr = 'richlistitem[value]';
            toArray(listScripts.querySelectorAll(expr)).forEach(function(item) {
                let uri, updateUrl, name;
                uri = createURI(item.value);
                try {
                    updateUrl = item.querySelector('label.update-url-static').value ||
                                item.querySelector('.url-input-box').value;
                } catch (e) {}
                name = getFileName(uri);
                urls[name] = updateUrl || '';
            });
            args.potUpdatePatchUtil.setPref('urls', JSON.stringify(urls || {}));
        }
        
        function saveAndClose() {
            callLater(0, function() { save(); });
            window.close();
        }
        
        function fireMouseEvent(element, type) {
            var event = element.ownerDocument.createEvent('MouseEvents');
            event.initMouseEvent(
                type || 'click', true, true,
                element.ownerDocument.defaultView,
                1, 0, 0, 0, 0,
                false, false, false, false,
                0, element
            );
            element.dispatchEvent(event);
        }
        
        function byId(id) {
            return document.getElementById(id);
        }
        
        function getFileName(path) {
            let uri = createURI(path);
            return uri.fileName || uri.leafName || (uri.file && uri.file.leafName);
        }
        
        function toArray(o) {
            return Array.prototype.slice.call(o);
        }
        
        function findUpdateURI(source) {
            let result = '', head, found = false;
            head = String(source || '').trim().slice(0, args.SCRIPT_DOCCOMMENT_SIZE);
            args.UPDATE_PATTERNS.uris.forEach(function(re) {
                if (!found && re.test(head)) {
                    result = head.match(re)[1];
                    found = true;
                }
            });
            if (!found && args.UPDATE_PATTERNS.uri.test(head)) {
                result = head.match(args.UPDATE_PATTERNS.uri)[1];
            }
            return result || '';
        }
        
        function getUpdateURL(path) {
            let result = '', source, fileName, head;
            fileName = path && path.path || path;
            source = getContents(fileName);
            if (source) {
                result = findUpdateURI(source);
            }
            if (!result) {
                result = updateUrls[getFileName(path)] || '';
            }
            return result;
        }
        
        function getCurrentVersion(path) {
            let result = '', source, fileName, head;
            fileName = path && path.path || path;
            source = getContents(fileName);
            if (source) {
                head = source.trim().slice(0, args.SCRIPT_DOCCOMMENT_SIZE);
                if (args.UPDATE_PATTERNS.version.test(head)) {
                    result = head.match(args.UPDATE_PATTERNS.version)[1];
                }
            }
            return result;
        }
        
        function compareVersions(a, b) {
            let result;
            try {
                result = Components.classes['@mozilla.org/xpcom/version-comparator;1']
                        .getService(Components.interfaces.nsIVersionComparator)
                        .compare(a, b);
            } catch (e) {
                result = a == b ? 0 :
                        a  >  b ? 1 : -1;
            }
            return result;
        }
        
        function countChars(src) {
            let chars = {}, len = 0, pre = '.';
            String(src || '').split('').forEach(function(c) {
                if (!((pre + c) in chars)) {
                    chars[pre + c] = true;
                    len++;
                }
            });
            return len;
        }
        
        function openRemoteFileInEditor(uri, context) {
            let d;
            if (context && context.style) {
                // コンテキストがあればカーソルをwaitにする
                context.style.cursor = 'wait';
            }
            d = download(uri, getTempDir()).addCallbacks(function(file) {
                callLater(0, function() {
                    openInEditor(file);
                });
            }, function(err) {
                error(err);
                alert('Error! ' + extractErrorMessage(err));
                return err;
            }).addBoth(function(err) {
                if (context && context.style) {
                    context.style.cursor = '';
                }
                try {
                    // テンポラリファイルを削除
                    file.remove(false);
                } catch (e) {}
                if (err instanceof Error) {
                    throw err;
                }
                return err;
            });
            return d;
        }
        
        function extractErrorMessage(err) {
            return (err && (err.message && err.message.message || err.message)) || err;
        }
        
        // -- from: tombloo.js --
        function getScriptFiles(dir) {
            var scripts = [];
            simpleIterator(dir.directoryEntries, ILocalFile, function(file) {
                if (file.leafName.match(/\.js$/)) {
                    scripts.push(file);
                }
            });
            return scripts;
        }
        
        function simpleIterator(e, ifc, func) {
            var value;
            if (typeof ifc === 'string') {
                ifc = Components.interfaces[ifc];
            }
            try {
                while (e.hasMoreElements()) {
                    value = e.getNext();
                    func(ifc ? value.QueryInterface(ifc) : value);
                }
            } catch (e if e == StopIteration) {}
        }
    ]]></>.toString();
    
    let (lang = LANG === 'ja' && LANG || 'en') {
        forEach(labels.template, function([key, vals]) {
            template = template.split(key).join(vals[lang]);
        });
        forEach(labels.script, function([key, vals]) {
            script = script.split(key).join(vals[lang]);
        });
    }
    forEach({
        '{ICON_LOADING}' : strip(<>
            data:image/gif;base64,
            R0lGODlhEAAQAPQAAP///z8+Pvn5+WloaKKhoUNCQltaWt/f3728vE9OTpeXl4uLi+rq6rGwsNPT
            03V0dH9/fwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05F
            VFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAA
            EAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla
            +KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAkKAAAALAAAAAAQABAAAAVoICCKR9KM
            aCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr
            6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkECQoAAAAsAAAAABAA
            EAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoL
            LoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkECQoAAAAsAAAA
            ABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7
            baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAkKAAAALAAAAAAQABAAAAVgICCO
            ZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYA
            qrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAkKAAAALAAAAAAQABAAAAVf
            ICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0Ua
            FBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==
        </>),
        // icon: http://www.famfamfam.com/
        '{ICON_EDIT}' : strip(<>
            data:image/png;base64,
            iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
            U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAMCSURBVDjLTdBNaFxVGMbx/zn33plOZjIT
            8zmGOnFM1VoNJYFWYi2CtVSMdKUbK+LKhSAGXYhd2m6FQkEXLbiwETcWiq3WpiiSBLRqTa122pEm
            MZPmw8lkMt93zrnnXhdJbB54l++Ph0cEQQDAm1/l9gOnHmnbMVzXPnXto32fhueXgAqwChigCBSA
            z4ErNpvxPe/pvcnY8PvPdbE9NeUn6spPFF2zU2moNA1zq1W+vVs7DIxuB3riIQFAbt3gCIEtwLIh
            7EhSYYklJY4Fgzsj9Cai7WeuLX4stwCjdTxqg+dDRQlKGtabUHI3rtCAf6sGgA/H5hlOR3mq0+my
            twHtrSFJrQk11yClwAYsC6QFFgJLgA8IU+anmSLX50uL9wGlehIRi1LDo94MkDLAkiCNwJJgEbCj
            /AN/j3/G250D1CZ/5BWdHPsf8JTq64k7lNwADyAAywhksLF9vPI17WvXiAy8TiI9yPrs4zSunH1j
            W4NmXzIRJrNiEBIkG88SaKlcJuX8SezRA6zdzRASitZ4klhHKmEDvHjicsS2ZCjsSJQxSAIgIADC
            tSnS9i8k0kdoLn1JqEXwz/RttKsKbqP6jATwmqorLEBujkQAAohUJtglrpLofwl38QzCKeLEWtHV
            RV+Xl17Y9875rNys32LjY0uwpAAhMfOXSJmrJHYdxb33KdLRqPLDrEzc4PTC4dtD741PA8iDo2Od
            nlIn9u9OsVwOmFsxlLKXSOqf6X5yBLV8FisU0Cz3kZ/8ndzAR2Sq3TNb29lGqUPAyG+ZWYoNG2fh
            G14dyOP5vSzdPM0D3SHctYfITd1CHvqEhZyLUSq/BUij9dDLB56IfHF8hJOvPcYeLrLn2bcI5ybJ
            Xphi+rs17nx/g4n2D4i09VKp1jFaF+430Hp2ebXEufEMbbEI2Zk86q+LpPcepJQvcO/mDM8fv8CD
            oX7CNuTXKhitF7YAMXjsVCcwCvQBHf25k0eG0l1i3+60mFPR4HxuSLhOB/FohLZ4C3/cyWWBY9fP
            vfsrwH+7HFmMUqkOrwAAAABJRU5ErkJggg==
        </>),
        '{ICON_VIEW}' : strip(<>
            data:image/png;base64,
            iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
            U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAL+SURBVBgZBcFNaJtlAMDx//ORjzZbs7TJ
            kmowbJcdZqr1oNavCiIIMraBh0IY7uZx8+OiVw9SQZgXp3gR3A5OtIigcxMcylyqVPADh0WNpO2b
            pk2bvm3e5P163sffT1hrATj/2drDwKXjR7JzwyhhGCVEScIoTlzgAOgBBugDO8DHwA0NAJDE8SMP
            VA7NvTpfAgAAwAuT/DBM8n3fVMMIDgLDf70BX//jPQtc1AAASRyXJ9ICgLU9Q0oItAClIZOS3JeR
            KClJKZitjnFPPjf54U/OOxIAwETRRE5DnMBBKHAj2AvA9cH1YWcEWwMDwOtX28wdy3F/MVXSAAAm
            iiYPpyVeAJ5vkFKgAaVAKlAIlIAEEGaf5r99fmm7jgYAMGFYzo8p3FHMMLBIaVESpBEoCQqLUoBV
            dPcD3r359z5wXgMAxGFYK0+kcH1LDGBBGYG0gAGFRVtJYsGkDHEYH/vi5cd3JQCACYNaJZ/BCy1C
            ghICCUhAAADCgrUQBwEmDAyABnjuzetjWsl0JiUJjUFiAYsFDAIAAUgJkTEMvGEM7ANogDgIS7lc
            FinAD3xav/2Iu/4npakCTneHk0+d4dDhSW5f/4jfiwUek1uy67Rfm59/6z0NYMJgXOfSWBOxfONT
            8tLjxXMNPM9jfX2dZvMrVCrL2dOn0FrR6XTkysrK2+12uySeuHClCFw+Mz/7wvHsFs3vv2WhscDV
            T77kr1/vMF2pUK/X6XQ69Ho9OpubpI9Ut155qXF0aWnJ1SYMnwGeX7nb4k77Z2aq4wD0y6cYDG+x
            sLBAoVBgMBiwvb3N5fc/YHf8wW+Ac/l8PqNNFD10+umZsTcaj3Ltmkez2QSgtvs5a9KyuLhILpcD
            wPM8bJIwtXv7STjJxsaGr00UtTZ7Lldu3iXU0/TdAT98d4v6zAz1ep1ut8vq6iqZTIZarUa5XMYP
            o6PLy8t7juNsitnGpSJwEahhk6KK9qpToz9O3Fsp6kw6LYSA1qhEdnyCaVpYm9go8H3Hcbqe5539
            H/YvZvvl5HpaAAAAAElFTkSuQmCC
        </>),
        '{ICON_SEARCH}' : strip(<>
            data:image/png;base64,
            iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0
            U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAH5SURBVDjLpZK/a5NhEMe/748kRqypmqQQ
            gz/oUPUPECpCoEVwyNStIA6COFR33boIjg6mg4uL0k0EO1RFISKImkHQxlbQRAsx0dgKJm/e53nu
            nnOwViR5leJnuZs+973jHBHB/+D/ah7X2LXWloilyMw5YgtD3CDiBWN4Zno8bQcJHBFBucauZfso
            lZDCru0OfFcAAUISrLZDfPzSKxuiibOT+T6JCwDMtrQzYQvZHQ5Cw2h3GK0OI9AWBzJJZFOxgtJU
            GpTABQAiLu5OOviuGIEWkBUwC7pasNZj7N2ThNJUjBQY4pznAoEWsBWwxU+JFXSVRTzmQWvKRR5R
            G4KVGMgKrAVYflexAAugDCEygdbUCI2F7zobk7FZY76DIDQgrT9HCwwt1FsBhhIu4p4D3kiS8B0M
            Jz28ftfGSPfl8MPLxbGBAqVpptbslJc+fEPMA7JDPrIpH3FX8LzaROdrE5O51jalgid3Lh4b6/sD
            ALh6971riErGcFET58gwDPGndG9JT6ReHcwfPorGygu8rdxvGxMeP3XtzcofgigWZ0/EtQ7n0/sO
            Te0/Mo7V5WeoVu61z1yvZzZX+BsnZx9opYLpevXp7eXKIrL5UWit0n0r/Isb50bjRGreiyWmgs76
            lfM31y5tSQAAc6czHjONXLi13thygih+AEq4N6GqMsuhAAAAAElFTkSuQmCC
        </>)
    }, function([key, val]) {
        script = script.split(key).join(val);
    });
    code = template.split('{SCRIPT}').join(['<![CDATA[', script, ']]>'].join(' '));
    template = script = null;
    return [head, encodeURIComponent(trim(code))].join('').trim();
}


// ----- Helper functions -----

function trim(s) {
    return stringify(s).replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}


function strip(s) {
    return stringify(s).replace(/[\s\u00A0\u3000]+/g, '');
}


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
 * あらかじめ設定できそうなupdateURLをオブジェクトに適応
 *
 * @param  {Object}   o   対象のオブジェクト
 * @return {Object}       適応されたオブジェクト
 */
function extendUpdateURL(o) {
    o = o || {};
    forEach(BASE_UPDATE_URLS, function([name, url]) {
        if (!(name in o)) {
            o[name] = url;
        }
    });
    return o;
}


function definePotUpdatePatchUtil() {
    /**
     * setPref/getPref で使うキー名 (キャッシュに使用)
     *
     * 接頭語を patches にしておく (その先頭に 'extensions.tombloo.' が付く)
     * 他のパッチと同じにならないようidをつけておく
     *
     * @const  {String}  PREF_PREFIX
     */
    const PREF_PREFIX = 'patches.polygonplanet.extension.update.patches.';
    var potUpdatePatchUtil = {
        getPref: function(key, def) {
            let value = getPref(PREF_PREFIX + key);
            if (value === undefined) {
                value = def;
            }
            return value;
        },
        setPref: function(key, val) {
            return setPref(PREF_PREFIX + key, val);
        }
    };
    return potUpdatePatchUtil;
}


})();

