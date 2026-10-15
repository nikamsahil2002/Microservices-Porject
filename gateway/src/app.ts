import express, { Express, Request, Response } from 'express';
import cors from 'cors';

type GatewayDependencyMap = {
  userService: string;
  productService: string;
  orderService: string;
  notificationService: string;
};

type GatewayHealthResponse = {
  status: 'ok';
  service: string;
  uptime: number;
  dependencies: GatewayDependencyMap;
};

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response<GatewayHealthResponse>) => {
    res.json({
      status: 'ok',
      service: process.env.SERVICE_NAME ?? 'gateway',
      uptime: process.uptime(),
      dependencies: {
        userService: 'http://user-service:3001',
        productService: 'http://product-service:3002',
        orderService: 'http://order-service:3003',
        notificationService: 'http://notification-service:3004',
      },
    });
  });

  return app;
}
