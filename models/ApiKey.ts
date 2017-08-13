import * as keystone from 'keystone';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';

import { user } from './User';

var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Apikey = new keystone.List('Apikey', {
	track: true,
});

Apikey.add({
	key: {
		type: Types.Text,
		default: genRandKey,
		required: true,
		unique: true,
	},
	author: {
		type: Types.Relationship,
		ref: 'User',
		index: true,
		required: true,
		initial: true,
		unique: true,
	},
});

Apikey.defaultColumns = 'author, key';
Apikey.register();

export interface apikey {
	key: string;
	author: string;
	_id: string | user;
}

export interface Apikey extends mongoose.Document  {
	key: string;
	author: string;
	_id: string | user;
}

function genRandKey() {
	return ((a: any) => { return a.randomBytes(256).toString('base64'); })(crypto);
}