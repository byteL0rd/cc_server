import * as fs from 'fs';
import * as handlebar from 'handlebars';
import * as faker from 'faker';
import * as keystone from 'keystone';
import { keys, flattenDeep } from 'lodash';
import { genUser, genInstit, genOrder, genCupTyp, genImg } from './../../faker';
import { cupon } from '../../models/Cupon';
import { forum } from '../../models/forum';
import { merchant } from '../../models/Merchant';
import { order } from '../../models/Order';
import { user } from '../../models/User';
import { instut } from '../../models/instut';
import { category } from '../../models/categs';
// creating memory store for headers
export const _header = fs.readFileSync('views/partials/header.hbs').toString()
export const _footer = fs.readFileSync('views/partials/footer.hbs').toString()

import * as moment from 'moment'

// compiling instutions

const _instutions = fs.readFileSync('views/partials/navbar_sub_list.hbs').toString()
export async function instutions(): Promise<string> {
    const instut = await keystone.list('Instut').model.find({});
    let _catq = []
    instut.forEach((e: any) => {
         _catq.push({ name: e.name, query: `institution=${e.name}` })
    })
    return handlebar.compile(_instutions)({ list: _catq })
}

export async function _nav_categories(): Promise<string> {
    const catges = await keystone.list('Category').model.find({});
    let _catq = []
    catges.forEach((e: any) => {
        e.author.forEach((e) => {
            _catq.push({ name: e, query: `cuponType=${e}` })
        })
    })
    return handlebar.compile(_instutions)({ list: _catq })
}

// compiling dynamic navbar
const _navbar = fs.readFileSync('views/partials/navbar.hbs', 'utf8').toString();
export async function navbar(isAuth: boolean, user?: user): Promise<string> {
    let author = (!user) ? user : user._id;
    const token = await keystone.list('Account').model.findOne({ author }) as any;
    return handlebar.compile(_navbar)({
        campuses: await instutions(),
        categs: await _nav_categories(),
        isAuth,
        user,
        token: (!token) ? token : token.wallet
    });
}


// creating card item for orders
const _grid_item = fs.readFileSync('views/partials/grid-item.hbs').toString()
export function grid_item(order: order): string {
    return handlebar.compile(_grid_item)(order);
}


// compling grids for others available
const _grid = fs.readFileSync('views/partials/grid.hbs').toString()
export function grid(items: order[]): string {
    let _items = '';
    items.forEach(e => {
        _items = _items + grid_item(e);
    });
    return handlebar.compile(_grid)({
        items: _items
    });
}

// compilling categories from database
const _categories = fs.readFileSync('views/partials/categories.hbs').toString();
export async function categories() {
    const catges = keystone.list('Category').model;
    const ar = []
    const _catg = await catges.find({});

    return handlebar.compile(_categories)({
        catgs: _catg
    });
}

// compling pagination options
const _paginate = fs.readFileSync('views/partials/paginator.hbs').toString();
export function paginate(totp: number = 0, cutp: number = 0, query = '') {
    return handlebar.compile(_paginate)({
        pages: paginator(totp, cutp).map(q => {

            return {
                url: (q === cutp) ? query + q + `" class="uk-active` : query + q + '&',
                no: q
            }
        }),
    });
}

const _index = fs.readFileSync('views/index.hbs').toString() + _footer;

interface paging {
    totp?: number,
    cutp?: number,
    query?: string,
    perPage?: number
}

// compiling the index page
export async function indexPage(items: order[], paging: paging,
    isAuth?: boolean, user?: user, message?: string): Promise<string> {
    if (items.length < paging.perPage) {
        paging.totp = paging.cutp;
    }
    if (!paging.query) paging.query = `/orders?page=`
    return handlebar.compile(_index)({
        items: grid(items),
        headers: _header,
        navbar: await navbar(isAuth, user),
        categories: await categories(),
        paginates: paginate(paging.totp, paging.cutp, paging.query),
        message
    });
}

// compiling the login page
const _login = fs.readFileSync('views/login.hbs').toString() + _footer;
export async function loginPage(isAuth: boolean = false, err?: any, user?: user, callbackurl?: string): Promise<string> {
    return handlebar.compile(_login)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        callbackurl,
        err: (err) ? err.mgs || err.message || err : undefined 
    });
}

// compiling tge signup page
const _signup = fs.readFileSync('views/signup.hbs').toString() + _footer
export async function signupPage(isAuth: boolean = false, err?: any, user?: user): Promise<string> {
    let __instut = await keystone.list('Instut').model.find({});
    __instut = __instut.map((e: any) => e.name)
    return handlebar.compile(_signup)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        instuts: __instut || [],
        err: (err) ? err.mgs || err.message || err : undefined 
    });
}

// compiling the order page
const _order = fs.readFileSync('views/view_order.hbs').toString() + _footer
export async function orderPage(order: order, isAuth?: boolean, items?: order[], user?: user): Promise<string> {
const forums = keystone.list('Forum').model;
    if (!order.cost) order.cost = 0;
    const comments = await forums.find({ order: order._id }).populate('author');    
    return handlebar.compile(_order)({
        items: items,
        headers: _header,
        navbar: await navbar(isAuth, user),
        categories: await categories(),
        order: order,
        enabled: (order.activated === 'enabled') ? true : false,
        expires: moment(order.createdAt || Date()).add(1, 'M').format('dddd, MMMM Do YYYY, h:mm a'),
        isAuth,
        comments
    });
}

// compiling the create order page
const _create_order = fs.readFileSync('views/create_order.hbs').toString() + _footer
export async function createOrderPage(isAuth?: boolean, user?: user, err?: any): Promise<string> {
    let __cupon_type = await keystone.list('Category').model.find({}) as any;
    // __cupon_type = __cupon_type.map((e: any) => e.author);//
    // __cupon_type = flattenDeep(__cupon_type);
    let __instut = await keystone.list('Instut').model.find({});
    __instut = __instut.map((e: any) => e.name)
    return handlebar.compile(_create_order)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        cuponTypes: __cupon_type,
        selected: (__cupon_type[0]) ? __cupon_type[0].name : '',
        instuts: __instut,
        err,
        isAuth: isAuth
    });
}

// compiling the cupon page
const _cupon = fs.readFileSync('views/view_cupon.hbs').toString() + _footer
export async function cuponPage(cupon: cupon, order: order, isAuth: boolean, user?: user): Promise<string> {
    return handlebar.compile(_cupon)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        cupon,
        order,
        expires: moment(order.createdAt || Date()).add(1, 'M').format('dddd, MMMM Do YYYY, h:mm a')
    });
}

// // compiling the get token page
const _get_token = fs.readFileSync('views/get_more_token.hbs').toString() + _footer
export async function getTokenPage(isAuth?: boolean, user?: user, callbackUrl?: string): Promise<string> {
    return handlebar.compile(_get_token)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
        callbackUrl
    });
}

interface PaymentOptions {
    action: string,
    order?: string
}
// // compiling the card payment page
const _paystack = fs.readFileSync('views/paystack.hbs').toString() + _footer
export async function paystackPage(isAuth?: boolean, user?: user,
    amount?: string, options?: PaymentOptions): Promise<string> {
    return handlebar.compile(_paystack)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
        publicKey: process.env.Paystack_Private_Key,
        email: user.email,
        amount: parseInt(amount) * 100,
        options
    });
}

const htmlHead = `
<!DOCTYPE html>
<html>

<head>
    {{{ headers }}}
</head>

<body>
    {{{ navbar }}}
    <section class="cc_body">
        <div class="uk-grid-small  uk-flex-center uk-text-center" uk-grid>
            <div class="uk-visible@s uk-width-1-4 uk-text-center" style="padding-left: 2%">
                {{{ categ }}}
                <br>
            </div>
            <div class="uk-width-expand  ">
`
const htmlbody = `            </div>
</div>
</section>
${_footer}
</body>

</html>`

// // compiling  aboutus page
const _about_us = ` ${htmlHead} 
<p class="uk-heading-primary" > About Us</p> 
<p> ${process.env.About_Us || 'we are the great cuopons suplier'} </p> <br><br>
<p class="uk-heading-primary" > Contact Us</p>
<p> ${process.env.Contact_Us || 'email us at admin@campuscoupons.ng'} </p> <br><br>
 ${htmlbody}`;
export async function aboutUsPage(isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_about_us)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}


// // compiling contact us page
const _contactUs = `${htmlHead} <p class="uk-heading-primary" > Contact Us</p>
<p> ${process.env.Contact_Us} </p> ${htmlbody}`;
export async function contactUsPage (isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_contactUs)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}

// // compiling How it works student guide page
const _htwStudent = `${htmlHead} 
    <p class="uk-heading-primary" > How It Works Student Guide </p>
    <style>
    .second-row { 
        width: 100%;
        height: 100%;
        flex-grow: 1; border: none; margin: 0; padding: 0; }
 </style>
    <iframe class="second-row"  src='https://view.officeapps.live.com/op/embed.aspx?src=http%3A%2F%2Fcampuscoupons%2Eng%3A80%2Fdocs%2Fhtwstudents%2Edocx&wdStartOn=1'
      frameborder='0'>This is an embedded <a target='_blank' href='https://office.com'>Microsoft Office</a> document,
     powered by <a target='_blank' href='https://office.com/webapps'>Office Online</a>.</iframe>
 ${htmlbody}`;
export async function HTWStudentPage (isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_htwStudent)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}

// // compiling contact us page
const _htwMerchant = `${htmlHead}
 <p class="uk-heading-primary" > How It Works Merchant Guide </p>
 <style>
    .second-row { 
        width: 100%;
        height: 100%;
        flex-grow: 1; border: none; margin: 0; padding: 0; }
 </style>
 <iframe class="second-row" src='https://view.officeapps.live.com/op/embed.aspx?src=http%3A%2F%2Fcampuscoupons%2Eng%3A80%2Fdocs%2Fhtwmerchants%2Edocx&wdStartOn=1'
 frameborder='0'>
 This is an embedded <a target='_blank' href='https://office.com'>
 Microsoft Office</a> 
 document, powered by <a target='_blank' href='https://office.com/webapps'>
 Office Online</a>.</iframe>
${htmlbody}`;
export async function HTWMerchantPage (isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_htwMerchant)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}

function paginator(totalPage: number, currentPage = 1, noListings = 5, steps = 3) {
    const listings = [];

    if (totalPage < noListings) {
        for (var i = 1; i < totalPage + 1; i++) {
            listings.push(i)
        }
        return listings;
    }
    listings.push(1)

    let _prec = currentPage - steps;
    let _next: number = currentPage + steps;
    if (_next > totalPage) _next = totalPage;
    for (var i = _prec; i < _next + 1; i++) {
        if (i > 1) listings.push(i)
    }
    return listings;
}