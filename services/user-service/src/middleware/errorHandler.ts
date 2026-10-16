import {NextFunction, Request, Response} from 'express';
import {CustomError} from '../utils/customError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new CustomError(`${req.method} ${req.originalUrl} not found`, 404));
}

export function errorHandler(
  err: Error & {statusCode?: number; status?: number},
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(
      `[${req.method}] ${req.originalUrl}`,
      err instanceof Error ? (err.stack ?? err) : err,
    );
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
}
