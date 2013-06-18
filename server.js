var express = require('express');
var app = express();
var http = require('http');

var websites = {
	'MSN News': 'http://news.msn.com/',
	'Reddit (Apocalypse)': 'http://www.reddit.com/r/apocalypse',
	'CNN World News': 'http://www.cnn.com/WORLD',
	'Yahoo News': 'http://news.yahoo.com/',
	'Google News': 'http://news.google.com/',
	'IMDb Movies in Theaters': 'http://www.imdb.com/movies-in-theaters/',
	'Google News (Health)': 'http://news.google.com/news/feeds?pz=1&cf=all&ned=us&hl=en&topic=m&output=rss'
};

var disasters = {
	'Natural Disaster': ['tornado', 'fire', 'hurricane', 'thunder', 'lightning', 'storm'],
	'Aliens': ['alien', 'ufo', 'u.f.o.'],
	'Zombies': ['disease', 'virus', 'infection'],
	'Asteroid / Astrological Event': ['asteroid', 'black hole', 'wormhole', 'worm hole', 'blackhole']
};

var disaster_counter = {};
var website_counter = {};

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

function updateFromWebsite(index, callback) {
	if (index >= Object.keys(websites).length) {
		return callback();
	}
	
	var website_name = Object.keys(websites)[index];
	website_counter[website_name] = [];
	
	http.get(websites[website_name], function(http_res) {
		http_res.setEncoding('utf8');
		
		var content = '';
		http_res.on('data', function(chunk) {
			content += chunk;
		});
		http_res.on('end', function() {
			for (var d in disasters) { // go through each disaster...
				for (var k in disasters[d]) { // each keyword for each disaster...
				
					if (typeof disaster_counter[d] == 'undefined' || disaster_counter[d] == null) {
						disaster_counter[d] = 0;
					}
					
					var keyword_count = (content.match(new RegExp(disasters[d][k], 'g'))||[]).length;
					disaster_counter[d] += keyword_count;
					website_counter[website_name].push({ disaster: d, keyword: disasters[d][k] });
				}
			}
			updateFromWebsite(index + 1, callback);
		});
	});
}

app.get('/update', function(req, res) {
	disaster_counter = {};
	website_counter = {};
	updateFromWebsite(0, function() {
		res.send(counter);
	});
});

app.get('/data', function(req, res) {
	var data = [];
	for (var i in disaster_counter) {
		data.push([i, disaster_counter[i]]);
	}
	res.send(data);
});

app.get('/details', function(req, res) {
	res.send(website_counter);
});

app.use(express.static(__dirname + '/static'));

// Initial update
updateFromWebsite(0, function() {
	console.log("Updated!  Listening...");
	app.listen(process.env.PORT || 8000);
})
