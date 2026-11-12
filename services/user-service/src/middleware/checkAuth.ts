import {NextFunction, Response} from 'express';
import {AuthRequest} from './auth';

const gatewayAuthUrl =
  process.env.GATEWAY_AUTH_URL ?? 'http://localhost:8080/internal/auth/verify';

function isAuthUser(value: unknown): value is AuthRequest['user'] {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string'
  );
}

export async function checkAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ') || !authorization.slice('Bearer '.length).trim()) {
    res.status(401).json({success: false, message: 'Unauthorized'});
    return;
  }

  try {
    const authResponse = await fetch(gatewayAuthUrl, {
      method: 'POST',
      headers: {authorization},
      signal: AbortSignal.timeout(5000),
    });

    if (authResponse.status === 401) {
      res.status(401).json({success: false, message: 'Invalid or expired token'});
      return;
    }

    if (!authResponse.ok) {
      console.error(`Gateway auth returned HTTP ${authResponse.status}`);
      res.status(503).json({success: false, message: 'Authentication service unavailable'});
      return;
    }

    const result: unknown = await authResponse.json();
    if (
      typeof result !== 'object' ||
      result === null ||
      !('user' in result) ||
      !isAuthUser(result.user)
    ) {
      console.error('Gateway auth returned an invalid user response');
      res.status(502).json({success: false, message: 'Invalid authentication service response'});
      return;
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error('Gateway auth request failed:', error);
    res.status(503).json({success: false, message: 'Authentication service unavailable'});
  }
}
