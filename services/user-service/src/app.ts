import express, {Express} from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import userRoutes from './routes/users';
import {AuthRequest, requireAuth} from './middleware/auth';
import {notFoundHandler, errorHandler} from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({origin: true, credentials: true}));
  app.use(express.json({limit: '1mb'}));
  app.use(express.urlencoded({extended: true}));

  app.use('/health', healthRouter);
  app.use('/api/users', userRoutes);

  app.get('/demo-protected', requireAuth, (req: AuthRequest, res) => {
    res.json({
      service: process.env.SERVICE_NAME || 'user-service',
      status: 'ok',
      user: req.user,
    });
  });

  app.get('/', (_req, res) => {
    res.json({service: process.env.SERVICE_NAME || 'user-service', status: 'ok'});
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
