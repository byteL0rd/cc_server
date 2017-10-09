// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();
// import * as keystone from 'keystone'
const keystone = require('keystone');
import { Routes } from './routes';
var handlebars: any = require('express-handlebars');
// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'cupon',
	'brand': 'cupon',

	'sass': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': '.hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		helpers: require('./templates/views/helpers')(),
		extname: '.hbs',
	}).engine,

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
});

// Load your project's Models
// keystone.import('models');
((k: {import: Function}) => { k.import('models') })(keystone as any);

// console.log(keystone)

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', Routes);
keystone.set('session store', 'mongo');

// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	// enquiries: 'enquiries',
	users: 'users',
	accounts: 'accounts',
	orders: 'orders',
	instutions: 'instuts',
	categories: 'categories',
	cupons: 'cupons',
	forums: 'forums'
});

// if (process.env.ssl) {
// 	keystone.set('ssl key', process.env.SSL_KEY);
// 	keystone.set('ssl cert', process.env.CERT);
// 	keystone.set('ssl ca', process.env.SSL_CA);
// 	keystone.set('ssl', process.env.SSL);	
// }

// Start Keystone to connect to your database and initialise the web server
keystone.start();
