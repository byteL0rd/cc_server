/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

import * as keystone from 'keystone'
import { Application, RequestHandler } from 'express'
import * as passport from 'passport';

import { flashMessages, initLocals } from './middleware';
import { apiLib } from './apiLib'

var importRoutes = keystone.importer(__dirname);
const config = require('./config');



// Common Middleware
keystone.pre('routes', initLocals);
keystone.pre('render', flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
export function Routes(app: Application) {

	require('./views_routes')(app);

	// Views
	// app.get('/', <RequestHandler>routes.views.index);
	app.all('/contact', <RequestHandler>routes.views.contact);


	app.use(`${config.root}/orders/givemecupon`, (req, res) => {

		res.send({ K: 'king custom' });
	});

	apiLib(keystone, app, config)
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};