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
var util = require("util"); 
var router = express.Router();


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

var db = new mongodb.Db('sneekysnap', new mongodb.Server('127.0.0.1', 27017), {safe:true});

app.use('/beta',function(req, res, next) {
	var email = req.body.email;
				db.open(function(err) { //save to db
			    if (!err) {
			        db.collection("beta",function(err,collection) {
			           

			                collection.save({"email":email},function(err,result) {
			                
			                    if (err) {
			                    	console.log('error while saving photo to db ->'.error + err);
			                      res.send({error: {message:"error ->" + err}})
			                    } else {
				                    console.log('       id:'.green + result._id.toString().prompt.bold.italic);
				                    res.render("index",{beta:1}); 
				                    db.close();
			                  	}
			                });
			          
			        });
			    } else {
			    	console.log('       ERROR: database error -> '.error.bold + err);
			      res.send({error: {message:"error ->" + err}})
			    }
			}); //end db
});


app.use('/api/v1/',apiRoute);
app.get('/', function (req, res) {
	var db = new mongodb.Db('sneekysnap', new mongodb.Server('127.0.0.1', 27017), {safe:true});
	db.open(function(err) { //save to db
			    if (!err) {
			        db.collection("feed",function(err,collection) {
			                collection.find().toArray(function(err, result) {
			                    if (err) {
			                      res.send(err)
			                      console.log('feed api connection error'.error);
			                    } else {
				                    console.log('** feed request'.warn);
				                    console.log(util.inspect(result, false, null));
				                    res.render('index',{posts:result});  
				                    db.close();
			                  	}
			                });
			        });
			    } else {
			    	console.log('       ERROR: database error -> '.error.bold + err);
			      res.send({error: {message:"error ->" + err}})
			    }
			}); //end db
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
