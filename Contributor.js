module.exports = function(mongoose) {

	var ContributorSchema = new mongoose.Schema({
		name: String,
		message: Boolean
	});

	var Contributor = mongoose.model("ContributorSchema", ContributorSchema);

	return Contributor;
};
