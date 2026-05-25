/**
 * File: src/app.ts
 * Purpose: Configure the Express app with middleware, routes, and error handling.
 */

import express, { Application } from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import router from './routes';
import swaggerSpec from './docs/swagger';
import { getClientStaticDir, renderClient } from './render/renderClient';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import logger from './utils/logger';
import config from './config';

/* createApp: Build and return the configured Express application. */
const createApp = (): Application => {
    const app = express();
    const viewsDir = path.resolve(__dirname, 'views');
    const clientStaticDir = getClientStaticDir();

    app.set('view engine', 'ejs');
    app.set('views', viewsDir);

    /* Security middleware: helmet and CORS for headers and cross-origin access.
     * In development the Vite dev-server runs on a separate origin (localhost:5173),
     * so we relax the CSP to allow its scripts and HMR websocket.
     * In production the built assets are served from the same origin, so the
     * default strict helmet CSP applies unchanged. */
    const viteDevOrigin = config.client.devOrigin;
    app.use(
        helmet({
            contentSecurityPolicy:
                config.env === 'production'
                    ? undefined
                    : {
                          directives: {
                              defaultSrc: ["'self'"],
                              scriptSrc: ["'self'", viteDevOrigin, "'unsafe-inline'"],
                              connectSrc: [
                                  "'self'",
                                  viteDevOrigin,
                                  viteDevOrigin.replace('http', 'ws'),
                              ],
                              styleSrc: ["'self'", "'unsafe-inline'"],
                              imgSrc: ["'self'", 'data:', 'blob:'],
                              fontSrc: ["'self'", 'data:'],
                          },
                      },
        }),
    );
    app.use(
        cors({
            /* Parse ALLOWED_ORIGINS or allow all origins by default. */
            origin: config.client.allowedOrigins ?? '*',
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }),
    );

    /* Body parsing middleware for JSON and URL-encoded payloads with 10MB limit. */
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    /* Response compression middleware to reduce response payload size. */
    app.use(compression());

    /* Request logging via Morgan, disabled in test mode. */
    if (config.env !== 'test') {
        app.use(
            morgan('combined', {
                stream: {
                    /* Pipe Morgan logs into Winston after trimming the newline. */
                    write: (message) => logger.http(message.trim()),
                },
            }),
        );
    }

    /* General API rate limiter: 100 requests per 1 minutes per IP.
     * Keeps a standard Retry-After header so clients can back off gracefully. */
    const apiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, message: 'Too many requests, please try again later.' },
    });

    /* Strict limiter for auth endpoints: 10 attempts per 1 minutes per IP.
     * Mitigates brute-force attacks against login and signup. */
    const authLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, message: 'Too many authentication attempts, please try again later.' },
    });

    app.use('/api/v1', apiLimiter);
    app.use('/api/v1/auth', authLimiter);

    /* Mount the API router at /api. */
    app.use('/api/v1', router);

    /* ── Swagger UI — served at /api/docs ──────────────────────────────────
     * Swagger UI bundles its own scripts and styles which require unsafe-inline.
     * We apply a loose CSP only for this path via a scoped middleware. */
    app.use(
        '/api/docs',
        ((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
            _res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
            );
            next();
        }) as express.RequestHandler,
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            customSiteTitle: 'Task Management API Docs',
            swaggerOptions: { persistAuthorization: true },
        }),
    );

    /* Raw spec at /api/docs.json */
    app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

    /* Serve the built client assets in production. */
    if (config.env === 'production') {
        app.use(
            express.static(clientStaticDir, {
                index: false,
            }),
        );
    }

    /* Let React Router own all non-API browser routes. */
    app.get(/^(?!\/api(?:\/|$)).*/, renderClient);

    /* 404 handler registered after all routes to catch unmatched paths. */
    app.use(notFoundHandler);

    /* Global error handler registered last to catch all forwarded errors. */
    app.use(errorHandler);

    return app;
};

export default createApp;
