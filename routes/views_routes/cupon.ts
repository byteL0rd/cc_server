import { Request, Response } from 'express';
import * as render from 'express-es6-template-engine';

export function viewCupon(req: Request, res: Response) {   
        res.render('view_cupon.html', {
            locals: {},
            partials: {}
        });
}

export async function viewSignUp(req: Request, res: Response) {
        res.render('signup.html', {
            locals: {},
            partials: {}
        });
}