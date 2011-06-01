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
 *
 * -----------------------------------------------------------------------
 *
 * @version  1.10
 * @date     2011-06-01
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

// Util object
var potTwitterEncUtil = definePotTwitterEncUtil();

// postの前に代替テキストとセパレータを設定
addBefore(Twitter, 'post', function(ps) {
    var params = {}, name;
    for each (name in ['prefix', 'separator']) {
        params[name] = stringify(potTwitterEncUtil.getPref(name));
    }
    beforeFilter(ps, params.prefix, params.separator);
});

// コンテキストメニューに設定ダイアログを登録
Tombloo.Service.actions.register({
    name: 'Twitter enclosure settings',
    type: 'context',
    icon: Twitter.ICON,
    check: function(ctx) {
        return true;
    },
    execute: function(ctx) {
        var params = {
            prefix: stringify(potTwitterEncUtil.getPref('prefix')),
            separator: stringify(potTwitterEncUtil.getPref('separator')),
            ps: {
                item: ctx.title || ctx.document && ctx.document.title,
                itemUrl: ctx.href,
                body: '',
                description: ''
            },
            window: window,
            joinText: joinText,
            stringify: stringify,
            beforeFilter: beforeFilter,
            potTwitterEncUtil: potTwitterEncUtil
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
}, 'Twitter enclosure settings');


/**
 * タイトルを括弧(「」)で囲い先頭に「見てる」などを付ける
 *
 * @param  {Object}   ps          post()に渡すオブジェクト
 * @param  {String}   prefix      先頭に付けるテキスト
 * @param  {String}   separator   テキストとタイトルを区切るときの文字
 */
function beforeFilter(ps, prefix, separator) {
    var brackets, contents, desc, item, body, itemUrl, word, make, sep;
    brackets = [
        // 括弧の中でタイトル文字列に使用されていないものを使う
        '「」', '“”', '『』', '‘’', '≪≫', '＜＞',
        '－－', '――', '──', '～～', 
        '""',   "''",   '--',
        '〔〕', '［］', '｛｝', '〈〉', '（）', '《》', '【】'
    ].map(function(b) {
        return b.split('');
    });
    sep = String(separator || '');
    word = /[一-龠々〆ぁ-んァ-ヶｦ-ｯｱ-ﾝ\u301Cー～－ｰ-ﾞ゛ﾟ゜ａ-ｚＡ-Ｚ０-９\w]/i;
    make = function() {
        return trim(joinText([desc, body, item, itemUrl], ' '));
    };
    // 余分なスペースなどを除去する
    desc = ltrim(spacize(stringify(ps.description || stringify(prefix) || '')));
    item = trim(spacize(stringify(ps.item)));
    body = ps.body ? trim(ps.body).wrap('"') : '';
    itemUrl = ps.itemUrl ? 'http://bit.ly/-*-*-*-*-*' : '';
    
    // 140文字以上なら余分なものは付加しない。可能なかぎり切り詰める。
    contents = make();
    while (item && item.length > 1 && contents.length >= 138) {
        item = spacize(item).slice(0, -2) + '…';
        if (item.length === 1) {
            item = '';
        }
        contents = make();
    }
    while (desc && desc.length > 1 && contents.length >= 138) {
        desc = spacize(desc).slice(0, -2) + '…';
        if (desc.length === 1) {
            desc = '';
        }
        contents = make();
    }
    
    // 記号以外の文字で終わってたらセパレータを付加
    if (desc && word.test(desc.slice(-1)) && desc.slice(-1) !== sep) {
        desc += sep;
    }
    
    contents = make();
    if (item && item.length && contents.length <= 138) {
        brackets = brackets.filter(function(b) {
            return item.indexOf(b[0]) === -1 && item.indexOf(b[1]) === -1;
        }).shift();
        
        // 140文字に収まるなら括弧で囲う
        if (brackets && brackets.length <= 2) {
            item = [
                stringify(brackets.shift()),
                stringify(brackets.pop())
            ].join(item);
        }
    }
    ps.description = desc;
    ps.item = item;
}


function generateXUL() {
    var head, template, script, code;
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
        #prefix {
            margin-left: 0.2em;
        }
        #submit-button {
            font-weight: bold;
            padding: 0.5em 0.7em 0.5em 0.4em;
        }
        "?>
        <dialog title="Twitter enclosure settings" buttons="accept"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:html="http://www.w3.org/1999/xhtml">
            <hbox flex="1">
                <vbox style="margin-left: 0.7em;" flex="1">
                    <label value="何も入力しなかったときの代替テキスト："/>
                    <textbox id="prefix" rows="1" multiline="false"
                             maxlength="140" value=""/>
                    <spacer height="5"/>
                    <label value="代替テキストの後に付くセパレータ："/>
                    <label value="セパレータは代替テキストの末尾が記号の場合は付きません"
                           style="margin: 0.5em; font-size: small;"/>
                    <textbox id="separator" rows="1" multiline="false"
                             maxlength="140" value=""/>
                    <spacer height="7"/>
                    <textbox id="preview" rows="5" multiline="true"
                             readonly="true" value=""/>
                    <spacer height="10"/>
                    <button id="submit-button" dlgtype="accept" 
                            image="chrome://tombloo/skin/accept.png"/>
                </vbox>
            </hbox>
            <script>{SCRIPT}</script>
        </dialog>
    ]]></>.toString());
    
    script = <><![CDATA[
        var args = arguments, params = args[0], env;
        var prefixBox, separatorBox, previewBox;
        
        env = Components.classes['@brasil.to/tombloo-service;1'].getService().wrappedJSObject;
        
        window.addEventListener('load', init, true);
        window.addEventListener('dialogaccept', save, true);
        
        function init() {
            prefixBox = byId('prefix');
            separatorBox = byId('separator');
            previewBox = byId('preview');
            prefixBox.value = params.stringify(params.potTwitterEncUtil.getPref('prefix'));
            separatorBox.value = params.stringify(params.potTwitterEncUtil.getPref('separator'));
            prefixBox.addEventListener('input', build, true);
            separatorBox.addEventListener('input', build, true);
            build();
        }
        
        function save() {
            params.prefix = params.stringify(byId('prefix').value);
            params.separator = params.stringify(byId('separator').value);
            params.potTwitterEncUtil.setPref('prefix', params.prefix);
            params.potTwitterEncUtil.setPref('separator', params.separator);
        }
        
        function build() {
            var psc = env.update({}, params.ps), q = '"';
            params.beforeFilter(
                psc,
                params.stringify(prefixBox.value),
                params.stringify(separatorBox.value)
            );
            previewBox.value = params.joinText([
                psc.description,
                psc.body ? q + params.stringify(psc.body) + q : '',
                psc.item,
                psc.itemUrl
            ], ' ');
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
        getPref: function(key) {
            return getPref(PREF_PREFIX + key);
        },
        setPref: function(key, val) {
            return setPref(PREF_PREFIX + key, val);
        }
    };
    return potTwitterEncUtil;
}


})();

