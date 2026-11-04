import {
  CreateOrderInput,
  createOrder,
  Order,
} from '../models/orderModel';
import {checkStockByGrpc, getProductByGrpcId, getUserByGrpcId} from '../grpc/orderGrpcClient';
import {CustomError} from '../utils/customError';

function getGrpcFailure(error: unknown): CustomError {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const grpcError = error as {code: number; details?: string; message?: string};

    if (grpcError.code === 5) {
      return new CustomError(grpcError.details ?? 'Referenced resource not found', 404);
    }

    if (grpcError.code === 14 || grpcError.code === 4) {
      return new CustomError('A dependent service is unavailable', 503);
    }
  }

  return new CustomError(
    error instanceof Error ? error.message : 'A dependent service request failed',
    502,
  );
}

export async function createOrderWithValidation(input: CreateOrderInput): Promise<Order> {
  let user: Awaited<ReturnType<typeof getUserByGrpcId>>;
  let product: Awaited<ReturnType<typeof getProductByGrpcId>>;

  try {
    [user, product] = await Promise.all([
      getUserByGrpcId(input.userId),
      getProductByGrpcId(input.productId),
    ]);
  } catch (error) {
    throw getGrpcFailure(error);
  }

  if (!user.exists) {
    throw new CustomError('User not found', 404);
  }

  if (!product.exists) {
    throw new CustomError('Product not found', 404);
  }

  let stockCheck: Awaited<ReturnType<typeof checkStockByGrpc>>;
  try {
    stockCheck = await checkStockByGrpc(input.productId, input.quantity);
  } catch (error) {
    throw getGrpcFailure(error);
  }

  if (!stockCheck.available) {
    throw new CustomError(
      `Insufficient stock. Available quantity: ${stockCheck.availableStock}`,
      400,
    );
  }

  return createOrder(input);
}
