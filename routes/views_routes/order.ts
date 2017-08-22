import { Request, Response } from 'express';
import { indexPage, createOrderPage, orderPage } from '../views/compiler';
import * as keystone from 'keystone';
import { pagingQuery } from './util';
import { keys } from 'lodash';

const orders = keystone.list('Order') as any

// renders a page to view a order
export async function viewOrder(req: Request, res: Response) {
    const order:any = await orders.model.findById({ _id: req.params.id });
    const orderList: any = await orders.model.find({}).limit(4);
    res.send(await orderPage(order, req.isAuthenticated(), orderList, req.user));
}

// renders a page to view orders
export async function viewOrders(req: Request, res: Response) {
    const query = req.query || {};
    const page = req.query.page;
    delete query.page;
    let _url_query = '';
    keys(query).forEach((e, i) => {
        _url_query = _url_query + `${e}=${encodeURI(query[e])}`
        if (i !== keys.length -1 ) _url_query = _url_query + '&'
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
            query: `/orders?${_url_query}&page=`
        }, req.isAuthenticated(), req.user))
    })
}

// renders the page to create orders
export async function viewCreateOrders(req: Request, res: Response) {
    res.send(await createOrderPage(req.isAuthenticated(), req.user));
}

// creates order or renders error
export async function createOrder(req: any, res: Response) {
    if (!req.files || !req.files.img) return res.send(await createOrderPage(req.isAuthenticated(),
        req.user, `image is required`))
    const orders = keystone.list('Order').model;
    let _newOrder = Object.assign({}, req.body, req.files);
    _newOrder.remain = _newOrder.number;
    _newOrder = new orders(_newOrder)
    _newOrder.save(async (err) => {
        if (err) return res.send(await createOrderPage(req.isAuthenticated(),
            req.user, err.Message || err))
        res.redirect(`/orders/${_newOrder._id}`);
    })
}