

var Backbone = require('backbone');
var Platforms = Backbone.Collection.extend({
    url: '/api/platforms',
    parse: function(res) {
        var arr = [];
        _.each(res, function(n, d) {
            arr.push({
                version: d,
                latest: n.latest
            });
        });
        return arr;
    }
});

module.exports = Platforms;