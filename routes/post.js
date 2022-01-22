const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
	title: String,
	desc: String,
	userid: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user",
	},
	likes: {
		type: Array,
		default: [],
	},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
});

module.exports = mongoose.model("post", postSchema);
