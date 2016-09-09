// Config routing and database for news and sentiment APIs
var express = require('express');
var twitterStream = require('./twitter/twitter-controller');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var webpackConfig = require('../webpack.config.js');
var tSentiment = require('./sentiment/twitter-sentiment-model');
var app = express();
var twitterCron = require('./workers/workers-twitter');
var CronJob = require('cron').CronJob;
var compiler = webpack(webpackConfig);
require("babel-core/register");
require('./config/mongoose')();
require('./config/express')(app);
require('./config/routes')(app);
require('./workers/workers.js');

// Cron job to compute average of Twitter data every 5 seconds to be used by Client
new CronJob('*/5 * * * * *', function() {
  twitterCron.getCollections(twitterCron.channels);
}, null, true, 'America/Los_Angeles');

// Set static page
app.use(express.static(__dirname + '/../client/www'));

// Webpack set-up
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
  historyApiFallback: true,
}));

console.log('APP LISTENING ON.....',process.env.PORT)

var server = app.listen(process.env.PORT || 3001, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('app listening at host', host, 'and port:',port);
});

module.exports = app;
