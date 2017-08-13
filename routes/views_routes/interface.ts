import { Request } from 'express';

export interface ARequest extends Request{
    session: {
        cookie: {
            path: string,
            _expires: number | Date,
            originalMaxAge: number,
            httpOnly: boolean
        }
    }
} 