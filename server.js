/*jshint node: true */
'use strict';

var DEFAULT_PORT = process.env.PORT || 5000,
    THE_YURT_POST_URL = 'https://api.hipchat.com/v2/room/98025/notification',
    YURT_FATHER_POST_URL = 'https://api.hipchat.com/v2/user/15664/message',
    YAHOO_GRUB_QUOTE_URL = 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol in ("GRUB")&env=http://datatables.org/alltables.env&format=json',
    express = require('express'),
    request = require('request'),
    options = require('optimist')
        .usage('Run the yurt-chat web server.')
        .options({
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
    argv = options.argv;

if (argv.help) {
    console.log(options.help());
    return;
}

function getJacksFerrariFactor (ret) {
    request(YAHOO_GRUB_QUOTE_URL, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        ret('' + Math.floor(parseFloat(JSON.parse(body).query.results.quote.BidRealtime) * 0.36));
      }
    });  
}

var app = express()
        .get('/', function(req, res) {
          res.send('YurtChat is running.');
        })
        .get('/jacksFerrariFactor', function (req, res) {
            getJacksFerrariFactor(res.send);
        })
        .get('/postJacksFerrariReport', function (req, res) {
            var ferrariFactor = getJacksFerrariFactor();
            request()       
        });

app.listen(argv.port);