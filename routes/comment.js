const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	likes: {
		type: Array,
		default: [],
	},
	postid: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "post",
	},
	user: {
		type: String,
	},
});

module.exports = mongoose.model("comment", commentSchema);
