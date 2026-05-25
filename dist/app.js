"use strict";
/**
 * File: src/app.ts
 * Purpose: Configure the Express app with middleware, routes, and error handling.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = __importDefault(require("./docs/swagger"));
const renderClient_1 = require("./render/renderClient");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = __importDefault(require("./config"));
/* createApp: Build and return the configured Express application. */
const createApp = () => {
    const app = (0, express_1.default)();
    const viewsDir = node_path_1.default.resolve(process.cwd(), 'src/views');
    const clientStaticDir = (0, renderClient_1.getClientStaticDir)();
    app.set('view engine', 'ejs');
    app.set('views', viewsDir);
    /* Security middleware: helmet and CORS for headers and cross-origin access.
     * In development the Vite dev-server runs on a separate origin (localhost:5173),
     * so we relax the CSP to allow its scripts and HMR websocket.
     * In production the built assets are served from the same origin, so the
     * default strict helmet CSP applies unchanged. */
    const viteDevOrigin = config_1.default.client.devOrigin;
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: config_1.default.env === 'production'
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
    }));
    app.use((0, cors_1.default)({
        /* Parse ALLOWED_ORIGINS or allow all origins by default. */
        origin: config_1.default.client.allowedOrigins ?? '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    /* Body parsing middleware for JSON and URL-encoded payloads with 10MB limit. */
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    /* Response compression middleware to reduce response payload size. */
    app.use((0, compression_1.default)());
    /* Request logging via Morgan, disabled in test mode. */
    if (config_1.default.env !== 'test') {
        app.use((0, morgan_1.default)('combined', {
            stream: {
                /* Pipe Morgan logs into Winston after trimming the newline. */
                write: (message) => logger_1.default.http(message.trim()),
            },
        }));
    }
    /* General API rate limiter: 100 requests per 1 minutes per IP.
     * Keeps a standard Retry-After header so clients can back off gracefully. */
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 1 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, message: 'Too many requests, please try again later.' },
    });
    /* Strict limiter for auth endpoints: 10 attempts per 1 minutes per IP.
     * Mitigates brute-force attacks against login and signup. */
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 1 * 60 * 1000,
        limit: 10,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, message: 'Too many authentication attempts, please try again later.' },
    });
    app.use('/api/v1', apiLimiter);
    app.use('/api/v1/auth', authLimiter);
    /* Mount the API router at /api. */
    app.use('/api/v1', routes_1.default);
    /* ── Swagger UI — served at /api/docs ──────────────────────────────────
     * Swagger UI bundles its own scripts and styles which require unsafe-inline.
     * We apply a loose CSP only for this path via a scoped middleware. */
    app.use('/api/docs', ((_req, _res, next) => {
        _res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
        next();
    }), swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, {
        customSiteTitle: 'Task Management API Docs',
        swaggerOptions: { persistAuthorization: true },
    }));
    /* Raw spec at /api/docs.json */
    app.get('/api/docs.json', (_req, res) => res.json(swagger_1.default));
    /* Serve the built client assets in production. */
    if (config_1.default.env === 'production') {
        app.use(express_1.default.static(clientStaticDir, {
            index: false,
        }));
    }
    /* Let React Router own all non-API browser routes. */
    app.get(/^(?!\/api(?:\/|$)).*/, renderClient_1.renderClient);
    /* 404 handler registered after all routes to catch unmatched paths. */
    app.use(error_middleware_1.notFoundHandler);
    /* Global error handler registered last to catch all forwarded errors. */
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.default = createApp;
//# sourceMappingURL=app.js.map