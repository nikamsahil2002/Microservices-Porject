import {NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../config';
import {AuthRequest, AuthUser} from './auth';

export function checkAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({success: false, message: 'Unauthorized'});
    return;
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const decodedUser = jwt.verify(token, config.jwtSecret) as AuthUser & {tokenType?: string};

    if (!decodedUser || !decodedUser.id) {
      res.status(401).json({success: false, message: 'Unauthorized'});
      return;
    }

    req.user = decodedUser;
    next();
  } catch {
    res.status(401).json({success: false, message: 'Invalid or expired token'});
  }
}
