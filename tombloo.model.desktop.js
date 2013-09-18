/**
 * Model Desktop - Tombfix patch
 *
 * デスクトップに保存するmodelを追加します
 *
 * @version    1.02
 * @date       2013-09-19
 * @author     polygon planet <polygon.planet.aqua@gmail.com>
 * @link       http://twitter.com/polygon_planet
 * @license    Public Domain
 * @updateURL  https://github.com/polygonplanet/tombloo/raw/master/tombloo.model.desktop.js
 *
 * Tombloo: https://github.com/to/tombloo/wiki
 */
(function() {

function getDesktopDir(name) {
    var dir = DirectoryService.get('Desk', IFile);
    name && dir.append(name);
    return dir;
}

models.register(update({}, Local, {
    name : 'Desktop',
    // unnamed.png edit
    ICON : 'data:image/png;base64,'+
           'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMA/wCAAMDekxktAAAC40lE'+
           'QVQokZXSaS/bcQAA4N+KTBwZ2xCZYwmC2LDxgvBizTDXYh2rYeJesjDJGK+Yzmyu1V1my3Rm6liw'+
           'qU6jjh5aWn9FS1ttqR4p6mhNmYTlt30FyfMRHgBx9HMBtmGlntiKAGxBYCQmMgqdnxpThAl5l4zO'+
           'D/Mpy4h6mnIvJzcjOiUn+OGLmxElN8IrgWt8fdmQAotr7aUz4ZnxVLkMD1RQr4Ja2d7kSE1q4hJl'+
           'ZIg6lVn+qahT4P64BdiF5OVUD5BYS9rjox2NdEfGh3r1sUKsYU2ONeIlvaTCuDiJcJUh2ryTi3eJ'+
           'LwWB6AQOX2bYP+QwpxDB9IyAMTI2SCb3tVS/gXvb+cnxtC6iQbom4YtoiMg7HAPSnjw63NXuKeT0'+
           '0eFd4+bq1srazjJ5olssZePrSnizNPY4RTAxfqJRL3JZ2MQ4gL3vq1PNHf/W9pGIEB5r1Hw2r1Mo'+
           '78G3ZbL4XetbCzLlCvlHH59BNazOZEf4giSM294mS7qGdJO+nOh1CGNIvzP5uSN7gl2NSEiKXYHG'+
           'oHnfiudyRveF1GdoFxAb7Wg8mheKOe0fCfDkxP2KZXlhAotay+O0iSRktU6q2FY2d7SKJbMSdnf6'+
           '3Wsg5oG/TDErlQnr8XXwFBqUcni2BY0S+HfjYFvw51CnUm00NDWKxQtqOTcmzAv4BKF/UuhiRNpc'+
           '2VhV8fYDoa6lqqQJV0AoKyC8Kibia782EYi1bRwa9zuVHhCLAQ7eSa9rKP3drE35rmiJLxfx1Cuz'+
           'h2uLOoSp4zL3EZ5uXqBGNgb6Z7LKvlkHpwOPkIbMYlpWQfv4FF+5jOhXp7VLv9bZPVA7Z2APw8Vp'+
           '/dwcZZCejyPFvhy+GFQBUPZpLref23lFevoHh/p5Rvg5B7tZRd1y9L8KghzNIt3tg647eXgH2nhG'+
           'OIcWmnnlATMrV5SFA0CZgwvgP3MTYAGAk7XNRQAc7S6bWpoAM2B6yRKYWgCULQrYgfP2/gfUes4v'+
           'jeWDagAAAABJRU5ErkJggg==',
    post : function(ps) {
        return (ps.type == 'photo') ? this.Photo.post(ps) : Local.append(getDesktopDir(ps.type + '.txt'), ps);
    },
    Photo : {
        post : function(ps) {
            var post_ = function(p) {
                var file = getDesktopDir();
                var name = p.file && p.file.leafName || validateFileName(createURI(p.itemUrl).fileName);
                file.append(name);
                clearCollision(file);
                return succeed().addCallback(function() {
                    return p.file ? (p.file.copyTo(file.parent, file.leafName), file) : download(p.itemUrl, file);
                });
            };

            if (ps.favorite && ps.favorite.form &&
                Array.isArray(ps.favorite.form.images) && ps.favorite.form.images.length
            ) {
                // Photoset
                return deferredForEach(ps.favorite.form.images, function(image) {
                    return wait(0).addCallback(function() {
                        return post_(update({}, ps, { itemUrl : image }));
                    });
                });
            }
            return post_(ps);
        }
    }
}), Local, true);

}());
