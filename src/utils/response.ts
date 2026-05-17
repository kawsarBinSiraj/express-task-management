/**
 * File: src/utils/response.ts
 * Purpose: Uniform response helpers for success and error JSON envelopes.
 */

import { Response } from 'express';

/* Private response shape interfaces for typed JSON payloads. */

/**
 * The JSON body shape for successful responses.
 * Generic over T to capture the exact type of the data payload.
 */
interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
}

/**
 * The JSON body shape for error responses.
 * `errors` is optional — include it for validation failures or detailed
 * sub-error arrays; omit it for simple operational errors.
 */
interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown;
}

/* Sends a typed JSON success response with status, message, and data. */
export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
): Response<SuccessResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/* Sends a typed JSON error response; includes errors only when provided. */
export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    errors?: unknown,
): Response<ErrorResponse> => {
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
