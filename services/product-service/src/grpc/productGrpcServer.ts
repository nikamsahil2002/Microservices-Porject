import * as grpc from '@grpc/grpc-js';
import {HealthImplementation} from 'grpc-health-check';
import {loadSync} from '@grpc/proto-loader';
import path from 'path';
import {getProductById} from '../services/productService';
import {CustomError} from '../utils/customError';

const protoPath = path.resolve(__dirname, '../../proto/product.proto');
const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productProto = grpc.loadPackageDefinition(packageDefinition) as any;

export function startProductGrpcServer(): Promise<void> {
  const server = new grpc.Server();
  const health = new HealthImplementation({
    '': 'SERVING',
    'product.ProductService': 'SERVING',
  });
  health.addToServer(server);

  const toGrpcError = (error: unknown): grpc.ServiceError => ({
    code:
      error instanceof CustomError && error.statusCode === 404
        ? grpc.status.NOT_FOUND
        : grpc.status.INTERNAL,
    details: error instanceof Error ? error.message : 'Product request failed',
    name: 'ProductServiceError',
    message: error instanceof Error ? error.message : 'Product request failed',
    metadata: new grpc.Metadata(),
  });

  server.addService(productProto.product.ProductService.service, {
    GetProductById: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      void (async () => {
        const productId = call.request?.id ?? '';
        const product = await getProductById(productId);

        callback(null, {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          stock: product.stock ?? 0,
          exists: true,
        });
      })().catch((error: unknown) => {
        callback(toGrpcError(error), null);
      });
    },
    CheckStock: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      void (async () => {
        const productId = call.request?.productId ?? '';
        const quantity = Number(call.request?.quantity ?? 0);
        const product = await getProductById(productId);

        const available = product.stock !== undefined && product.stock >= quantity;

        callback(null, {
          available,
          availableStock: product.stock ?? 0,
          productId: product.id,
        });
      })().catch((error: unknown) => {
        callback(toGrpcError(error), null);
      });
    },
  });

  const grpcPort = Number(process.env.PRODUCT_GRPC_PORT ?? 50052);

  return new Promise<void>((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${grpcPort}`,
      grpc.ServerCredentials.createInsecure(),
      (error: Error | null, boundPort: number) => {
        if (error) {
          reject(error);
          return;
        }

        server.start();
        console.log(`Product gRPC server listening on port ${boundPort}`);
        resolve();
      },
    );
  });
}
