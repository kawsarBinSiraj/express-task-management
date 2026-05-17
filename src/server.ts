/**
 * File: src/server.ts
 * Purpose: Application entry point that starts the server and handles shutdown.
 */

import 'dotenv/config';
import createApp from './app';
import config from './config';
import logger from './utils/logger';
import { disconnectPrisma } from './config/prisma';

/* Async bootstrap function for starting the server. */
const bootstrap = async (): Promise<void> => {
    /* Build the configured Express app. */
    const app = createApp();

    /* Start the server on the configured port. */
    const server = app.listen(config.port, () => {
        logger.info(`Server running in [${config.env}] mode on port ${config.port}`);
        logger.info(`Client panel URL -> http://localhost:${config.port}/`);
        logger.info(`API base URL -> http://localhost:${config.port}/api`);
    });

    /* Graceful shutdown handler for termination signals. */
    const shutdown = async (signal: string): Promise<void> => {
        logger.warn(`${signal} received - initiating graceful shutdown...`);

        /* Stop accepting new connections and wait for current ones to finish. */
        server.close(async () => {
            logger.info('HTTP server closed - no longer accepting new connections.');

            /* Disconnect Prisma after the server closes. */
            await disconnectPrisma();

            logger.info('Shutdown complete. Exiting process with code 0.');
            process.exit(0);
        });

        /* Force exit after 10 seconds if shutdown stalls. */
        setTimeout(() => {
            logger.error('Shutdown timed out after 10s - forcing exit with code 1.');
            process.exit(1);
        }, 10_000);
    };

    /* Listen for SIGTERM and SIGINT to trigger graceful shutdown. */
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    /* Handle unhandled Promise rejections by logging and exiting. */
    process.on('unhandledRejection', (reason: unknown) => {
        logger.error('Unhandled Promise Rejection detected:', reason);
        process.exit(1);
    });

    /* Handle uncaught exceptions by logging and exiting immediately. */
    process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception detected:', error);
        process.exit(1);
    });
};

/* Invoke bootstrap and let unhandled rejections be handled by the process guard. */
bootstrap();
