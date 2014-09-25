var express = require('express');
var io = require('socket.io');
var path = require('path');
var router = express.Router();
var colors = require('colors');
var util = require("util"); 
var fs = require("fs"); 
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


//prep db
var db = new mongodb.Db('sneekysnap', new mongodb.Server('127.0.0.1', 27017), {safe:true});

router.get('/feed', function(req, res, next) {
	console.log('[GET]'.debug.bold + ' SneekySnap API v1.0 ----'.warn + ' /feed'.green);
	db.open(function(err) { //save to db
			    if (!err) {
			        db.collection("feed",function(err,collection) {
			                collection.find().toArray(function(err, result) {
			                    if (err) {
			                      res.send(err)
			                      console.log('feed api connection error'.error);
			                    } else {
				                    console.log('** feed request'.warn);
				                    res.send(result);  
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

router.get('/upload', function(req, res, next) {
	console.log('[GET]'.debug.bold + ' SneekySnap API v1.0 ----'.warn + ' /upload'.green);
	res.render('_upload');
});

router.post('/new',function(req, res, next) {
	console.log('[POST]'.red.bold + ' SneekySnap API v1.0 ----'.warn + ' /new'.green);
	var upload = [];
 
console.log("test ->>>>" + req.body.uuid);

	var uuid = req.body.uuid;
  var lat = req.lat;
  var long = req.long;

  if ('files' in req.files) { 
		if (req.files.files.size === 0) {
		  res.send({error: {message:"0"}})
		} else {
			upload.push({path:req.files.files.path});
 			upload.push({info:req.files.files});
			db.open(function(err) { //save to db
			    if (!err) {
			        db.collection("feed",function(err,collection) {
			            if (upload != "" || upload != null) {

			                collection.save({"post": {"user":uuid,"coor": {"lat":32,"long":323},"expires":"date","data":upload}},function(err,result) {
			                
			                    if (err) {
			                    	console.log('error while saving photo to db ->'.error + err);
			                      res.send({error: {message:"error ->" + err}})
			                    } else {
				                    console.log('       id:'.green + result._id.toString().prompt.bold.italic);
				                    res.send([result]);  
				                    db.close();
			                  	}
			                });
			            } else {
			                console.log('       ERROR: Incorrect file attributes'.error.bold);
			                res.send({error: {message:"0"}})
			            }
			        });
			    } else {
			    	console.log('       ERROR: database error -> '.error.bold + err);
			      res.send({error: {message:"error ->" + err}})
			    }
			}); //end db
		}
	} else {
		console.log('       ERROR: '.error.bold + 'No photo to upload'.error);
		res.send({error: {message:"0"}})
	}
	
});

module.exports = router;
