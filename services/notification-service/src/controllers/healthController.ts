import {Request, Response} from 'express';
import {getHealthData, HealthResponse} from '../services/healthService';

export function getHealth(_req: Request, res: Response<HealthResponse>) {
  res.json(getHealthData(process.env.SERVICE_NAME ?? 'notification-service'));
}
