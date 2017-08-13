var nodemailer = require('nodemailer');

var G_Email = process.env.GMAIL_EMAIL;
var G_Password = process.env.GMAIL_PASSWORD;

/**
 * [data description]
 * @type {Object}
 * var data = {
 *	from: email,
 *	subject: `${siteName} : User Registration for user Id: ${id} at ${Date()}`,
 	text: `succesfull email validation for
 	${fullName}`,
 	to: 'ajogundijo@student.lautech.edu.ng',
 };
 */

module.exports = function mailer (data) {
	var smtpTransport = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: G_Email,
			pass: G_Password,
		},
	});

	var mailOptions = {
		from: G_Email,
		to: data.to,
		subject: data.subject,
		text: data.text,
	};

	return smtpTransport.sendMail(mailOptions);
};
