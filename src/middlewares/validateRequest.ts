/**
 * File: src/middlewares/validateRequest.ts
 * Purpose: Create a Zod-based middleware to validate and sanitize req.body.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

/* Create a middleware from a Zod schema that validates req.body. */
export const validateRequest = (schema: ZodSchema<any>) => {
   return (req: Request, res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
         /* Convert Zod issues into a simple array of field/message objects. */
         const errors = result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
         }));

         sendError(res, 422, 'Validation failed', errors);
         return;
      }

      /* Replace req.body with the validated, normalized value from Zod. */
      req.body = result.data;
      next();
   };
};
