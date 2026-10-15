import { NextFunction, Request, Response } from 'express';

export interface AuthRequest extends Request {
  user?: {
    token: string;
    authenticated: boolean;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = {
    token: authHeader.replace('Bearer ', ''),
    authenticated: true,
  };

  return next();
}
