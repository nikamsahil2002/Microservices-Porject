import {DataTypes, Model, Optional} from 'sequelize';
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

export interface UpdateOrderInput extends CreateOrderInput {
  status?: OrderStatus;
}

type OrderCreationAttributes = Optional<Order, 'id' | 'status' | 'createdAt'>;

class OrderRecord extends Model<Order, OrderCreationAttributes> implements Order {
  declare id: string;
  declare userId: string;
  declare productId: string;
  declare quantity: number;
  declare totalAmount: string;
  declare status: OrderStatus;
  declare createdAt: Date;
}

OrderRecord.init(
  {
    id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4},
    userId: {type: DataTypes.STRING(100), allowNull: false, field: 'user_id'},
    productId: {type: DataTypes.STRING(100), allowNull: false, field: 'product_id'},
    quantity: {type: DataTypes.INTEGER, allowNull: false, validate: {min: 1}},
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'total_amount',
      validate: {min: 0},
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {isIn: [['pending', 'paid', 'cancelled', 'fulfilled']]},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize: database,
    tableName: 'orders',
    timestamps: false,
  },
);

function toOrder(record: OrderRecord): Order {
  return {
    id: record.id,
    userId: record.userId,
    productId: record.productId,
    quantity: record.quantity,
    totalAmount: record.totalAmount,
    status: record.status,
    createdAt: record.createdAt,
  };
}

export async function initializeOrderModel(): Promise<void> {
  await OrderRecord.sync();
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return toOrder(await OrderRecord.create({...input, totalAmount: String(input.totalAmount)}));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const record = await OrderRecord.findByPk(id);
  return record ? toOrder(record) : undefined;
}

export async function getOrders(
  page: number,
  limit: number,
): Promise<{orders: Order[]; total: number}> {
  const result = await OrderRecord.findAndCountAll({
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
  });

  return {
    orders: result.rows.map(toOrder),
    total: result.count,
  };
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput,
): Promise<Order | undefined> {
  const record = await OrderRecord.findByPk(id);
  if (!record) {
    return undefined;
  }

  await record.update({...input, totalAmount: String(input.totalAmount)});
  return toOrder(record);
}

export async function deleteOrder(id: string): Promise<Order | undefined> {
  const record = await OrderRecord.findByPk(id);
  if (!record) {
    return undefined;
  }

  const order = toOrder(record);
  await record.destroy();
  return order;
}
