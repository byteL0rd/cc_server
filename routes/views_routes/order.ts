import { Request, Response } from 'express';
import { indexPage, createOrderPage, orderPage } from '../views/compiler';
import * as keystone from 'keystone';
import { pagingQuery } from './util';
import { keys } from 'lodash';

const orders = keystone.list('Order') as any
export async function viewOrder(req: Request, res: Response) {
    const order:any = await orders.model.findById({ _id: req.params.id });
    const orderList: any = await orders.model.find({}).limit(4);
    res.send(await orderPage(order, req.isAuthenticated(), orderList, req.user));
}

export async function viewOrders(req: Request, res: Response) {
    const query = req.query || {};
    const page = req.query.page;
    delete query.page;
    let _url_query = '';
    keys(query).forEach((e, i) => {
        _url_query = _url_query + `${e}=${encodeURI(query[e])}&`
    });
    const orderList: any = await orders.paginate({
					page: page,
					perPage: 8,
					maxPages: 4,
    }).find(query).exec(async (err, data: pagingQuery) => {
        res.send(await indexPage(data.results, {
            cutp: data.currentPage,
            totp: data.totalPages,
            perPage: 8,
            query: _url_query
        }, req.isAuthenticated(), req.user))
    })
}

export async function viewCreateOrders(req: Request, res: Response) {
    res.send(await createOrderPage([], req.isAuthenticated(), req.user));
}