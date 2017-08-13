import { index } from './util'
import { Application } from 'express';
import * as render from 'express-es6-template-engine';
import { viewLogin, viewSignUp, authLogin, authSignUp, authLogOut } from './auth';
import { viewCreateOrders, viewOrders, viewOrder } from './order';
import { viewCupon } from './cupon';
import * as passport from 'passport';
import { genOrder } from './../../test/faker'
import * as keystone from 'keystone';
import * as session from 'express-session';
import * as store from 'connect-mongo';
import * as moment from 'moment';
// import * as mongoStore from 'MongoStore';
const mongostore = store(session)

module.exports = function routes(app: Application) {

    app.engine('html', render)
    app.set('views', 'views')
    app.set('view engine', 'html')
    // renders the default homepage

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
    app.get('/orders/:id', viewOrder)


    // app
    //     .route('/token')
    //     // renders a page to view token
    //     .get()
    //     // renders a page to create token
    //     .post()

    app.get('/cupon', viewCupon)

    app.get('/logout', authLogOut);

    app.get('/pp', (req, res) => {
        const Order = keystone.list('Order').model
        const order = new Order(genOrder());
        order.save((err) => {
            if (err) return res.json(err);
            res.json(Order);
        })
    })

}