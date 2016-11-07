/* jshint esversion:6 */

var fs = require('fs');
var data = fs.readFileSync('./data.json').toString();
var cards = JSON.parse(data);

function Storage() {
	this.addCard = (card, cb) => {
		var newCard = card;
		newCard.id = Math.floor(Math.random() * 10000000);
		cards.push(newCard);
		this.saveCard(cb);
	};

	this.saveCard = (cb) => {
		fs.writeFile(
			"./data.json",
			JSON.stringify(cards),
			(err) => {
				if (err) {
					console.log("Error writing cards to file");
					cb(false);
					return;
				}
				cb(true);
			}
		);
	};

	this.getCards = (cb) => {
		fs.readFile(
			"./data.json",
			(err, cards) => {
				if (err) {
					console.log("Error reading cards from file");
					cb(false);
					return;
				}
				cb(cards);
			}
		);
	};


	this.deleteCard = (card, cb) => {
		for (var i =0; i < cards.length; i++) {
			 if (cards[i].id === card.id) {
		      cards.splice(i, 1);
		   }
		}
		fs.writeFile(
			"./data.json",
			JSON.stringify(cards),
			(err) => {
				if (err) {
					console.log("Error writing cards to file");
					cb(false);
					return;
				}
				cb(true);
			}
		);
	};

	this.addContributor = (newContributor, cardId, cb) => {
		newContributor.id = Math.floor(Math.random() * 10000000);
		var index;
		for(var i = 0; i < cards.length; i++) {
			if(cards[i].id == cardId) {
				index = i;
			} 
		}
		cards[index].contributors.push(newContributor);
		fs.writeFile(
			"./data.json",
			JSON.stringify(cards),
			(err) => {
				if (err) {
					console.log("Error writing cards to file");
					cb(false);
					return;
				}
				cb(cards[i - 1]);
			}
		);
	};

	this.addRecording = (item, cb) => {
		var cardIndex = getIndex(cards, item.cardId);
		console.log(cardIndex);
		var contributorIndex = getIndex(cards[cardIndex].contributors, item.contributor);
		console.log(contributorIndex);
		cards[cardIndex].contributors[contributorIndex].message = recording;
		fs.writeFile(
			"./data.json",
			JSON.stringify(cards),
			(err) => {
				if (err) {
					console.log("Error writing cards to file");
					cb(false);
					return;
				}
				cb(cards[i - 1]);
			}
		);
	};

	this.removeContributor = (contributor, cardId, cb) => {
		var card;
		for(var c of cards) {
			if(c.id == cardId) {
				card = c;
			} 
		}
		for (var i =0; i < card.contributors.length; i++) {
			if (card.contributors[i].id === contributor.id) {
				console.log("card.contributors[i]", card.contributors[i]);
		      card.contributors.splice(i, 1);
		   }
		}
		fs.writeFile(
			"./data.json",
			JSON.stringify(cards),
			(err) => {
				if (err) {
					console.log("Error writing cards to file");
					cb(false);
					return;
				}
				cb(card);
			}
		);
	};

	this.getCardById = (cardId, cb) => {
		for(var c of cards) {
			if(c.id == cardId) {
				cb(c);
				return;
			} 
		}
		cb(null);
	};

	getIndex = (array, thing) => {
		var index;
		for(var i = 0; i < array.length; i++) {
			if(array[i].id == thing) {
				index = i;
			} 
		}
		return index;
	};
}

module.exports = Storage;