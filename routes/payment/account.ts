var co = require('co');
var keystone = require('keystone');
var account = keystone.list('Account').model;
var paystack = require('./paystack');

module.exports = function accountList (req, res, next) {
	// creating secure controlled body update
	var body = {
		bank: req.body.bank,
		acctNo: req.body.acctNo,
		author: req.user._id,
		bankName: req.body.bankName,
	};

	// allowing flow controls based on methods
	switch (req.method) {
		case 'GET':
			return getAccount();
		default:
			return res.status(404).json({ mgs: 'method not allowed' });
	}

	/**
	 * [getAccount description]
	 * @return {[function]} [description]
	 */
	function getAccount () {
		var query = account.findOne({
			author: req.user._id,
		});
		return formatGetResponse(req, res, next, query);
	}
};

// executes the query for both list and retrieves and send it to the next middleware
function formatGetResponse (req, res, next, query)
function formatGetResponse (req, res, next, query, successCode)
function formatGetResponse(req, res, next, query, successCode = 200, failCode = 406) {
	query
		.then((data) => {
			res.local = {};
			res.local.status = successCode;
			res.local.body = data;
			return next();
		})
		.catch((err) => {
			res.status(failCode).json(err);
		});
}
