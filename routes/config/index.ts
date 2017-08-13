import * as Account from './account';
import * as Cupon from './cupon';
import * as Forum from './forum';
import * as Merchant from './merchant';
import * as Order from './order';
import * as User from './user';
/**
 * @apiDefine ListQueryScheme
 *
 * @apiParam (query) {string} [sort] field used for sorting
 */

module.exports = {
	root: '/api/v1',
	models: {
		Account,
		Cupon,
		Forum,
		Merchant,
		User,
		Order
	},
};
