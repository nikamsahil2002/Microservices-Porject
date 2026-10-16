export interface HealthDependencyStatus {
  postgres: 'configured' | 'missing';
  rabbitmq: 'configured' | 'missing';
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  uptime: number;
  dependencies: HealthDependencyStatus;
}

export function getHealthData(serviceName: string): HealthResponse {
  return {
    status: 'ok',
    service: serviceName,
    uptime: process.uptime(),
    dependencies: {
      postgres: process.env.DB_DATABASE || process.env.POSTGRES_URL ? 'configured' : 'missing',
      rabbitmq: process.env.RABBITMQ_URL ? 'configured' : 'missing',
    },
  };
}
