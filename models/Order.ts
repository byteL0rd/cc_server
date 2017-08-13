import * as keystone from 'keystone';
import * as mongoose from 'mongoose';
import { cupon } from './Cupon'
import { user } from './User';

const Types = keystone.Field.Types;
const order = new keystone.List('Order', {
    track: true
});

/** Cupon schema declaration */
order.add({
    name: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    institution: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    bizPhoneNo: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    address: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    email: <keystone.FieldSpec>{ type: Types.Email, required: true, initial: true, index: true },
    description: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    info: <keystone.FieldSpec>{ type: Types.Text, required: false, initial: true, index: true },
    // town: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    // state: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true, index: true },
    author: <keystone.FieldSpec>{
        type: Types.Relationship,
        ref: 'User',
        index: true
    },
    cost: <keystone.FieldSpec>{ type: Types.Number, required: true, initial: true, default: 0 },
    number: <keystone.FieldSpec>{ type: Types.Number, required: true, initial: true },
    remain: <keystone.FieldSpec>{ type: Types.Number, required: true, initial: true },
    cuponType: <keystone.FieldSpec>{ type: Types.Text, required: true, initial: true },
    img: <keystone.FieldSpec>{ type: Types.Text }
});

order.schema.post('remove', (doc: any, next: any) => {
    let rDoc: order = doc; ///just type safing typescript lol...
    const cupon = keystone.list('Cupon').model;
    cupon.remove(<cupon>{ order: rDoc._id })
        .then(e => next(null, doc))
        .catch(next)
});

order.schema.post('save', (doc: any, next: any) => {
    let sDoc: order = doc;

    const cupon = keystone.list('Cupon').model;
    cupon.findOne(<cupon>{ order: sDoc._id })
        .then((e) => {
            if (e) {
                updateCupons(sDoc)
                    .then((e) => next(null, doc))
                    .catch((e) => next(e));
            } else {
                createCupons(sDoc)
                    .then((e) => {
                        doc.cupons = sDoc
                        next(null, doc)
                    })
                    .catch(next);
            }
        }).catch(next);
});

function updateCupons(order: order) {
    const cupon = keystone.list('Cupon').model;
    return cupon.findOneAndUpdate(<cupon>{ order: order._id },
        <cupon>{ cuponType: order.cuponType });
}

function createCupons(order: order) {
    const cupon = keystone.list('Cupon').model;
    const listing: cupon[] = [];
    for (var i = 0; i < order.number; i++) {
        listing.push({
            cuponType: order.cuponType,
            number: i, order: order._id
        });
    }
    return cupon.create(listing);
}

order.defaultColumns = "cuponType, merchant, number, remain";
order.register();

export interface order {
    _id: string,
    name: string,
    institution: string,
    bizPhoneNo: string,
    address: string,
    email: string,
    description: string,
    info: string,
    author: string | user,
    number: number,
    remain: number,
    cost: number,
    cuponType: string,
    img: string
}

export interface Order extends mongoose.Document {
    _id: string,
    name: string,
    institution: string,
    bizPhoneNo: string,
    address: string,
    email: string,
    description: string,
    info: string,
    author: string | user,
    number: number,
    remain: number,
    cost: number,
    cuponType: string,
    img: string
}