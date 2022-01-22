const express = require("express");
const router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const commentModel = require("./comment");
const sendMail = require("./nodemailer");
const multer = require("multer");
const passport = require("passport");
const localStrategy = require("passport-local");
const axios = require("axios");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/images/uploads");
	},
	filename: function (req, file, cb) {
		// const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", checkLoggedIn, function (req, res) {
	res.render("index", { title: "Facebook - Log In or Sign up" });
});

router.post("/toRegister", function (req, res) {
	res.render("register");
});

router.get("/profile", isLoggedIn, function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.populate("posts")
		.then(function (foundUser) {
			commentModel
				.find({ user: foundUser.fname })
				.populate("postid")
				.then(function (forComment) {
					console.log(forComment);
					res.render("profile", {
						foundUser,
						title: "Profile Page",
						forComment,
					});
				});
		})
		.catch(function (err) {
			res.send("err: " + err);
		});
});

router.post("/register", function (req, res) {
	var newUser = new userModel({
		fname: req.body.fname,
		username: req.body.username,
		dob: req.body.dob,
		email: req.body.email,
		gender: req.body.gender,
	});
	userModel
		.register(newUser, req.body.password)
		.then(function (createdUser) {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/profile");
			});
		})
		.catch(function (err) {
			res.send(err);
		});
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/profile",
		failureRedirect: "/",
	}),
	function (req, res) {}
);

router.get("/logout", function (req, res) {
	req.logOut();
	res.redirect("/");
});

router.post("/createPost", function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (currentUser) {
			postModel
				.create({
					title: req.body.title,
					desc: req.body.desc,
					userid: currentUser,
				})
				.then(function (createdPost) {
					// postModel.findOne().populate("posts");
					currentUser.posts.push(createdPost._id);
					currentUser.save().then(function (val) {
						res.redirect("/profile");
					});
				})
				.catch(function (err) {
					res.send(err);
				});
		});
});

router.get("/like/:id", function (req, res) {
	userModel
		.findOne({ fname: req.session.passport.user })
		.then(function (likedUser) {
			postModel.findOne({ _id: req.params.id }).then(function (likedPost) {
				if (likedPost.likes.indexOf(likedUser._id) === -1) {
					likedPost.likes.push(likedUser._id);
				} else {
					likedPost.likes.splice(likedPost.likes.indexOf(likedUser._id), 1);
				}
				likedPost.save().then(function (dets) {
					res.redirect("/profile");
				});
				res.redirect(req.headers.referer);
			});
		});
});

router.post("/comment/:id", function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (foundUser) {
			postModel.findOne({ _id: req.params.id }).then(function (foundPost) {
				commentModel
					.create({
						text: req.body.comment,
						postid: foundPost._id,
						user: foundUser.fname,
					})
					.then(function (createdComment) {
						foundPost.comments.push(createdComment);
						foundPost
							.save()
							.then(function (data) {
								res.redirect("/profile");
							})
							.catch(function (err) {
								res.send("error is : " + err);
							});
					});
			});
		});
});

router.get("/tl", function (req, res) {
	postModel
		.find()
		.populate("userid")
		.then(function (allPosts) {
			res.render("tl", { allPosts, title: "Timeline" });
		});
});

router.post("/upload", upload.single("dp"), function (req, res) {
	userModel
		.findOne({ fname: req.session.passport.user })
		.then(function (curUser) {
			Jimp.read(`./public/images/uploads/${req.file.filename}`, (err, file) => {
				if (err) throw err;
				file
					.resize(file.bitmap.width * 0.5, file.bitmap.height * 0.5) // resize
					.quality(50) // set JPEG quality
					.write(`./public/images/uploads/${req.file.filename}`); // save
			});
			curUser.dp = req.file.filename;	
			curUser.save().then(function (data) {
				// console.log(data);
				res.redirect("/profile");
			});
		});
});

router.get("/reset", function (req, res) {
	res.render("forMail", { title: "Password Reset Page" });
});

router.post("/reset", function (req, res) {
	userModel.findOne({ email: req.body.emailCheck }).then(function (userData) {
		const secret = uuidv4();
		sendMail(
			req.body.emailCheck,
			`http://localhost:3000/${userData._id}/${secret}`
		).then(function () {
			res.send("Check Your Mail !");
		});
	});
});

router.get("/:id/:secret", function (req, res) {
	userModel.findOne({ _id: req.params.id }).then(function (fu) {
		res.render("newPass", { title: "Reset Password", fu });
		console.log(fu);
	});
});

router.post("/newPass/:id", function (req, res) {
	userModel.findOne({ _id: req.params.id }).then(function (user) {
		if (req.body.newPass1 === req.body.newPass2) {
			user.setPassword(req.body.newPass1, function (err, result) {
				user.save().then(function (done) {
					res.send("password reset successful !");
				});
			});
		} else {
			res.send("passwords didn't match !");
		}
	});
});

router.get("/username", function (req, res) {
	res.render("username");
});

router.get("/username/:value", function (req, res) {
	userModel.findOne({ username: req.params.value }).then(function (found) {
		if (found === null) {
			res.json({ check: false });
		} else {
			res.json({ check: true });
		}
	});
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}

function checkLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/profile");
	}
}

module.exports = router;
