import * as keystone from 'keystone'
import * as mongoose from 'mongoose';

import { account } from './Account';
import { apikey } from './ApiKey';

const Types = keystone.Field.Types;
/**
 * User Model
 * ==========
 */
const User = new keystone.List('User', {
	track: true
});

// user schma declaration
User.add({
	name: <keystone.FieldSpec>{ type: Types.Name, initial: true, index: true },
	email: <keystone.FieldSpec>{ type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true, min: 8 },
	institution: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true },
}, 'Permissions', {
		isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

// creates  an api key for a user when saved
User.schema.post('save', (doc: any, next: any) => {
	const apiKey = keystone.list('Apikey').model;
	apiKey.findOne(<apikey>{ author: doc._id })
		.then((e) => {
			if (e) return next(null, doc);
			ensureUpdates(doc, next);
		});
});

// creates an apikey when updates happens
function ensureUpdates(doc: user, next) {
	createAccount(doc._id)
		.then((e) => createApiKey(doc._id))
		.then(d => next(null, doc))
		.catch(next)
}

// creates an apikey when user is saved
function createApiKey(_id: string) {
	const apiKey = keystone.list('Apikey').model;
	return new apiKey(<apikey>{ author: _id }).save();
}

// creates an account for the user
function createAccount(_id: string) {
	const account = keystone.list('Account').model;
	return new account(<account>{ author: _id, wallet: 20 }).save();
}

export interface user {
	_id: string,
	name: string;
	email: string;
	password: string;
	institution: string;
}

export interface User extends mongoose.Document {
	_id: string,
	name: string;
	email: string;
	password: string;
	institution: string;
}

// properties to display in admin dashboard
User.defaultColumns = 'name, email, institution ,isAdmin';
User.register();
