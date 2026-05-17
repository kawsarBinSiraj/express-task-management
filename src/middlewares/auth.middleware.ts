/**
 * File: src/middlewares/auth.middleware.ts
 * Purpose: Authenticate JWTs and provide optional role-based authorization.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { IJwtPayload } from '../interfaces/auth.interface';
import { sendError } from '../utils/response';
import { Role } from '../generated/prisma/client.js';

/* Augment Express.Request with optional req.user for authenticated routes. */
declare global {
   namespace Express {
      interface Request {
         /* req.user is set after successful JWT verification. */
         user?: IJwtPayload;
      }
   }
}

/* Authenticate the Bearer JWT and attach decoded payload to req.user. */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
   const authHeader = req.headers.authorization;

   /* Reject requests missing a valid Bearer Authorization header. */
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'Authentication required. Please provide a valid Bearer token.');
      return;
   }

   /* Extract the token string from the Bearer header. */
   const token = authHeader.split(' ')[1];

   try {
      /* Verify the token and attach decoded payload to req.user. */
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
   } catch {
      /* Return a generic 401 for invalid or expired tokens. */
      sendError(res, 401, 'Invalid or expired token. Please sign in again.');
   }
};

/* authorize: Role-based middleware factory returning 403 if role is not allowed. */
export const authorize = (...roles: Role[]) => {
   return (req: Request, res: Response, next: NextFunction): void => {
      /* Deny access when the user is missing or role is not allowed. */
      if (!req.user || !roles.includes(req.user.role)) {
         sendError(res, 403, `Access forbidden. Required role(s): ${roles.join(', ')}.`);
         return;
      }

      next();
   };
};
