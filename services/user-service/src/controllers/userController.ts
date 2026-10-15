import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  PublicUser,
} from '../services/userService';

export function registerUserController(req: Request, res: Response) {
  const result = registerUser(req.body);

  return res.status(201).json({
    success: true,
    data: result,
  });
}

export function loginUserController(req: Request, res: Response) {
  const result = loginUser(req.body);

  return res.status(200).json({
    success: true,
    data: result,
  });
}

export function getCurrentUserController(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user: PublicUser = getCurrentUser(req.user);

  return res.status(200).json({
    success: true,
    data: user,
  });
}
