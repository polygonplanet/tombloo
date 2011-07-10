/**
 * Extension.Twitter.Enclose - Tombloo patches
 *
 * Twitterにポストするとき括弧(「」)等でタイトルを囲うTomblooパッチ
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
 * @version  1.12
 * @date     2011-07-11
 * @author   polygon planet <polygon.planet@gmail.com>
 *            - Blog: http://polygon-planet.blogspot.com/
 *            - Twitter: http://twitter.com/polygon_planet
 *            - Tumblr: http://polygonplanet.tumblr.com/
 * @license  Same as Tombloo
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
           n.systemLanguage)) || 'en').split('-').shift().toLowerCase();
})(navigator);

// メニューのラベル
const MENU_LABEL = ({
    ja: 'Twitter括弧で囲うパッチの設定',
    en: 'Twitter enclosure settings'
})[LANG === 'ja' && LANG || 'en'];


const SAMPLE_SHORT_URL = 'http://bit.ly/-*-*-*-*-*';


// Util object
var potTwitterEncUtil = definePotTwitterEncUtil();


// postの前に代替テキストとセパレータを設定
addBefore(Twitter, 'post', function(ps) {
    let ops = {}, name, prefs = {
        enclose   : true, 
        prefix    : '',
        separator : ''
    };
    for (name in prefs) {
        ops[name] = potTwitterEncUtil.getPref(name, prefs[name]);
    }
    ops.enclose = !!ops.enclose;
    beforeFilter(ps, ops);
});

// コンテキストメニューに設定ダイアログを登録
Tombloo.Service.actions.register({
    name: MENU_LABEL,
    type: 'context',
    icon: Twitter.ICON,
    check: function(ctx) {
        return true;
    },
    execute: function(ctx) {
        let params = {
            enclose   : !!potTwitterEncUtil.getPref('enclose', true),
            prefix    : stringify(potTwitterEncUtil.getPref('prefix')),
            separator : stringify(potTwitterEncUtil.getPref('separator')),
            ps : {
                item        : ctx.title || ctx.document && ctx.document.title,
                itemUrl     : ctx.href,
                body        : '',
                description : ''
            },
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
    name: '----',
    type: 'context'
}, MENU_LABEL);


/**
 * タイトルを括弧(「」)で囲い先頭に「見てる」などを任意で付ける
 *
 * @param  {Object}   ps   post()に渡すオブジェクト
 * @param  {Object}   ops  オプション
 *                           - enclose   : タイトルを括弧で囲うかどうか
 *                           - prefix    : 先頭に付けるテキスト
 *                           - separator : テキストとタイトルを区切るときの文字
 */
function beforeFilter(ps, ops) {
    const MAX_LENGTH = ops.enclose ? 138 : 140;
    let brackets, contents, word, make, psd;
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
    word = /[一-龠々〆ぁ-んァ-ヶｦ-ｯｱ-ﾝﾞ゛ﾟ゜ａ-ｚＡ-Ｚ０-９\w\u301Cー～－ｰ-]/i;
    make = function(o) {
        return trim(joinText([o.desc, o.body, o.item, o.itemUrl], ' '));
    };
    update(make, {
        desc: function(o) {
            let desc = trim(o.desc), sep = rtrim(spacize(o.sep));
            // 記号以外の文字で終わってたらセパレータを付加
            if (desc && sep &&
                word.test(desc.slice(-1)) && desc.slice(-1) !== sep.charAt(0)
            ) {
                desc += sep;
            }
            o.desc = desc;
        },
        truncateAll: function(o) {
            // 同じ記号になってしまった場合、続かないようにする
            if (o.desc && o.sep && word.test(o.desc.slice(-1))) {
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
            o.body = unwrap(o.body);
            make.truncate(o, 'body');
            o.body = wrap(o.body);
            
            // セパレータを結合
            make.desc(o);
            
            make.truncate(o, 'desc');
            return o;
        },
        // 140文字以上ならそれ以上付加しない。可能なかぎり切り詰める
        truncate: function(o, key) {
            let maked = make(o);
            while (o[key] && o[key].length > 1 && maked.length >= MAX_LENGTH) {
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
        item    : trim(spacize(stringify(ps.item))),
        body    : wrap(ps.body),
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
        body        : unwrap(psd.body),
        description : psd.desc
    });
}


// XULを動的生成 (設定メニューのためキャッシュはしない)
function generateXUL() {
    let head, template, script, code, labels;
    labels = {
        '{TITLE}': {
            ja: MENU_LABEL,
            en: MENU_LABEL
        },
        '{ENCLOSE}': {
            ja: 'タイトルを括弧で囲う',
            en: 'Enclose the title with brackets.'
        },
        '{PREFIX}': {
            ja: '何も入力しなかったときの代替テキスト：',
            en: 'Alternative(prefix) text when input field is empty:'
        },
        '{SEPARATOR}': {
            ja: '代替テキストの後に付くセパレータ：',
            en: 'Separator which adheres after alternative text:'
        },
        '{SEPARATOR_NOTE}': {
            ja: 'セパレータは代替テキストの末尾が記号の場合は付きません',
            en: 'If the symbolic end of the alt text, then separator is not appended.'
        },
        '{SUBMIT_TIP}': {
            ja: '保存',
            en: 'Save'
        }
    };
    head = 'data:application/vnd.mozilla.xul+xml;charset=utf-8,';
    template = trim(<><![CDATA[
        <?xml version="1.0" encoding="utf-8"?>
        <?xml-stylesheet type="text/css" href="chrome://global/skin/"?>
        <?xml-stylesheet type="text/css" href="data:text/css,
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
        "?>
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
                    <spacer height="10"/>
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
        var encloseCheck, prefixBox, separatorBox, previewBox, previewLength;
        
        env = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
        
        window.addEventListener('load', init, true);
        window.addEventListener('dialogaccept', save, true);
        
        function init() {
            encloseCheck  = byId('enclose');
            prefixBox     = byId('prefix');
            separatorBox  = byId('separator');
            previewBox    = byId('preview');
            previewLength = byId('length');
            encloseCheck.checked = !!params.potTwitterEncUtil.getPref('enclose', true);
            prefixBox.value      = params.stringify(params.potTwitterEncUtil.getPref('prefix'));
            separatorBox.value   = params.stringify(params.potTwitterEncUtil.getPref('separator'));
            encloseCheck.addEventListener('command', build, true);
            prefixBox.addEventListener('input', build, true);
            separatorBox.addEventListener('input', build, true);
            build();
        }
        
        function save() {
            params.enclose   = !!byId('enclose').checked;
            params.prefix    = params.stringify(byId('prefix').value);
            params.separator = params.stringify(byId('separator').value);
            params.potTwitterEncUtil.setPref('enclose', params.enclose);
            params.potTwitterEncUtil.setPref('prefix', params.prefix);
            params.potTwitterEncUtil.setPref('separator', params.separator);
        }
        
        function build() {
            var psc = env.update({}, params.ps), status, q = '"';
            params.beforeFilter(psc, {
                enclose   : !!encloseCheck.checked,
                prefix    : params.stringify(prefixBox.value),
                separator : params.stringify(separatorBox.value)
            });
            status = params.joinText([
                psc.description,
                psc.body ? q + params.stringify(psc.body) + q : '',
                psc.item,
                psc.itemUrl
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
            case 'object':
                if (x && x.constructor === String) {
                    result = x;
                }
                break;
            default:
                break;
        }
    }
    return String(result);
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
    return potTwitterEncUtil;
}


})();

