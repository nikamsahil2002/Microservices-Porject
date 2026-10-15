import dotenv from 'dotenv';

dotenv.config();

type OrderServiceConfig = {
  port: number;
  serviceName: string;
  postgresUrl: string;
  rabbitMqUrl: string;
  nodeEnv: string;
};

export const config: OrderServiceConfig = {
  port: Number(process.env.PORT ?? 3003),
  serviceName: process.env.SERVICE_NAME ?? 'order-service',
  postgresUrl: process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/app',
  rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
