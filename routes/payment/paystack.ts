const request = require('request-promise');
// const request = function (...args) {
// 	return Promise.resolve(args);
// }

const root = 'https://api.paystack.co';
const API_KEY = process.env.PAYSTACK_SK_KEY;

const headers = {
	Authorization: `Bearer ${API_KEY}`,
};

exports.charge = function (email, amount, number, cvv,
	expiry_month, expiry_year, metaData) {
	return new Promise(function (resolve, reject) {
		request({
			url: `https://api.paystack.co/charge`,
			method: 'POST',
			body: {
				email,
				amount,
				card: {
					number,
					cvv,
					expiry_month,
					expiry_year,
					metadata: {
						email: metaData.email,
						fullName: `${metaData.fullName.first}  ${metaData.fullName.last}`,
						_id: metaData._id,
					},
				},
			},
			json: true,
			headers,
		}).then(d => resolve(d))
			.catch(e => reject(e.message || e));
	});
};


/**
 * [description] To create SunAccounts
 * @param  {[String]} business  [description]
 * @param  {[String]} bank      [description]
 * @param  {[String]} acctNo    [description]
 * @param  {[String]} perCharge [description]
 * @return {[promise]}           [description]
 */
const subAcctUrl = root + '/subaccount';
exports.createSubAcct = function (business, bank, acctNo, perCharge, metaData) {
	return new Promise(function (resolve, reject) {
		//  note the exteranl promise housing was done because
		//  of unpredictale behaviour of request.
		request({
			url: subAcctUrl,
			headers,
			body: {
				business_name: business,
				settlement_bank: bank,
				account_number: acctNo,
				percentage_charge: perCharge,
				metadata: {
					email: metaData.email,
					fullName: `${metaData.fullName.first}  ${metaData.fullName.last}`,
					_id: metaData._id,
				},
			},
			method: 'POST',
			json: true,
		}).then(d => {
			console.log(d);
			resolve(d);
		})
		.catch(e => {
			console.log(e);
			reject(e.message || e);
		});
	});

};

/**
 * [description] list and returns list of subaccounts
 * @param  {[String]} perPage [description]
 * @param  {[String]} Page    [description]
 * @return {[promise]}         [description]
 */
exports.listSubAcct = function (perPage, page) {
	return request({
		url: `${subAcctUrl}?perPage=${perPage}&page=${page}`,
		headers,
		method: 'GET',
		json: true,
	});
};

/**
 * [description] returns a specific subaccountId
 * @param  {[String]} id [description]
 * @return {[promise]}    [description]
 */
exports.retrieveSubAcct = function (id) {
	return request({
		url: `${subAcctUrl}/${id}`,
		method: 'GET',
		headers,
		json: true,
	});
};

/**
 * [description] updates subaccount with body
 * @param  {[Object]} body [description]
 * @return {[promise]}      [description]
 */
exports.updateSubAcct = function (id, body) {
	return request({
		url: `${subAcctUrl}/${id}`,
		body,
		headers,
		method: 'PUT',
		json: true,
	});
};

/**
 * [description] retrieves bank list surposted
 * @return {[promise]} [description]
 */
exports.retrieveBankList = function (perPage = 30, page = 1) {
	return new Promise(function (resolve, reject) {
		request({
			url: `${root}/bank?perPage=${perPage}&page=${page}`,
			method: 'GET',
			json: true,
			headers,
		}).then(d => resolve(d)).catch(e => reject(e));
	});
};

/**
 * [description]
 * @param  {[String]} recipient [description]
 * @param  {[Number]} amount    [description]
 * @param  {[Promise]} reason    [description]
 * @return {[Promise]}           [description]
 */
exports.transferTo = function (recipient, amount, reason) {
	return request({
		url: `${root}/transfer`,
		body: {
			source: 'balance',
			reason,
			amount: amount * 100,
			currency: 'NGN',
			recipient,
		},
		method: 'POST',
		json: true,
		headers,
	});
};

/**
 * [description] deactive the otp
 * @return {[Promise]} [description]
 */
exports.deacOTP = function () {
	return request({
		url: `${root}/transfer/disable_otp`,
		method: 'POST',
		headers,
		json: true,
	});
};

/**
 * [description] deactive OTP finally
 * @param  {[string]} otp_code [description]
 * @return {[Promise]}          [description]
 */
exports.finalDeacOTP = function (otp_code) {
	return request({
		url: `${root}/transfer/disable_otp_finalize`,
		method: 'POST',
		body: {
			otp: otp_code,
		},
		json: true,
		headers,
	});
};

exports.initTrac = function (reference, amount, email, metadata) {
	return request({
		url: `https://api.paystack.co/transaction/initialize`,
		method: 'POST',
		body: {
			reference,
			amount: amount * 100,
			email,
			metadata,
		},
		json: true,
		headers,
	});
};

exports.verifyTrac = function (id) {
	return request({
		url: `https://api.paystack.co/transaction/verify/${id}`,
		method: 'GET',
		json: true,
		headers,
	});
};
