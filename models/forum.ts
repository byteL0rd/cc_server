import * as keystone from 'keystone';
import * as mongoose from 'mongoose';

import { user } from './User';
import { order } from './Order';

const Types = keystone.Field.Types;
const forum = new keystone.List('Forum', {
    track: true
});

/** forum schema declaration */
forum.add({
    author: <keystone.FieldSpec>{
        type: Types.Relationship,
        ref: 'User',
        required: true, initial: true,
        index: true
    },
    order: <keystone.FieldSpec>{
        type: Types.Relationship,
        ref: 'Order',
        required: true, initial: true
    },
    comment: <keystone.FieldSpec>{
        type: Types.Text, required: true,
        initial: true,
        index: true
    }
});

forum.defaultColumns = 'author, order, comment';
forum.defaultSort = 'comment';
forum.register();

export interface forum {
    _id: string;
    author: string | user;
    order: string | order;
}

export interface Forum extends mongoose.Document {
    _id: string;
    author: string | user;
    order: string | order;
}