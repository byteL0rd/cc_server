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

const _categories = fs.readFileSync('views/partials/categories.hbs').toString();
export async function categories() {
    const catges = keystone.list('Category').model;
    const ar = []
    const _catg = await catges.find({});

    return handlebar.compile(_categories)({
        catgs: _catg
    });
}

const _paginate = fs.readFileSync('views/partials/paginator.hbs').toString();
export function paginate(totp: number = 0, cutp: number = 0, query = '') {
    return handlebar.compile(_paginate)({
        pages: paginator(totp, cutp).map(q => {

            return {
                url: (q === cutp) ? q + '&' + query + `" class="uk-active` : q + '&' + query,
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
export async function indexPage(items: order[], paging: paging, isAuth?: boolean, user?: user): Promise<string> {
    if (items.length < paging.perPage) {
        paging.totp = paging.cutp;
    }
    return handlebar.compile(_index)({
        items: grid(items),
        headers: _header,
        navbar: await navbar(isAuth, user),
        categories: await categories(),
        paginates: paginate(paging.totp, paging.cutp, paging.query)
    });
}

const _login = fs.readFileSync('views/login.hbs').toString() + _footer;
export async function loginPage(isAuth: boolean = false, err?: string, user?: user): Promise<string> {
    return handlebar.compile(_login)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        err
    });
}


const _signup = fs.readFileSync('views/signup.hbs').toString() + _footer
export async function signupPage(isAuth: boolean = false, err?: any, user?: user): Promise<string> {
    return handlebar.compile(_signup)({
        headers: _header,
        navbar: await navbar(isAuth, user),
        err: (err) ? err.mgs || err.message : undefined 
    });
}

const _order = fs.readFileSync('views/view_order.hbs').toString() + _footer
export async function orderPage(order: order, isAuth?: boolean, items?: order[], user?: user): Promise<string> {
    if (!order.cost) order.cost = 0;
    return handlebar.compile(_order)({
        items: items,
        headers: _header,
        navbar: await navbar(isAuth, user),
        categories: await categories(),
        order: order
    });
}

const _create_order = fs.readFileSync('views/create_order.hbs').toString() + _footer
export async function createOrderPage(items: order[], isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_create_order)({
        headers: _header,
        navbar: await navbar(isAuth, user)
    });
}

const _cupon = fs.readFileSync('views/view_cupon.hbs').toString() + _footer
export async function cuponPage(cupon: cupon, order: order, isAuth: boolean, user?: user): Promise<string> {
    return handlebar.compile(_cupon)({
        headers: _header,
        navbar: navbar(isAuth, user),
        cupon,
        order
    });
}

const _get_token = fs.readFileSync('views/get_more_token.hbs').toString() + _footer
export async function getTokenPage(isAuth?: boolean, user?: user): Promise<string> {
    return handlebar.compile(_get_token)({
        headers: _header,
        navbar: navbar(isAuth, user),
    });
}

// const _index = fs.readFileSync('views/index.hbs').toString()
// export function indexPage(items: order[], isAuth?: boolean, user?: user): string {
//     return handlebar.compile(_index)({
//         items: grid(items),
//         headers:_header,
//         navbar: navbar(isAuth, user),
//         categories: categories()
//     });
// }

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