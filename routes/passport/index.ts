import * as express from 'express';
import * as _ from 'lodash';

var jwtSigner = require('./jwt').signJWT;


/**
 *	 @apiDefine  AuthUserSuccessExample
 *
 * @apiSuccessExample {json} Success-Response:
 * 	HTTP/1.1 201 created
 * 	 	{
 * 	 		"apikey": "random crypto key",
 * 	 		"user": {
 * 	 	 		"_id" : "58f3faedd54ab01c60ad5585",
 * 	 	 		"email" : "user@keystonejs.com",
 *				"institution": "ladoke surr";
 * 	 	 		"fullName" : {
 * 	 		 		"first" : "keystone",
 * 	 		 	 	"last" : "Admin"
 *  	 	 	}
 *  	 	},
 *  	 "jwt": "randowm jwt token"
 * 	 	}
 */
function passportAuths(keystone, app, passport, config) {

	var User = keystone.list('User').model;

	if (!config) config = {};
	var mountPath = config.root || '/auth';

	require('./apiKey')(keystone, passport);
	// require('./facebook')(passport, User);
	require('./jwt').default(passport, User);
	require('./localAuth')(passport, User);

	// setting up mounts and request for various type of auth logins
	var router = express.Router();
	// responsible for sending user deatils and other auth details
	var subRouter = express.Router();

	router.use('/:method', function (req, res, next) {

		var authMethod = req.params.method.toLowerCase();
		var requiredUser = !req.query.callbackurl;

		// responsible for default routing of the user
		switch (req.method) {
			case 'GET':
				return getRequest(req, res, next);
			case 'POST':
				return postRequest(req, res, next);
			default:
				return handleErr(req, res, next);
		}

		// hanles and error from any type of request
		function handleErr(req, res, next) {
			res.status(405).json({
				err: `${req.method} is not allowed for ${authMethod}`,
			});
		}

		/**
		 * @api {get} /auth/:method get authentication method
		 * @apiName GetAuthMethod
		 * @apiGroup AUTH
		 *
		 * @apiParam (param) {string=["apiKey", "jwt", "facebook"]} method  Type
		 * @apiParam (query) {string} [user] query param when set to 1 return
		 * @apiParam (query) {string} [apikey] apikey unique apikey for the user
		 * @apiParam (query) {string} [token] jWT unique generated encrypted userData
		 * the user object
		 *
		 * @apiDescription endpoint allows various get request authentication
		 * facebook and google would use oAuth for userauthentication
		 * while apikey and jwt requires their parameters to be in the headers
		 * or query due to the stateless authentication principle of the auth
		 * implementation credentials are of either apikey or jwt
		 * is to be passed repeatedly for most write actions or resources
		 * @apiUse UserSuccessRespone
		 *
		 * @apiuse UserSuccessExample
		 *
		 * @apiError UnAuthorized invalid auth credentials provided
		 *
		 * @apiErrorExample Error-Response:
		 * HTTP/1.1 401 UnAuthorized
		 * 	UnAuthorized
		 *
		 * HTTP/1.1 401 UnAuthorized
		 * 	{mgs: "validation mgs"}
		 *
		 */
		// setups auth type for any get request checks if user details
		// is required from the query and sends it back
		function getRequest(req, res, next) {
			switch (authMethod) {
				case 'apikey':
					const localAKP = passport.authenticate('localapikey', {
						session: false,
					});
					if (requiredUser) return subRouter.use(localAKP, getUserVer)(req, res, next);
					return localAKP(req, res, next);
				case 'jwt':
					const jwtP = passport.authenticate('jwt', {
						session: false,
					});
					if (requiredUser) return subRouter.use(jwtP, getUserVer)(req, res, next);
					return jwtP(req, res, next);
				case 'facebook':
					const fbP = passport.authenticate('facebook');
					if (requiredUser) return subRouter.use(fbP, getUserVer)(req, res, next);
					return fbP(req, res, next);
				case 'dashboard':
					if (!req.user) {
						return res.status(401).json({
							mgs: 'please login first',
						});
					}
					return res.status(200).json(req.user);
				default:
					return handleErr(req, res, next);
			}
		}

		/**
		 * @api {post} /auth/:method post authentication method
		 * @apiName PostAuthMethod
		 * @apiGroup AUTH
		 *
		 * @apiParam (param) {string=["login", "signup"]} method  Type
		 * @apiParam (query) {string} [user] query param when set to 1 returns
		 * the user object
		 *
		 * @apiParam (body) {string} email the user email used Registration
		 * @apiParam (body) {string} password use for vaildation
		 *
		 * @apiParam (signup) {string} fullName fullname firstName and Lastname
		 * @apiParam (signup) {string} institution user institution enrolled
		 *
		 * @apiDescription endpoint allows various get request authentication
		 * facebook and google would use oAuth for userauthentication
		 * while apikey and jwt requires their parameters to be in the headers
		 * or in the query for authentication due to the stateless implementation
		 * of resources
		 *
		 * @apiSuccess {string} apikey unique id generated apikey
		 * @apiSuccess {string} token unique id random generated auth atringr
		 * @apiUse UserSuccessRespone
		 *
		 * @apiuse AuthUserSuccessExample
		 *
		 * @apiError UnAuthorized invalid auth credentials provided
		 *
		 * @apiErrorExample Error-Response:
		 * HTTP/1.1 401 UnAuthorized
		 * 	UnAuthorized
		 *
		 * HTTP/1.1 401 UnAuthorized
		 * 	{mgs: "validation mgs"}
		 *
		 */
		// setup auths for any post request
		function postRequest(req, res, next) {
			switch (authMethod) {
				case 'login':
					if (requiredUser) {
						return subRouter.use(passport.authenticate('login'), getUserVer)(req, res, next);
					}
					return passport.authenticate('login', {
						sucessRedirect: req.query.callbackurl,
					})(req, res, next);
				case 'signup':
					if (requiredUser) {
						return subRouter.use(passport.authenticate('signUp'), getUserVer)(req, res, next);
					}
					return passport.authenticate('signUp')(req, res, next);
				default:
					return handleErr(req, res, next);
			}
		}

		function getUserVer(req, res, next) {
			if (authMethod === 'dashboard') return res.status(200).json(req.user);
			return succesfullAuth(req, res);
		}

		function succesfullAuth(req, res) {
			// var token = jwtSigner(req.user);
			var token = 'default token';
			var user = _.omit(req.user, ['password', 'isAdmin']);

			res.status(200).json(req.user);
		}
	});

	app.use(mountPath, router);
}

module.exports = passportAuths;
