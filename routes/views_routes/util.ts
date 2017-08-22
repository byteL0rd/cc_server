import { Request, Response } from 'express';
import * as render from 'express-es6-template-engine';
import * as path from 'path';
import { indexPage, getTokenPage } from '../views/compiler'
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

export async function index(req: Request, res: Response) {
    orders.paginate({
        page: req.query.page || 1,
        perPage: 8,
        maxPages: 8,
    }).find({ remain: { $gt: 0 } }).exec(async (err, data: pagingQuery) => {
        res.send(await indexPage(data.results, {
            cutp: data.currentPage,
            totp: data.totalPages
        }, req.isAuthenticated(), req.user));
    })
}

export async function searchResultPage(req: Request, res: Response) {
    let searchQuery = req.query.query || req.query.q || req.body.query || '';
    let searchResults = orders.paginate({
        page: req.query.page || 1,
        perPage: 8,
        maxPages: 8,
    }).find({ $text: { $search: searchQuery } })
        .exec(async (err, data: pagingQuery) => {
            res.send(await indexPage(data.results, {
                cutp: data.currentPage,
                totp: data.totalPages,
                perPage: 8,
                query: `/search?q=${searchQuery}&page=`
            }, req.isAuthenticated(), req.user, `you have searched ${searchQuery}`));
        });
}

export async function view_create_token(req: Request, res: Response) {
    res.send(await getTokenPage(req.isAuthenticated(), req.user));
}

export async function review(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect('/');
    const _review = new forums({ author: req.user._id, order: req.query.order, comment: req.body.comment });
    _review.save((err) => {
        if (err) console.log(err);
        res.redirect(`/orders/${req.query.order}`);
    });
}