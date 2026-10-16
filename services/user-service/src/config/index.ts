import dotenv from 'dotenv';

dotenv.config();

type UserServiceConfig = {
  port: number;
  serviceName: string;
  mongoUri: string;
  jwtSecret: string;
  refreshTokenSecret: string;
  nodeEnv: string;
};

export const config: UserServiceConfig = {
  port: Number(process.env.PORT ?? 3001),
  serviceName: process.env.SERVICE_NAME ?? 'user-service',
  mongoUri:
    process.env.USER_MONGO_URI ??
    process.env.MONGO_URI ??
    'mongodb://localhost:27017/microservices-users',
  jwtSecret: process.env.JWT_SECRET ?? 'microservice-dev-secret',
  refreshTokenSecret:
    process.env.JWT_REFRESH_SECRET ??
    `${process.env.JWT_SECRET ?? 'microservice-dev-secret'}-refresh`,
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
