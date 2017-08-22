import { Request, Response } from 'express';
import { cuponPage } from './../views/compiler';
import * as keystone from 'keystone';

const Order = keystone.list('Order').model;
const Cupon = keystone.list('Cupon').model;
const Account = keystone.list('Account').model;

export async function viewCupon(req: Request, res: Response) {
    if (!req.isAuthenticated()) return res.redirect('/orders/' + req.query.id);
    try {
        let _order = await Order.findOne({ _id: req.query.id }) as any;
        if (_order.cost > 0) {
            let account = await Account.findOne({ author: req.user._id }) as any;
            account.wallet = account.wallet - _order.cost;
            if (account.wallet < 0) return res.redirect(`/orders/${req.query.id}`);
            account = await Account.findOneAndUpdate({ author: req.user._id }, account);
        }
        if (_order === {} || _order == undefined ) return res.redirect('/orders')
        _order.remain = _order.remain - 1
        if (_order.remain < 1) { _order.remain = 0;  _order.finished = true };
        _order = await Order.findByIdAndUpdate(req.query.id, _order)
        const _cupon = await Cupon.findOne({ order: req.query.id, number: _order.remain }) as any;
        if (_order.remain < 1) return res.redirect('/orders');
        res.send(await cuponPage(_cupon, _order, req.isAuthenticated(), req.user));
    } catch (error) {
        console.log(error);
        res.redirect('/orders');
    }
}

export async function viewSignUp(req: Request, res: Response) {
    res.render('signup.html', {
        locals: {},
        partials: {}
    });
}