/**
 * Service.Actions.ChangeAcount.Resize - Tombloo patches
 *
 * 「アカウントの切り替え」ダイアログをリサイズするだけのパッチ
 *
 * 機能:
 * --------------------------------------------------------------------------
 * [Service Actions ChangeAcount Resize patch]
 *
 * - 「アカウントの切り替え」ダイアログを内容に合わせてリサイズする
 * - ユーザー名リストをソートする
 *
 * --------------------------------------------------------------------------
 *
 * @version    1.01
 * @date       2011-08-05
 * @author     polygon planet <polygon.planet@gmail.com>
 *              - Blog    : http://polygon-planet.blogspot.com/
 *              - Twitter : http://twitter.com/polygon_planet
 *              - Tumblr  : http://polygonplanet.tumblr.com/
 * @license    Same as Tombloo
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.service.actions.changeacount.resize.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function(undefined) {

// デフォルトのダイアログの幅
const MAX_WIDTH  = 600;

// デフォルトのダイアログの高さ
const MAX_HEIGHT = 600;

// changeAcountをアップデート
update(Tombloo.Service.actions[getMessage('label.action.changeAcount')], {
    execute: function() {
        let win, resize, start, timeout, interval;
        start    = +new Date;
        timeout  = 15 * 1000;
        interval = 150;
        resize = function() {
            let elems, stop = false, size = {}, max = {
                diff   : 0,
                height : 0
            };
            // リストアイテムすべての幅を調べる (読み込まれてる場合)
            elems = win.document.querySelectorAll('#users .listitem-iconic');
            elems = Array.prototype.slice.call(elems) || [];
            elems.forEach(function(item) {
                let diff, orgWidth;
                try {
                    orgWidth = item.width;
                    item.style.overflow = 'scroll';
                    diff = item.scrollWidth - orgWidth;
                    max.height += item.scrollHeight || 0;
                    if (diff > max.diff) {
                        max.diff = diff;
                    }
                } catch (e) {} finally {
                    if (item) {
                        item.style.overflow = '';
                    }
                }
            });
            if (max.diff > 0) {
                try {
                    size.width  = win.outerWidth + max.diff + 60;
                    size.height = win.outerHeight + 10;
                    win.resizeTo(
                        Math.min(MAX_WIDTH, size.width)   || MAX_WIDTH,
                        Math.min(MAX_HEIGHT, size.height) || MAX_HEIGHT
                    );
                    stop = true;
                    win.centerWindowOnScreen();
                } catch (e) {}
            }
            // ロードが完了してない場合はタイムアウトまで再試行
            if (!stop && (+new Date - start < timeout)) {
                setTimeout(resize, interval);
            }
            if (stop) {
                // ユーザー名でソート
                {
                    let listbox, newItems = [], labels = [];
                    elems.forEach(function(item) {
                        labels.push(item.label);
                    });
                    alphanumSort(labels, true);
                    labels.forEach(function(label) {
                        let pushed;
                        elems.forEach(function(item) {
                            if (!pushed && item.label === label) {
                                newItems.push(item);
                                pushed = true;
                            }
                        });
                    });
                    if (newItems && newItems.length === elems.length) {
                        elems.forEach(function(item) {
                            if (!listbox) {
                                listbox = item.parentNode;
                            }
                            removeElement(item);
                        });
                        newItems.forEach(function(item) {
                            listbox.appendChild(item);
                        });
                    }
                }
            }
        };
        win = openDialog(
            'chrome://tombloo/content/library/login.xul',
            [
                'resizable',
                'centerscreen',
                'width='  + MAX_WIDTH,
                'height=' + MAX_HEIGHT
            ].join(',')
        );
        setTimeout(resize, 0);
        return win;
    }
});


/**
 * ヒューマンライクなソート (natural sort)
 *
 * Based: http://www.davekoelle.com/alphanum.html
 *
 * @example   alphanumSort(['a10', 'a2', 'a100', 'a1', 'a12']);
 * @results   ['a1', 'a2', 'a10', 'a12', 'a100']
 *
 * @param  {Array}    array            対象の配列
 * @param  {Boolean}  caseInsensitive  大文字小文字を区別しない
 * @return {Array}                     ソートされた配列 (引数そのもの)
 */
function alphanumSort(array, caseInsensitive) {
    let z, t, x, y, n, i, j, m, h;
    if (array && typeof array.splice === 'function') {
        for (z = 0; t = array[z]; z++) {
            array[z] = [];
            x = n = 0;
            y = -1;
            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                m = (i == 46 || (i >= 48 && i <= 57));
                if (m != n) {
                    array[z][++y] = '';
                    n = m;
                }
                array[z][y] += j;
            }
        }
        array.sort(function(a, b) {
            let x, aa, bb, c, d;
            for (x = 0; (aa = a[x]) && (bb = b[x]); x++) {
                if (caseInsensitive) {
                    aa = aa.toLowerCase();
                    bb = bb.toLowerCase();
                }
                if (aa != bb) {
                    c = Number(aa);
                    d = Number(bb);
                    if (c == aa && d == bb) {
                        return c - d;
                    } else {
                        return (aa > bb) ? 1 : -1;
                    }
                }
            }
            return a.length - b.length;
        });
        for (z = 0, h = array.length; z < h; z++) {
            array[z] = array[z].join('');
        }
    }
    return array;
}


})();

