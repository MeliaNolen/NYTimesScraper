var express = require("express");
var exphb = require('express-handlebars');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cheerio = require('cheerio');
var request = require('request');
var logger = require("morgan");

var PORT = process.env.PORT || 3000;

var db = require("./models");

var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get('/scrape', function (req, res) {
    // scraping data
    request("https://www.nytimes.com", function (error, response, html) {
        var $ = cheerio.load(html);
        var results = [];

        $("h2.story-heading > a").each(function (i, element) {
            var title = $(element).text().trim();
            var link = $(element).attr("href");

            results.push({
                title: title,
                link: link
            });
        });
        console.log(results);

        // saving data to mongo
        db.Article.create(results)
            .then(function (dbArticle) {
                console.log(dbArticle);
            })
            .catch(function (err) {
                return res.json(err);
            });
    });
    res.send("Scrape Complete");

});

app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

