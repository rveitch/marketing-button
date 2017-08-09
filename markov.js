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
var Text = require('markov-chains-text').default;
const blogContent = require('./app/blogtitles');
const fakeBlogContent = new Text(blogContent);

// INTERNAL REQUIRES
//var dictionary = require('./app/dictionary');
//var marketingJargon = new Ipsum(dictionary.curated);
//var hashtagGenerator = new Ipsum(dictionary.hashtag);
//console.log(marketingJargon.generate(1, 'sentence'));

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
  // markov-chains-text
  const sentence = fakeBlogContent.makeSentence();
  res.json({title: sentence});
});

/******************************** SERVER LISTEN *******************************/

// Server Listen
app.listen( port, function () {
	console.log( '\nApp server is running on ' + root_url +':' + port + '\n' );
});
