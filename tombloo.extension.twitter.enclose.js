/**
 * Extension.Twitter.Enclose - Tombloo patches
 *
 * Twitterポスト時に括弧で囲んだり接尾語を付けたり最大文字数超えないようにするパッチ
 * http://twitter.com/
 *
 * 機能:
 * -----------------------------------------------------------------------
 * [Extension Twitter Enclose patch]
 *
 * - Twitterポスト時にタイトルを括弧(「」) 等で囲う
 * - タイトルに括弧が使われてる場合、違う括弧に自動で切り替える
 * - Twitterポスト時に先頭に「見てる」等のテキストを自動で付加できる
 * - コンテキストメニューから代替テキストの編集用ダイアログが利用できる
 * - 140文字を超えないよう自動調節
 * - 括弧を付けるか付けないか選択できるよう変更
 *
 * -----------------------------------------------------------------------
 *
 * @version    1.23
 * @date       2011-09-28
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.extension.twitter.enclose.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 *
 * Based: http://efcl.info/2009/0429/res648/
 *        http://d.hatena.ne.jp/toby/20100220/
 */
//-----------------------------------------------------------------------------
(function(undefined) {

// Define language
const LANG = (function(n) {
    return ((n && (n.language || n.userLanguage || n.browserLanguage ||
           n.systemLanguage)) || 'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
})(navigator);

// メニューのラベル
const MENU_LABEL = ({
    ja : 'Twitter括弧で囲うパッチの設定',
    en : 'Twitter enclosure settings'
})[LANG === 'ja' && LANG || 'en'];


//TODO: t.co 短縮URL対応の処理
const SAMPLE_SHORT_URL = 'http://bit.ly/-*-*-*-*-*';//FIXME: t.co


// Util object
var potTwitterEncUtil = definePotTwitterEncUtil();


// Fixed extractor (暫定)
addAround(Tombloo.Service.extractors['Quote - Twitter'], 'extract', function(proceed, args) {
    let ctx = update({}, args[0] || {}), re;
    re = /(?:status|statuses)\/(\d+)/;
    if (re.test(ctx.hash) && !re.test(ctx.href)) {
        // hash = '#!/user/status/xxxxxxxxxx'
        // href = 'https://twitter.com/'
        //           ↑
        // '#!' のせいで…こんな状態になってしまっているので修正
        ctx.href = re.test(ctx.document.documentURI) ?
                           ctx.document.documentURI  : ctx.href + ctx.hash;
        if (!re.test(ctx.href)) {
            ctx.href = re.test(ctx.window.location && ctx.window.location.href) ?
                        ctx.window.location.href :
                        ctx.document.location && ctx.document.location.href;
        }
    }
    try {
        return proceed(args);
    } catch (e) {
        return {
            type     : 'quote',
            item     : ctx.title.substring(0, ctx.title.indexOf(': ')) || ctx.title,
            itemUrl  : ctx.href,
            body     : createFlavoredString(ctx.selection ?
                                ctx.window.getSelection() :
                        ctx.document.querySelector('.tweet-text-large') ||
                        ctx.document.querySelector('.entry-content')
            ),
            favorite : {
                name : 'Twitter',
                id   : (function() {
                    try {
                        return ctx.href.match(re)[1];
                    } catch (e) {
                        return ctx.hash.match(/\b(\d+)[^\d]*$/)[1];
                    }
                })()
            }
        };
    }
});


// Twitter.post アップデート
addAround(Twitter, 'post', function(proceed, args, that) {
    let ps = args[0], org = update({}, ps), ops = {}, name, prefs = {
        enclose   : true,
        prefix    : '',
        separator : '',
        suffix    : ''
    };
    for (name in prefs) {
        ops[name] = potTwitterEncUtil.getPref(name, prefs[name]);
    }
    ops.enclose = !!ops.enclose;
    // postの前に代替テキスト、接尾語の付加や文字数調整を行う
    if (ps.twitterSuffix !== undefined) {
        ps.suffix = stringify(ps.twitterSuffix);
        delete ps.twitterSuffix;
        ops.suffix = ps.suffix;
    }
    try {
        beforeFilter(ps, ops);
        return that.update(trim(joinText([
            stringify(ps.description),
            trim(ps.body) ? wrap(trim(ps.body)) : '',
            stringify(ps.item),
            stringify(ps.itemUrl),
            stringify(ps.suffix)
        ], ' ')));
    } finally {
        update(ps, org);
    }
});


// QuickPostFormに接尾語入力フィールドを追加
(function(globals) {

if (QuickPostForm.extended) {
    let (qe = QuickPostForm.extended) {
        qe.addProcedure(procedure);
    }
} else {
    addAround(QuickPostForm, 'show', function(proceed, args) {
        const QUICKPOSTFORM_XUL_PATH = 'chrome://tombloo/content/quickPostForm.xul';
        let [ps, position, message] = args;
        let win, result, orgOpenDialog;
        orgOpenDialog = globals.openDialog;
        update(ps || {}, {
            twitterSuffix : stringify(potTwitterEncUtil.getPref('suffix'))
        });
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
        } finally {
            // 元の関数に戻す
            update(globals, {
                openDialog : orgOpenDialog
            });
            // 拡張用メソッド
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


function isDisplayFields() {
    return !!potTwitterEncUtil.getPref('displayForm', true);
}

function procedure(win, ps) {
    win.addEventListener('load', function() {
        let doc, elmForm, formPanel, suffixBox, wrapper, make;
        if (!models.Twitter.check(ps)) {
            return;
        }
        doc = win.document;
        formPanel = win.dialogPanel.formPanel;
        make = {};
        'vbox textbox'.split(' ').forEach(function(tag) {
            make[tag.toUpperCase()] = bind(E, null, tag);
        });
        withDocument(doc, function() {
            elmForm = doc.getElementById('form');
            
            // テキストボックスを配置
            wrapper = elmForm.appendChild(make.VBOX({
                flex  : 1,
                style : 'max-height: 3em;'
            }));
            suffixBox = wrapper.appendChild(make.TEXTBOX({
                name      : 'twitterSuffix',
                emptytext : 'Suffix (Twitter)',
                value     : stringify(ps.twitterSuffix),
                multiline : false,
                rows      : 1,
                style     : [
                    'margin-top: 0.7em',
                    'margin-bottom: 0.5em'
                ].join(';')
            }));
            if (!isDisplayFields()) {
                wrapper.style.display = 'none';
            }
            formPanel.fields.twitterSuffix = suffixBox;
            {
                let toggleFields = function(resize) {
                    let posters, prev, curr;
                    if (isDisplayFields()) {
                        posters = formPanel.postersPanel.checked.filter(function(poster) {
                            return poster && poster.name === Twitter.name;
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


// コンテキストメニューに設定ダイアログを登録
Tombloo.Service.actions.register({
    name  : MENU_LABEL,
    type  : 'context',
    icon  : Twitter.ICON,
    check : function(ctx) {
        return true;
    },
    execute : function(ctx) {
        let params = {
            enclose     : !!potTwitterEncUtil.getPref('enclose', true),
            prefix      : stringify(potTwitterEncUtil.getPref('prefix')),
            separator   : stringify(potTwitterEncUtil.getPref('separator')),
            suffix      : stringify(potTwitterEncUtil.getPref('suffix')),
            displayForm : !!potTwitterEncUtil.getPref('displayForm', true),
            ps : {
                item        : ctx.title || ctx.document && ctx.document.title,
                itemUrl     : ctx.href,
                body        : '',
                description : ''
            },
            trim              : trim,
            window            : window,
            joinText          : joinText,
            stringify         : stringify,
            beforeFilter      : beforeFilter,
            potTwitterEncUtil : potTwitterEncUtil,
            SAMPLE_SHORT_URL  : SAMPLE_SHORT_URL
        };
        openDialog(
            generateXUL(),
            'chrome,resizable,centerscreen',
            params
        );
    }
}, '----');

// 区切り線を登録
Tombloo.Service.actions.register({
    name : '----',
    type : 'context'
}, MENU_LABEL);


/**
 * タイトルを括弧(「」)で囲い先頭に「見てる」などを任意で付ける
 *
 * @param  {Object}   ps   post()に渡すオブジェクト
 * @param  {Object}   ops  オプション
 *                           - enclose   : タイトルを括弧で囲うかどうか
 *                           - prefix    : 先頭に付けるテキスト
 *                           - separator : テキストとタイトルを区切るときの文字
 *                           - suffix    : 末尾に付けるテキスト
 */
function beforeFilter(ps, ops) {
    const MAX_LENGTH = ops.enclose ? 138 : 140;
    let brackets, contents, re, make, psd;
    brackets = [
        // 括弧の中でタイトル文字列に使用されていないものを使う
        '「」', '“”', '『』', '‘’', '≪≫', '＜＞',
        '－－', '――', '──', '～～', '｜｜',
        '〔〕', '［］', '｛｝', '〈〉', '（）',
        '//',   '{}',   '()',   '[]',   '<>',   '||',
        '《》', '【】'
    ].map(function(b) {
        return b.split('');
    });
    re = {
        word    : /[一-龠々〆ぁ-んァ-ヶｦ-ｯｱ-ﾝﾞ゛ﾟ゜ａ-ｚＡ-Ｚ０-９\w\u301Cー～－ｰ-]/i,
        hashtag : /#[\w一-龠々ぁ-んァ-ヶａ-ｚＡ-Ｚ０-９]{1,139}/i
    };
    make = function(o) {
        return trim(joinText([
            stringify(o.desc),
            trim(o.body) ? wrap(trim(o.body)) : '',
            stringify(o.item),
            stringify(o.itemUrl),
            stringify(o.suffix)
        ], ' '));
    };
    update(make, {
        desc : function(o) {
            let desc = trim(o.desc), sep = rtrim(spacize(o.sep));
            // 記号以外の文字で終わってたらセパレータを付加
            if (desc && sep &&
                re.word.test(desc.slice(-1)) && desc.slice(-1) !== sep.charAt(0)
            ) {
                desc += sep;
            }
            o.desc = desc;
        },
        truncateAll : function(o) {
            // 同じ記号になってしまった場合、続かないようにする
            if (o.desc && o.sep && re.word.test(o.desc.slice(-1))) {
                while (o.sep && o.desc.slice(-1) === o.sep.charAt(0)) {
                    o.sep = o.sep.substring(1);
                }
            }
            if (o.sep && o.sep.length >= 5) {
                make.truncate(o, 'sep');
                make.truncate(o, 'item');
            } else {
                make.truncate(o, 'item');
                make.truncate(o, 'sep');
            }
            make.truncate(o, 'body');
            
            // セパレータを結合
            make.desc(o);
            
            make.truncate(o, 'desc');
            make.truncate(o, 'suffix');
            return o;
        },
        // 140文字以上ならそれ以上付加しない。可能なかぎり切り詰める
        truncate : function(o, key) {
            let maked = make(o);
            while (o[key] && o[key].length > 1 && maked.length > MAX_LENGTH) {
                o[key] = spacize(o[key]).slice(0, -2) + '…';
                if (o[key].length === 1) {
                    o[key] = '';
                }
                maked = make(o);
            }
            return o;
        }
    });
    psd = {
        // 余分なスペースなどを除去する
        desc    : ltrim(spacize(stringify(ps.description || stringify(ops.prefix) || ''))),
        sep     : rtrim(spacize(stringify(ops.separator))),
        suffix  : trim(spacize(stringify(ps.suffix === undefined ? ops.suffix : (ps.suffix || ops.suffix)))),
        item    : trim(spacize(stringify(ps.item))),
        body    : trim(ps.body),
        itemUrl : ps.itemUrl ? SAMPLE_SHORT_URL : ''
    };
    
    // 最大文字数で丸める
    psd = make.truncateAll(psd);
    
    // 設定されてたらタイトルを括弧で囲う
    if (ops.enclose) {
        contents = make(psd);
        if (psd.item && psd.item.length && contents.length <= MAX_LENGTH) {
            brackets = brackets.filter(function(b) {
                return !~psd.item.indexOf(b[0]) && !~psd.item.indexOf(b[1]);
            }).shift();
            
            // 140文字に収まるなら括弧で囲う
            if (brackets && brackets.length <= 2) {
                psd.item = [
                    stringify(brackets.shift()),
                    stringify(brackets.pop())
                ].join(psd.item);
            }
        }
    }
    update(ps, {
        item        : psd.item,
        body        : psd.body,
        description : psd.desc,
        suffix      : psd.suffix
    });
}


// XULを動的生成 (設定メニューのためキャッシュはしない)
function generateXUL() {
    let head, template, script, style, code, labels;
    labels = {
        '{TITLE}': {
            ja : MENU_LABEL,
            en : MENU_LABEL
        },
        '{ENCLOSE}': {
            ja : 'タイトルを括弧で囲う',
            en : 'Enclose the title with brackets.'
        },
        '{PREFIX}': {
            ja : '何も入力しなかったときの代替テキスト：',
            en : 'Alternative(prefix) text when input field is empty:'
        },
        '{SEPARATOR}': {
            ja : '代替テキストの後に付くセパレータ：',
            en : 'Separator which adheres after alternative text:'
        },
        '{SUFFIX}': {
            ja : '末尾に付くテキスト：',
            en : 'Text to put on end (suffix):'
        },
        '{SEPARATOR_NOTE}': {
            ja : 'セパレータは代替テキストの末尾が記号の場合は付きません',
            en : 'If the symbolic end of the alt text, then separator is not appended.'
        },
        '{SUFFIX_NOTE}': {
            ja : '末尾テキストは常に優先的に付加されます',
            en : 'Suffix is always appended preferentially.'
        },
        '{SUFFIX_DISPLAY_FORM_CHECK}': {
            ja : 'クイックポストフォームに入力フィールドを表示する',
            en : 'Display input fields at QuickPostForm.'
        },
        '{SUBMIT_TIP}': {
            ja : '保存',
            en : 'Save'
        }
    };
    head = 'data:application/vnd.mozilla.xul+xml;charset=utf-8,';
    style = ['data:text/css,', encodeURIComponent(trim(<><![CDATA[
        window {
            margin: 0.7em 0.5em;
        }
        button {
            cursor: pointer;
            margin-top: 0.7em;
            padding: 0.5em 0;
        }
        textbox {
            margin: 0 0.5em 0.5em 0.7em;
        }
        .button-icon {
            margin-right: 0.5em;
        }
        #length {
            opacity: 0.75;
        }
        #submit-button {
            font-weight: bold;
            padding: 0.5em 0.7em 0.5em 0.4em;
        }
    ]]></>))].join('');
    
    template = trim(<><![CDATA[
        <?xml version="1.0" encoding="utf-8"?>
        <?xml-stylesheet type="text/css" href="chrome://global/skin/"?>
        <?xml-stylesheet type="text/css" href="{STYLE}"?>
        <dialog title="{TITLE}" buttons="accept"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:html="http://www.w3.org/1999/xhtml">
            <hbox flex="1">
                <vbox flex="1">
                    <checkbox id="enclose" label="{ENCLOSE}" checked="true"/>
                    <spacer height="5"/>
                    <label value="{PREFIX}"/>
                    <textbox id="prefix" rows="1" multiline="false" flex="1"
                             maxlength="140" value=""/>
                    <spacer height="5"/>
                    <label value="{SEPARATOR}"/>
                    <label value="{SEPARATOR_NOTE}"
                           style="margin: 0.5em; font-size: small;"/>
                    <textbox id="separator" rows="1" multiline="false" flex="1"
                             maxlength="140" value=""/>
                    <spacer height="5"/>
                    <label value="{SUFFIX}"/>
                    <label value="{SUFFIX_NOTE}"
                           style="margin: 0.5em; font-size: small;"/>
                    <textbox id="suffix" rows="1" multiline="false" flex="1"
                             maxlength="140" value=""/>
                    <spacer height="5"/>
                    <checkbox id="displayForm" checked="true"
                              label="{SUFFIX_DISPLAY_FORM_CHECK}"/>
                    <spacer height="15"/>
                    <label value="Preview"/>
                    <spacer height="2"/>
                    <textbox id="preview" rows="5" multiline="true" flex="1"
                             readonly="true" value=""/>
                    <spacer height="5"/>
                    <hbox align="right">
                        <label id="length" value=""/>
                    </hbox>
                    <spacer height="5"/>
                    <button id="submit-button" dlgtype="accept" label="OK" flex="1"
                            tooltiptext="{SUBMIT_TIP}"
                            image="chrome://tombloo/skin/accept.png"/>
                </vbox>
            </hbox>
            <script>{SCRIPT}</script>
        </dialog>
    ]]></>.toString());
    
    forEach(labels, function([key, vals]) {
        template = template.replace(key, vals[LANG === 'ja' && LANG || 'en']);
    });
    
    script = <><![CDATA[
        var args = arguments, params = args[0], env;
        var encloseCheck, prefixBox, separatorBox, suffixBox, displayFormCheck, previewBox, previewLength;
        
        env = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
        
        window.addEventListener('load', init, true);
        window.addEventListener('dialogaccept', save, true);
        
        function init() {
            encloseCheck     = byId('enclose');
            prefixBox        = byId('prefix');
            separatorBox     = byId('separator');
            suffixBox        = byId('suffix');
            displayFormCheck = byId('displayForm');
            previewBox       = byId('preview');
            previewLength    = byId('length');
            encloseCheck.checked     = !!params.potTwitterEncUtil.getPref('enclose', true);
            prefixBox.value          = params.stringify(params.potTwitterEncUtil.getPref('prefix'));
            separatorBox.value       = params.stringify(params.potTwitterEncUtil.getPref('separator'));
            suffixBox.value          = params.stringify(params.potTwitterEncUtil.getPref('suffix'));
            displayFormCheck.checked = !!params.potTwitterEncUtil.getPref('displayForm', true);
            encloseCheck.addEventListener('command', build, true);
            prefixBox.addEventListener('input', build, true);
            separatorBox.addEventListener('input', build, true);
            suffixBox.addEventListener('input', build, true);
            displayFormCheck.addEventListener('command', build, true);
            build();
        }
        
        function save() {
            params.enclose     = !!byId('enclose').checked;
            params.prefix      = params.stringify(byId('prefix').value);
            params.separator   = params.stringify(byId('separator').value);
            params.suffix      = params.stringify(byId('suffix').value);
            params.displayForm = !!byId('displayForm').checked;
            params.potTwitterEncUtil.setPref('enclose', params.enclose);
            params.potTwitterEncUtil.setPref('prefix', params.prefix);
            params.potTwitterEncUtil.setPref('separator', params.separator);
            params.potTwitterEncUtil.setPref('suffix', params.suffix);
            params.potTwitterEncUtil.setPref('displayForm', params.displayForm);
        }
        
        function build() {
            var psc = env.update({}, params.ps), status, q = '"';
            params.beforeFilter(psc, {
                enclose   : !!encloseCheck.checked,
                prefix    : params.stringify(prefixBox.value),
                separator : params.stringify(separatorBox.value),
                suffix    : params.stringify(suffixBox.value)
            });
            status = params.joinText([
                params.stringify(psc.description),
                params.trim(psc.body) ? q + params.trim(psc.body) + q : '',
                params.stringify(psc.item),
                params.stringify(psc.itemUrl),
                params.stringify(psc.suffix)
            ], ' ');
            if (status.length >= 140) {
                status = shortenUrls(status);
            }
            previewBox.value = status;
            previewLength.value = status.length;
        }
        
        function shortenUrls(text) {
            var re = /https?[-_.!~*'()a-zA-Z0-9;\/?:@&=+$,%#^]+/g;
            return text.replace(re, params.SAMPLE_SHORT_URL);
        }
        
        function byId(id) {
            return document.getElementById(id);
        }
    ]]></>.toString();
    
    template = template.split('{STYLE}').join(style);
    code = template.split('{SCRIPT}').join(['<![CDATA[', script, ']]>'].join(' '));
    return [head, encodeURIComponent(trim(code))].join('').trim();
}


// Helper functions
function spacize(s) {
    return stringify(s).replace(/[\s\u3000]+/g, ' ');
}


function trim(s) {
    return stringify(s).replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
}


function ltrim(s) {
    return stringify(s).replace(/^[\s\u3000]+/g, '');
}


function rtrim(s) {
    return stringify(s).replace(/[\s\u3000]+$/g, '');
}


function wrap(text) {
    let s = trim(text), q = '"';
    if (s && s.charAt(0) !== q) {
        s = q + s + q;
    }
    return s;
}


function unwrap(text) {
    let s = trim(text), q = '"';
    if (s && s.length >= 2 && s.charAt(0) === q && s.slice(-1) === q) {
        s = s.slice(1, -1);
    }
    return s;
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


function definePotTwitterEncUtil() {
    /**
     * setPref/getPref で使うキー名 (キャッシュに使用)
     *
     * 接頭語を patches にしておく (その先頭に 'extensions.tombloo.' が付く)
     * 他のパッチと同じにならないようidをつけておく
     *
     * @const  {String}  PREF_PREFIX
     */
    const PREF_PREFIX = 'patches.polygonplanet.extension.twitter.enclose.';
    var potTwitterEncUtil = {
        getPref : function(key, def) {
            let value = getPref(PREF_PREFIX + key);
            if (value === undefined) {
                value = def;
            }
            return value;
        },
        setPref : function(key, val) {
            return setPref(PREF_PREFIX + key, val);
        }
    };
    return potTwitterEncUtil;
}


})();

