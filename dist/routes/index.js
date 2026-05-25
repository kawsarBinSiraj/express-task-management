"use strict";
/**
 * File: src/routes/index.ts
 * Purpose: Root API router that mounts sub-routers and exposes /health.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth.route"));
const task_route_1 = __importDefault(require("./task.route"));
const user_route_1 = __importDefault(require("./user.route"));
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
/* Public health check endpoint for liveness probes and uptime checks. */
router.get('/health', (_req, res) => {
    (0, response_1.sendSuccess)(res, 200, 'Server is healthy and accepting requests.', {
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
router.use('/auth', auth_route_1.default);
router.use('/tasks', task_route_1.default);
router.use('/users', user_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map