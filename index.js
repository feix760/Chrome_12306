/**
 * @file app
 * @date 2015-12-22
 */
const http = require('http');
const webpack = require('webpack');
const express = require('express');
const bodyParser = require('body-parser');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./webpack.config.js');
const controller = require('./server/controller');
const port = 8101;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: '1mb',
  extended: true
}));

// const compiler = webpack(config);
// const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
  // publicPath: '/',
  // stats: { colors: true },
// });
// app.use(webpackDevMiddleware);

// route
app.use('/recognize', controller.recognize);

app.listen(port, () => {
  console.log('Server listening on port %d', port);
});

module.exports = app;
