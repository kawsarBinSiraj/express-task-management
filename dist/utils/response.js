"use strict";
/**
 * File: src/utils/response.ts
 * Purpose: Uniform response helpers for success and error JSON envelopes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/* Sends a typed JSON success response with status, message, and data. */
const sendSuccess = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/* Sends a typed JSON error response; includes errors only when provided. */
const sendError = (res, statusCode, message, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        /*
         * Conditionally spread `errors` into the response body.
         * When `errors` is undefined this evaluates to `false` and the spread
         * is a no-op, so the key does not appear in the JSON at all.
         */
        ...(errors !== undefined && { errors }),
    });
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map