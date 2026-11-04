import {Request, Response} from 'express';
import {
  deleteOrder,
  getOrderById,
  getOrders,
  UpdateOrderInput,
  updateOrder,
} from '../models/orderModel';
import {createOrderWithValidation} from '../services/orderService';
import {CustomError} from '../utils/customError';

function getOrderId(req: Request): string {
  const {id} = req.params;
  if (typeof id !== 'string') {
    throw new CustomError('Order ID must be a valid UUID', 400);
  }
  return id;
}

export async function createOrderController(req: Request, res: Response): Promise<void> {
  const order = await createOrderWithValidation(req.body);
  res.status(201).json({success: true, data: order});
}

export async function getOrdersController(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const result = await getOrders(page, limit);

  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  });
}

export async function getOrderController(req: Request, res: Response): Promise<void> {
  const order = await getOrderById(getOrderId(req));
  if (!order) {
    throw new CustomError('Order not found', 404);
  }
  res.status(200).json({success: true, data: order});
}

export async function updateOrderController(req: Request, res: Response): Promise<void> {
  const order = await updateOrder(getOrderId(req), req.body as UpdateOrderInput);
  if (!order) {
    throw new CustomError('Order not found', 404);
  }
  res.status(200).json({success: true, data: order});
}

export async function deleteOrderController(req: Request, res: Response): Promise<void> {
  const order = await deleteOrder(getOrderId(req));
  if (!order) {
    throw new CustomError('Order not found', 404);
  }
  res.status(200).json({success: true, data: order});
}
