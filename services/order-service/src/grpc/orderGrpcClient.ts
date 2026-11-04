import * as grpc from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';
import path from 'path';

const protoBasePath = path.resolve(__dirname, '../../proto');

function createUserClient() {
  const packageDefinition = loadSync(path.join(protoBasePath, 'user.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const userProto = grpc.loadPackageDefinition(packageDefinition) as any;
  return new userProto.user.UserService(
    process.env.USER_GRPC_HOST ?? 'localhost:50051',
    grpc.credentials.createInsecure(),
  );
}

function createProductClient() {
  const packageDefinition = loadSync(path.join(protoBasePath, 'product.proto'), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const productProto = grpc.loadPackageDefinition(packageDefinition) as any;
  return new productProto.product.ProductService(
    process.env.PRODUCT_GRPC_HOST ?? 'localhost:50052',
    grpc.credentials.createInsecure(),
  );
}

export async function getUserByGrpcId(userId: string) {
  const client = createUserClient();

  return new Promise<{id: string; name: string; email: string; exists: boolean}>((resolve, reject) => {
    client.GetUserById({id: userId}, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: response?.id ?? '',
        name: response?.name ?? '',
        email: response?.email ?? '',
        exists: Boolean(response?.exists),
      });
    });
  });
}

export async function getProductByGrpcId(productId: string) {
  const client = createProductClient();

  return new Promise<{id: string; name: string; sku: string; price: number; stock: number; exists: boolean}>((resolve, reject) => {
    client.GetProductById({id: productId}, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: response?.id ?? '',
        name: response?.name ?? '',
        sku: response?.sku ?? '',
        price: Number(response?.price ?? 0),
        stock: Number(response?.stock ?? 0),
        exists: Boolean(response?.exists),
      });
    });
  });
}

export async function checkStockByGrpc(productId: string, quantity: number) {
  const client = createProductClient();

  return new Promise<{available: boolean; availableStock: number; productId: string}>((resolve, reject) => {
    client.CheckStock({productId, quantity}, (error: grpc.ServiceError | null, response: any) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        available: Boolean(response?.available),
        availableStock: Number(response?.availableStock ?? 0),
        productId: response?.productId ?? productId,
      });
    });
  });
}
