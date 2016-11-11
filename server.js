/* jshint esversion:6 */
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');
var outFile = 'test';

var express = require("express");
var cors = require('cors');

var app = express();

var mongoose = require("mongoose");

var PORT = process.env.port || 8000;

mongoose.connect("mongodb://localhost");

var CardConstructor = require("./Card.js");
var Card = CardConstructor(mongoose);

var ContributorConstructor = require("./Contributor.js");
var Contributor = ContributorConstructor(mongoose);

var Storage = require('./storage.js');
var storage = new Storage();



binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');  

  client.on('stream', function(stream, meta) {
    console.log('new stream', meta);
    outFile = meta.name;
    var fileWriter = new wav.FileWriter('./messages/' + outFile, {
	    channels: 1,
	    sampleRate: 48000,
	    bitDepth: 16
  	});
    stream.pipe(fileWriter);

    

    stream.on('end', function() {
      fileWriter.end();
      console.log('wrote to file ' + outFile);
    });
  });
});



var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
	console.log(req.url);
	next();
});

mongoose.Promise = global.Promise;

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.post("/api/new-card", function(req, res) {
	var card = new Card({title: req.body.card.title, songVolume: 0.3});
	card.save();
	res.send({status: "success", message: "New card added!"});
});

app.get("/api/get-cards", function(req, res) {
	Card.find({}).exec((err, cards) =>{
		if (err) {
			console.log(err);
			res.status(500);
			res.send({status: "error", message: "couldn't get cards"});
			return;
		}
		res.send(cards.reverse());
	});
});

app.get("/api/get-card/:id", function(req, res) {
	var cardId = req.params.id;
	Card.findOne({_id: cardId}, (err, card) => {
		res.send(card);
	});
});

app.post("/api/delete-card", function(req, res) {
	var cardId = req.body.cardId;
	console.log(cardId);
	Card.remove(
	  { _id: cardId},
		(err) => {
			if (err) {
				console.log(err);
				res.status(500);
				res.send({status: "error", message: "sass overload"});
				return;
			}
			res.send([]);
		}
	);
});

app.post("/api/add-contributor/:id", function(req, res) {
	var cardId = req.params.id;
	var contributor = new Contributor({name: req.body.newContributor.name, message: false});
	Card.findOneAndUpdate(
		{_id : cardId },
		{$push: {"contributors": contributor}},
		{new: true},
		(err, card) => {
			if (err) {
				console.log(err);
				res.status(500);
				res.send({status: "error", message: "sass overload"});
				return;
			}
			res.send([]);
		}
	);
});

app.post("/api/remove-contributor/:id", function(req, res) {
	var cardId = req.params.id;
	var contributor = req.body.contributor;
	var Id = contributor.name ;
	console.log(contributor);
	console.log(Id);
	Card.update(
	  { _id: cardId },
	  { $pull: { 'contributors': {name: Id} } },
	  { 'new': true },
		(err, data) => {
			if (err) {
				console.log(err);
				res.status(500);
				res.send({status: "error", message: "sass overload"});
				return;
			}
			console.log(data,"hello");
			res.send([]);
		}
	);
});

app.post("/api/set-song/:id", function(req, res) {
	var cardId = req.params.id;
	var song = req.body.song;
	Card.findOneAndUpdate(
		{_id : cardId },
		{song: song},
		{new: true},
		(err, card) => {
			if (err) {
				console.log(err);
				res.status(500);
				res.send({status: "error", message: "sass overload"});
				return;
			}
			res.send(card);
		}
	);
});

app.post("/api/set-volume/:id", function(req, res) {
	var cardId = req.params.id;
	var songVolume = req.body.songVolume;
	Card.findOneAndUpdate(
		{_id : cardId },
		{songVolume: songVolume},
		{new: true},
		(err, card) => {
			if (err) {
				console.log(err);
				res.status(500);
				res.send({status: "error", message: "sass overload"});
				return;
			}
			res.send(card);
		}
	);
});

app.post("/api/add-message", function(req, res) {
	var contributorId = req.body.contributorId;
	var cardId = req.body.cardId;
	console.log("card", cardId);
	
	Card.findOne({_id: cardId}, (err, card) => {
		console.log(card);
		if (err) {
			console.log(err);
			res.status(500);
			res.send({status: "error", message: "sass overload"});
			return;
		}
		var array = [];
		card.contributors.map(function(obj){ 
			console.log("obj", obj._id, "id", contributorId);
		   if (obj._id == contributorId) {
		   		obj.message = true;	
		   		array.push(obj);	
		   } else {
		   		array.push(obj);
		   }

		});
		Card.findOneAndUpdate(
			{_id : cardId },
			{contributors: array},
			{new: true},
			(err, card) => {
				if (err) {
					console.log(err);
					res.status(500);
					res.send({status: "error", message: "sass overload"});
					return;
				}
				res.send([]);
			}
		);

	});
	

});

app.post("/api/get-name/:id", function(req, res) {
	var contributorId = req.params.id;
	var cardId = req.body.cardId;
	Card.findOne({_id: cardId}, (err, card) => {
		if (err) {
			console.log(err);
			res.status(500);
			res.send({status: "error", message: "sass overload"});
			return;
		}
		console.log("contributorId", contributorId);
		for (var i of card.contributors) {
			if (i._id == contributorId) {
				res.send(i);
			}
		}
	});
});


app.use(express.static("messages"));

app.use(function(req, res, next) {
	res.status(404);
	res.send("404 Error - File Not Found");
});


app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("500 Error - Server Error");
});


app.listen(PORT, function() {
	console.log("Listening on port " + PORT);
});

