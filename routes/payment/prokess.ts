const paystack = require('./paystack');
const co = require('co');
const Account = {
	findOne: function (arg) { return { populate: function (arg) { return {} } } },
	findOneAndUpdate: function(a,r,g){return { populate :function(arg) { return {}}}}
}
	// require('keystone').list('Account').model;

export function myCoins(author) {
	return Account.findOne({ author }).populate('author');
};

export function addCoins(author, email, amount, number, cvv,
	expiry_month, expiry_year) {
	return co.wrap(function* (author, email, amount, number, cvv,
		expiry_month, expiry_year) {
		try {
			// SUDO CODE
			// find the user acctNo
			// paytransacton
			// update transaction
			// send a response of sucess:

			let acct = yield Account.findOne({ author }).populate('author');
			var mgs = 'invalid account details for transaction';
			if (!acct) throw new Error(mgs);
			let transcation = yield paystack.charge(email, amount, number, cvv,
				expiry_month, expiry_year, acct.author);

			// bind amount to transaction
			acct.wallet = parseInt(acct.wallet) + parseInt(amount);
			acct = yield Account.findOneAndUpdate({ author }, acct, {
				upsert: true, new: true
			});

			const data = {
				status: 'success',
				updatedAcct: acct,
				transcation,
			};
			return Promise.resolve(data);
		} catch (e) {
			return Promise.reject(e);
		}
	})(author, email, amount, number, cvv,
		expiry_month, expiry_year);
};
