import * as express from 'express';
import * as _ from 'lodash';
// var exCaResDir = require('express-cache-controller');

var cursorMDW = require('./cursorMiddleware');
var defaultMDW = require('./middleware');

export function apiLib (keystone, app, config) {
	var rootRoute = config.root;
	var models = _.keys(config.models);

	var router = express.Router();

	models.forEach(function (model) {
		// using the configuration file for settings
		// like custom routes and custom middlewares
		// and resource
		var _cursorMDW = cursorMDW(keystone, model, config);
		var _route = config.models[model].alias || model;
		_route = _route + 's';
		var resources = _.keys(config.models[model].resources);
		console.log(_route, resources);

		resources.forEach(function (resource) {
			// instanties models with their defined method and enabled
			// endpoints ['create', 'update', 'list', 'retrieve']
			// taking the specified middleware on the config [var _customMDW]
			// and also the default generic middleware [var _defaultMDW]
			var _customMDW = config.models[model].resources[resource].middleware;
			var _defaultMDW = defaultMDW.remapQuery;

			if (!_customMDW) _customMDW = {};
			// instanicate default middleware for write operations
			if (resource === 'create' || resource === 'update') _defaultMDW = defaultMDW.setAuthor;
			// sets middlewares before and afer various endpoints and validates them
			_customMDW.before = checkMDW(_customMDW.before);
			_customMDW.after = checkMDW(_customMDW.after);
			// formulates the sequence of occurrence of the middlewares
			var _middleware = _.concat(_customMDW.before, _defaultMDW,
				config.models[model].resources[resource].customCursor || _cursorMDW[resource],
				_customMDW.after, defaultMDW.finalResponse);

			// define route structure based on the router object
			switch (resource) {
				case 'create':
					router.post(`/${_route}`, _middleware);
					break;
				case 'update':
					router.patch(`/${_route}/:id`, _middleware);
					break;
				case 'list':
					router.get(`/${_route}`, _middleware);
					break;
				case 'retrieve':
					router.get(`/${_route}/:id`, _middleware);
					break;
				default:

			}
		});
	});

	// router.use(exCaResDir({ noCache: true }));
	app.use(rootRoute, router);
}

function checkMDW (middleware) {
	if (_.isArray(middleware) || _.isFunction(middleware)) return middleware;
	return [];
}
