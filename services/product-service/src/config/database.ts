import mongoose from 'mongoose';
import {config} from './index';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(
      `Error While Connecting Database\n${error}\nRetry Database Connection after 5000ms\n`,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
    return connectDatabase();
  }
}
