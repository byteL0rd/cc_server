var LocalApikey = require('./lib/localApikey');

function apiKey (keystone, passport) {
	var ApiKey = keystone.list('Apikey').model;
	var User = keystone.list('User').model;

	passport.use(new LocalApikey.Strategy((apiKey, done) => {

		ApiKey.findOne({})
			.then((data) => {
				if (data === {}) return done(null, false);
				User.findOne({
					_id: data.author,
				})
				.then(data => {
					if (data === {}) return done(null, false);
					done(null, data);
				})
				.catch(err => done(err));
			})
			.catch(err => done(err));
	}));
}

module.exports = apiKey;
