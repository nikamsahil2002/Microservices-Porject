import {database} from '../config/database';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function initializeNotificationModel(): Promise<void> {
  await database.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  const result = await database.query<Notification>(
    `INSERT INTO notifications (user_id, type, message, data)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id AS "userId", type, message, data,
       read_at AS "readAt", created_at AS "createdAt"`,
    [input.userId, input.type, input.message, input.data ?? null],
  );

  return result.rows[0];
}
