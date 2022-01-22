const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/facebook");

const userSchema = mongoose.Schema({
	fname: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
	},
	dob: {
		type: Date,
		required: true,
		min: Date.now - 18 * 365 * 24 * 60 * 60 * 1000,
	},
	gender: {
		type: String,
		required: true,
	},
	password: String,
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
	dp: {
		type: String,
		default: "../images/uploads/default.png",
	},
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
