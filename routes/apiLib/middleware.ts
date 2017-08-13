/**
 * this function remaps the default user query to dynamic db query
 */
exports.remapQuery = function remapQuery (req, res, next) {
	next();
};

/**
 * sets the form body field Author to the user Id
 */
exports.setAuthor = function (req, res, next) {
	if (req.method === 'GET') return next();
	if (!req.user) return res.status(401).json({ mgs: 'unathorized request made' });
	req.body.author = req.user._id;
	next();
};

/**
 * this just sends the final response
 */
exports.finalResponse = function finalResponse (req, res) {
	res.status(res.local.status).json(res.local.body);
};
