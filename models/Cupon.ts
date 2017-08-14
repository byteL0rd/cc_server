import * as keystone from 'keystone';
import * as mongoose from 'mongoose';

import { order } from './Order';

const Types = keystone.Field.Types;
const Cupon = new keystone.List('Cupon', {
    track: true
});

/** Cupon schema declaration */
Cupon.add({
    cuponType: <keystone.FieldSpec>{
        type: Types.Text, required: true,
        initial: true,
        index: true
    },
    order: <keystone.FieldSpec>{
        required: true,
        initial: true,
        type: Types.Relationship,
		ref: 'Order',
    },
    number: <keystone.FieldSpec>{
        type: Types.Text, required: true,
        initial: true
    }
});

Cupon.defaultColumns = "order.bizName, cuponType, order, number";
Cupon.defaultSort = 'order.bizName';
Cupon.register();

export interface cupon {
    _id?: string,
    order: string | order,
    number: number,
    cuponType: string
}

export interface Cupon extends mongoose.Document {
    _id: string,
    order: string | order,
    number: number,
    cuponType: string
}