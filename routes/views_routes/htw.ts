import { Request, Response } from 'express';
import { HTWMerchantPage, HTWStudentPage } from '../views/compiler';

export async function merchantHTWPage(req: Request, res: Response) {
  res.send(await HTWMerchantPage(req.isAuthenticated(), req.user));
}


export async function studentHTWPage(req: Request, res: Response) {
  res.send(await HTWStudentPage(req.isAuthenticated(), req.user));
}