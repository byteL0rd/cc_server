var keystone = require('keystone');
var inbox = keystone.list('Inbox');
var user = keystone.list('User').model;

exports.offerReq = function (req, res, next) {
	// 'acceptedBy'
	// let acp = req.body.acceptedBy;
	// console.log(acp);
	// acp = mongoose.Types.ObjectId(acp);
	// console.log(acp)
	// req.body.acceptedBy = acp;
	next();
};

exports.updateUser = function (req, res, next) {
	user.findOneAndUpdate({ _id: req.user._id }, req.body,
		{ upsert: true, new: true })
		.then(d => res.status(200).json(d))
		.catch(d => res.status(406).json(d));
};

exports.inboxList = function (req, res, next) {
	var searchQuery = req.query.dbQuery;

	var query1 = searchQuery;
	var query2 = searchQuery;

	query1.from = req.user._id;
	query2.to = req.user._id;

	var query = inbox.paginate({
		page: req.query.page || 1,
		perPage: 10,
		maxPages: 10,
	}).find({
		$or: [query1, query2],
	});

	query = remapCusorQuery(req, 'Inbox', 'list', query);
	query.sort(req.query.sortBy);
	query = new Promise(function (resolve, reject) {
		query.exec((err, data) => {
			console.log(err, data);
			resolve(data);
			reject(err);
		});
	});
	formatGetResponse(req, res, next, query, 200, 406);
};


// executes the query for both list and retrieves and send it to the next middleware
function formatGetResponse (req, res, next, query, successCode, failCode = 406) {
	query
		.then((data) => {
			res.local = {};
			res.local.status = successCode || 200;
			res.local.body = data;
			return next();
		})
		.catch((err) => {
			console.log(err);
			res.status(failCode).json(err);
		});
}

// add population to the query defined in the resource config
function remapCusorQuery (req, listName, action, query) {
	if (req.query.field) query = query.select(req.query.field);
	var config = require('./restApi');
	console.log(config.models);
	var resource = config.models[listName].resources;
	var populate = resource[action].populate;
	if (populate) {
		populate.forEach(function (elem) {
			query = query.populate(elem.path);
			if (elem.selectField) query = query.populate(elem.path, elem.selectField);
		});
	};
	return query;
}
