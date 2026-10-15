export interface HealthDependencyStatus {
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
      rabbitmq: process.env.RABBITMQ_URL ? 'configured' : 'missing',
    },
  };
}
