import {Pool} from 'pg';
import {config} from './index';

export const database = new Pool({connectionString: config.postgresUrl});

export async function connectDatabase(): Promise<void> {
  const adminUrl = new URL(config.postgresUrl);
  adminUrl.pathname = '/postgres';
  const adminDatabase = new Pool({connectionString: adminUrl.toString()});

  try {
    const result = await adminDatabase.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      config.dbDatabase,
    ]);

    if (result.rowCount === 0) {
      const databaseName = config.dbDatabase.replace(/"/g, '""');
      await adminDatabase.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await adminDatabase.end();
  }

  await database.query('SELECT 1');
}
