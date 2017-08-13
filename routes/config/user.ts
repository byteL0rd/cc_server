import { authorizeRoute } from './../middleware'
/**
 * @apiDefine  UserSuccessRespone
 *
 * @apiSuccess {string} _id unique id generated as idendier
 * @apiSuccess {string} email the user email used Registration
 * @apiSuccess {Object} fullName fullname firstName and Lastname
 * @apiSuccess {string} fullName.first first Name
 * @apiSuccess {string} fullName.last last Name
 * @apiSuccess {string} password hashed password
 * @apiSuccess {string} institution user insitiution
 */

/**
 *  @apiDefine  UserWriteParams
 *
 * @apiParam {string} email the user email used Registration
 * @apiParam {string} fullName fullname firstName and Lastname
 * @apiParam {string} password password used for Registration
 * @apiParam {string} institution user insitiution
 */

/**
 *	 @apiDefine  UserSuccessExample
 *
 * @apiSuccessExample {json} Success-Response:
 * 	HTTP/1.1 201 created
 * 	 	{
 * 	 	 "_id" : "58f3faedd54ab01c60ad5585",
 * 	 	 "email" : "user@keystonejs.com",
 * 	 	 "title" : "instiution",
 * 	 	 "fullName" : {
 * 	 		 	"first" : "keystone",
 * 	 		 	 "last" : "Admin"
 *  	 	}
 *  	}
 */

 /**
  * @apiDefine  UserSuccessListRespone
  *
  * @apiSuccess {Object[]} Users List that match the query
	* @apiSuccess {string} _id unique id generated as idendier
  * @apiSuccess {string} email the user email used Registration
  * @apiSuccess {Object} fullName fullname firstName and Lastname
  * @apiSuccess {string} fullName.first first Name
  * @apiSuccess {string} fullName.last last Name
  * @apiSuccess {string} password hashed password
  * @apiSuccess {string} gender user gender
  * @apiSuccess {string} dob date of birth of the user
  * @apiSuccess {string} aboutMe briefs user info for profile
  * @apiSuccess {string[]} skills arrays of string of skills
  * @apiSuccess {string} title describing user briefly
  * @apiSuccess {string} phoneNo contact phoneNo for the user
  */

/**
  *	 @apiDefine  UserSuccessListExample
  *
  * @apiSuccessExample {json} Success-Response:
  * 	HTTP/1.1 200 created
  * 	[
	* 	 	{
  * 	 	 "_id" : ObjectId("58f3faedd54ab01c60ad5585"),
  * 	 	 "email" : "user@keystonejs.com",
  * 	 	 title" : "the only paris kportk in town",
  * 	 	 "skills" : [ ],
  * 	 	 "aboutMe" : "a new awesome wokkaholic who enjoys good and creative work that blows mind miles away",
  * 	 	 "dob" : "3-12-80",
	* 	 	 "gender" : "male",
	* 	 	 "phoneNo" : 81333984314
  * 	 	 "fullName" : {
  * 	 		 	"first" : "keystone",
  * 	 		 	 "last" : "Admin"
  *  	 	},
  * 	 },
  * 	 {
  * 	 	 "_id" : ObjectId("58f3fcc02d435c23047069b2"),
  * 	 	 "email" : "abey@mail.com",
  * 	 	 "dob" : ISODate("1994-01-01T00:00:00Z"),
  * 	 	 "phoneNo" : 8133398431,
  * 	 	 "gender" : "male",
  * 	 	 "title" : "a great wokkaholic",
  * 	 	 "skills" : [ ],
  * 	 	 "aboutMe" : "a new awesome wokkaholic who enjoys good and creative work"
  *  }
  * 	]
  */

/**
 *  @apiDefine  UserFailureWriteRespone
 *
 * @apiError UseFail  failure during validation
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 406 unacceptable
 * 	{
 * 	mgs: "validation error message object"
 * 	}
 *
 */

/**
 * @apiDefine  UserWriteParamExample
 *
 * @apiParamExample {json}  User-Write-Json-Example:
 * 	{
 * 	 	 "email" : "abey@mail.com",
 * 	 	 "password" : "lobverysgig",
 * 	 	 "dob" : ISODate("1994-01-01T00:00:00Z"),
 * 	 	 "phoneNo" : 78133398431,
 * 	 	 "gender" : "male",
 * 	 	 "title" : "a great wokkaholic gigger",
 * 	 	 "aboutMe" : "a new awesome wokkaholic who enjoys good and creative work"
 */


 /**
  * @api {PATCH} /api/v1/user/:id update user with new details
  * @apiName UpdateUser
  * @apiGroup User
  *
  * @apiUse authorizeRouteHeaders
  * @apiParam {string} unique user identifer
  *
  * @apiDescription this endpoint is responsible
  * for updating an existing user details
  *
  * @apiUse  UserWriteParams
  *
  * @apiUse  UserWriteParamExample
  *
  * @apiUse  UserSuccessRespone
  *
  * @apiuse  UserSuccessExample
  *
  * @apiUse  UserFailureWriteRespone
  */
const update = {
	middleware: {
		before: [authorizeRoute, function (req, res, next) {
			// req.body.isAdmin = false;
			next();
		}],
	},
};


/**
 * @api {GET} /api/v1/user get user lists
 * @apiName ListUser
 * @apiGroup User
 *
 * @apiUse authorizeRouteHeaders
 *
 * @apiDescription this endpoint is responsible
 * for retrieving and searching Users  dyanmically
 * using params and _id  provided as querys
 * returns a list filtered from the query
 *
 * @apiUse  UserWriteParams
 * @apiParam {string} _id unique id for Gig
 * @apiUse ListQueryScheme
 *
 * @apiUse  UserSuccessListRespone
 *
 * @apiuse  UserSuccessListExample
 *
 * @apiError NotFOund  null response from the db
 *
 * @apiErrorExample Empty-Response:
 * HTTP/1.1 200 ok
 * 	[]
 *
 */
const list = {};


/**
 * @api {GET} /api/v1/user/:id retrieve user with that id
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiUse authorizeRouteHeaders
 *
 * @apiParam {string} id unique id to retrieve a User
 *
 * @apiDescription this endpoint is responsible
 * for retrieving an exiting user details.
 *
 * @apiUse  UserSuccessRespone
 *
 * @apiuse  UserSuccessExample
 *
 * @apiError NotFOund  null response from the db
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 200 ok
 * 	null
 *
 */
const retrieve = {};

const user = {
  resources: {
		update,
		retrieve,
	},
};

module.exports = user;
