const keystone =  require('keystone');
const Users = keystone.list('User').model
const validator =  require('validator')

export function signUp(req, email, password, done) {
	if (!req.body.name) return done({ mgs: 'name is required' });
	if (!validator.isEmail(req.body.email)) return done({ mgs: 'invalid email address' });
	if (!validator.isLength(req.body.password, { min: 8, max: 15 })) return done({ mgs: 'invalid password length must be between 8 and 15' });
	// find a user in mongo with provided emailAddress
	Users.findOne({
		email,
	}, (err, user) => {
		// In case of any error, return using the done method
		if (err) {
			return done(err);
		}
		// already exists
		if (user) {
			return done(new Error(`${req.body.email} already exists`));
		}
		// if there is no user, create the user
		// to  understand the user validation process
		// <a href='./userSchema.html'>userSchema</a>
		const newuser = new Users(req.body);
		// confirms valid ApiKey by sending a valid Email
		var data = {
			to: req.body.email,
			subject: `${process.env.SITE_NAME} : User Registration @t ${Date()}`,
			text: `succesfull email validation for
					${newuser.fullName}  of id: ${newuser._id}
					thank you for using our platform`,
		};

		newuser.save((saveErr) => {
			if (saveErr) {
				return done(saveErr);
			}
			console.log(data);
			// mailer(data)
			// 	.catch((e) => {
			// 		console.log(e, `error validating email ${req.body.email}`);
			// 	});
			return done(null, newuser);
		});
	});
}
