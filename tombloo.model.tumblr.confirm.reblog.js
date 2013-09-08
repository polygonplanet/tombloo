/**
 * Tombloo.Model.Tumblr.Confirm.Reblog - Tombloo patches
 *
 * Tumblrでリブログ/ポストするとき特定のアカウントだったら警告するTomblooパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 *
 * - 指定されたアカウントだったら警告(確認ダイアログ表示)
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.03
 * @date       2013-09-08
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter : http://twitter.com/polygon_planet
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.tumblr.confirm.reblog.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {


var LANG = function(n) {
    return ((n && (n.language  || n.userLanguage || n.browserLanguage ||
            n.systemLanguage)) || 'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);


var LABELS = {
    translate : function(name) {
        var r, o, p, args = Array.prototype.slice.call(arguments);
        p = args.shift();
        o = LABELS[p];
        while (o && args.length) {
            p = args.shift();
            o = o[p];
        }
        return o && o[LANG === 'en' && LANG || 'ja'];
    },
    MENU_LABEL : {
        ja : 'リブログ確認の設定',
        en : 'Settings for reblog confirm'
    }
};


var MENU_LABEL = LABELS.translate('MENU_LABEL');


var PrefUtil = definePrefUtil();


Tombloo.Service.actions.register({
    name : MENU_LABEL,
    type : 'context,menu',
    // icon: http://www.famfamfam.com/
    icon : [
        'data:image/png;base64',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKRSURBVDjLpZNrSNNRGIeVuaSLrW2NCozl',
        'SsrCvqifKrG1vyznRDLQMi9TsamsUCzvSWJKC0Ms0/I2hratmVbi3bLIysRZlgh9qFGuCKOF5Kao',
        'nV9n+yAGokIHHs7hhd/zvofDcQHg8j8sW0wN2FpQJuVNl8u2QC3loEDMtUX7CYrXJDjrx8u6FcYl',
        'NVE83KbciOCiNISD9MDNRHaQf3lVQZWMgwYaVNNQqcwBF1dCBbhwlIczfpypVQWlgZvQVZUPS6ca',
        'g7XpOBckQIZkB9IYEZIPcee02XL3FQU1scKfM98/YOpFFb72XseooRDm9quwmk3QKXdPvdOkrltR',
        'UBG9f8A6dBeTw0bY3+ooeufZatLhToLv8IpX2CZrYnsfTtXqVP6YHa7FzFirE/ubJrRk+sM3UHlf',
        'wNSsX1YgCNG586WNKZ7SPox9mYYhLwz6PLkTx/n5+G94Bj8BT1x3ni+u3vCPgH/c4OoRbIgXhg5g',
        '3GJHowXIGANSXgOJT4G4DkBTXolnMT7oFbPxgNlo7WDYuYuCAxH14ZKTahgHF1A9CqheESj7CZK6',
        'CWIfElwrqsRI5hHMtJeBjHfBps/AUJrvn55jbiqnYCR/38JkWzZu1rchvpN2pR0VjwhimglONREY',
        'w/fATsOokANZXKDECz/UQeiWsD45BaMFPsTaU4So5AYU99oQ3Qyc1hNEagkiagn66NjE1IKl61fh',
        'dlp3I07Be60qx5TjPa9QlMwHxPdDQUdPWELrCSGm6xIBGpq96AIr5bOShW6GZVl8BbM+xeNSbjF/',
        'V3hbtTBIMyFi7tlEwc1zIolxLjM0bv5l4l58y/LCZA4bH5Nc8VjuttDFsHLX/G0HIndm045mx9h0',
        'n3CEHfW/dpehdpL0UXsAAAAASUVORK5CYII='
    ].join(''),
    check : function(ctx) {
        return true;
    },
    execute : function(ctx) {
        openDialog(
            generateXUL(),
            'chrome,alwaysRaised,resizable,centerscreen,minimizable,titlebar,close',
            {PrefUtil : PrefUtil}
        );
    }
}, '----');


['post', 'favor'].forEach(function(action) {
    addAround(Tumblr, action, function(proceed, args) {
        var ok = false, accounts;

        try {
            accounts = JSON.parse(PrefUtil.getPref('accounts')).accounts;
        } catch (e) {
            accounts = [];
        }
        accounts = accounts || [];

        if (accounts.some(function(v) { return v === Tumblr.user; })) {
            ok = confirm('アカウントは ' + Tumblr.user + ' です。よろしいですか？');
        } else {
            ok = true;
        }

        if (ok) {
            return proceed(args);
        } else {
            return fail('Disabled account');
        }
    });
});


function generateXUL() {
    var head, template, script, style, code, labels;

    labels = {
        template : {
            '{TITLE}' : {
                ja : 'Tombloo - ' + MENU_LABEL,
                en : 'Tombloo - ' + MENU_LABEL
            },
            '{DESCRIPTION}' : {
                ja : 'リブログ/ポスト時に確認するアカウント(email)を1行ずつ設定します',
                en : 'Set your account name (email) one line at a time when you reblogged.'
            },
            '{NOTES}' : {
                ja : 'アカウント名は「アカウントの切り替え」から確認できます',
                en : 'You can confirm your account name by *Change Account*.'
            },
            '{BUTTON_CLEAR}' : {
                ja : 'クリア',
                en : 'Clear'
            },
            '{BUTTON_OK}' : {
                ja : '保存',
                en : 'OK'
            },
            '{BUTTON_CANCEL}' : {
                ja : 'キャンセル',
                en : 'Cancel'
            }
        },
        script : {}
    };

    head = 'data:application/vnd.mozilla.xul+xml;charset=utf-8,';

    style = ['data:text/css,', encodeURIComponent([
        'window, dialog {',
            'margin: 0.7em 0.5em;',
            'width: 360px;',
            'height: 300px;',
        '}',
        'button {',
            'cursor: pointer;',
            'margin-top: 0.7em;',
            'padding: 0.5em 0.7em 0.5em 0.4em;',
            'height: 3.2em;',
            'vertical-align: bottom;',
        '}',
        '.button-icon {',
            'margin-right: 0.5em;',
        '}',
        '#submit-button, #cancel-button, #clear-button {',
            'font-weight: bold;',
        '}',
    ].join('\n'))].join('');

    template = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<?xml-stylesheet type="text/css" href="chrome://global/skin/"?>',
        '<?xml-stylesheet type="text/css" href="chrome://global/skin/global.css"?>',
        '<?xml-stylesheet type="text/css" href="{STYLE}"?>',
        '<dialog title="{TITLE}" buttons="accept,cancel"',
                'xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"',
                'xmlns:html="http://www.w3.org/1999/xhtml">',
            '<hbox flex="1">',
                '<vbox style="margin: 0.2em;" flex="1">',
                    '<hbox flex="1">',
                        '<vbox flex="1">',
                            '<label value="{DESCRIPTION}"/>',
                            '<spacer height="1"/>',
                            '<label value="{NOTES}"/>',
                            '<spacer height="2"/>',
                        '</vbox>',
                    '</hbox>',
                    '<hbox flex="15">',
                        '<textbox id="input" multiline="true" flex="15" rows="12" value=""/>',
                    '</hbox>',
                    '<hbox flex="1" align="right">',
                        '<hbox align="right" pack="end" flex="1">',
                            '<button id="clear-button" tooltiptext="{BUTTON_CLEAR}"',
                                    'label="{BUTTON_CLEAR}"/>',
                            '<spacer width="35" height="2"/>',
                            '<button id="submit-button" dlgtype="accept" tooltiptext="{BUTTON_OK}"',
                                    'image="chrome://tombloo/skin/accept.png" label="{BUTTON_OK}"/>',
                            '<button id="cancel-button" dlgtype="cancel"',
                                    'tooltiptext="{BUTTON_CANCEL}" label="{BUTTON_CANCEL}"/>',
                        '</hbox>',
                    '</hbox>',
                '</vbox>',
            '</hbox>',
            '<script type="application/javascript;version=1.7">{SCRIPT}</script>',
        '</dialog>',
    ].join('\n');

    script = [
        "var env, args, accounts, input;",
        "",
        "args = arguments[0];",
        "env = Components.classes['@tombfix.github.io/tombfix-service;1'].getService().wrappedJSObject;",
        "env.extend(this, env, false);",
        "",
        "void function() {",
            "try {",
                "accounts = JSON.parse(args.PrefUtil.getPref('accounts')).accounts;",
            "} catch (e) {",
                "accounts = [];",
            "}",
        "}();",
        "",
        "window.addEventListener('load', function() {",
            "input = document.getElementById('input');",
            "input.value = accounts.join('\\n');",
            "",
            "document.getElementById('clear-button').addEventListener('click', function() {",
                "input.value = '';",
            "}, false);",
        "}, false);",
        "",
        "window.addEventListener('dialogaccept', function() {",
            "var val = ('' + input.value).split(/\\r\\n|\\r|\\n/).map(function(v) {",
                "return v.replace(/^\\s+|\\s+$/g, '');",
            "}).filter(function(v) {",
                "return v;",
            "});",
            "args.PrefUtil.setPref('accounts', JSON.stringify({accounts : val}));",
        "}, false);"
    ].join('\n');
    
    (function() {
        var lang = LANG === 'ja' && LANG || 'en';
        forEach(labels.template, function([key, vals]) {
            template = template.split(key).join(vals[lang]);
        });
        forEach(labels.script, function([key, vals]) {
            script = script.split(key).join(vals[lang]);
        });
    }());

    template = template.split('{STYLE}').join(style);
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


function stringify(x) {
    var result = '', c;
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
        }
    }
    return result.toString();
}


function definePrefUtil() {
    /**
     * setPref/getPref で使うキー名
     *
     * 接頭語を patches にしておく (その先頭に 'extensions.tombloo.' が付く)
     * 他のパッチと同じにならないようidをつけておく
     */
    var PREF_PREFIX = 'patches.polygonplanet.extension.confirm.reblog.';
    return {
        getPref : function(key, def) {
            var value = getPref(PREF_PREFIX + key);
            if (value === void 0) {
                value = def;
            }
            return value;
        },
        setPref : function(key, val) {
            return setPref(PREF_PREFIX + key, val);
        }
    };
}


}());
