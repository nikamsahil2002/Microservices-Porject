import * as grpc from '@grpc/grpc-js';
import {HealthImplementation} from 'grpc-health-check';
import {loadSync} from '@grpc/proto-loader';
import path from 'path';
import {getUserById} from '../services/userService';

const protoPath = path.resolve(__dirname, '../../proto/user.proto');
const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition) as any;

export function startUserGrpcServer(): Promise<void> {
  const server = new grpc.Server();
  const health = new HealthImplementation({
    '': 'SERVING',
    'user.UserService': 'SERVING',
  });
  health.addToServer(server);

  server.addService(userProto.user.UserService.service, {
    GetUserById: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      void (async () => {
        const userId = call.request?.id ?? '';
        const user = await getUserById(userId);

        if (!user) {
          callback(null, {
            id: '',
            name: '',
            email: '',
            exists: false,
          });
          return;
        }

        callback(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          exists: true,
        });
      })().catch((error: unknown) => {
        callback({
          code: grpc.status.INTERNAL,
          details: error instanceof Error ? error.message : 'Failed to fetch user',
        } as grpc.ServiceError, null);
      });
    },
  });

  const grpcPort = Number(process.env.USER_GRPC_PORT ?? 50051);

  return new Promise<void>((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${grpcPort}`,
      grpc.ServerCredentials.createInsecure(),
      (error: Error | null, boundPort: number) => {
        if (error) {
          reject(error);
          return;
        }
        
        console.log(`User gRPC server listening on port ${boundPort}`);
        resolve();
      },
    );
  });
}
