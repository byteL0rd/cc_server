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
    return handlebar.compile(_navbar)({
        campuses: await instutions(),
        categs: await _nav_categories(),
        isAuth,
        user,
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
export async function loginPage(isAuth: boolean = false, err?: any, user?: user): Promise<string> {
    return handlebar.compile(_login)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        err: (err) ? err.mgs || err.message || err : undefined 
    });
}

// compiling tge signup page
const _signup = fs.readFileSync('views/signup.hbs').toString() + _footer
export async function signupPage(isAuth: boolean = false, err?: any, user?: user): Promise<string> {
    return handlebar.compile(_signup)({
        headers: _header,
        navbar: await navbar(isAuth, user),
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
        isAuth,
        comments
    });
}

// compiling the create order page
const _create_order = fs.readFileSync('views/create_order.hbs').toString() + _footer
export async function createOrderPage(isAuth?: boolean, user?: user, err?: any): Promise<string> {
    let __cupon_type = await keystone.list('Category').model.find({});
    __cupon_type = __cupon_type.map((e: any) => e.author);
    __cupon_type = flattenDeep(__cupon_type);

    let __instut = await keystone.list('Instut').model.find({});
    __instut = __instut.map((e: any) => e.name)
    return handlebar.compile(_create_order)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        cuponTypes: __cupon_type,
        instuts: __instut,
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
        order
    });
}

// // compiling the get token page
const _get_token = fs.readFileSync('views/get_more_token.hbs').toString() + _footer
export async function getTokenPage(isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_get_token)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}

// // compiling the card payment page
const _paystack = fs.readFileSync('views/paystack.hbs').toString() + _footer
export async function paystackPage(isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_get_token)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
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
</body>

</html>`

// // compiling  aboutus page
const _about_us = ` ${htmlHead} <p class="uk-heading-primary" > About Us</p> 
<p> ${process.env.About_Us} </p> ${htmlbody} ${_footer}`;
export async function aboutUsPage(isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_about_us)({
        headers: _header,
        categ: await categories(),
        navbar: await navbar(isAuth, user),
    });
}


// // compiling contact us page
const _contactUs = `${htmlHead} <p class="uk-heading-primary" > Contact Us</p>
<p> ${process.env.Contact_Us} </p> ${htmlbody} ${_footer}`;
export async function contactUsPage (isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_contactUs)({
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