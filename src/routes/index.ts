/**
 * File: src/routes/index.ts
 * Purpose: Root API router that mounts sub-routers and exposes /health.
 */

import { Router, Request, Response } from 'express';
import authRouter from './auth.route';
import taskRouter from './task.route';
import userRouter from './user.route';
import { sendSuccess } from '../utils/response';

const router = Router();

/* Public health check endpoint for liveness probes and uptime checks. */
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, 200, 'Server is healthy and accepting requests.', {
    /*
     * Simple string indicator — load balancers check the HTTP status code
     * (200 = healthy) but including this makes the response human-readable.
     */
    status: 'OK',

    /*
     * ISO 8601 timestamp of this response — useful for debugging
     * timezone-related issues between client and server.
     */
    timestamp: new Date().toISOString(),

    /*
     * How long the Node.js process has been running, rounded to whole seconds.
     * A short uptime may indicate a recent crash/restart worth investigating.
     */
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

/* Mount feature routers under their API prefixes. */
router.use('/auth', authRouter);
router.use('/tasks', taskRouter);
router.use('/users', userRouter);

export default router;
