import * as keystone from 'keystone';
import * as mongoose from 'mongoose';

import { user } from './User'
const Types = keystone.Field.Types;

/**
 * Inbox Model
 * ==========
 */
const Account = new keystone.List('Account', {
	track: true,
});

// account model schema declaration
Account.add({
	wallet: {
		type: Types.Number,
		required: true,
		initial: true,
		default: 10,
	},
	author: {
		type: Types.Relationship,
		ref: 'User',
		required: true,
		initial: true,
		unique: true,
		index: true
	}
});

export interface account {
	_id: string;
	wallet: number;
	author: string | user
}

export interface Account extends mongoose.Document {
	_id: string;
	wallet: number;
	author: string | user
}

// properties displayed in admin dashboard.
Account.defaultColumns = 'author, wallet';
Account.register();
