// JwtStrategy REQUIREMENTS
var jwt = require('jsonwebtoken');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt_opts = {} as any;

var tokenField = 'JWT_Token';
var extractors = [ExtractJwt.fromHeader(tokenField), ExtractJwt.fromAuthHeader(tokenField),
	ExtractJwt.fromAuthHeaderWithScheme(tokenField), ExtractJwt.fromUrlQueryParameter('token'),
	ExtractJwt.fromBodyField('token'),
];
jwt_opts.jwtFromRequest = ExtractJwt.fromExtractors(extractors);
jwt_opts.secretOrKey = 'secret';
jwt_opts.issuer = 'accounts.examplesoft.com';
jwt_opts.audience = 'yoursite.net';
jwt_opts.expiresIn = '30d';

function jwtStrategy (passport, User) {
	// JWT user Authentication scheme
	passport.use(new JwtStrategy(jwt_opts, (jwt_payload, done) => {
		var searchId = jwt_payload._doc._id;
		User.findOne({
			_id: searchId,
		})
		.then((user) => {
			if (user !== {}) return done(null, user);
			done(null, false);
		})
		.catch((err) => done(err, false));
	}));
}

function signUserJWT (user) {
	return jwt.sign(user, jwt_opts.secretOrKey, {
		expiresIn: jwt_opts.expiresIn,
		issuer: jwt_opts.issuer,
		audience: jwt_opts.audience,
	});
}

exports.default = jwtStrategy;
exports.signJWT = signUserJWT;
