/*jshint node: true */
'use strict';

var DEFAULT_FROM = 'Totes the Goat',
    DEFAULT_PORT =  5000,
    THE_YURT_ROOM_ID = 98025,
    TESTING_ROOM_ID = 726139,
    DEFAULT_ROOM_ID = TESTING_ROOM_ID,
    FERRARI_ICON_URL = 'https://s3.amazonaws.com/uploads.hipchat.com/7413/167007/NnUG7394KnATQ65/jack.png',
    POST_HIPCHAT_MESSAGE_URL = 'https://api.hipchat.com/v1/rooms/message?',
    YAHOO_GRUB_QUOTE_URL = 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in ("GRUB")&env=http://datatables.org/alltables.env&format=json',
    express = require('express'),
    request = require('request'),
    q = require('querystring'),
    options = require('optimist')
        .usage('Run the yurt-chat web server.')
        .options({
            from: {
                alias: 'f',
                describe: 'The name used in HipChat.'
            },
            roomId: {
                alias: 'r',
                describe: 'The id of the HipChat room to which messages will be sent.'
            },
            hipchatAuthToken: {
                alias: 'a',
                describe: 'The auth token to use for HipChat interactions.'
            },
            port: {
                alias: 'p',
                'default': DEFAULT_PORT,
                describe: 'The local port number where the web server is to run.'
            },
            help: {
                alias: 'h',
                describe: 'Show this help information.'
            }
        }),
    argv = options.argv,
    port = process.env.PORT || argv.port || DEFAULT_PORT,
    hipchatAuthToken = process.env.HIPCHAT_AUTH_TOKEN || argv.hipchatAuthToken || null,
    from = process.env.FROM || argv.from || DEFAULT_FROM,
    roomId = process.env.ROOM_ID || argv.roomId || DEFAULT_ROOM_ID;

if(hipchatAuthToken === null) {
    console.log('Unable to start without a HipChat Auth Token :-/');
    return;
}

if (argv.help) {
    console.log(options.help());
    return;
}

function getJacksFerrariFactor (ret) {
    request(YAHOO_GRUB_QUOTE_URL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            ret(Math.floor(parseFloat(JSON.parse(body).query.results.quote.BidRealtime) * 0.36));
        }
    });
}

function postHipChatMessage (room, messages, done) {
    var posts = [];
    messages.forEach(function (message) {
        posts.push(POST_HIPCHAT_MESSAGE_URL + q.stringify(
            {
                'auth_token': hipchatAuthToken,
                'room_id': room,
                message: message,
                'message_format': 'html',
                from: from,
                notify: 1,
                color: 'purple',
                format: 'json'
            }
        ));
    });

    posts.reverse();

    var poster = function () {
        if(posts.length > 0) {
            request.post(posts.pop(), poster);
        } else {
            done('posted to ' + room + ': \n' + messages.join('\n'));
        }
    };

    poster();
}

var app = express()
    .get('/', function (req, res) {
        res.send('Totes Bot is running.');
    })
    .get('/jacksFerrariFactor', function (req, res) {
        getJacksFerrariFactor(function (factor) {
            res.send('' + factor);
        });
    })
    .get('/postJacksFerrariReport', function (req, res) {
        getJacksFerrariFactor(function (factor) {
            var msg = '';

            for(var i = 0; i < factor; i++) {
                msg += '<img src="' + FERRARI_ICON_URL + '"/>';
            }

            postHipChatMessage(roomId, [ 'Jack\'s Ferrari Pile, Today: ', msg ], function (doneMsg) {
                res.send(doneMsg);
            });
        });
    })
    .get('/postAsTotes/:msg', function (req, res) {
        postHipChatMessage(roomId, [ req.param('msg') ], function (doneMsg) {
            res.send(doneMsg);
        });
    });

app.listen(port);