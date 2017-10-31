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
var moment = require('moment-timezone');
var randomExt = require('random-ext');
var casual = require('casual');
var changeCase = require('change-case');
var Sentencer = require('sentencer');
var Ipsum = require('ipsum').Ipsum; // words, sentences, paragraph
var Text = require('markov-chains-text').default;

// INTERNAL REQUIRES
var dictionary = require('./app/dictionary');
const blogContent = require('./app/blogtitles');

dotenv.load();
var root_url = process.env.ROOT_URL;
var port = Number(process.env.PORT);
var webhookUrl = process.env.WEBHOOK_URL || 'https://fccua.herokuapp.com/';
var webhookUrl_button1 = process.env.WEBHOOK_URL_BUTTON_1 || 'https://fccua.herokuapp.com/';
var webhookUrl_button2 = process.env.WEBHOOK_URL_BUTTON_2 || 'https://fccua.herokuapp.com/';
var webhookUrl_button3 = process.env.WEBHOOK_URL_BUTTON_3 || 'https://fccua.herokuapp.com/';
var webhookUrl_button4 = process.env.WEBHOOK_URL_BUTTON_4 || 'https://fccua.herokuapp.com/';
var webhookUrl_button1 = process.env.WEBHOOK_URL_BUTTON_1 || 'https://fccua.herokuapp.com/';
var webhookUrl_button2 = process.env.WEBHOOK_URL_BUTTON_2 || 'https://fccua.herokuapp.com/';
var webhookUrl_button3 = process.env.WEBHOOK_URL_BUTTON_3 || 'https://fccua.herokuapp.com/';
var webhookUrl_button4 = process.env.WEBHOOK_URL_BUTTON_4 || 'https://fccua.herokuapp.com/';

var marketingJargon = new Ipsum(dictionary.curated);
var hashtagGenerator = new Ipsum(dictionary.hashtag);

// SENTENCER CONFIG
Sentencer.configure({
  actions: {
    randomName: function() {
      return casual.full_name;
    },
    randomCompany: function() {
      return casual.company_name;
    },
    randomBuzzword: function() {
      return changeCase.titleCase(marketingJargon.generate(1, 'words'));
    },
    randomLowNumber: function() {
      return randomExt.integer(60, 1);
    },
    randomPercent: function() {
      return randomExt.integer(1000, 1);
    },
    currentYear: function() {
      return moment(Date.now()).format('YYYY');
    },
  }
});

const fakeBlogContent = new Text(blogContent);

/******************************** EXPRESS SETUP *******************************/

var app = express();
app.set('json spaces', 2);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(useragent.express());

/******************************** EXPRESS ROUTES *******************************/
app.get('/', function (req, res) {

  async.waterfall([
  	function(callback) {
      callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
  });
});

app.get('/test', function (req, res) {

  async.waterfall([
  	function(callback) {
      callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
  });
});

app.get('/dynamic', function (req, res) {
  if (!req.query.url) {
    res.json({error: 'Must provide a url in the query params.'});
  }
  const dynamicWebhookURL = req.query.url;
  async.waterfall([
  	function(callback) {
			callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
      sendWebookResponse(result, dynamicWebhookURL);
  });
});

app.get('/button1', function (req, res) {
  async.waterfall([
  	function(callback) {
			callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
      sendWebookResponse(result, webhookUrl_button1);
  });
});

app.get('/button2', function (req, res) {
  async.waterfall([
  	function(callback) {
			callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
      sendWebookResponse(result, webhookUrl_button2);
  });
});

app.get('/button3', function (req, res) {
  async.waterfall([
  	function(callback) {
			callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
      sendWebookResponse(result, webhookUrl_button3);
  });
});

app.get('/button4', function (req, res) {
  async.waterfall([
  	function(callback) {
			callback(null, createContent());
  	},
  ], function (err, result) {
      res.json( result );
      sendWebookResponse(result, webhookUrl_button4);
  });
});

app.get('/original-generator', function (req, res) {

  async.waterfall([
  	function(callback) {
			var photoId = Math.floor((Math.random() * 1000) + 1);
      var photo2Id = Math.floor((Math.random() * 1000) + 1);
			const context = {
				title: null,
				body: null,
				image: 'https://unsplash.it/600/315?image=' + photoId,
        photo: 'https://unsplash.it/600/315?image=' + photo2Id,
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

/******************************** FUNCTIONS *******************************/

function createContent() {
  const context = {
  	title: null,
  	body: null,
  	image: 'https://unsplash.it/600/315?image=' + randomExt.integer(1000, 1),
    photo: 'https://unsplash.it/600/315?image=' + randomExt.integer(1000, 1),
  };

  var randomPunctuation = randomExt.pick(['.', '?', '!', '...']);

  const title = fakeBlogContent.makeSentence();
  context['title'] = Sentencer.make(title);

  const startDate = Date.now();
  const endDate = moment(Date.now()).add(2, 'weeks');
  var randomDate = randomExt.date(new Date(endDate), new Date(startDate));

  context['date'] = moment(randomDate).tz(casual.timezone).format('YYYY-MM-DDTHH:mmZ');
  context['end_date'] = moment(randomDate).add(randomExt.integer(20160, 1440), 'minutes').tz(casual.timezone).format('YYYY-MM-DDTHH:mmZ');
  var bodyText = marketingJargon.generate(1, 'sentence') + ' #' + hashtagGenerator.generate(1, 'words');
  context['body'] = bodyText;
  return context;
}

function sendWebookResponse(result, webhookUrl) {
  request({
    uri: webhookUrl,
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36'
    },
    json: true,
    body: result
  }, function (error, response, body) {
    console.log(`Sent to webookUrl: ${webhookUrl}`);
    console.log(`Payload:`, result);
    console.log('Response:', body);
    console.log('statusCode:', response && response.statusCode);
  });
}


/******************************** SERVER LISTEN *******************************/

// Server Listen
app.listen( port, function () {
	console.log( '\nApp server is running on ' + root_url +':' + port + '\n' );
});
