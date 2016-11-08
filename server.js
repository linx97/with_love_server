/* jshint esversion:6 */


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
	var card = new Card({title: req.body.card.title});
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
		res.send(cards);
	});
});

app.get("/api/get-card/:id", function(req, res) {
	var cardId = req.params.id;
	Card.findOne({_id: cardId}, (err, card) => {
		res.send(card);
	});
});

app.post("/api/delete-card", function(req, res) {
	var card = req.body.card;
	console.log(card);
	console.log(card._id);
	Card.remove(
	  { _id: card._id },
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
	var contributor = new Contributor({name: req.body.newContributor.name});
	Card.findOneAndUpdate(
		{_id : cardId },
		{$push: {"contributors": {contributor}}},
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
	var Id = contributor.contributor._id;
	Card.update(
	  { _id: cardId },
	  { $pull: { contributors: {_id: Id} } },
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

app.post("/api/add-redcording/:id", function(req, res) {
	var contributorId = req.params.id;
	var cardId = req.body.cardId;
	var recording = req.body.recording;
	var info = {
		cardId: cardId,
		recording: recording,
		contributorId: contributorId
	};
	storage.addRecording(info, (rec) => {
		console.log("server: add record", recording);
		res.send(card);
	});
});


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

