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


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



//prep db
var db = new mongodb.Db('sneekysnap', new mongodb.Server('127.0.0.1', 27017), {safe:true});

router.get('/feed/local', function(req,res,next){
	console.log(req.query.lat);
	var latitude = parseFloat(req.query.lat);
	var longitude = parseFloat(req.query.long);

	var minLat = latitude - 0.01;
	var maxLat = latitude + 0.01;
	var minLong = longitude - 0.01;
	var maxLong = longitude + 0.01;


  console.log("minLat: " + minLat);
  console.log("maxLat: " + maxLat);
  console.log("minLong: " + minLong);
  console.log("maxLong: " + maxLong);

  var now = new Date(Date.parse("9/30/14, 12:57 AM"));
 

	db.open(function(err) { //save to db
	    if (!err) {
	        db.collection("feed",function(err,collection) {
	                collection.find({$and: [{"post.coor.lat": {$gte: minLat, $lte: maxLat}},{"post.coor.long": {$gte: minLong, $lte: maxLong}}]}).sort({ $natural: -1 } ).toArray(function(err, result) {
	                    if (err) {
	                      res.send(err)
	                      console.log('feed api connection error'.error);
	                    } else {
		                    console.log('** feed request'.warn);
		                    var filteredResults = [];
		                    for (var i = 0; i < result.length; i++) {
		                    	 var now = Date.now();
		                    	 var expires = parseFloat(result[i].post.expires);
		                    	
		                    	 if (expires > now) {
		                    	 	 filteredResults.push(result[i]);
		                    	 }
		                    };
		                    console.log(result.length);
		                    console.log(result[0].post.expires);
		                    if (filteredResults.length > 0) {
		                    	res.send(filteredResults);
		                    } else {
		                    	res.send("{\"error\":\"no local results\"");
		                    }

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
				                    res.render('feed.html',{result:result});
				                    //res.send(result);  
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
  var coorLat = parseFloat(req.body.lat);
  var coorLong = parseFloat(req.body.long);
  var expirationDate = req.body.expires;

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

			                collection.save({"post": {"user":uuid,"coor": {"lat":coorLat,"long":coorLong},"expires":expirationDate,"data":upload}},function(err,result) {
			                
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
