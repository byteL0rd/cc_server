import * as keystone from 'keystone';
import * as mongoose from 'mongoose';
import { cupon } from './Cupon'
import { user } from './User';
import * as mailer from './../routes/mailer';
import { SendMailOptions } from 'nodemailer'
const xlsx = require('xlsx')
import * as nodemailer from 'nodemailer';
import * as faker from 'faker'
import { orderBy } from 'lodash';


const G_Email = process.env.GMAIL_EMAIL || '';
const G_Password = process.env.GMAIL_PASSWORD || '';

const textSearch = require('mongoose-text-search');

const Types = keystone.Field.Types;
const order = new keystone.List('Order', {
    track: true,
    index: true
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
    cost: <keystone.FieldSpec>{ type: Types.Number, default: 0 },
    number: <keystone.FieldSpec>{ type: Types.Number, required: true, initial: true },
    remain: <keystone.FieldSpec>{ type: Types.Number, required: true, initial: true, index: true },
    cuponType: <keystone.FieldSpec>{ type: Types.TextArray},
    category: <keystone.FieldSpec>{ type: Types.Text },
    finished: <keystone.FieldSpec>{ type: Types.Boolean, default: false },
    image_upload: { type: Types.Text },
    activated: { type: Types.Select, default: 'disabled', options: 'enabled, disabled, approved', emptyOption: false }
});

// adding search to it
order.schema.plugin(textSearch);
order.schema.index({
    "name": "text", "institution": "text", "cuponType": "text",
    "category": "text", "description": "text",  "info": "text",  "address": "text", 
});

// removes cupons of an order when removed
order.schema.post('remove', (doc: any, next: any) => {
    let rDoc: order = doc; ///just type safing typescript lol...
    const cupon = keystone.list('Cupon').model;
    cupon.remove(<cupon>{ order: rDoc._id })
        .then(e => next(null, doc))
        .catch(next)
});

// sends mail when an order is updated
function updateMailList(sDoc, doc, next) {
    updateCupons(sDoc)
        .then((e: any) => {
        console.log(e)
        keystone.list('Cupon').model.find({ order: sDoc._id })
            .then((d: any) => {
                d = remapDocsToList(d);
                sendMail(doc, d)
                .then( d => {
                    next(null, doc)
                }).catch( e => next(e));
            })
    })
    .catch((e) => next(e));
}

// sends mail when a new order is created
function createMailList(sDoc, doc, next) {
    createCupons(sDoc)
    .then((e: any) => {
        e = remapDocsToList(e);
        sendMail(doc, e)
            .then( d => {
                console.log(d)
                doc.cupons = sDoc
                next(null, doc)
            }).catch(next)
    })
    .catch(next);
}

//  sends mail when an order is approved
function approved(sDoc, next) {
    let price;
    try {
        price = parseInt(sDoc.number) * parseInt(process.env.OrderPrice);
        if (parseInt(sDoc.number) < 100) price = parseInt(process.env.OrderPrice) * 10;
    } catch (error) {
        price =  parseInt(process.env.OrderPrice) * 10
    }
    let m = {
        subject: `${process.env.SITE_NAME || 'campuscoupons.ng'}: Approved Cupon Order  ${sDoc._id}  ${Date.now()}`,
        text: `your cupon order has been approved. 
        Please proceed to www.campuscoupons.ng/payment/debitcard?amount=${ price }&order=${sDoc._id}&action=approved 
            Thank You. 
            www.campuscupons.ng`
    }
    NotifyForPayment(sDoc, m).then(() => next(null, sDoc)).catch(next)
}

// sends cupon list when an order is enabled
function enabled(sDoc, next) {
    const cupon = keystone.list('Cupon').model;
    cupon.findOne(<cupon>{ order: sDoc._id })
        .then((e) => {
            if (e) return updateMailList(sDoc, sDoc, next);
            return createMailList(sDoc, sDoc, next)
        }).catch(next);
}

//  sends mail when an order is created
function disabled(sDoc, next) {
    let m = {
        subject: `${process.env.SITE_NAME || 'campuscoupons.ng'} for order ${sDoc._id} ${Date.now()}`,
        text: `your coupon orders has been submitted. 
    You will be get back from us when your coupon order is approved for payment.
     Thank You. 
     www.campuscoupons.ng`
    }
    NotifyForPayment(sDoc, m).then(() => next(null, sDoc)).catch(next)
}

// creates and saves  all cupons of an order
order.schema.post('save', (doc: any, next: any) => {

    switch (doc.activated) {
        case 'approved':
            return approved(doc, next)
        case 'enabled':
            return enabled(doc, next);
        default:
            return disabled(doc, next);
    }
});

// takes an order and updates it cupons when updated
function updateCupons(order: order) {
    const cupon = keystone.list('Cupon').model;
    return cupon.update(<cupon>{ order: order._id },
        <cupon>{ cuponType: order.cuponType });
}

// creates cupons for a saved other
function createCupons(order: order) {
    const cupon = keystone.list('Cupon').model;
    const listing: cupon[] = [];
    for (var i = 0; i < order.number; i++) {
        listing.push({
            cuponType: order.cuponType,
            number: i, order: order._id,
            code: faker.random.alphaNumeric(12)
        });
    }
    return cupon.create(listing);
}

// creating excel spreedsheets from docs arrays
export function createExcel(d: any[]): string {
    const wopts = { bookType: 'xlsx', type: 'base64' };
    const Sheet1 = xlsx.utils.json_to_sheet(d);
    const wb = {
        SheetNames: ['Sheet1'],
        Sheets: {
            Sheet1
        }
    }
    return xlsx.write(wb, wopts);
}

// creating transport for nodemailer
const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: G_Email,
        pass: G_Password,
    },
});

interface S_Mail {
    subject: string,
    text?: string,
    html?: string
}
export async function NotifyForPayment(order: order, mai: S_Mail) {
    try {
        const owner: user = await keystone.list('User').model.findOne(<user>{ _id: order.author }) as any;
        // formating mail for users
        const mail: SendMailOptions = {
            from: G_Email,
            to: owner.email,
            subject: mai.subject,
            text: mai.text,
            attachments: []
        }
        if (process.env.NODE_ENV !== 'production') console.log(mail);
        const mailed = await smtpTransport.sendMail(mail)
    } catch (e) {
        console.log(e)
    }
}

function remapDocsToList(d: cupon[]) {
    let _arry = d.map((val: any) => {
        return {
            no: val.number,
            code: '' + val['code'] + ' '.toUpperCase()
        }
    });
    return orderBy(_arry, ['no'], 'asc');
}

export async function sendMail(order: order, d: any[]) {
    const owner: user = await keystone.list('User').model.findOne(<user>{ _id: order.author }) as any;
    console.log(d);
    const xlsAttch = createExcel(d);
    // formating mail for users
    const mail: SendMailOptions = {
        from: G_Email,
        to: owner.email,
        subject: process.env.CUPON_MAIL_SUBJECT_MESSAGE || `
        Your confirmation cupon codes for the order you placed at campuscoupons.ng`,
        text: process.env.CUPON_MAIL_TEXT_MESSAGE || `Your  coupon codes for the order
        you placed at campuscoupons.ng is in the excel spreadsheets attachement. Thank You For Using CampusCupons`,
        attachments: [{
            filename: `Order_${order._id}.xlsx`,
            content: xlsAttch,
            encoding: 'base64'
        }]
    }
    if (process.env.NODE_ENV !== 'production') console.log(mail);
    return smtpTransport.sendMail(mail)
}

// properties to diplay in admin dashboard
order.defaultColumns = "cuponType, number, activated, remain";
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
    img: string,
    activated: string,
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
    img: string,
    activated: string
}