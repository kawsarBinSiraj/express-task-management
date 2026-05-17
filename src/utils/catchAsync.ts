/**
 * File: src/utils/catchAsync.ts
 * Purpose: Wrap async Express handlers so rejected promises forward to next(err).
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';

/* Wraps an async handler and forwards any rejection to Express error handling. */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    /*
     * Execute the async handler and catch any rejection.
     * `.catch(next)` is equivalent to `.catch((err) => next(err))`.
     * This passes the error to Express's next() triggering the global
     * error handler defined in middlewares/error.middleware.ts.
     */
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
