import { Request, Response } from 'express';
import * as render from 'express-es6-template-engine';
import * as path from 'path';
import { indexPage } from '../views/compiler'
import { genOrder } from '../../faker';
import * as faker from 'faker';

import * as keystone from 'keystone';

const orders = keystone.list('Order') as any;
    // .model

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
    }).find({}).exec(async (err, data: pagingQuery) => {
        res.send(await indexPage(data.results, {
            cutp: data.currentPage,
            totp: data.totalPages
        }, req.isAuthenticated(), req.user));
    })
}
