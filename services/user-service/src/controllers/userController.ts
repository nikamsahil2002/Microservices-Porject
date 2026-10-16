import {Request, Response} from 'express';
import {AuthRequest} from '../middleware/auth';
import {
  getCurrentUser,
  loginUser,
  refreshAuthTokens,
  registerUser,
  revokeRefreshToken,
  PublicUser,
} from '../services/userService';

export async function registerUserController(req: Request, res: Response): Promise<void> {
  const result = await registerUser(req.body);
  res.status(201).json({success: true, data: result});
}

export async function loginUserController(req: Request, res: Response): Promise<void> {
  const result = await loginUser(req.body);
  res.status(201).json({success: true, data: result});
}

export async function refreshTokenController(req: Request, res: Response): Promise<void> {
  const tokens = await refreshAuthTokens(req.body?.refreshToken);
  res.status(201).json({success: true, data: tokens});
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  await revokeRefreshToken(req.body?.refreshToken);
  res.status(200).json({success: true, message: 'Logged out'});
}

export async function getCurrentUserController(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({success: false, message: 'Unauthorized'});
    return;
  }

  const user: PublicUser = await getCurrentUser(req.user);

  res.status(200).json({success: true, data: user});
}
