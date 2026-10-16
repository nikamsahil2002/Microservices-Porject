import {config} from './config';
import {createApp} from './app';
import {connectDatabase} from './config/database';
import {initializeOrderModel} from './models/orderModel';

async function startServer(): Promise<void> {
  await connectDatabase();
  await initializeOrderModel();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`${config.serviceName} listening on port ${config.port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error(`${config.serviceName} failed to start`, error);
  process.exit(1);
});
