export interface HealthDependencyStatus {
  mongo: 'configured' | 'missing';
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
      mongo: process.env.USER_MONGO_URI || process.env.MONGO_URI ? 'configured' : 'missing',
    },
  };
}
