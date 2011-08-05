/**
 * Service.Actions.ChangeAcount.Resize - Tombloo patches
 *
 * 「アカウントの切り替え」ダイアログを内容サイズに合わせてリサイズするパッチ
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
 * @version    1.04
 * @date       2011-08-06
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
        let win, resize, sort, getItems, usersList, modelSelect;
        getItems = function() {
            let items = win.document.querySelectorAll('#users .listitem-iconic');
            return Array.prototype.slice.call(items) || [];
        };
        resize = function() {
            let d = new Deferred(), start, timeout, interval, resizeTo;
            start    = +new Date;
            timeout  = 15 * 1000;
            interval = 150;
            resizeTo = function() {
                let elems, stop = false, size = {}, max;
                max = {
                    diff   : 0,
                    height : 0,
                    box    : usersList.boxObject.width
                };
                // リストアイテムすべての幅を調べる (読み込まれてる場合)
                getItems().forEach(function(item) {
                    let diff;
                    try {
                        diff = Math.floor((item.getAttribute('label').length * 6.128) - max.box);
                        max.height += item.scrollHeight || 0;
                        if (diff > max.diff) {
                            max.diff = diff;
                        }
                    } catch (e) {}
                });
                if (max.diff > 0) {
                    try {
                        size.width  = win.outerWidth + max.diff + 60;
                        size.height = win.outerHeight + max.height + 20;
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
                    setTimeout(resizeTo, interval);
                } else {
                    d.callback();
                }
            };
            setTimeout(resizeTo, 0);
            return d;
        };
        sort = function() {
            let sorted = false, elems, newItems = [], labels = [];
            elems = getItems();
            elems.forEach(function(item) {
                labels.push(item.getAttribute('label'));
            });
            alphanumSort(labels);
            labels.forEach(function(label) {
                let done = false;
                elems.forEach(function(item) {
                    if (!done && item.getAttribute('label') === label) {
                        newItems.push(item);
                        done = true;
                    }
                });
            });
            if (newItems && newItems.length === elems.length) {
                clearChildren(usersList);
                newItems.forEach(function(item) {
                    usersList.appendChild(item);
                    if (item.disabled || /tick[.]\w+$/i.test(item.getAttribute('image'))) {
                        usersList.selectedItem = item;
                    }
                });
                sorted = true;
            }
            return sorted;
        };
        win = openDialog(
            'chrome://tombloo/content/library/login.xul',
            [
                'resizable',
                'centerscreen',
                //'width='  + MAX_WIDTH,
                //'height=' + MAX_HEIGHT
            ].join(',')
        );
        win.addEventListener('load', function() {
            let doSort = function() {
                let timeout = 5 * 1000, start = +new Date;
                till(function() {
                    let end = false;
                    if (sort()) {
                        end = true;
                    } else if (+new Date - start > timeout) {
                        end = true;
                    }
                    return end;
                });
            };
            usersList = win.document.getElementById('users');
            modelSelect = win.document.getElementById('models');
            callLater(1, function() {
                modelSelect.addEventListener('select', function() {
                    doSort();
                }, true);
            });
            callLater(0.12, function() {
                resize().addCallback(function() {
                    doSort();
                });
            });
        }, true);
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
 * @param  {Array}    array   対象の配列
 * @return {Array}            ソートされた配列 (引数そのもの)
 */
function alphanumSort(array) {
    let chunkify, alphanumCase;
    chunkify = function(t) {
        let tz = [], x = 0, y = -1, n = 0, i, j, m;
        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            m = (i == 46 || (i >=48 && i <= 57));
            if (m !== n) {
                tz[++y] = '';
                n = m;
            }
            tz[y] += j;
        }
        return tz;
    };
    alphanumCase = function(a, b) {
        let aa, bb, c, d, x, 
        aa = chunkify(a.toLowerCase());
        bb = chunkify(b.toLowerCase());
        for (x = 0; aa[x] && bb[x]; x++) {
            if (aa[x] !== bb[x]) {
                c = Number(aa[x]);
                d = Number(bb[x]);
                if (c == aa[x] && d == bb[x]) {
                    return c - d;
                } else {
                    return (aa[x] > bb[x]) ? 1 : -1;
                }
            }
        }
        return aa.length - bb.length;
    };
    return array.sort(alphanumCase);
}


})();

