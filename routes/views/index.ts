import * as keystone from 'keystone'
import { Request, Response, RequestHandler } from 'express'


exports = module.exports = <RequestHandler>function (req: Request, res: Response) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	// Render the view
	view.render('index');
};