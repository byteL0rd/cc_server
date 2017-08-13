/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
import * as _ from 'lodash'
import { Request as DReq, Response, NextFunction, RequestHandler } from 'express'
import { AuthorizedReq } from './interface'
import * as passport from 'passport';

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
export const initLocals = <RequestHandler> function (req: AuthorizedReq, res: Response, next: NextFunction) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Contact', key: 'contact', href: '/contact' },
	];
	res.locals.user = req.user;
	next();
};



export interface Request extends DReq{
	flash(info: string, details?: string): void;
	user: any;
}

/**
	Fetches and clears the flashMessages before a view is rendered
*/
export const flashMessages = <RequestHandler> function (req: Request, res: Response, next: NextFunction) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages,
		(mgs: any[]) => mgs.length) ? flashMessages : false;
	next();
};

/**
	Prevents people from accessing protected pages when they're not signed in
 */
export const requireUser = <RequestHandler> function (req: Request, res: Response, next: NextFunction) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

export function authorizeRoute (req, res, next) {
	//  if user already logins in allows request
	if (req.user) return next();

	// checks for apikey
	const apikey = 'apikey';
	if (req.get(apikey) || req.query[apikey] || req.body[apikey]) {
		return passport.authenticate('localapikey', { session: false })(req, res, next);
	}

	var headerToken = 'JWT_TOKEN';
	var token = 'token';
	if (req.get(headerToken) || req.query[token] || req.body[token]) {
		return passport.authenticate('jwt', { session: false })(req, res, next);
	}
	// finally checks for user token
	res.status(401).json({ mgs: 'unathourized' });
};