/**
 * Download Tumblr Archive - Tombfix patch
 *
 * Tumblr/archiveページで 右クリック→Tumbfix→「Download archive photos」
 * 肌色っぽい画像だけでてきてクリックするとLocalに保存される
 * HighResがあればHighResで保存する
 *
 * @version   1.0.1
 * @date      2014-08-09
 * @license   MIT
 * @updateURL https://github.com/polygonplanet/tombloo/raw/master/tombfix.tumblr.archivedownload.js
 */

Tombfix.Service.actions.register({
    name: 'Download archive photos',
    type: 'context',
    check: function(ctx) {
        return /\/archive/.test(ctx.href);
    },
    execute: function(ctx) {
        var self = this;
        var win = ctx.window;
        var doc = ctx.document;
        var baseUrl = ctx.href.match(/^(https?:\/+[^\/]+)\/archive/)[1];

        var images = this.getAllImages(doc);
        var archive = this.getArchive(win, doc, baseUrl);

        this.updateDate(doc, archive);

        var pagination = $x('//*[@id="pagination"]', doc);
        while (doc.body.firstChild) {
            doc.body.removeChild(doc.body.firstChild);
        }

        doc.body.appendChild(archive.container);

        if (pagination) {
            doc.body.appendChild(pagination);
        }
        doc.body.appendChild(archive.status);

        var nextLink = $x('//*[@id="next_page_link"]', doc);
        var query = '';

        if (nextLink) {
            query = nextLink.getAttribute('href');
            nextLink.parentNode.removeChild(nextLink);
        }

        var next = this.createElement(doc, 'div', {
            style: {
                display: 'none'
            },
            attr: {
                id: 'tumbfixArchiveDownload_next',
                'data-href': query
            }
        });
        doc.body.appendChild(next);

        win.addEventListener('scroll', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            archive.onScroll();
        }, false);

        archive.date.onChange = function() {
            self.appendDate(archive);
        };
        this.appendDate(archive);
        this.getImages(archive, images);
    },
    getArchive: function(win, doc, baseUrl) {
        var self = this;

        var archive = {
            doc: doc,
            baseUrl: baseUrl,
            timer: null,
            fetching: false,
            maxWidth: win.innerWidth - 50,
            itemWidth: 150,
            maxWidthIndex: 0,
            heights: [],
            date: {
                set: function(year, month) {
                    if (this.year !== year || this.month !== month) {
                        this.changed = true;
                    }
                    this.year = year;
                    this.month = month;

                    if (this.changed) {
                        this.onChange && this.onChange();
                        this.changed = false;
                    }
                },
                changed: false,
                year: null,
                month: null
            },
            status: this.createElement(doc, 'div', {
                style: {
                    position: 'fixed',
                    left: '42%',
                    bottom: '20px',
                    background: '#fff',
                    padding: '.5em 1em',
                    opacity: '1',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    boxShadow: '1px 1px 5px #555',
                    display: 'none',
                    zIndex: 99999
                },
                text: 'Download Completed.'
            }),
            onScroll: function() {
                if (archive.fetching) {
                    return;
                }

                if (win.scrollY >= win.scrollMaxY) {
                    var next = $x('//*[@id="tumbfixArchiveDownload_next"]', doc);
                    var query = next.getAttribute('data-href');

                    if (query) {
                        var url = archive.baseUrl + query;

                        request(url).addCallback(function(res) {
                            var doc = convertToHTMLDocument(res.responseText);

                            self.updateDate(doc, archive);
                            var nextPage = $x('//*[@id="next_page_link"]', doc);

                            if (nextPage) {
                                next.setAttribute('data-href', nextPage.getAttribute('href'));
                            } else {
                                next.setAttribute('data-href', '');
                            }
                            self.getImages(archive, self.getAllImages(doc));
                        });
                    }
                }
            }
        };

        archive.maxWidthIndex = Math.round(archive.maxWidth / archive.itemWidth);
        archive.heights = Array.apply(null, { length: archive.maxWidthIndex - 1 }).map(function() {
            return 100;
        });

        archive.container = this.createElement(doc, 'div', {
            style: {
                width: archive.maxWidth,
                position: 'absolute',
                left: '70px',
                top: '-50px'
            }
        });
        return archive;
    },
    getAllImages: function(doc) {
        return $x('//*[contains(@class, "post")]/*[contains(@class, "post_content")]' +
            '/*[contains(@class, "has_imageurl")]/@data-imageurl', doc, true);
    },
    updateDate: function(doc, archive) {
        var posts = $x('//*[starts-with(@id, "posts_")]', doc);

        if (posts && posts.id && /\d{6,}/.test(posts.id)) {
            var date = posts.id.match(/posts_(\d{4})(\d{2})/);
            if (date) {
                archive.date.set(date[1], date[2]);
            }
        }
    },
    createElement: function(doc, name, options) {
        options || (options = {});

        var el = doc.createElement(name);
        var style = options.style;
        var text = options.text;
        var attr = options.attr;

        style && Object.keys(style).forEach(function(key) {
            el.style[key] = style[key];
        });

        if (text != null) {
            el.textContent = text;
        }

        attr && Object.keys(attr).forEach(function(key) {
            el.setAttribute(key, attr[key]);
        });

        return el;
    },
    createDate: function(doc, year, month) {
        var wrap = this.createElement(doc, 'div', {
            style: {
                margin: '0px',
                padding: '0px'
            }
        });

        var date = this.createElement(doc, 'a', {
            style: {
                margin: '0px',
                padding: '0px'
            },
            text: year + '/' + month
        });

        return wrap.appendChild(date), wrap;
    },
    createImage: function(doc, src) {
        return this.createElement(doc, 'img', {
            style: {
                margin: '0px',
                padding: '0px'
            },
            attr: {
                src: src
            }
        });
    },
    // 日付クリックでその月のarchiveに移動(どんどん重くなるため)
    appendDate: function(archive) {
        var max = Math.max.apply(null, archive.heights) || 0;

        archive.heights = archive.heights.map(function() {
            return max + 100;
        });

        var dateWrap = this.createDate(archive.doc, archive.date.year, archive.date.month);
        var date = dateWrap.firstChild;

        date.href = archive.baseUrl + '/archive/' +
            archive.date.year + '/' + ('' + archive.date.month).replace(/^0/, '');

        var style = {
            position: 'absolute',
            left: '10px',
            top: ((parseInt(max) || 0) + 20) + 'px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            zIndex: 99999
        };

        Object.keys(style).forEach(function(key) {
            date.style[key] = style[key];
        });

        archive.container.appendChild(date);
    },
    appendImage: function(archive, src, imgWidth, imgHeight) {
        var self = this;
        var img = this.createImage(archive.doc, src);

        img.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var ps = {
                type: 'photo',
                itemUrl: src
            };
            self.getHighRes(ps).addCallback(function(ps) {
                Models.Local.post(ps).addCallback(function() {
                    img.style.opacity = '0.5';
                    img.setAttribute('data-done', 'yes');

                    archive.status.style.display = 'none';

                    if (archive.timer) {
                        clearTimeout(archive.timer);
                        archive.timer = null;
                    }

                    setTimeout(function() {
                        archive.status.style.display = 'block';
                        archive.timer = setTimeout(function() {
                            archive.status.style.display = 'none';
                        }, 3000);
                    }, 300);
                });
            });
        }, false);

        img.addEventListener('mouseover', function(ev) {
            img.style.borderColor = img.getAttribute('data-done') === 'yes' ? '#e58ee2' : '#ff7cfc';
        }, false);

        img.addEventListener('mouseout', function(ev) {
            img.style.borderColor = 'transparent';
        }, false);

        img.style.border = '2px solid transparent';
        img.style.position = 'absolute';
        img.style.width = archive.itemWidth + 'px';

        var per = imgWidth / imgHeight;
        var height = archive.itemWidth / per;

        img.style.height = height + 'px';

        var index = 0;
        var minHeight = -1;

        if (archive.heights.length < archive.maxWidthIndex - 1) {
            index = archive.heights.length;
            minHeight = 0;
        } else {
            for (var i = 0; i < archive.heights.length; i++) {
                if (minHeight === -1) {
                    minHeight = archive.heights[i];
                    index = i;
                } else {
                    if (minHeight > archive.heights[i]) {
                        minHeight = archive.heights[i];
                        index = i;
                    }
                }
            }
        }

        img.style.left = (index * (archive.itemWidth + 2)) + 'px';
        img.style.top = (archive.heights[index] + 2) + 'px';
        img.style.cursor = 'pointer';

        archive.container.appendChild(img);
        archive.heights[index] = (archive.heights[index] || 0) + 2 + height;
    },
    getImages: function(archive, allImages) {
        var self = this;

        if (archive.fetching) {
            return;
        }

        archive.fetching = true;

        var delay = 0;

        deferredForEach(allImages, function(src) {
            // gifはやらない
            if (!/_\d+\.(?:png|jpe?g)$/.test(src)) {
                return succeed(false);
            }

            return wait(delay).addCallback(function() {
                return self.isFleshColorImage(src).addCallback(function(res) {
                    if (res && res.width) {
                        delay = 0.1;
                        self.appendImage(archive, src, res.width, res.height);
                    } else {
                        delay = 0;
                    }
                });
            });
        }).addCallback(function() {
            archive.fetching = false;
            archive.onScroll();
        });
    },
    getHighRes: function(ps) {
        var itemUrl = ps.itemUrl;

        if (ps.type !== 'photo' || !/tumblr.*_\d+\.\w+$/.test(itemUrl)) {
            return succeed(ps);
        }

        // HighResがあれば取得
        var highRes = itemUrl.replace(/^(.*)_\d+\.(\w+)$/, '$1_1280.$2');

        if (highRes === itemUrl) {
            return succeed(ps);
        }

        return request(highRes).addErrback(function(err) {
            return ps;
        }).addCallback(function(res) {
            if (res.status == 200) {
                update(ps, {
                    itemUrl: highRes,
                    form: {
                        image: highRes
                    }
                });
            }
            return ps;
        });
    },
    // 肌色っぽい画像だけ抽出
    isFleshColorImage: function(src) {
        var self = this;

        return loadImage(src).addCallback(function(img) {
            var canvas = document.createElementNS(HTML_NS, 'canvas');
            var ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            var image = ctx.getImageData(0, 0, img.width, img.height);
            if (self.hasFleshColor(image.data, img.width, img.height)) {
                return {
                    res: true,
                    width: img.width,
                    height: img.height
                };
            }
            return false;
        });
    },
    hasFleshColor: function(data, width, height) {
        var count = 0;
        var min = ~~(data.length / 4 / width);
        var r, g, b, a;

        for (var i = 0, len = data.length; i < len; i += 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            a = data[i + 3];

            if (this.isFleshColor(r, g, b) && ++count > min) {
                return true;
            }
        }
    },
    // すごくてきとう
    isFleshColor: function(r, g, b, a) {
        if (r < 0xdd) {
            return false;
        }

        if (g < 0x82 && b < 0x82) {
            return false;
        }

        if (r === g || r === b) {
            return false;
        }
        return true;
    }
}, '----');
