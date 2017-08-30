import { Request, Response } from 'express';
import { indexPage, createOrderPage, orderPage } from '../views/compiler';
import * as keystone from 'keystone';
import { pagingQuery } from './util';
import { keys } from 'lodash';
import * as mongoose from 'mongoose';

const orders = keystone.list('Order') as any

// renders a page to view a order
export async function viewOrder(req: Request, res: Response) {
    const order:any = await orders.model.findOne({ _id: req.params.id.toString() });
    const orderList: any = await orders.model.find({ activated: 'enabled', remain: { $gt: 0 } }).limit(4);
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
    query.activated = 'enabled';
    query.remain = { $gt: 0 };
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

const cloud = require('cloudinary');

// creates order or renders error
export async function createOrder(req: any, res: Response) {
    if (!req.isAuthenticated()) return res.redirect('/login');
    if (!req.files || !req.files.image_upload) return res.send(await createOrderPage(req.isAuthenticated(),
        req.user, `image is required`))
    const orders = keystone.list('Order').model;
    let _newOrder = Object.assign({}, req.body);
    _newOrder.remain = _newOrder.number;
    _newOrder.author = req.user._id
    _newOrder.activated = 'disabled';
    _newOrder.cost = 0;
    _newOrder = new orders(_newOrder) as any;
    let image_upload = await cloud.v2.uploader.upload(req.files.image_upload.path);
    console.log(image_upload)
    _newOrder.image_upload = image_upload.secure_url;
    _newOrder.save(async (err) => {
        if (err) return res.send(await createOrderPage(req.isAuthenticated(),
            req.user, err.Message || err));
        res.redirect(`/orders/${_newOrder._id}`);
    })
}