import {NextFunction, Request, Response} from 'express';
import jwt, {JwtPayload} from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET ?? 'microservice-dev-secret';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;
  const token =
    typeof authorization === 'string' && authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : '';

  if (!token) {
    res.status(401).json({success: false, message: 'Unauthorized'});
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (
      typeof payload === 'string' ||
      typeof payload.id !== 'string' ||
      payload.id.length === 0 ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      (payload as JwtPayload & {tokenType?: string}).tokenType !== 'access'
    ) {
      res.status(401).json({success: false, message: 'Invalid or expired token'});
      return;
    }

    req.authUser = {id: payload.id, email: payload.email, name: payload.name};
    next();
  } catch {
    res.status(401).json({success: false, message: 'Invalid or expired token'});
  }
}
