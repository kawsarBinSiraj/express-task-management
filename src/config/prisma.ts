/**
 * File: src/config/prisma.ts
 * Purpose: Create and expose a shared PrismaClient instance with the Prisma 7 PostgreSQL adapter.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import config from './index';
import logger from '../utils/logger';

/* Typed global cache for the PrismaClient instance. */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!config.database.url) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

/* Create or reuse the singleton PrismaClient with environment-based logging. */
const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: config.database.url }),
    log:
      config.env === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

/* Cache PrismaClient on globalThis only in development to avoid leaks. */
if (config.env !== 'production') {
  globalForPrisma.prisma = prisma;
}

/* Disconnect Prisma gracefully during shutdown. */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected from the database.');
}

export default prisma;
