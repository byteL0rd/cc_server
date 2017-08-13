// FacebookStrategy REQUIREMENTS
var FacebookStrategy = require('passport-facebook');
var FACEBOOK_APP_ID = '';
var FACEBOOK_APP_SECRET = '';
var FACEBOOK_CALLBACK_URL = 'http://localhost:3000/auth/facebook/callback';

function facebook (passport, User) {
	// FaceBook Auth scheme
	passport.use(new FacebookStrategy({
		clientID: FACEBOOK_APP_ID,
		clientSecret: FACEBOOK_APP_SECRET,
		callbackURL: FACEBOOK_CALLBACK_URL,
		profileFields: ['id', 'displayName', 'photos', 'email'],
		enableProof: true,
	},
	function (accessToken, refreshToken, profile, cb) {
		// use email and facebookId TO  updateAndCreate
		// User.findOrCreate({
		// 	facebookId: profile.id,
		// }, function(err, user) {
		// 	return cb(err, user);
		// });
	}
	));
}
module.exports = facebook;
