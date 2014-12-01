/**
 * FetchController
 *
 * @description :: Server-side logic for managing fetches
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var request = require('request'),
    q = require('q'),
    img_config = sails.config.imgur,
    string,
    result = {},
    results = [],
    finalPayload = {},
    options;

function checkCache(timestamp) {
    if (typeof timestamp === 'undefined') return x = true;
    x = ((Date.now() - timestamp) > 50000) ? true : false;
    return x;
};

function fetch(subreddit, page) {
    var defer = q.defer(),
        data = [],
        body,
        options = {
            url: 'https://api.imgur.com/3/gallery/r/' + subreddit + '/top/month/',
            headers: {
                'Authorization': 'Client-ID ' + img_config.CLIENTID
            }
        };

    if (page) {
        options['url'] = options['url'] + 'page/' + page;
        console.log(options['url'])
    }

    request.get(options, function(err, response, body) {
        if (err) defer.reject(response)
        body = JSON.parse(body),

            _.map(body.data, function(element, index) {
                data.push({
                    "image_href": element.link,
                    "image_thumb": 'http://i.imgur.com/' + element.id + 'b.jpg',
                    "link": "http://imgur.com/r/" + subreddit + "/" + element.id,
                    "score": element.score,
                    "id": element.id
                });
            });

        defer.resolve(data);
    })

    return defer.promise;

}


module.exports = {
    index: function(req, res) {

        if (finalPayload.data === 'undefined' || checkCache(finalPayload['timestamp'])) {

            var data = [],
                promises = [
                    fetch("macsetups"),
                    fetch("battlestations"),
                    fetch("averagebattlestations"),
                    fetch("battlestations", 1),
                    fetch("battlestations", 2),
                    fetch("battlestations", 3),
                    fetch("desktops")
                ];

            q.allSettled(promises)
                .then(function(results) {
                    _.each(results, function(result, index) {
                        if (result.state === 'fulfilled') {
                            data.push(results[index].value);
                        }
                    });
                    data = _.chain(data)
                        .flatten()
                        .sortBy('score')
                        .reverse()
                        .value();
                    finalPayload = {
                        'data': data,
                        'timestamp': Date.now()
                    }
                    res.json(finalPayload);
                })
                .catch(function(error) {
                    res.badRequest(error)
                })
                .done();
        } else {
            res.json(finalPayload);
        }
    }

}
