/*jshint node: true */
'use strict';

var DEFAULT_PORT = process.env.PORT || 5000,
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

var app = express()
        .get('/publishJacksFerarriReport', function (req, res) {
            request(YAHOO_GRUB_QUOTE_URL, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                
              }
            });
        });

app.listen(argv.port);