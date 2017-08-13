var localApiKey = require('passport-localapikey');
var BadRequestError = localApiKey.BadRequestError;

localApiKey.Strategy.prototype.authenticate = function (req, options) {
	options = options || {};

	//  just modgying the module to accomodate headers for apikey
	var apikey = req.get('apikey') || lookup(req.body,
		this._apiKeyField) || lookup(req.query, this._apiKeyField);

	if (!apikey) {
		return this.fail(new BadRequestError(options.badRequestMessage || 'Missing API Key'));
	}

	var self = this;

	function verified(err, user, info) {
		if (err) {
			return self.error(err);
		}
		if (!user) {
			return self.fail(info);
		}
		self.success(user, info);
	}

	if (self._passReqToCallback) {
		this._verify(req, apikey, verified);
	} else {
		this._verify(apikey, verified);
	}

	function lookup(obj, field) {
		if (!obj) {
			return null;
		}
		var chain = field.split(']').join('').split('[');
		for (var i = 0, len = chain.length; i < len; i++) {
			var prop = obj[chain[i]];
			if (typeof (prop) === 'undefined') {
				return null;
			}
			if (typeof (prop) !== 'object') {
				return prop;
			}
			obj = prop;
		}
		return null;
	}
};

module.exports = localApiKey;
