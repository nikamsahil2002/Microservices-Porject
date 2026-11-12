import {Request} from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export {checkAuth, checkAuth as requireAuth} from './checkAuth';
