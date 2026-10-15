import dotenv from 'dotenv';

dotenv.config();

type UserServiceConfig = {
  port: number;
  serviceName: string;
  mongoUri: string;
  nodeEnv: string;
};

export const config: UserServiceConfig = {
  port: Number(process.env.PORT ?? 3001),
  serviceName: process.env.SERVICE_NAME ?? 'user-service',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/app',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
