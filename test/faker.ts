import * as faker from 'faker';
import { cupon } from './../models/Cupon'
import { merchant } from './../models/Merchant'
import { order } from './../models/Order'
import { user } from './../models/User'
import * as keystone from 'keystone';

export function genImg(): string {
    const imgPath = '/assets/images/';
    const images = ['011-details-2560x1440-A.jpg', '23c9d5c32827c457d3f0e498330101ab.jpg',
        '569e89a851e9747d62d9a0507c1ed38a.jpg', '656af773487b9218959a3110ed43876b.jpg',
        '6502a68098a93be56978aef209521821.jpg', '034113ed7465398cd29fa10cf4b57b73.jpg',
        '45262f571a39848c70f895a248e49e0f.jpg', 'banner_01.png',
        'e31ffddc05f70eec53bd578c6e52c3cb.jpg', 'enough_love_-wallpaper-1366x768.jpg',
        'f585401729cb7e2abbbd580eb1ea59dd.jpg', 'love_red_roses-wallpaper-1366x768.jpg'
    ];
    return imgPath + images[faker.random.number({
        max: images.length - 1,
        min: 0
    })];
}

export function genInstit(): string {
    const inst = ['ladoke akintola university', 'univeristy of ibadan',
        'unversity of ilorin', 'redeemers university', 'federal polytechnic ede',
        'university of osun state', 'adeleke university', 'kwara state univeristy'
    ]
    return inst[faker.random.number({ max: inst.length - 1, min: 0 })];
}

export function genCupTyp(): string {
    const cuponType = ['food and extra drink', 'get a cloth',
        'extra refund cash', 'free delivery', 'laundry service'
    ]
    return cuponType[faker.random.number({ max: cuponType.length - 1, min: 0 })];
}

export function genUser(): user {
    return <any>{
        //  _id: faker.random.uuid(),
        email: faker.internet.email(),
        institution: genInstit(),
        name: faker.name.findName(),
        password: faker.random.alphaNumeric(10)
    }
}


export function genOrder(userId?: string): order {
    return <any>{
        // _id: faker.random.uuid(),
        author: userId,
        bizPhoneNo: faker.random.number().toString(),
        name: faker.company.companyName(),
        institution: genInstit(),
        address: `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.state()}`,
        cuponType: genCupTyp(),
        description: faker.lorem.sentence(6, 12),
        info: faker.lorem.sentences(),
        number: 80,
        remain: faker.random.number({
            max: 80,
            min: 0
        }),
        img: genImg(),
        email: faker.internet.email()
    }
}

export async function populate() {

}


// function name(params:type) {
//             var t = require('../../updates/0.0.1-admins');
//         var l = keystone.list('User').model;
//         var admin = new l(t.create.User[0]);
//         admin.save((e) => {
//             if (e) return res.json(e);
//             return res.json(admin);
//         });
// }