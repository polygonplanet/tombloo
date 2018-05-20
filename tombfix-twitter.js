// twitter patch

update(Twitter, {
  getToken() {
    return this.getSessionValue('token', () =>
      request('https://mobile.twitter.com/', {
        responseType : 'document'
      }).addCallback(({response : doc}) => {
        let tokenElm = doc.querySelector('.authenticity_token');
        if (tokenElm) {
          return {
            authenticity_token : tokenElm.value
          };
        }

        let a = doc.querySelector('a.favorite');
        if (a && /authenticity_token=\w+/.test(a.href)) {
          return {
            authenticity_token: a.href.match(/authenticity_token=(\w+)/)[1]
          };
        }

        throw new Error(getMessage('error.unknown'));
      })
    );
  }
});
