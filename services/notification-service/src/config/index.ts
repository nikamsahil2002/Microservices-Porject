import dotenv from 'dotenv';

dotenv.config();

type NotificationServiceConfig = {
  port: number;
  serviceName: string;
  rabbitMqUrl: string;
  nodeEnv: string;
};

export const config: NotificationServiceConfig = {
  port: Number(process.env.PORT ?? 3004),
  serviceName: process.env.SERVICE_NAME ?? 'notification-service',
  rabbitMqUrl: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
