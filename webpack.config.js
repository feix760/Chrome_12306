const path = require('path');
const webpack = require('webpack');
const chalk = require('chalk');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const output = './dist';

module.exports = {
  entry: {
    'index': './src/page/index/index.js'
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    alias: {
      asset: path.join(__dirname, 'src/asset'),
    },
  },
  output: {
    path: path.join(__dirname, output),
    filename: 'js/[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
          ]
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader',
          ]
        }),
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|wav|mp4)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 2048,
            fallback: 'file-loader',
            // img output path
            name: 'img/[name].[hash:8].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([ output ]),
    new webpack.ProgressPlugin((percentage, msg, modules) => {
      const stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(chalk.magenta(`📦  ${(modules || '').split(' ')[0]} ${msg} `));
        stream.clearLine(1);
      }
    }),
    new HtmlWebpackPlugin({
      chunks: [ 'index' ],
      filename: 'html/index.html',
      template: './src/page/index/index.html',
    }),
    // css output path
    new ExtractTextPlugin('css/[name].css'),
    new CopyWebpackPlugin([
      'src/background.js',
      'src/icon32.png',
      'src/icon48.png',
      'src/manifest.json',
    ]),
  ],
};
