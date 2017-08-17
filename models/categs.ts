import * as keystone from 'keystone';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';

import { user } from './User';

var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var Category = new keystone.List('Category', {
	track: true,
});

// category model schema declaration
Category.add({
	name: {
		type: Types.Text,
		required: true,
        unique: true,
        inital: true
	},
	author: {
        type: Types.TextArray,
        default: []
	},
});

// property to display in admin
Category.defaultColumns = 'name';
Category.register();

export interface category {
	name: string;
	type: string[];
	_id: string;
}

export interface Category extends mongoose.Document  {
	name: string;
	type: string[];
	_id: string;
}