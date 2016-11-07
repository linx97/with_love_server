module.exports = function(mongoose) {

	var CardSchema = new mongoose.Schema({
		title: String,
		contributors: Array
	});

	var Card = mongoose.model("CardSchema", CardSchema);

	return Card;
};
