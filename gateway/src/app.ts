import 'dotenv/config';
import express, {Express, Request, Response} from 'express';
import cors from 'cors';
import {createProxyMiddleware} from 'http-proxy-middleware';
import {requireAuth} from './middleware/auth';

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

const dependencies: GatewayDependencyMap = {
  userService: process.env.USER_SERVICE_URL ?? 'http://user-service:3001',
  productService: process.env.PRODUCT_SERVICE_URL ?? 'http://product-service:3002',
  orderService: process.env.ORDER_SERVICE_URL ?? 'http://order-service:3003',
  notificationService: process.env.NOTIFICATION_SERVICE_URL ?? 'http://notification-service:3004',
};

function createServiceProxy(target: string) {
  return createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    pathRewrite: (_path, req) => req.originalUrl,
    on: {
      error: (error, _req, res) => {
        console.error(`Gateway proxy error for ${target}:`, error.message);
        if ('writeHead' in res && !res.headersSent) {
          res.writeHead(502, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, message: 'Upstream service unavailable'}));
        }
      },
    },
  });
}

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({origin: true, credentials: true}));

  app.get('/health', (_req: Request, res: Response<GatewayHealthResponse>) => {
    res.json({
      status: 'ok',
      service: process.env.SERVICE_NAME ?? 'gateway',
      uptime: process.uptime(),
      dependencies,
    });
  });

  app.post('/internal/auth/verify', requireAuth, (req, res) => {
    res.json({user: req.authUser});
  });

  app.use('/api/users', createServiceProxy(dependencies.userService));
  app.use('/api/products', createServiceProxy(dependencies.productService));
  app.use('/api/orders', createServiceProxy(dependencies.orderService));
  app.use('/api/notifications', createServiceProxy(dependencies.notificationService));

  app.use((_req, res) => {
    res.status(404).json({success: false, message: 'Route not found'});
  });

  return app;
}
