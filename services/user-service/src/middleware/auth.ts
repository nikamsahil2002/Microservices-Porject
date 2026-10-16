import {Request} from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export {checkAuth, checkAuth as requireAuth} from './checkAuth';
