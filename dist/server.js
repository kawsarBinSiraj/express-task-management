"use strict";
/**
 * File: src/server.ts
 * Purpose: Application entry point that starts the server and handles shutdown.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const prisma_1 = require("./config/prisma");
/* Async bootstrap function for starting the server. */
const bootstrap = async () => {
    /* Build the configured Express app. */
    const app = (0, app_1.default)();
    /* Start the server on the configured port. */
    const server = app.listen(config_1.default.port, () => {
        logger_1.default.info(`Server running in [${config_1.default.env}] mode on port ${config_1.default.port}`);
        logger_1.default.info(`Client panel URL -> http://localhost:${config_1.default.port}/`);
        logger_1.default.info(`API base URL -> http://localhost:${config_1.default.port}/api`);
    });
    /* Graceful shutdown handler for termination signals. */
    const shutdown = async (signal) => {
        logger_1.default.warn(`${signal} received - initiating graceful shutdown...`);
        /* Stop accepting new connections and wait for current ones to finish. */
        server.close(async () => {
            logger_1.default.info('HTTP server closed - no longer accepting new connections.');
            /* Disconnect Prisma after the server closes. */
            await (0, prisma_1.disconnectPrisma)();
            logger_1.default.info('Shutdown complete. Exiting process with code 0.');
            process.exit(0);
        });
        /* Force exit after 10 seconds if shutdown stalls. */
        setTimeout(() => {
            logger_1.default.error('Shutdown timed out after 10s - forcing exit with code 1.');
            process.exit(1);
        }, 10000);
    };
    /* Listen for SIGTERM and SIGINT to trigger graceful shutdown. */
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    /* Handle unhandled Promise rejections by logging and exiting. */
    process.on('unhandledRejection', (reason) => {
        logger_1.default.error('Unhandled Promise Rejection detected:', reason);
        process.exit(1);
    });
    /* Handle uncaught exceptions by logging and exiting immediately. */
    process.on('uncaughtException', (error) => {
        logger_1.default.error('Uncaught Exception detected:', error);
        process.exit(1);
    });
};
/* Invoke bootstrap and let unhandled rejections be handled by the process guard. */
bootstrap();
//# sourceMappingURL=server.js.map