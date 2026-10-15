import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(
  err: AppError | Error & { statusCode?: number; status?: number },
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode ?? err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[${req.method}] ${req.originalUrl}`, err instanceof Error ? err.stack ?? err : err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
}
