export interface HealthDependencyStatus {
  mongo: 'configured' | 'missing';
  redis: 'configured' | 'missing';
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
      mongo: process.env.PRODUCT_MONGO_URI || process.env.MONGO_URI ? 'configured' : 'missing',
      redis: process.env.REDIS_URL ? 'configured' : 'missing',
    },
  };
}
