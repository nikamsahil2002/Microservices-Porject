import {Pool} from 'pg';
import {Sequelize} from 'sequelize';
import {config} from './index';

export const database = new Sequelize(config.postgresUrl, {
  dialect: 'postgres',
  logging: false,
});

async function ensureDatabaseExists(): Promise<void> {
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
}

export async function connectDatabase(): Promise<void> {
  try {
    await ensureDatabaseExists();
    await database.authenticate();
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error(
      `Error While Connecting Database\n${error}\nRetry Database Connection after 5000ms\n`,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
    return connectDatabase();
  }
}
