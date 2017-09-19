import * as keystone from 'keystone';
import * as mongoose from 'mongoose';
import * as faker from 'faker'


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
    },
    code: {
        type: Types.Text,
        default: function () {
            return faker.random.alphaNumeric(12)
        }
    }
});

Cupon.defaultColumns = "order.bizName, cuponType, order, number, code";
Cupon.defaultSort = 'order.bizName';
Cupon.register();

export interface cupon {
    _id?: string,
    order: string | order,
    number: number,
    cuponType: string,
    code
}

export interface Cupon extends mongoose.Document {
    _id: string,
    order: string | order,
    number: number,
    cuponType: string,
    code
}