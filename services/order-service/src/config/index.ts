import dotenv from 'dotenv';

dotenv.config();

type OrderServiceConfig = {
  port: number;
  serviceName: string;
  dbUsername: string;
  dbPassword: string;
  dbDatabase: string;
  dbHost: string;
  dbPort: number;
  postgresUrl: string;
  rabbitMqUrl: string;
  nodeEnv: string;
};

const dbUsername = process.env.DB_USERNAME ?? 'postgres';
const dbPassword = process.env.DB_PASSWORD ?? '1234';
const dbDatabase = process.env.DB_DATABASE ?? 'green-dose-local';
const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = Number(process.env.DB_PORT ?? 5432);

export const config: OrderServiceConfig = {
  port: Number(process.env.PORT ?? 3003),
  serviceName: process.env.SERVICE_NAME ?? 'order-service',
  dbUsername,
  dbPassword,
  dbDatabase,
  dbHost,
  dbPort,
  postgresUrl:
    process.env.POSTGRES_URL ??
    `postgresql://${encodeURIComponent(dbUsername)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${encodeURIComponent(dbDatabase)}`,
  rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
