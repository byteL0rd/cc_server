import { Request } from 'express';
import * as express from 'express';
import { User } from './../../models/User';
import {authorizeRoute } from './../middleware';

import { addCoins } from './prokess';
// const paystack = require('./paystack');
interface r extends Request {
	user: User;
}
module.exports = function payment (app, mountPath) {
	const router = express.Router();
	router.use(authorizeRoute)
	// pay with master card and charge
	router.post('/charge', (req: r, res) => {
		var b = req.body;
		addCoins(req.user._id, req.user.email, b.amount,
			b.number, b.cvv, b.expiry_month,
			b.expiry_year).then(res.status(200).json)
			.catch(res.status(406).json);
	});

	app.use(mountPath, router);
};
