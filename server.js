var express = require("express");
var exphb = require('express-handlebars');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require('cheerio');
var request = require('request');
var logger = require("morgan");

// scraping data
request("https://www.nytimes.com", function(error, response, html) {
  var $ = cheerio.load(html);
  var results = [];

  $("h2.story-heading > a").each(function(i, element) {
    var title = $(element).text().trim();
    var link = $(element).attr("href");

    results.push({
      title: title,
      link: link
    });
  });
  console.log(results);
});