var LocalStrategy = require('passport-local').Strategy;
var keystone = require('keystone');
var ApiKey = keystone.list('Apikey').model;
var Account = keystone.list('Account').model;
import { signUp } from './lib/user';

import { Account } from './../../models/Account';
import * as validator from "validator";
// var mailer = require('./../mailer');
var siteName = process.env.SITE_NAME || 'cupon';

// the function is exported and @{passport, usersmodel} is passed
// has a parameter when imported
// into the autitication route;
module.exports = function localAuth(passport, Users) {
	// serializeuser by holding ID for identifing specific user
	// sends  back a key  to decrypt the user
	// function serializingCallback(user, done) {
	// }
	passport.serializeUser((user, done) => {
		console.log('serializing' + user._id);
		done(null, user._id);
	});

	// deserializeuser by using the serialize Key
	//  for decrytpting the user data
	passport.deserializeUser((_id, done) => {
		console.log('deserializing' + _id);
		done(null, Users.findById(_id, (err, user) => {
			if (err) {
				// console.log('there is an error');
				return err;
			}
			return user;
		}));
	});

	// a 'SignIn' strategy has been created to autheticated Users
	// the function makes use of  two parameters @{email} @{password}
	// and sends a err response if it failed or user if succesfull.
	passport.use('login', new LocalStrategy({
		passReqToCallback: true,
		usernameField: 'email',
		passwordField: 'password',
	},
		(req, email, password, done) => {
			// TODO: user NOT FOUND TODO: INVALID password TODO: AUTHENTICATE user
			console.log(req)
			Users.findOne({
				email,
			}, (err, user) => {
				if (err) {
					// console.log(err);
					return done(null, false, {
						message: 'user not found',
					});
				}
				if (user === null || user === {}) {
					return done(null, false, {
						message: 'emailAddress not found',
					});
				}

				user._.password.compare(password, (err, ismatch) => {
					console.log(ismatch);
					if (!err && ismatch) return done(null, user);
					return done(null, false, {
						mgs: `invalid password`,
					});
				});
			});
		}));


	// a 'signUp' strategy has been created to autheticated Users
	// the function makes use of  mutiple parameters @{emaiil} @{password} @{userProfile Object}
	// and sends a err response if it failed or user if succesfull.
	// passReqToCallback: allows us to pass back the entire request to the callback

	passport.use('signUp', new LocalStrategy({
		passReqToCallback: true,
		usernameField: 'email',
		passwordField: 'password',
	}, signUp
	));
};
