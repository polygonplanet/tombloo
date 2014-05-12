/*
 * Model Clipboard - Tombfix patch
 *
 * @version   1.0.0
 * @date      2014-05-12
 * @updateURL https://github.com/polygonplanet/tombloo/raw/master/tombfix.model.clipboard.js
 */

Models.register({
    name : 'Clipboard',
    ICON : [
        // page_copy.png
        'data:image/png;base64,',
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0',
        'U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIpSURBVDjLddM9aFRBFIbh98zM3WyybnYV',
        'f4KSQjBJJVZBixhRixSaShtBMKUoWomgnaCxsJdgIQSstE4nEhNREgyoZYhpkogkuMa4/3fuHIu7',
        'gpLd00wz52POMzMydu/Dy958dMwYioomIIgqDa+VnWrzebNUejY/NV6nQ8nlR4ufXt0fzm2WgxUg',
        'qBInAWdhemGbpcWNN9/XN27PPb1QbRdgjEhPqap2ZUv5+iOwvJnweT1mT5djZKjI6Ej/udz+wt1O',
        'JzAKYgWyDjJWyFghmzFsbtcY2gsTJwv09/Vc7RTgAEQgsqAKaoWsM8wu/z7a8B7vA8cHD3Fr+ktF',
        'gspO3a+vrdVfNEulJ/NT4zWngCBYY1oqSghKI465fvYwW+VAatPX07IZmF7YfrC0uDE8emPmilOF',
        'kHYiBKxAxhmSRPlZVVa2FGOU2Ad2ap4zg92MDBXJZczFmdflx05VEcAZMGIIClZASdesS2cU/dcm',
        '4sTBArNzXTcNakiCb3/HLRsn4Fo2qyXh3WqDXzUlcgYnam3Dl4Hif82dbOiyiBGstSjg4majEpl8',
        'rpCNUQUjgkia0M5GVAlBEBFUwflEv12b/Hig6SmA1iDtzhcsE6eP7LIxAchAtwNVxc1MnhprN/+l',
        'h0txErxrPZVdFdRDEEzHT6LWpTbtq+HLSDDiOm2o1uqlyOT37bIhHdKaXoL6pqhq24Dzd96/tUYG',
        'wPSBVv7atFglaFIu5KLuPxeX/xsp7aR6AAAAAElFTkSuQmCC'
    ].join(''),
    check : function(ps) {
        return /regular|quote|link/.test(ps.type) && !ps.file;
    },
    converters: {
        regular : function(ps, title) {
            return ps.description;
        },
        link : function(ps, title) {
            return ps.pageUrl;
        },
        quote : function(ps, title) {
            return [
                ps.description,
                ps.body.wrap('"'),
                title.wrap('"'),
                ps.pageUrl
            ].join(' ').trim();
        }
    },
    post : function(ps) {
        var title = ps.item || ps.page || '';

        copyString(this.converters[ps.type](ps, title));
        return succeed();
    }
}, Local, true);

