var express = require('express');
var app = express();
var http = require('http');

var websites = ['http://news.msn.com/',
	'http://www.reddit.com/r/apocalypse',
	'http://www.cnn.com/WORLD',
	'http://news.yahoo.com/',
	'http://news.google.com/',
	'http://www.imdb.com/movies-in-theaters/',
	'http://news.google.com/news/feeds?pz=1&cf=all&ned=us&hl=en&topic=m&output=rss'];

var disasters = {
	'Natural Disaster': ['tornado', 'fire', 'hurricane', 'thunder', 'lightning', 'storm'],
	'Aliens': ['alien', 'ufo', 'u.f.o.'],
	'Zombies': ['disease', 'virus', 'infection'],
	'Asteroid / Astrological Event': ['asteroid', 'black hole', 'wormhole', 'worm hole', 'blackhole']
};

var counter = {};

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

var util = require('util'),
	twitter = require('twitter');
	
var twit = new twitter({
	consumer_key: "aFZmgf2ivP9ZCqNrmg2YTQ",
	consumer_secret: 'pGzS4jRYLYryjB89p6cA93HBQiHkwFK3kFUBTe2sMc',
	access_token_key: '43029380-mDuqzVmiCvXYCmWg01X53tWJUA4vH3lRmWLkgBHi8',
	access_token_secret: 'RzVSxIxkxrxdHolrs1En73hyjVYdKZinKY1z0n5xia0'
});

app.get('/twitter', function(req, res) {
/*	twit.search('nodejs', function(data) {
		res.send(util.inspect(data));
	});*/
	twit.getUserTimeline(function(data) {
		res.send(data);
	});
});

function updateFromWebsite(index, callback) {
	if (index >= websites.length) {
		return callback();
	}
	
	http.get(websites[index], function(http_res) {
		http_res.setEncoding('utf8');
		
		var content = '';
		http_res.on('data', function(chunk) {
			content += chunk;
		});
		http_res.on('end', function() {
			for (var d in disasters) { // go through each disaster...
				for (var k in disasters[d]) { // each keyword for each disaster...
					if (typeof counter[d] == 'undefined' || counter[d] == null) {
						counter[d] = 0;
					}
					counter[d] += (content.match(new RegExp(disasters[d][k], 'g'))||[]).length;
				}
			}
			updateFromWebsite(index + 1, callback);
		});
	});
}

app.get('/update', function(req, res) {
	counter = {};
	updateFromWebsite(0, function() {
		res.send(counter);
	});
});

app.get('/data', function(req, res) {
	var data = [];
	for (var i in counter) {
		data.push([i, counter[i]]);
	}
	res.send(data);
});

app.use(express.static(__dirname + '/static'));

// Initial update
updateFromWebsite(0, function() {
	console.log("Updated!  Listening...");
	app.listen(process.env.PORT || 8000);
})
