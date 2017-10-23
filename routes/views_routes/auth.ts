import * as console from 'console';
import { Script } from 'vm';
import { Message } from '_debugger';
import { Request, Response, NextFunction } from 'express';
import * as render from 'express-es6-template-engine';
import * as passport from 'passport';
import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as keystone from 'keystone';
import { loginPage, signupPage, formatVerifyPage } from '../views/compiler';
import { signUp } from '../passport/lib/user';
import * as validator from 'validator';

const sessAuth = require('keystone/lib/session');

// renders login page
export async function viewLogin(req, res: Response) {
    if (req.isAuthenticated()) res.redirect('/');
    res.send(await loginPage(req.isAuthenticated(), undefined, undefined, req.query.callbackurl))
}

// renders signup page
export async function viewSignUp(req: Request, res: Response) {
    if (req.isAuthenticated()) return res.redirect('/');
   res.send(await signupPage(req.isAuthenticated(), req.user))
}

// authenicate user login request and renders err to the login page if any
 function AuthCated(req: Request, res: Response, errPage, mgs?:any) {
    async function onsucess(user) {
		if (req.body.name) {
			await keystone.list('User').model
				.findOneAndUpdate({ _id: req.user._id }, { name: req.body.name });
			authSignJwt(req, res)
				.then(() => console.log(`sent mail to ${req.user.id}`))
				.catch(() => console.log(`error sending mail to ${req.user.id}`));
		}
        res.redirect(req.query.callbackurl || req.body.callbackurl || '/')
    }

    async function onfail(err: any) {
        err = (err) ? err.message : err;
        res.send(await errPage(req.isAuthenticated(), err));
    }
	return sessAuth.signin({ email: req.body.email, password: req.body.password },
		req, res, onsucess, onfail)
}

// 'logins in a new user
export function authLogin(req: Request, res: Response, next: NextFunction) {
    return AuthCated(req, res, loginPage);
}

// sign's up a new user and renders err to the signup page if any
export async function authSignUp(req: Request, res: Response, next: NextFunction) {
    if (req.body.password !== req.body.confirmPassword) {
        return res.send(await signupPage(false, `passwords doesn't match for confirmation`))
	}
	if (req.body.password && req.body.confirmPassword) {
		if (!validator.isEmail(req.body.email)) {
			return res.send(await signupPage(false, `invalid email address provided`))
		}
	}
    signUp(req, req.body.email, req.body.password, done);
    
    async function done(isAuth, user, err) {
        if (typeof isAuth === 'string') return res.send(await signupPage(false, isAuth));
        if (isAuth !== null || !user) return res.send(await signupPage(false, isAuth));
        if (err) return res.send(await signupPage(false, err));
        return AuthCated(req, res, signupPage);
    }
}

// logs a login user out
export function authLogOut(req: Request, res: Response, next: NextFunction) {
    return express.Router().use(sessAuth.signout, (req, res) => {
        req.logout();
        res.redirect('/');
    })(req, res, next)
}

import { SendMailOptions } from 'nodemailer'
import { smtpTransport } from '../../models/Order';

const G_Email = process.env.GMAIL_EMAIL || '';
const G_Password = process.env.GMAIL_PASSWORD || '';

const _defaultPassword = 'randomcachedpasskey';
/**
 * signs userdata for activation
 * 
 * @export
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
export async function authSignJwt(req: Request, res: Response) {
	const token = jwt.sign(req.user, process.env.COOKIE_SECRET || _defaultPassword);
	const mail: SendMailOptions = {
        from: G_Email,
        to: req.user.email,
        subject: process.env.VERIFY_MAIL_SUBJECT_MESSAGE || `
        please activate your and verify your user account for www.campuscoupons.ng`,
		text: `please visit www.campuscoupons.ng/verify?token=${token} 
		 Thank You For Using CampusCupons`
    }
	
	await smtpTransport.sendMail(mail);
}

/**
 * verifys and notify the user that it has been activate
 * 
 * @export
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
export async function authVerifyJwt(req: Request, res: Response) {
	const _changeLocation = ` <br>
	<a href="www.campuscoupons.ng/login" style="color: blue"> Login </a>
	<script>
	setTimeout(function() {
		window.location.href = "www.campuscoupons.ng/login";
	}, 10000);
	</script> `
	const User = keystone.list('User').model;
	try {
		let user = await jwt.verify(req.query.token,
			process.env.COOKIE_SECRET || _defaultPassword);
		user.activated = true;
		user = await User.findByIdAndUpdate(user.id, user);
		return formatVerifyPage(`${user.name} has been activated. enjoy many coupons thank you.
			www.campuscoupons.ng ${_changeLocation} `);
	} catch (error) {
		return formatVerifyPage(` Invalid token provided. please contact
			admin@campuscoupons.ng for any complains. Thank you. ${_changeLocation}`);
	}
}
