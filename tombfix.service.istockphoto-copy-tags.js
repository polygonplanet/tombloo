/**
 * iStockphotoのタグをクリップボードにコピーするTombfixのパッチ
 *
 * @version    1.0.0
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombfix.service.istockphoto-copy-tags.js
 */
(function() {

Tombfix.Service.actions.register({
  name: 'iStockphotoのタグをコピー',
  type: 'context',
  icon: 'https://www.istockphoto.com/favicon.ico',
  check(ctx) {
    return ctx != null && ctx.host === 'www.istockphoto.com' && this._getPhotoUrl(ctx) != null;
  },
  _getPhotoUrl(ctx) {
    if (ctx && ctx.target) {
      let current = ctx.target;
      while (current.parentNode) {
        if (/^https:\/\/www\.istockphoto\.com\/jp\/%E3%82%B9%E3%83%88%E3%83%83%E3%82%AF%E3%83%95%E3%82%A9%E3%83%88\//.test(current.href)) {
          return current.href;
        }
        current = current.parentNode;
      }
    }
  },
  _getTags(url) {
    return request(url).addCallback(res => {
      const doc = convertToHTMLDocument(res.responseText);
      const elem = doc.querySelector('.keywords .section-content ul');
      const showAll = elem.querySelector('.show-all');
      if (showAll) {
        showAll.parentNode.removeChild(showAll);
      }
      Array.from(elem.querySelectorAll('li')).forEach(el => {
        el.style.display = 'block';
      });
      const tags = elem.textContent.replace(/^[\s,]+|[\s,]+$/g, '').split(/\s*,\s*/);
      const uniqTags = Array.from(new Set(tags));
      return uniqTags;
    });
  },
  execute(ctx) {
    const url = this._getPhotoUrl(ctx);
    if (url) {
      this._getTags(url).addCallback(uniqTags => {
        copyString(uniqTags.join(','));
      });
    }
  }
}, '----');

})();
