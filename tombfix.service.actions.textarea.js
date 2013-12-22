/**
 * Create <textarea/> - Tombloo/Tombfix patch
 *
 * @version    1.00
 * @date       2013-12-21
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter: http://twitter.com/polygon_planet
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombfix.service.actions.textarea.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 * Tombfix: https://github.com/tombfix/core
 */
(function() {

var LANG = (function(n) {
    return ((n && (n.language  || n.userLanguage || n.browserLanguage ||
            n.systemLanguage)) || 'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator));


var LABELS = {
    translate: function(name) {
        return this[name][LANG === 'en' && LANG || 'ja'];
    },
    CREATE_TEXTAREA: {
        ja: 'ここに<textarea/>を作る',
        en: 'Create <textarea/> here'
    }
};


var ICONS = {
    CREATE_TEXTAREA: [
        // icon: tab_edit.png : http://www.famfamfam.com/
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHWSURBVDjLzZPdS1NxGMf3L3TbXV5EEN50',
        '30UJpTdClBBKSgh2Y5cyW0QXISY2eiGxklYgGoaE2YtFdTjHvZyO25i6uReOuRc3T7TNnOFOw8bH',
        's2MmZUEQRRefm9+P74fn9zzPzwJY/gTLPxUsjB04Hh06ifq4i+m7R5jp29/82+HFiT2NmmBlZfYp',
        'fMrwcXYU+Urte/PS4XDUGLw14Gc8G+4gF7pIaXEcTeylGHzEl4SL4L02fUsQ9vtl0mnVJJOpML9J',
        'bITl0AXKRRfFd+3kp84SGWwlMHC6PHXj2N4twYd4PIzH40KSJBOn04lX6GM5eI6yLrM234KeamI1',
        'bCNxv54HA/bStyZuCiIoimwG3W430lgvmtf6NdyMnmykEDqPeqsOLSJWnqZ/J0gmY/h8XmRZZnL8',
        'KuEXHUbZk+jxVj6nTrFiVKL21zLnFclmMzsFqZRKIODn5VA3c89tzExcI600sBZvIj/dSex2vRmO',
        'RiPkctq2oNJlQXhlHC6Rzy/xsKcGVhNE75xAsO3GbZTssR8lu+CjUMga5ExEUTAnZPlxZJfaqinJ',
        'Nykp11G6DjFyporB/h5+NeIdC9NwcJfe3bJv/c3luvXX9sPSE2t11f/zF/6KYAOj9QWRU1s5XQAA',
        'AABJRU5ErkJggg=='
    ].join('')
};


[
    {
        name: LABELS.translate('CREATE_TEXTAREA'),
        type: 'context',
        icon: ICONS.CREATE_TEXTAREA,
        check: function(ctx) {
            return ctx.target != null && ctx.target.parentNode != null;
        },
        execute: function(ctx) {
            var elem = ctx.document.createElement('textarea');
            elem.style.width = '300px';
            elem.style.height = '200px';
            elem.style.padding = '2px';
            ctx.target.parentNode.appendChild(elem);
            elem.focus();
        }
    }
].forEach(function(item) {
    Tombfix.Service.actions.register(item, '----');
});


}());
