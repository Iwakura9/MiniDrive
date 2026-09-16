import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const minimumSecretLength = 32;

export type AppConfiguration = {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  appUsername: string;
  appPassword: string;
  corsOrigin: string;
  dbPath: string;
  uploadDir: string;
};

export function configuration(): AppConfiguration {
  const jwtSecret = process.env.JWT_SECRET;
  const appUsername = process.env.APP_USERNAME;
  const appPassword = process.env.APP_PASSWORD;

  if (!jwtSecret || jwtSecret.length < minimumSecretLength) {
    throw new Error(`JWT_SECRET deve ter ao menos ${minimumSecretLength} caracteres`);
  }
  if (!appUsername) throw new Error('APP_USERNAME é obrigatório');
  if (!appPassword || appPassword.length < 8) {
    throw new Error('APP_PASSWORD deve ter ao menos 8 caracteres');
  }

  const configuredDbPath = process.env.DB_PATH ?? '../data/minidrive.sqlite';
  const dbPath = configuredDbPath === ':memory:'
    ? configuredDbPath
    : resolve(process.cwd(), configuredDbPath);
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });

  return {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    appUsername,
    appPassword,
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    dbPath,
    uploadDir: resolve(process.cwd(), process.env.UPLOAD_DIR ?? '../arquivos'),
  };
}
