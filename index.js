'use strict';

var juice = require('juice'),
    argv = require('minimist')(process.argv.slice(2)),
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


if (!argv.file) {
  throw new Error('a --file argument is needed');
}
if (argv.datetimes && !argv.lang) {
  throw new Error('--lang is required if you are using datetimes');
}


var datetimes = [];
if (argv.datetimes) {
  datetimes = JSON.parse(argv.datetimes);

  switch (argv.lang) {
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
      throw new Error('unrecognized lang: ' + argv.lang);
  }
}


var contents = fs.readFileSync(argv.file).toString();
_.each(datetimes, function (datetime) {
  datetime.name = datetime.name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  datetime.name = datetime.name.toUpperCase();
  var variable = new RegExp('\\[\\[\\$' + datetime.name + '\\]\\]', 'g');

  var formatter = new goog.i18n.DateTimeFormat(datetime.format);
  var date = goog.date.DateTime.fromTimestamp(datetime.value * 1000);
  var output = formatter.format(date);

  contents = contents.replace(variable, output);
});


var options = {
  url: 'file:///' + path.resolve(process.cwd(), argv.file),
};
juice.juiceContent(contents, options, function (err, html) {
  if (err) {
    throw err;
  }

  console.log(html);
});
