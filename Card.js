module.exports = function(mongoose) {

	var CardSchema = new mongoose.Schema({
		title: String,
		contributors: Array,
		song: String,
		songVolume: Number
	});

	var Card = mongoose.model("CardSchema", CardSchema);

	return Card;
};
