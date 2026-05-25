"use strict";
/**
 * File: src/middlewares/error.middleware.ts
 * Purpose: Global error handling and 404 middleware for Express.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const client_js_1 = require("../generated/prisma/client.js");
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
/* AppError: Custom error type carrying status and operational flag. */
class AppError extends Error {
    constructor(message, statusCode) {
        /*
         * Pass message to the parent Error class so that err.message is set
         * correctly and standard error utilities (logger, Sentry) can read it.
         */
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        /*
         * Keeps the stack trace clean by removing the AppError constructor frame.
         * Only available in V8 (Node.js) — no-op on other runtimes.
         */
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/* Global Express error handler mapping known errors to JSON responses. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, _req, res, _next) => {
    /*
     * Always log the full error (including stack trace) server-side so that
     * developers and monitoring tools see the complete picture, even when
     * we return a vague message to the client.
     */
    logger_1.default.error(err);
    /* Handle AppError with its status and message. */
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    /* Handle expired JWTs with 401. */
    if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        res.status(401).json({
            success: false,
            message: 'Your session has expired. Please sign in again.',
        });
        return;
    }
    /* Handle invalid JWTs with generic 401 response. */
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        res.status(401).json({
            success: false,
            message: 'Invalid authentication token. Please sign in again.',
        });
        return;
    }
    /* Handle known Prisma request errors like P2002 and P2025. */
    if (err instanceof client_js_1.Prisma.PrismaClientKnownRequestError) {
        const prismaError = err;
        /* Handle Prisma unique constraint violations (P2002). */
        if (prismaError.code === 'P2002') {
            const fields = prismaError.meta?.target?.join(', ') ?? 'field';
            res.status(409).json({
                success: false,
                message: `A record with this ${fields} already exists.`,
            });
            return;
        }
        /* Handle Prisma record not found errors (P2025). */
        if (prismaError.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'The requested resource could not be found.',
            });
            return;
        }
    }
    /* Handle Prisma validation errors as 400 bad request. */
    if (err instanceof client_js_1.Prisma.PrismaClientValidationError) {
        res.status(400).json({
            success: false,
            message: 'Invalid data provided to the database query.',
        });
        return;
    }
    /* Handle unknown errors and return generic 500 in production. */
    const message = config_1.default.env === 'production' ? 'An unexpected internal error occurred. Please try again later.' : err.message;
    res.status(500).json({ success: false, message });
};
exports.errorHandler = errorHandler;
/* 404 handler for unmatched routes, returning method and path in the message. */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} does not exist.`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map