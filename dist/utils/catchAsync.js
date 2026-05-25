"use strict";
/**
 * File: src/utils/catchAsync.ts
 * Purpose: Wrap async Express handlers so rejected promises forward to next(err).
 */
Object.defineProperty(exports, "__esModule", { value: true });
/* Wraps an async handler and forwards any rejection to Express error handling. */
const catchAsync = (fn) => {
    return (req, res, next) => {
        /*
         * Execute the async handler and catch any rejection.
         * `.catch(next)` is equivalent to `.catch((err) => next(err))`.
         * This passes the error to Express's next() triggering the global
         * error handler defined in middlewares/error.middleware.ts.
         */
        fn(req, res, next).catch(next);
    };
};
exports.default = catchAsync;
//# sourceMappingURL=catchAsync.js.map