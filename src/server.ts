/**
 * File: src/server.ts
 * Purpose: Application entry point — exports app for Vercel, starts server locally.
 */

import 'dotenv/config';
import createApp from './app';
import config from './config';
import logger from './utils/logger';
import { disconnectPrisma } from './config/prisma';

const app = createApp();

/* Export for Vercel serverless */
export default app;

/* Only call listen() when running locally (not on Vercel) */
if (!process.env.VERCEL) {
    const server = app.listen(config.port, () => {
        logger.info(`Server running in [${config.env}] mode on port ${config.port}`);
        logger.info(`Client panel URL -> http://localhost:${config.port}/`);
        logger.info(`API base URL -> http://localhost:${config.port}/api`);
    });

    const shutdown = async (signal: string): Promise<void> => {
        logger.warn(`${signal} received - initiating graceful shutdown...`);
        server.close(async () => {
            logger.info('HTTP server closed - no longer accepting new connections.');
            await disconnectPrisma();
            logger.info('Shutdown complete. Exiting process with code 0.');
            process.exit(0);
        });
        setTimeout(() => {
            logger.error('Shutdown timed out after 10s - forcing exit with code 1.');
            process.exit(1);
        }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason: unknown) => {
        logger.error('Unhandled Promise Rejection detected:', reason);
        process.exit(1);
    });
    process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception detected:', error);
        process.exit(1);
    });
}
