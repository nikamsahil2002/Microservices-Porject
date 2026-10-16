import dotenv from 'dotenv';

dotenv.config();

type ProductServiceConfig = {
  port: number;
  serviceName: string;
  mongoUri: string;
  redisUrl: string;
  nodeEnv: string;
};

export const config: ProductServiceConfig = {
  port: Number(process.env.PORT ?? 3002),
  serviceName: process.env.SERVICE_NAME ?? 'product-service',
  mongoUri:
    process.env.PRODUCT_MONGO_URI ??
    process.env.MONGO_URI ??
    'mongodb://localhost:27017/microservices-product',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
