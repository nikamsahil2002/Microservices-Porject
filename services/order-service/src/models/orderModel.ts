import {database} from '../config/database';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'fulfilled';

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalAmount: string;
  status: OrderStatus;
  createdAt: Date;
}

export interface CreateOrderInput {
  userId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
}

export async function initializeOrderModel(): Promise<void> {
  await database.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(100) NOT NULL,
      product_id VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'cancelled', 'fulfilled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const result = await database.query<Order>(
    `INSERT INTO orders (user_id, product_id, quantity, total_amount)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id AS "userId", product_id AS "productId",
       quantity, total_amount AS "totalAmount", status, created_at AS "createdAt"`,
    [input.userId, input.productId, input.quantity, input.totalAmount],
  );

  return result.rows[0];
}
