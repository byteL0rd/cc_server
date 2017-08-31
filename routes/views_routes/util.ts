import { Request, Response } from 'express';
import * as render from 'express-es6-template-engine';
import * as path from 'path';
import { indexPage, getTokenPage, aboutUsPage, contactUsPage, paystackPage } from '../views/compiler'
import { genOrder } from '../../faker';
import * as faker from 'faker';

import * as keystone from 'keystone';

const orders = keystone.list('Order') as any;
const forums = keystone.list('Forum').model;

export interface pagingQuery {
    results: any[],
    total: number,
    currentPage: number,
    totalPages: number,
    pages: number[],
    previous: boolean,
    first: number,
    next: number,
    last: number
}

// renders the first index page
export async function index(req: Request, res: Response) {
    orders.paginate({
        page: req.query.page || 1,
        perPage: 8,
        maxPages: 8,
    }).find({ remain: { $gt: 0 }, activated: 'enabled' }).exec(async (err, data: pagingQuery) => {
        res.send(await indexPage(data.results, {
            cutp: data.currentPage,
            totp: data.totalPages
        }, req.isAuthenticated(), req.user));
    })
}

// renders the first search page results
export async function searchResultPage(req: Request, res: Response) {
    let searchQuery = req.query.query || req.query.q || req.body.query || '';
    let searchResults = orders.paginate({
        page: req.query.page || 1,
        perPage: 8,
        maxPages: 8,
    }).find({ $text: { $search: searchQuery }, remain: { $gt: 0 }, activated: 'enabled' })
        .exec(async (err, data: pagingQuery) => {
            res.send(await indexPage(data.results, {
                cutp: data.currentPage,
                totp: data.totalPages,
                perPage: 8,
                query: `/search?q=${searchQuery}&page=`
            }, req.isAuthenticated(), req.user, `you have searched ${searchQuery}`));
        });
}

// page that show token to amount paid ratio
export async function view_create_token(req: Request, res: Response) {
    res.send(await getTokenPage(req.isAuthenticated(), req.user, req.query.callbackUrl || req.body.callbackUrl));
}

// page that shows paystack payment form
export async function paystackCardPage(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.send(await paystackPage(req.isAuthenticated(), req.user,
        req.query.amount || req.body.amount, { action: req.query.action, order: req.query.order }));
}


// saves orders reviews to the database
export async function review(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect('/');
    const _review = new forums({ author: req.user._id, order: req.query.order, comment: req.body.comment });
    _review.save((err) => {
        if (err) console.log(err);
        res.redirect(`/orders/${req.query.order}`);
    });
}

//  sends the contact us page
export async function contactUs(req: Request, res: Response) { 
    res.send(await contactUsPage(req.isAuthenticated(), req.user));
}
 
//  sends the about us page
export async function aboutUs(req: Request, res: Response) {
    res.send(await aboutUsPage(req.isAuthenticated(), req.user));
}

// payment gateway
export async function paymentGateWay(req: Request, res: Response) {
    if (!req.isAuthenticated() ) return res.redirect(`/login?callbackurl=${req.originalUrl}`)
    switch (req.query.action) {
        case 'approved':
            return pay4Orders(req, res);
        default:
            return pay4token(req, res);
    }
}

const paystack = require('./../payment/paystack');
export async function pay4Orders(req: Request, res: Response) {
    try {
        if (!req.query.order) throw `order code is required for approval`;
        if (!req.query.verify) throw `transcation verification code is required for approval`;
        if (!process.env.OrderPrice) throw ` price is required for approval`;
        const Orders = keystone.list('Order').model;
        let amount: string  = process.env.OrderPrice;
        const _order = await Orders.findOne({ _id: req.query.order, activated: 'approved' }) as any;
        // if (_order == null) throw `order not found or already approved`;
        const verifed = await paystack.verifyTrac(req.query.verify);
        if (verifed.status !== true && verifed.data.status === 'success') throw `unverifed transaction code`;
        if (verifed.data.amount !== parseInt(amount) * 100) throw `amount does not equals ${amount} to be paid`;
        _order.activated = 'enabled';
        const updatedOrder = await Orders.findOneAndUpdate({ _id: req.query.order, activated: 'approved' }, _order) as any;
        res.redirect(`/orders/${updatedOrder._id}`);
    } catch (error) {
        res.send(error);
    }
 }
//   paying for token and adding to the user's wallet
export async function pay4token(req: Request, res: Response) {
    try {
        if (!req.query.verify) throw 'transcation verification code is required for approval';
        const verifed:any = await paystack.verifyTrac(req.query.verify);
        if (verifed.status !== true && verifed.data.status === 'success') throw `unverifed transaction code`;
        let amount = parseInt(verifed.data.amount) / 100; // converting to naira
        if (amount < 100) return addToWallet(amount/ 5);
        if (amount === 100) return addToWallet(20);
        if (amount === 200) return addToWallet(50);
        if (amount === 300) return addToWallet(100);
        if (amount === 400) return addToWallet(200);
        return addToWallet(amount/ 1.5);
    } catch (error) {
        res.send(error);
    }
    
    async function addToWallet(amount: number) {
        try {
            const Accounts = keystone.list('Account').model;
            const account: any = await Accounts.findOne({ author: req.user._id }) as any;
            account.wallet = account.wallet + amount;
            const updatedAccount = await Accounts.findOneAndUpdate({ author: req.user._id}, account);
            res.redirect(req.query.callbackurl || '/');
        } catch (error) {
            res.send(error);
        }
    }
 }