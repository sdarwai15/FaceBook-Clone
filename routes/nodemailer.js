const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = ``;

const CLIENT_SECRET = ``;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = ``;

const oauthclient = new google.auth.OAuth2(
	CLIENT_ID,
	CLIENT_SECRET,
	REDIRECT_URI
);

oauthclient.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(receiver, text) {
	try {
		const access_token = await oauthclient.getAccessToken();
		const transport = nodemailer.createTransport({
			service: "gmail",
			auth: {
				type: "OAuth2",
				user: "",
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: access_token,
			},
		});

		const mailOpts = {
			from: "",
			to: receiver,
			subject: "Check",
			text: "kuch bhi kuch",
			html: text,
		};

		const result = await transport.sendMail(mailOpts);
		return result;
	} catch (err) {
		return err;
	}
}

module.exports = sendMail;
