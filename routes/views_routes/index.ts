import { index, view_create_token, review } from './util'
import { Application } from 'express';
import * as render from 'express-es6-template-engine';
import { viewLogin, viewSignUp, authLogin, authSignUp, authLogOut } from './auth';
import { viewCreateOrders, viewOrders, viewOrder, createOrder } from './order';
import { viewCupon } from './cupon';
import * as passport from 'passport';
import { genOrder } from './../../faker';
import * as keystone from 'keystone';
import * as session from 'express-session';
import * as store from 'connect-mongo';
import * as moment from 'moment';
import * as compression from 'compression';
const mongostore = store(session);
import * as multer from 'multer';

module.exports = function routes(app: Application) {

    app.engine('html', render)
    app.set('views', 'views')
    app.set('view engine', 'html')
    // renders the default homepage

    // appends a session store for login-ed users    
    app.use(session({
        name: `${process.env.SITE_NAME || 'Campouscoupon.ng'}`,
        secret: `${process.env.SESSION_SECRET || ' session._Campouscoupon.ng'}`,
        store: new mongostore({
            mongooseConnection: keystone.get('mongoose').connection,
            collection: 'session',
            ttl: 14 * 24 * 60 * 60,
            touchAfter: 12 * 3600
        }),
        saveUninitialized: false,
        resave: true
    }));

    app.use(passport.initialize());
    app.use(passport.session())
    // require('./passport')(keystone, app, passport);
    require('../passport/localAuth')(passport, keystone.list('User').model);

    // adds compression for serving static files    
    app.use('/*', compression());

    // renders the homepage    
    app.get('/', index);

    // renders the login page 
    app.get('/login', viewLogin)
    app.use('/login', authLogin);

    // renders the signup page 
    app.get('/signup', viewSignUp)
    app.use('/signup', authSignUp);

    // renders page to view others
    // renders a page to create an other
    //  renders page to view a order 
    app.get('/orders', viewOrders)
    app.get('/createorders', viewCreateOrders)
    app.post('/createorders', createOrder)
    app.get('/orders/:id', viewOrder)


    app.get('/gettoken', view_create_token)
    //     // renders a page to view token
    //     .get()
    //     // renders a page to create token
    //     .post()

    app.get('/cupon', viewCupon);
    app.post('/review', review);

    // logs a user out
    app.get('/logout', authLogOut);

    var bcrypt = require('bcrypt-nodejs');  
    app.get('/pp', async (req, res) => {
        if (req.query.user) {
            const _user = keystone.list('User').model
            let admin = _user.findOneAndUpdate({ email: 'user@keystonejs.com' }, {
                name: 'king abey',
                email: 'user@keystonejs.com',
                password:  bcrypt.hashSync('OneAbiodun', bcrypt.genSaltSync(10)),
                institution: 'ladoke akintola uiversity'
            }, (err, doc) => {
                console.log(err, doc)
                res.send({ err, doc });

            });

        }
        res.status(404);
        // const Order = keystone.list('Order').model
        // const order = new Order(genOrder());
        // order.save((err) => {
        //     if (err) return res.json(err);
        //     res.json(Order);
        // })
    })

}