"use strict";
/**
 * File: src/utils/logger.ts
 * Purpose: Winston logger configured per environment with console transport.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
/* Extract needed Winston format helpers for logger configuration. */
const { combine, timestamp, colorize, printf, errors } = winston_1.default.format;
/* Format log lines with timestamp, level, and stack trace when present. */
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack ?? message}`;
});
/* Logger singleton with environment-aware formatting and console transport. */
const logger = winston_1.default.createLogger({
    /*
     * Minimum log level to emit.
     *  • 'debug'  in non-production — show all logs including debug + http.
     *  • 'warn'   in production    — suppress debug/info, keep warn and error.
     */
    level: config_1.default.env === 'production' ? 'warn' : 'debug',
    /*
     * Compose the format pipeline. When NODE_ENV is 'development',
     * colorize() wraps level strings with ANSI codes so the console is easier
     * to read. In other environments, uncolorize() strips them for clean output.
     */
    format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), config_1.default.env === 'development' ? colorize() : winston_1.default.format.uncolorize(), logFormat),
    transports: [
        /* Console transport for stdout/stderr, suitable for container deployments. */
        new winston_1.default.transports.Console(),
        /*
         * File transports — uncomment to persist logs to disk.
         * Recommended for bare-metal / VM deployments.
         * Ensure the `logs/` directory exists or create it on startup.
         *
         * new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
         * new winston.transports.File({ filename: 'logs/combined.log' }),
         */
    ],
    /*
     * Do not exit the process on a handled exception inside winston itself.
     * Unhandled exceptions are caught separately in server.ts.
     */
    exitOnError: false,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map