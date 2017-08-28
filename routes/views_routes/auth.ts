import { Request, Response, NextFunction } from 'express';
import * as render from 'express-es6-template-engine';
import * as passport from 'passport';
import * as express from 'express';

import { loginPage, signupPage } from '../views/compiler';
import { signUp } from '../passport/lib/user';

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
 function AuthCated(req, res, errPage, mgs?:any) {
    function onsucess(user) {
        res.redirect(req.query.callbackurl || req.body.callbackurl || '/')
    }

    async function onfail(err: any) {
        res.send(await errPage(req.isAuthenticated(), err.message || err));
    }
    return sessAuth.signin({email: req.body.email, password: req.body.password }, req, res, onsucess, onfail)
}

// 'logins in a new user
export function authLogin(req: Request, res: Response, next: NextFunction) {
    return AuthCated(req, res, loginPage);
}

// sign's up a new user and renders err to the signup page if any
export function authSignUp(req: Request, res: Response, next: NextFunction) {
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