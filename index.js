'use strict';

var juice = require('juice'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path');


// Load Closure Library
require('./vendor/closure-library/closure/goog/bootstrap/nodejs');

goog.require('goog.date.DateTime');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeSymbols_es');
goog.require('goog.i18n.DateTimeSymbols_en');
goog.require('goog.i18n.DateTimeSymbols_fr');


 
var input = [];
process.stdin.setEncoding('utf8'); 
process.stdin.on('data', function (chunk) {
    input.push(chunk);
});


process.stdin.on('end', function () {
  input = JSON.parse(input);

  if (input.datetimes && !input.lang) {
    throw new Error('lang is required if you are using datetimes');
  }

  if (input.datetimes) {
    switch (input.lang) {
      case 'es':
        goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es;
        goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es;
        break;

      case 'en':
        goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en;
        goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en;
        break;

      case 'fr':
        goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr;
        goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr;
        break;

      default:
        throw new Error('unrecognized lang: ' + input.lang);
    }
  }

  _.each(input.datetimes, function (datetime) {
    datetime.name = datetime.name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    datetime.name = datetime.name.toUpperCase();
    var variable = new RegExp('\\[\\[\\$' + datetime.name + '\\]\\]', 'g');

    var formatter = new goog.i18n.DateTimeFormat(datetime.format);
    var date = goog.date.DateTime.fromTimestamp(datetime.value * 1000);
    var output = formatter.format(date);

    input.contents = input.contents.replace(variable, output);
  });

  var options = {
    url: 'file://' + path.resolve(process.cwd(), input.cwd, 'non-used.html'),
  };
  juice.juiceContent(input.contents, options, function (err, html) {
    if (err) {
      throw err;
    }

    console.log(html);
  });
});


