/**
 * PIXTAのタグをクリップボードにコピーするTombfixのパッチ
 *
 * @version    1.0.0
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombfix.service.pixta-copy-tags.js
 */
(function() {

Tombfix.Service.actions.register({
  name: 'PIXTAのタグをコピー',
  type: 'context',
  icon: 'https://pixta.jp/assets/favicon-e77ff40d0ec2c75e6701252efda45070be4df82ed6767fd938152d85e1bef487.ico',
  check(ctx) {
    return ctx != null && ctx.host === 'pixta.jp' && this._getPhotoUrl(ctx) != null;
  },
  _getPhotoUrl(ctx) {
    if (ctx && ctx.target) {
      let current = ctx.target;
      while (current.parentNode) {
        if (/photo\/\d+/.test(current.href)) {
          return current.href;
        }
        current = current.parentNode;
      }
    }
  },
  _getTags(url) {
    return request(url).addCallback(res => {
      const doc = convertToHTMLDocument(res.responseText);
      const productTags = doc.querySelector('.product-tags__content');
      const tags = productTags.textContent.trim().split(/\s+/);
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
