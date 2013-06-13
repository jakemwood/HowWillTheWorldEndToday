var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

app.use(express.static(__dirname + '/static'));

app.listen(process.env.PORT || 8000);
