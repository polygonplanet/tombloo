/**
 * Open Tumblr /archive - Tombloo/Tombfix patch
 *
 * @version    1.00
 * @date       2013-09-08
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 *              - Twitter: http://twitter.com/polygon_planet
 * @license    Same as Tombloo/Tombfix
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombfix.tumblr.archivelink.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

var LANG = function(n) {
    return ((n && (n.language  || n.userLanguage || n.browserLanguage ||
            n.systemLanguage)) || 'en').split(/[^a-zA-Z0-9]+/).shift().toLowerCase();
}(navigator);

var LABELS = {
    translate: function(name) {
        var r, o, p, args = Array.prototype.slice.call(arguments);
        p = args.shift();
        o = LABELS[p];
        while (o && args.length) {
            p = args.shift();
            o = o[p];
        }
        return o && o[LANG === 'en' && LANG || 'ja'];
    },
    OPEN_ARCHIVE: {
        ja: '/archive を開く',
        en: 'Open /archive'
    },
    OPEN_TAB_ARCHIVE: {
        ja: '/archive を新しいタブで開く',
        en: 'Open new tab /archive'
    },
    OPEN_ARCHIVE_LINK: {
        ja: 'リンク先の /archive を開く',
        en: 'Open /archive link'
    },
    OPEN_TAB_ARCHIVE_LINK: {
        ja: 'リンク先の /archive を新しいタブで開く',
        en: 'Open new tab /archive'
    }
};

var ICONS = {
    // icon: database_go.png : http://www.famfamfam.com/
    GO: [
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJMSURBVDjLpVPPaxNBGH3ZJCQkVSEkJJja',
        '0MSCabHoSUEKerAgggRy0ZP9F4QeDAhepKeeBA8GPFQCEutdCMRSSYkimouIVqUkNW1iyJZN0mR/',
        'zvrNwtbUGjw48JiZb773vvfN7jhM08T/DNfwplgsekjwBuEWY+wMzVMEWrKPNH+j+QmhmEqlDJvj',
        'sB0QeZrWz0Kh0GwkEoHf74fP5wM/lyQJ3W4XtVoNrVarRLGb6XS6bhF5AkehUFirVqu8nDlqaJpm',
        'VioVM5/Pr9g8wbZCm5lwOPzPnqPRKKjItSN3QEFLsdlswuv1wuPxwO12W7F+vw9RFFGv15FIJKzc',
        'kQIulwt7e3uQZdna67qOTqcDRVGsMx77q4Ddk9PptBzwZA7q2xJZrWYw0PaRmXwBwzj4CL/vwHbA',
        'kzmJgydy8JiiqxgPJpF5eR0aUxwjW7AJD98swGQaVKZDpf3JwBSSkQvoyvtY/XE/+HT57tjrRbF3',
        'RMCurjMVV2duwzAZDGaATrEjbePs+CX01AHe19al2QdC4JAAB6/OIZNlTq62v5JlipEbzdDQUbo4',
        'd2oOPa0vvN0qtQ8EuHX+qehPRKPRIAEZuqEjfHyCyIYltivVEBiL4MP2Bja+l1qqjvlhBwvlcvl5',
        'Mpn0x2IxDHQFK+VlugPVchMPTuNifB7vqiWsbRbbso7LO0vmJ8fwa8zlcpMkdI+QFgThBH8LvB3u',
        '7LF4xzw/MedY33y1qzDzCpG/HHpMf45sNnuMyKcJjC718yNpUTSY0zdgRvznkrll5/0CZpfQA8IR',
        'Xj8AAAAASUVORK5CYII='
    ].join(''),
    // icon: database_add.png : http://www.famfamfam.com/
    ADD: [
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIkSURBVDjLpVNNiFJRFP7eU1E0KSLTMpAw',
        'YSxyaidDtChm0WYQ3NSutv2s2kwwm2igNgMtooUQEQhhA9GqhSDTQsZZFDbNDBgVg5bSw9J8rzFF',
        '33udc+HGg0ladOHj3nPe+b7zc99VbNvG/yy30yiVSl4SnCNcsixrivYEgY7WJu0faX9EKGUyGVNy',
        'FFkBkY/T+WkoFEpFIhEEAgH4/X7w916vB8Mw0Gg00G63y+S7mM1mm4LIAYxisbhSr9c5nT1pjUYj',
        'u1qt2oVC4YnkqbIUMk6Ew+F/9hyNRkFJLuyaATmFoqZp8Pl88Hq98Hg8wtfv99HpdNBsNhGPx0Xs',
        'RAG3241ut4vBYCDs8XgMXdcxHA7FN/b9VUD25HK5RAUczKC+hYgcNpNN05xcAQdLkqIoIlj6VFWd',
        'XIEUkAQGV8M2k2vaG3z6sYGfVR39XzsHlm/dX3h5d31xlwAHM5goBd5+LuO75z3OnU3jyP4EVrZe',
        'KGub2p309cP7VKcAQ2Znoiz3deMVTk1Nw1RNTB+ahamMkD45w7RrfwSYwFdFf6K4Quf6pmvwKHsw',
        'l7wh7Jvnc4gfTPHR52zhcqVSeZZMJgOxWEyI8BC5CmOnh63WKtZbZczPPsa94hX4XCLJQHG+xnw+',
        'f5SEFghZmvhefgvcTqn2HN3gBmZSZ5CInMaHr1Wsvivjy3ZvSZn0nHO5XJDIxwgWDbW2vL10m9xX',
        'CUGCQXi49qA1/xvyq6BCh7yZeQAAAABJRU5ErkJggg=='
    ].join('')
};

[
    // 区切り線
    {
        name: '----',
        type: 'context'
    },
    {
        name: LABELS.translate('OPEN_ARCHIVE'),
        type: 'context',
        icon: ICONS.GO,
        check: function(ctx) {
            var re = /tumblr/i;
            return !/^https?:\/+www\.tumblr\.com/.test(ctx.href) && (re.test(ctx.host) ||
                (ctx.target && ctx.target.ownerDocument &&
                re.test(ctx.target.ownerDocument.documentElement.innerHTML)));
        },
        execute: function(ctx) {
            var url = ctx.href.replace(/^(http:\/+[^\/]+).*$/, '$1/') + 'archive';
            ctx.target.ownerDocument.location.href = url;
        }
    },
    {
        name: LABELS.translate('OPEN_TAB_ARCHIVE'),
        type: 'context',
        icon: ICONS.ADD,
        check: function(ctx) {
            var re = /tumblr/i;
            return !/^https?:\/+www\.tumblr\.com/.test(ctx.href) && (re.test(ctx.host) ||
                (ctx.target && ctx.target.ownerDocument &&
                re.test(ctx.target.ownerDocument.documentElement.innerHTML)));
        },
        execute : function(ctx) {
            var url = ctx.href.replace(/^(http:\/+[^\/]+).*$/, '$1/') + 'archive';
            addTab(url);
        }
    },
    {
        name: LABELS.translate('OPEN_ARCHIVE_LINK'),
        type: 'context',
        icon: ICONS.GO,
        check: function(ctx) {
            var re = /tumblr/i;
            var url = ctx.linkURL;
            return ctx.onLink && !/^https?:\/+www\.tumblr\.com/.test(url) && (re.test(url) ||
                (ctx.target && ctx.target.ownerDocument &&
                 re.test(ctx.target.ownerDocument.documentElement.innerHTML)));
        },
        execute: function(ctx) {
            var url = ctx.linkURL.replace(/^(http:\/+[^\/]+).*$/, '$1/') + 'archive';
            ctx.target.ownerDocument.location.href = url;
        }
    },
    {
        name: LABELS.translate('OPEN_TAB_ARCHIVE_LINK'),
        type: 'context',
        icon: ICONS.ADD,
        check: function(ctx) {
            var re = /tumblr/i;
            var url = ctx.linkURL;
            return ctx.onLink && !/^https?:\/+www\.tumblr\.com/.test(url) && (re.test(url) ||
                (ctx.target && ctx.target.ownerDocument &&
                 re.test(ctx.target.ownerDocument.documentElement.innerHTML)));
        },
        execute : function(ctx) {
            var url = ctx.linkURL.replace(/^(http:\/+[^\/]+).*$/, '$1/') + 'archive';
            addTab(url);
        }
    },
    {
        name: '----',
        type: 'context'
    }
].forEach(function(item) {
    Tombfix.Service.actions.register(item, '----');
});


}());
