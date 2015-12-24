/**
 * @file app
 * @date 2015-12-22
 */
var
    http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    controller = require('./server/controller'),
    port = 8101;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    limit: '1mb',
    extended: true
}));

// route
app.use('/recognize', controller.recognize);

app.listen(port, function() {
    console.log('Server listening on port %d', port);
});

module.exports = app;

