var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var swig = require('swig');
var path = require('path');
var mongodb = require('mongodb');
var colors = require('colors');
var multer = require('multer');
var getRawBody = require('raw-body')
var typer      = require('media-typer')

if (process.env.NODE_ENV === "development") {
	server.listen(8080);
} else {
	server.listen(80);
}

app.engine('html',swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser());

app.use(multer({
  dest: "public/uploads"
}));

/* ROUTES */
var apiRoute = require('./routes/api');


app.use('/api/v1/',apiRoute,bodyParser({ 
    limit: 1024 * 1000
}));
app.get('/', function (req, res) {
	res.render('index');
});


/* SOCKET STUFF */
io.on('connection', function (socket) {
	console.log(socket.id + ' connected!');
	var world = socket.handshake.headers.host;

	var db = new mongodb.Db(world, new mongodb.Server('127.0.0.1', 27017), {safe:true});


  socket.join(world); //join domain room

	socket.on('news',function(data) {
		console.log(socket);
		io.to(world).emit('news',data);
		console.log('MESSAGE SENT TO EVERYONE AT ' + world);
	});

  socket.on('disconnect',function(data) {
  	console.log(socket.id + ' disconnected!');
  });
});

console.log("\033[2J\033[0f");
console.log('[SneekySnap] '.bold.magenta + 'SERVER STARTED'.grey.underline);
