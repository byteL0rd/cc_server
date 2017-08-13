import * as keystone from 'keystone';
import * as mongoose from 'mongoose';

const Types = keystone.Field.Types;
const merchant = new keystone.List('Merchant', {
    track: true
});

import { user } from './user';

/** Cupon Merchant declaration */
merchant.add({
    name: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    institution: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    // town: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    // state: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    author: <keystone.FieldSpec>{
        type: Types.Relationship,
        ref: 'User',
        index: true
    }
});

merchant.defaultColumns = 'name, biz, author, institution, location';

merchant.defaultSort = 'institution';

merchant.register();

export interface merchant {
    _id: string;
    name?: string;
    biz: string;
    location: string;
    institution: string;
    author?: string | user;
}

export interface Merchant extends mongoose.Document {
    _id: string;
    name?: string;
    biz: string;
    location: string;
    institution: string;
    author?: string | user;
}