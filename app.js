'use strict';
var dotenv = require('dotenv');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var request = require('request');
var async = require("async");
var _ = require('lodash');
var moment = require('moment');
var randomExt = require('random-ext');
//var ipsum = require("ipsum");
var Ipsum = require('ipsum').Ipsum; // words, sentences, paragraph


// INTERNAL REQUIRES
var dictionary = require('./app/dictionary');
var marketingJargon = new Ipsum(dictionary.curated);
var hashtagGenerator = new Ipsum(dictionary.hashtag);
console.log(marketingJargon.generate(1, 'sentence'));

dotenv.load();
var root_url = process.env.ROOT_URL;
var port = Number(process.env.PORT);
var webhookUrl = process.env.WEBHOOK_URL || 'https://fccua.herokuapp.com/';

/******************************** EXPRESS SETUP *******************************/

var app = express();
app.set('json spaces', 2);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(useragent.express());

app.get('/', function (req, res) {

  async.waterfall([
  	function(callback) {
			var photoId = Math.floor((Math.random() * 1000) + 1); // between 1-1000
			const context = {
				title: null,
				body: null,
				image: 'https://unsplash.it/600/315?image=' + photoId,
			};
      var titleText = marketingJargon.generate(1, 'sentence');
      context['title'] = titleText;
      const startDate = Date.now();
      const endDate = moment(Date.now()).utc().endOf('month');  //.add(7, 'days');
      var randomDate = randomExt.date(new Date(endDate), new Date(startDate));
      context['date'] = moment(randomDate).format('YYYY-MM-DDTHH:mm:sZ');
      callback(null, context);
  	},
		function(titleContext, callback) {
			const context = titleContext || {};
      var bodyText = marketingJargon.generate(2, 'sentence') + ' #' + hashtagGenerator.generate(1, 'words');
      context['body'] = bodyText;
      callback(null, context);
  	}
  ], function (err, result) {
      res.json( result );

      request({
        uri: webhookUrl,
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
        },
        json: true,
        body: result
      }, function (error, response, body) {
				console.log('Sent to webookUrl', body);
      });

  });
});

app.get('/test', function (req, res) {

  async.waterfall([
  	function(callback) {
			var photoId = Math.floor((Math.random() * 1000) + 1); // between 1-1000
			const context = {
				title: null,
				body: null,
				image: 'https://unsplash.it/600/315?image=' + photoId,
			};
      var titleText = marketingJargon.generate(1, 'sentence');
      context['title'] = titleText;
      const startDate = Date.now();
      const endDate = moment(Date.now()).utc().endOf('month');  //.add(7, 'days');
      var randomDate = randomExt.date(new Date(endDate), new Date(startDate));
      context['date'] = moment(randomDate).format('YYYY-MM-DDTHH:mm:sZ');
      callback(null, context);
  	},
		function(titleContext, callback) {
			const context = titleContext || {};
      var bodyText = marketingJargon.generate(2, 'sentence') + ' #' + hashtagGenerator.generate(1, 'words');
      context['body'] = bodyText;
      callback(null, context);
  	}
  ], function (err, result) {
      res.json( result );
  });
});

app.get('/original-generator', function (req, res) {

  async.waterfall([
  	function(callback) {
			var photoId = Math.floor((Math.random() * 1000) + 1); // between 1-1000
			const context = {
				title: null,
				body: null,
				image: 'https://unsplash.it/600/315?image=' + photoId,
			};
      request({
        uri: 'http://www.ipsumaas.com/gen/?text=64&style=cos_ipsum',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
        }
      }, function (error, response, body) {
				console.log('response.body', response.body);
        var titleText = JSON.parse(response.body);
        context['title'] = titleText;
        //schema.social_networks.facebook.response = (fbStatus || null )
        //console.log('titleText', titleText);
        callback(null, context);
      });
  	},
		function(titleContext, callback) {
			const context = titleContext || {};
      request({
        uri: 'http://www.ipsumaas.com/gen/?sentences=1&style=cos_ipsum',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
        }
      }, function (error, response, body) {
        var bodyText = JSON.parse(response.body).toString();
				context['body'] = bodyText;
				console.log('bodyText', bodyText);
				callback(null, context);
      });

  	}
  ], function (err, result) {
      res.json( result );
      request({
        uri: webhookUrl,
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
        },
        json: true,
        body: result
      }, function (error, response, body) {
				console.log('Sent to webookUrl', body);
      });
  });
});


/******************************** SERVER LISTEN *******************************/

// Server Listen
app.listen( port, function () {
	console.log( '\nApp server is running on ' + root_url +':' + port + '\n' );
});
