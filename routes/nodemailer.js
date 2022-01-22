const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = `577934109240-ecs81ac7fjbqavomls4qnkapf0bgqbgk.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//041bdB1wH0gdqCgYIARAAGAQSNwF-L9IrfZI5nOPGYZ3hu8lxCtEvznhmVZSoVha8nqhTXrhVY22Gt3XQKlEYjzP1BaFa4A6mkYA`;

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
				user: "darwaisourabh@gmail.com",
				clientId: CLIENT_ID,
				clientSecret: CLIENT_SECRET,
				refreshToken: REFRESH_TOKEN,
				accessToken: access_token,
			},
		});

		const mailOpts = {
			from: "darwaisourabh@gmail.com",
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
